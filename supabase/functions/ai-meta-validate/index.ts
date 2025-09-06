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
    const { userId, requestedAction, resourceType } = await req.json();

    if (!requestedAction) {
      return new Response(JSON.stringify({ allowed: false, reason: 'requestedAction is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check available_features registry
    const { data: feature, error } = await supabase
      .from('available_features')
      .select('name, is_active, description')
      .eq('name', requestedAction)
      .maybeSingle();

    if (error) {
      console.error('Feature check error:', error);
      return new Response(JSON.stringify({ allowed: false, reason: 'Validation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!feature) {
      return new Response(JSON.stringify({ allowed: false, reason: 'Feature not available' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (feature.is_active === false) {
      return new Response(JSON.stringify({ allowed: false, reason: 'Feature is disabled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ allowed: true, reason: 'Feature allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-meta-validate error:', err);
    return new Response(JSON.stringify({ allowed: false, reason: err.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});