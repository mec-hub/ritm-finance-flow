import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize cache outside the Deno.serve function
const cache = new Map();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: youtubeToken, error: tokenError } = await supabaseClient
      .from('youtube_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single();

    if (tokenError) {
      throw new Error(`Could not fetch YouTube token: ${tokenError.message}`);
    }

    let { access_token: accessToken, refresh_token: refreshToken } = youtubeToken;
    const apiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new Error('Google API Key not configured');
    }

    // Check if the access token is expired and refresh it if necessary
    const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiry = jwtPayload.exp * 1000; // Expiry in milliseconds

    if (Date.now() >= expiry) {
      console.log('Access token expired, refreshing...');

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google Client ID or Secret not configured');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to refresh token:', tokenResponse.status, tokenResponse.statusText);
        throw new Error('Failed to refresh access token');
      }

      const newTokenData = await tokenResponse.json();
      accessToken = newTokenData.access_token;

      // Update the access token in the database
      const { error: updateError } = await supabaseClient
        .from('youtube_tokens')
        .update({ access_token: accessToken })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update access token in database:', updateError);
        throw new Error('Failed to update access token in database');
      }

      console.log('Access token refreshed and updated in database.');
    }

    const { type = 'overview', startDate, endDate } = await req.json();
    console.log('Processing request:', { metricsType: type, startDate, endDate });

    // Cache key based on request parameters
    const cacheKey = `metrics_${type}_${startDate || 'default'}_${endDate || 'default'}`;
    
    // For debugging thumbnails, clear cache temporarily
    if (type === 'top-videos') {
      console.log('Cleared cache for top-videos to debug thumbnails');
      cache.delete(cacheKey);
    }

    // Check cache first
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      console.log(`Returning cached data for: ${cacheKey}`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const baseUrl = 'https://www.googleapis.com/youtube/v3';
    let result = {};

    if (type === 'channel-info') {
      // New endpoint to fetch channel info including thumbnail
      const channelResponse = await fetch(
        `${baseUrl}/channels?part=snippet,statistics&mine=true&key=${apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error(`Channel API error: ${channelResponse.status} ${channelResponse.statusText}`);
      }

      const channelData = await channelResponse.json();
      console.log('Fetched channel info for thumbnail');

      if (channelData.items && channelData.items.length > 0) {
        result = {
          channel: channelData.items[0]
        };
      }

      // Cache for 1 hour
      cache.set(cacheKey, result);
      setTimeout(() => cache.delete(cacheKey), 60 * 60 * 1000);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (type === 'overview') {
      // Fetch channel statistics
      const channelResponse = await fetch(
        `${baseUrl}/channels?part=statistics&mine=true&key=${apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error(`Channel API error: ${channelResponse.status} ${channelResponse.statusText}`);
      }

      const channelData = await channelResponse.json();

      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('No channel found for this account');
      }

      const channel = channelData.items[0];

      // Fetch recent videos
      const videosResponse = await fetch(
        `${baseUrl}/search?part=snippet&mine=true&order=date&type=video&key=${apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!videosResponse.ok) {
        throw new Error(`Videos API error: ${videosResponse.status} ${videosResponse.statusText}`);
      }

      const videosData = await videosResponse.json();

      result = {
        channel: channel,
        recentVideos: videosData.items || [],
      };
    } else if (type === 'analytics') {
      if (!startDate || !endDate) {
        throw new Error('Start and end dates are required for analytics');
      }

      // Fetch basic analytics data
      const analyticsResponse = await fetch(
        `${baseUrl}/reports?part=id,snippet&metrics=views,averageViewDuration,estimatedMinutesWatched,subscribersGained&dimensions=day&startDate=${startDate}&endDate=${endDate}&key=${apiKey}&currency=BRL`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!analyticsResponse.ok) {
        console.error('Analytics API error:', analyticsResponse.status, analyticsResponse.statusText);
        
        // Try to extract more detailed error information from the response
        let errorMessage = `Analytics API error: ${analyticsResponse.status} ${analyticsResponse.statusText}`;
        try {
          const errorData = await analyticsResponse.json();
          if (errorData.error && errorData.error.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
      
        // If the error is related to YouTube Analytics API not being enabled, return a specific message
        if (errorMessage.includes('youtubeAnalytics.readonly')) {
          result = {
            error: 'YouTube Analytics API não está habilitada. Por favor, habilite a API no Google Cloud Console.',
            fallback: {
              viewCount: '0',
              subscriberCount: '0',
              videoCount: '0'
            }
          };
        } else {
          throw new Error(errorMessage);
        }
      }

      const analyticsData = await analyticsResponse.json();

      // Fetch traffic sources
      const trafficSourcesResponse = await fetch(
        `${baseUrl}/reports?part=id,snippet&metrics=views&dimensions=trafficSource&startDate=${startDate}&endDate=${endDate}&key=${apiKey}&currency=BRL`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!trafficSourcesResponse.ok) {
        throw new Error(`Traffic Sources API error: ${trafficSourcesResponse.status} ${trafficSourcesResponse.statusText}`);
      }

      const trafficSourcesData = await trafficSourcesResponse.json();

      // Fetch device types
      const deviceTypesResponse = await fetch(
        `${baseUrl}/reports?part=id,snippet&metrics=views,estimatedMinutesWatched&dimensions=deviceType&startDate=${startDate}&endDate=${endDate}&key=${apiKey}&currency=BRL`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!deviceTypesResponse.ok) {
        throw new Error(`Device Types API error: ${deviceTypesResponse.status} ${deviceTypesResponse.statusText}`);
      }

      const deviceTypesData = await deviceTypesResponse.json();

      result = {
        analytics: analyticsData,
        trafficSources: trafficSourcesData,
        deviceTypes: deviceTypesData,
      };
    } else if (type === 'top-videos') {
      // Fetch the most popular videos
      const videosResponse = await fetch(
        `${baseUrl}/videos?part=snippet,statistics,contentDetails&myRating=like&chart=mostPopular&maxResults=25&key=${apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!videosResponse.ok) {
        throw new Error(`Videos API error: ${videosResponse.status} ${videosResponse.statusText}`);
      }

      const videosData = await videosResponse.json();
      result = { topVideos: videosData.items || [] };
    }

    console.log(`Fetched YouTube metrics: ${type} for period: ${startDate || 'default'} to ${endDate || 'default'}`);

    // Cache results for 15 minutes
    cache.set(cacheKey, result);
    setTimeout(() => cache.delete(cacheKey), 15 * 60 * 1000);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in youtube-metrics:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
