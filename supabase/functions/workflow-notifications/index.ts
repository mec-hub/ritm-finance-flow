
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, videoItemId, userId } = await req.json()

    switch (action) {
      case 'check_approvals':
        // Check if video item has 2+ approvals and can be archived
        const { data: approvals, error: approvalsError } = await supabaseClient
          .from('video_workflow_approvals')
          .select('*')
          .eq('video_item_id', videoItemId)
          .eq('approved', true)

        if (approvalsError) throw approvalsError

        const approvalCount = approvals?.length || 0
        
        if (approvalCount >= 2) {
          // Get the video item
          const { data: videoItem, error: itemError } = await supabaseClient
            .from('video_workflow_items')
            .select('*')
            .eq('id', videoItemId)
            .single()

          if (itemError) throw itemError

          // Archive the item
          const { error: archiveError } = await supabaseClient
            .from('video_workflow_archived')
            .insert({
              original_item_id: videoItem.id,
              user_id: videoItem.user_id,
              title: videoItem.title,
              content_type: videoItem.content_type,
              approval_count: approvalCount,
              final_publication_date: videoItem.estimated_publication_date,
              metadata: {
                original_stage: videoItem.current_stage,
                tags: videoItem.tags,
                description: videoItem.description
              }
            })

          if (archiveError) throw archiveError

          // Delete the original item
          const { error: deleteError } = await supabaseClient
            .from('video_workflow_items')
            .delete()
            .eq('id', videoItemId)

          if (deleteError) throw deleteError

          return new Response(
            JSON.stringify({ 
              success: true, 
              archived: true,
              message: 'Item arquivado com sucesso após 2+ aprovações'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            archived: false,
            approvalCount,
            message: `Item tem ${approvalCount} aprovação(ões). Precisa de 2+ para arquivar.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_workflow_stats':
        // Get workflow statistics for dashboard
        const { data: items, error: statsError } = await supabaseClient
          .from('video_workflow_items')
          .select('current_stage')
          .eq('user_id', userId)

        if (statsError) throw statsError

        const stats = {
          scripted: 0,
          recorded: 0,
          editing: 0,
          awaiting_review: 0,
          approved: 0,
          total: items?.length || 0
        }

        items?.forEach(item => {
          stats[item.current_stage as keyof typeof stats]++
        })

        return new Response(
          JSON.stringify({ success: true, stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Error in workflow-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
