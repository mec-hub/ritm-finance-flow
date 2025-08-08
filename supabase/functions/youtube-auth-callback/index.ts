
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user ID
    const error = url.searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return new Response(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      })
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-auth-callback`

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured')
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error_description}`)
    }

    // Get channel info
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const channelData = await channelResponse.json()
    console.log('Channel response:', channelData)

    if (!channelResponse.ok || !channelData.items?.length) {
      throw new Error('Failed to get channel information')
    }

    const channel = channelData.items[0]
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

    // Store tokens in database
    const { error: dbError } = await supabaseClient
      .from('youtube_tokens')
      .upsert({
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        channel_id: channel.id,
        channel_title: channel.snippet.title,
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store tokens')
    }

    console.log('Successfully stored YouTube tokens for user:', state)

    return new Response(`
      <html>
        <body>
          <h1>YouTube Connected Successfully!</h1>
          <p>Channel: ${channel.snippet.title}</p>
          <script>
            window.opener?.postMessage({ type: 'youtube-auth-success' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in youtube-auth-callback:', error)
    return new Response(`
      <html>
        <body>
          <h1>Authentication Failed</h1>
          <p>Error: ${error.message}</p>
          <script>window.close();</script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 400,
    })
  }
})
