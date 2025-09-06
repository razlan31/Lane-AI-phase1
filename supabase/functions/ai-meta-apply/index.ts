import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ApplyInput = {
  userId: string;
  role: 'explainer' | 'strategist' | 'analyst' | 'guide' | 'journal' | 'assistant';
  action: string; // e.g., 'create_idea', 'journal_entry'
  payload: any;
  confirm?: boolean;
  draftInteractionId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ApplyInput = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check via Bearer token (required)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Guardrails: throttle to 5 AI-applied writes per hour
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count: recentCount } = await supabase
      .from('ai_interaction_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('result_status', 'confirmed')
      .gte('created_at', oneHourAgo);

    if ((recentCount || 0) >= 5) {
      return new Response(JSON.stringify({ error: 'Rate limit: Too many AI-applied changes. Try later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create draft interaction first if not provided
    let interactionId = body.draftInteractionId;
    if (!interactionId) {
      const { data: draft, error: draftErr } = await supabase
        .from('ai_interaction_history')
        .insert({
          user_id: user.id,
          role: body.role,
          instruction: `Proposed action: ${body.action}`,
          ai_response: 'Draft created',
          action_type: body.action,
          action_payload: body.payload,
          result_status: 'pending',
          resource_type: body.action.includes('idea') ? 'ideas' : body.action.includes('journal') ? 'personal_journal' : 'unknown'
        })
        .select('id')
        .single();

      if (draftErr) {
        console.error('Draft creation error:', draftErr);
        return new Response(JSON.stringify({ error: 'Failed to create draft' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      interactionId = draft.id;
    }

    // Always return a preview/diff to UI
    const preview = {
      action: body.action,
      role: body.role,
      payload: body.payload,
    };

    if (!body.confirm) {
      return new Response(JSON.stringify({
        preview,
        interactionId,
        applied: false
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Apply mutations only on confirm
    let resourceId: string | null = null;
    if (body.action === 'create_idea') {
      const { data, error } = await supabase
        .from('ideas')
        .insert({
          user_id: user.id,
          title: body.payload?.title || 'Untitled Idea',
          description: body.payload?.description || '',
          assumptions: body.payload?.assumptions || {},
          risks: body.payload?.risks || {},
          suggestions: body.payload?.suggestions || {},
          status: 'draft',
          ai_interaction_id: interactionId
        })
        .select('id')
        .single();
      if (error) throw error;
      resourceId = data.id;
    } else if (body.action === 'journal_entry') {
      const { data, error } = await supabase
        .from('personal_journal')
        .insert({
          user_id: user.id,
          entry: body.payload?.entry || '',
          tags: body.payload?.tags || [],
          mood: body.payload?.mood || null,
          ai_interaction_id: interactionId
        })
        .select('id')
        .single();
      if (error) throw error;
      resourceId = data.id;
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported action for apply' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Mark interaction as confirmed
    await supabase
      .from('ai_interaction_history')
      .update({ result_status: 'confirmed', resource_id: resourceId })
      .eq('id', interactionId);

    return new Response(JSON.stringify({ applied: true, interactionId, resourceId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-meta-apply error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});