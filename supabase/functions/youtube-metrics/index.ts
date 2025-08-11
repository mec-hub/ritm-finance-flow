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

  console.log('Analytics API URL:', url.toString())

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Analytics API error:', errorData)
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

    // Check cache first (but always refresh scheduled videos for debugging)
    const cacheKey = `metrics_${metricsType}_${startDate}_${endDate}`
    const cachedData = await fetchFromCache(supabaseClient, user.id, cacheKey)
    
    if (cachedData && metricsType !== 'scheduled-videos') {
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
        // ... keep existing code (channel statistics and overview logic)
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
        // ... keep existing code (analytics logic)
        try {
          console.log('Fetching analytics data for channel:', tokenData.channel_id)

          let mainMetrics = null
          let trafficSources = null
          let deviceTypes = null
          let geographicData = null
          
          try {
            mainMetrics = await fetchAnalyticsData(
              accessToken, 
              tokenData.channel_id, 
              startDate, 
              endDate,
              'views,averageViewDuration,estimatedMinutesWatched,subscribersGained'
            )
            console.log('Successfully fetched main analytics')
          } catch (error) {
            console.log('Main analytics failed:', error.message)
          }

          try {
            trafficSources = await fetchAnalyticsData(
              accessToken, 
              tokenData.channel_id, 
              startDate, 
              endDate,
              'views,estimatedMinutesWatched',
              'trafficSourceType'
            )
            console.log('Successfully fetched traffic sources')
          } catch (error) {
            console.log('Traffic sources failed:', error.message)
          }

          try {
            deviceTypes = await fetchAnalyticsData(
              accessToken, 
              tokenData.channel_id, 
              startDate, 
              endDate,
              'views,estimatedMinutesWatched',
              'deviceType'
            )
            console.log('Successfully fetched device types')
          } catch (error) {
            console.log('Device types failed:', error.message)
          }

          try {
            geographicData = await fetchAnalyticsData(
              accessToken, 
              tokenData.channel_id, 
              startDate, 
              endDate,
              'views,estimatedMinutesWatched',
              'country'
            )
            console.log('Successfully fetched geographic data')
          } catch (error) {
            console.log('Geographic data failed:', error.message)
          }

          if (mainMetrics || trafficSources || deviceTypes) {
            responseData = {
              analytics: mainMetrics,
              trafficSources: trafficSources,
              deviceTypes: deviceTypes,
              geographic: geographicData,
              dateRange: { startDate, endDate }
            }
          } else {
            console.log('No analytics data available, falling back to basic stats')
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
              error: 'Detailed analytics not available. This may be due to insufficient permissions or the Analytics API not being enabled for your application.'
            }
          }
        } catch (error) {
          console.error('Analytics API error:', error)
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
        // ... keep existing code (top videos logic)
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
          
          allVideoStats = (allVideoStatsData.items || []).map((video: any) => ({
            id: video.id,
            title: video.snippet?.title || '',
            publishedAt: video.snippet?.publishedAt || '',
            thumbnails: video.snippet?.thumbnails || null,
            statistics: video.statistics || { viewCount: '0', likeCount: '0', commentCount: '0' },
            contentDetails: video.contentDetails || { duration: 'PT0S' }
          }))
        }

        responseData = {
          topVideos: allVideoStats.sort((a: any, b: any) => 
            parseInt(b.statistics.viewCount || '0') - parseInt(a.statistics.viewCount || '0')
          ).slice(0, 20)
        }
        break

      case 'scheduled-videos':
        console.log('=== ENHANCED SCHEDULED VIDEOS DETECTION ===')
        console.log('Fetching scheduled videos for channel:', tokenData.channel_id)
        
        try {
          // Method 1: Try to get videos that are private/unlisted which might include scheduled ones
          console.log('Method 1: Checking private/unlisted videos...')
          const myVideosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=50&order=date`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )
          
          if (!myVideosResponse.ok) {
            console.error('My videos search failed:', await myVideosResponse.text())
            throw new Error('Failed to fetch user videos')
          }
          
          const myVideosData = await myVideosResponse.json()
          console.log('My videos response:', {
            itemsCount: myVideosData.items?.length || 0,
            pageInfo: myVideosData.pageInfo,
            error: myVideosData.error
          })

          let scheduledVideos = []

          if (myVideosData.items && myVideosData.items.length > 0) {
            const videoIds = myVideosData.items.map((video: any) => video.id.videoId).join(',')
            
            // Get detailed video information including status
            console.log('Fetching detailed video status for', myVideosData.items.length, 'videos...')
            const videoDetailsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoIds}`,
              {
                headers: { 'Authorization': `Bearer ${accessToken}` },
              }
            )
            
            if (!videoDetailsResponse.ok) {
              console.error('Video details fetch failed:', await videoDetailsResponse.text())
            } else {
              const videoDetailsData = await videoDetailsResponse.json()
              console.log('Video details response:', {
                itemsCount: videoDetailsData.items?.length || 0,
                sampleVideo: videoDetailsData.items?.[0] ? {
                  title: videoDetailsData.items[0].snippet?.title,
                  privacyStatus: videoDetailsData.items[0].status?.privacyStatus,
                  publishAt: videoDetailsData.items[0].status?.publishAt,
                  uploadStatus: videoDetailsData.items[0].status?.uploadStatus
                } : 'No videos'
              })

              // Filter for scheduled videos
              scheduledVideos = (videoDetailsData.items || [])
                .filter((video: any) => {
                  const hasPublishAt = video.status?.publishAt
                  const isPrivate = video.status?.privacyStatus === 'private'
                  const isUnlisted = video.status?.privacyStatus === 'unlisted'
                  const isFutureDate = hasPublishAt && new Date(video.status.publishAt) > new Date()
                  
                  console.log(`Video ${video.snippet?.title}:`, {
                    privacyStatus: video.status?.privacyStatus,
                    publishAt: video.status?.publishAt,
                    uploadStatus: video.status?.uploadStatus,
                    isFutureDate,
                    isScheduled: hasPublishAt && isFutureDate && (isPrivate || isUnlisted)
                  })
                  
                  return hasPublishAt && isFutureDate && (isPrivate || isUnlisted)
                })
                .sort((a: any, b: any) => 
                  new Date(a.status.publishAt).getTime() - new Date(b.status.publishAt).getTime()
                )
            }
          }

          // Method 2: Alternative approach using activities API if available
          if (scheduledVideos.length === 0) {
            console.log('Method 2: Trying channel activities approach...')
            try {
              const activitiesResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&channelId=${tokenData.channel_id}&maxResults=50`,
                {
                  headers: { 'Authorization': `Bearer ${accessToken}` },
                }
              )
              
              if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json()
                console.log('Activities response:', {
                  itemsCount: activitiesData.items?.length || 0,
                  activities: activitiesData.items?.map((item: any) => ({
                    type: item.snippet?.type,
                    publishedAt: item.snippet?.publishedAt,
                    title: item.snippet?.title
                  })) || []
                })
              } else {
                console.log('Activities API not accessible:', await activitiesResponse.text())
              }
            } catch (error) {
              console.log('Activities API error:', error)
            }
          }

          console.log('Final scheduled videos found:', scheduledVideos.length)
          
          responseData = {
            scheduledVideos: scheduledVideos,
            debug: {
              totalVideosChecked: myVideosData.items?.length || 0,
              method: 'forMine=true search + video details',
              timestamp: new Date().toISOString()
            }
          }

        } catch (error) {
          console.error('Error fetching scheduled videos:', error)
          responseData = {
            scheduledVideos: [],
            error: `Could not fetch scheduled videos: ${error.message}`,
            debug: {
              error: error.message,
              timestamp: new Date().toISOString()
            }
          }
        }
        
        console.log('=== END ENHANCED SCHEDULED VIDEOS DETECTION ===')
        break

      default:
        throw new Error(`Unknown metrics type: ${metricsType}`)
    }

    // Cache the response (except for scheduled-videos while debugging)
    if (metricsType !== 'scheduled-videos') {
      await saveToCache(supabaseClient, user.id, cacheKey, responseData, 30)
    }

    console.log('Fetched YouTube metrics:', metricsType, 'for period:', startDate, 'to', endDate)

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
