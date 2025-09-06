import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      scenarioData, 
      title, 
      ventureId = null, 
      fieldsToInclude = [], 
      confirm = false 
    } = await req.json();

    if (!scenarioData || !title) {
      return new Response(JSON.stringify({ error: 'scenarioData and title are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create draft interaction first
    const { data: draft, error: draftErr } = await supabase
      .from('ai_interaction_history')
      .insert({
        user_id: user.id,
        role: 'analyst',
        instruction: `Convert scenario to worksheet: ${title}`,
        ai_response: 'Converting scenario to structured worksheet',
        action_type: 'convert_to_worksheet',
        action_payload: {
          scenario_data: scenarioData,
          title: title,
          venture_id: ventureId,
          fields_to_include: fieldsToInclude
        },
        result_status: 'pending',
        resource_type: 'worksheets'
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

    const interactionId = draft.id;

    // Build worksheet schema from scenario data
    const worksheetSchema = {
      type: 'scenario_conversion',
      inputs: {},
      outputs: {},
      metadata: {
        original_scenario: scenarioData.scenario_id,
        confidence: scenarioData.confidence_score,
        created_from: 'scenario_eval'
      }
    };

    // Map scenario assumptions to worksheet inputs
    if (scenarioData.assumptions) {
      Object.entries(scenarioData.assumptions).forEach(([key, value]) => {
        if (fieldsToInclude.length === 0 || fieldsToInclude.includes(key)) {
          worksheetSchema.inputs[key] = {
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value,
            type: typeof value === 'number' ? 'number' : 'text'
          };
        }
      });
    }

    // Map scenario results to worksheet outputs
    if (scenarioData.computed_results) {
      Object.entries(scenarioData.computed_results).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
          worksheetSchema.outputs[key] = {
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value,
            computed: true
          };
        }
      });
    }

    // Always return preview first if not confirmed
    const preview = {
      title: title,
      venture_id: ventureId,
      schema: worksheetSchema,
      interaction_id: interactionId
    };

    if (!confirm) {
      return new Response(JSON.stringify({
        preview,
        applied: false,
        message: 'Worksheet preview ready. Confirm to create.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create worksheet only on explicit confirmation
    const { data: worksheet, error: worksheetErr } = await supabase
      .from('worksheets')
      .insert({
        user_id: user.id,
        venture_id: ventureId,
        type: 'scenario_conversion',
        inputs: worksheetSchema.inputs,
        outputs: worksheetSchema.outputs,
        confidence_level: scenarioData.confidence_score >= 0.7 ? 'calculated' : 'estimate',
        version: 1,
        template_category: 'scenario',
        is_template: false
      })
      .select('id')
      .single();

    if (worksheetErr) {
      console.error('Worksheet creation error:', worksheetErr);
      
      // Mark interaction as error
      await supabase
        .from('ai_interaction_history')
        .update({ result_status: 'error', ai_response: `Failed to create worksheet: ${worksheetErr.message}` })
        .eq('id', interactionId);

      return new Response(JSON.stringify({ error: 'Failed to create worksheet', detail: worksheetErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create initial version entry for the worksheet
    const { error: versionErr } = await supabase
      .from('versions')
      .insert({
        parent_id: worksheet.id,
        parent_type: 'worksheet',
        user_id: user.id,
        content: {
          inputs: worksheetSchema.inputs,
          outputs: worksheetSchema.outputs,
          metadata: worksheetSchema.metadata,
          created_from_scenario: true
        },
        status: 'committed',
        version_number: 1
      });

    if (versionErr) {
      console.error('Version creation error:', versionErr);
    }

    // Mark interaction as confirmed
    await supabase
      .from('ai_interaction_history')
      .update({ 
        result_status: 'confirmed', 
        resource_id: worksheet.id,
        ai_response: `Successfully created worksheet "${title}" from scenario`
      })
      .eq('id', interactionId);

    return new Response(JSON.stringify({
      applied: true,
      worksheet_id: worksheet.id,
      interaction_id: interactionId,
      message: `Worksheet "${title}" created successfully from scenario.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create worksheet from scenario error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create worksheet from scenario', 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});