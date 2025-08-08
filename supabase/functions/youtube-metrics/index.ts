
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

async function fetchAnalyticsData(accessToken: string, channelId: string, startDate: string, endDate: string, metrics: string, dimensions: string = 'day'): Promise<any> {
  const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports')
  url.searchParams.set('ids', `channel==${channelId}`)
  url.searchParams.set('startDate', startDate)
  url.searchParams.set('endDate', endDate)
  url.searchParams.set('metrics', metrics)
  url.searchParams.set('dimensions', dimensions)

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Analytics API error: ${errorData.error?.message || response.statusText}`)
  }

  return await response.json()
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
        const newExpiresAt = new Date(Date.now() + 3600 * 1000)
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

    // Get parameters from request body
    const requestBody = await req.json()
    const metricsType = requestBody.type || 'overview'
    const startDate = requestBody.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = requestBody.endDate || new Date().toISOString().split('T')[0]

    console.log('Processing request:', { metricsType, startDate, endDate })

    // Check cache first
    const cacheKey = `metrics_${metricsType}_${startDate}_${endDate}`
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

        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${tokenData.channel_id}&order=date&maxResults=10&type=video`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        )
        const videosData = await videosResponse.json()

        const videoIds = videosData.items?.map((video: any) => video.id.videoId).join(',')
        let videoStats = null
        if (videoIds) {
          const videoStatsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )
          const videoStatsData = await videoStatsResponse.json()
          videoStats = videoStatsData.items || []
        }

        responseData = {
          channel: channelData.items?.[0] || null,
          recentVideos: videosData.items || [],
          videoStats: videoStats,
        }
        break

      case 'analytics':
        try {
          console.log('Fetching analytics data for channel:', tokenData.channel_id)

          // Main analytics metrics
          const mainMetrics = await fetchAnalyticsData(
            accessToken, 
            tokenData.channel_id, 
            startDate, 
            endDate,
            'views,impressions,impressionClickThroughRate,averageViewDuration,estimatedMinutesWatched,subscribersGained'
          )

          // Traffic source data
          const trafficSources = await fetchAnalyticsData(
            accessToken, 
            tokenData.channel_id, 
            startDate, 
            endDate,
            'views,estimatedMinutesWatched',
            'trafficSourceType'
          )

          // Device type data
          const deviceTypes = await fetchAnalyticsData(
            accessToken, 
            tokenData.channel_id, 
            startDate, 
            endDate,
            'views,estimatedMinutesWatched',
            'deviceType'
          )

          // Geographic data
          const geographicData = await fetchAnalyticsData(
            accessToken, 
            tokenData.channel_id, 
            startDate, 
            endDate,
            'views,estimatedMinutesWatched',
            'country'
          )

          console.log('Successfully fetched analytics data:', {
            mainMetrics: mainMetrics?.rows?.length || 0,
            trafficSources: trafficSources?.rows?.length || 0,
            deviceTypes: deviceTypes?.rows?.length || 0
          })

          responseData = {
            analytics: mainMetrics,
            trafficSources: trafficSources,
            deviceTypes: deviceTypes,
            geographic: geographicData,
            dateRange: { startDate, endDate }
          }
        } catch (error) {
          console.error('Analytics API error:', error)
          // Fallback to basic channel statistics
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
        break

      case 'top-videos':
        // Get channel's videos with statistics
        const channelVideosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${tokenData.channel_id}&order=viewCount&maxResults=50&type=video`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        )
        const channelVideosData = await channelVideosResponse.json()

        const allVideoIds = channelVideosData.items?.map((video: any) => video.id.videoId).join(',')
        let allVideoStats = []
        if (allVideoIds) {
          const allVideoStatsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${allVideoIds}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )
          const allVideoStatsData = await allVideoStatsResponse.json()
          allVideoStats = allVideoStatsData.items || []
        }

        responseData = {
          topVideos: allVideoStats.sort((a: any, b: any) => 
            parseInt(b.statistics.viewCount || '0') - parseInt(a.statistics.viewCount || '0')
          ).slice(0, 20)
        }
        break

      default:
        throw new Error(`Unknown metrics type: ${metricsType}`)
    }

    // Cache the response
    await saveToCache(supabaseClient, user.id, cacheKey, responseData, 30)

    console.log('Fetched and cached YouTube metrics:', metricsType, 'for period:', startDate, 'to', endDate)

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
