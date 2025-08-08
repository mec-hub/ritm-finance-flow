
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CachedData {
  data: any;
  expiresAt: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${data.error_description}`)
  }

  return data.access_token
}

async function fetchFromCache(supabase: any, userId: string, cacheKey: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('youtube_cache')
    .select('cache_data, expires_at')
    .eq('user_id', userId)
    .eq('cache_key', cacheKey)
    .single()

  if (error || !data) return null

  const expiresAt = new Date(data.expires_at)
  if (expiresAt <= new Date()) {
    // Cache expired, delete it
    await supabase
      .from('youtube_cache')
      .delete()
      .eq('user_id', userId)
      .eq('cache_key', cacheKey)
    return null
  }

  return data.cache_data
}

async function saveToCache(supabase: any, userId: string, cacheKey: string, data: any, ttlMinutes: number = 60) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  
  await supabase
    .from('youtube_cache')
    .upsert({
      user_id: userId,
      cache_key: cacheKey,
      cache_data: data,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'user_id,cache_key'
    })
}

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

    // Get user's YouTube tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('youtube_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: 'YouTube not connected',
        needsAuth: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    let accessToken = tokenData.access_token

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt <= new Date()) {
      console.log('Token expired, refreshing...')
      try {
        accessToken = await refreshAccessToken(tokenData.refresh_token)
        
        // Update token in database
        const newExpiresAt = new Date(Date.now() + 3600 * 1000) // 1 hour from now
        await supabaseClient
          .from('youtube_tokens')
          .update({
            access_token: accessToken,
            expires_at: newExpiresAt.toISOString(),
          })
          .eq('user_id', user.id)
        
        console.log('Token refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh token:', error)
        return new Response(JSON.stringify({ 
          error: 'Token refresh failed',
          needsAuth: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
    }

    const { searchParams } = new URL(req.url)
    const metricsType = searchParams.get('type') || 'overview'

    // Check cache first
    const cacheKey = `metrics_${metricsType}`
    const cachedData = await fetchFromCache(supabaseClient, user.id, cacheKey)
    
    if (cachedData) {
      console.log('Returning cached data for:', cacheKey)
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let responseData = {}

    // Fetch different metrics based on type
    switch (metricsType) {
      case 'overview':
        // Channel statistics
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${tokenData.channel_id}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        )
        const channelData = await channelResponse.json()

        // Recent videos
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${tokenData.channel_id}&order=date&maxResults=5&type=video`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        )
        const videosData = await videosResponse.json()

        responseData = {
          channel: channelData.items?.[0] || null,
          recentVideos: videosData.items || [],
        }
        break

      case 'analytics':
        // YouTube Analytics API requires different permissions
        // For now, we'll use basic statistics
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        try {
          const analyticsResponse = await fetch(
            `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${tokenData.channel_id}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=day`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )
          
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            responseData = { analytics: analyticsData }
          } else {
            // Fallback to channel statistics
            const fallbackResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${tokenData.channel_id}`,
              {
                headers: { 'Authorization': `Bearer ${accessToken}` },
              }
            )
            const fallbackData = await fallbackResponse.json()
            responseData = { 
              analytics: null,
              fallback: fallbackData.items?.[0]?.statistics || null,
              error: 'Analytics API not available with current permissions'
            }
          }
        } catch (error) {
          console.error('Analytics API error:', error)
          responseData = { 
            analytics: null,
            error: 'Failed to fetch analytics data'
          }
        }
        break

      default:
        throw new Error(`Unknown metrics type: ${metricsType}`)
    }

    // Cache the response for 1 hour
    await saveToCache(supabaseClient, user.id, cacheKey, responseData, 60)

    console.log('Fetched and cached YouTube metrics:', metricsType)

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in youtube-metrics:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
