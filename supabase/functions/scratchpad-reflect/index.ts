import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { noteText, existingKpis = [], existingTags = [], notes = [], analysisType = 'comprehensive', context = {} } = await req.json();
    
    if (!noteText && !notes.length) {
      return new Response(JSON.stringify({ error: 'Missing noteText or notes for analysis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user from auth token
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let isPaid = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;

      if (userId) {
        // Check if user has paid plan for AI reflection
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, subscription_plan, is_founder')
          .eq('id', userId)
          .maybeSingle();
        
        const paidPlans = ['pro_promo', 'pro_standard', 'weekly', 'annual'];
        const plan = (profile?.plan || profile?.subscription_plan || 'free') as string;
        isPaid = paidPlans.includes(plan) || !!profile?.is_founder;
      }
    }

    // Feature gate: AI reflection only for paid users
    if (!isPaid) {
      return new Response(JSON.stringify({ 
        error: 'AI reflection is available with paid plans. Upgrade to get intelligent tagging and conversion suggestions!',
        requiresUpgrade: true 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt based on analysis type
    let systemPrompt = `You are an AI reflection assistant for business scratchpad notes. Your job is to analyze notes and provide intelligent insights.`;
    
    if (analysisType === 'comprehensive') {
      systemPrompt += `
      
For the given note, provide:
1. Suggested tags (3-5 relevant business categories)
2. Potential KPI connections (link to existing metrics if relevant)  
3. Conversion suggestions (how this could become structured data)
4. Action items extracted from the text
5. Business insights and patterns

Respond in JSON format with keys: suggestedTags, kpiConnections, conversionSuggestions, actionItems, insights`;
    } else if (analysisType === 'pattern_detection') {
      systemPrompt += `
      
Analyze multiple notes to detect patterns and suggest:
1. Common themes and topics
2. Recurring metrics or numbers mentioned
3. Business areas needing attention
4. Potential venture opportunities
5. Recommended KPIs to track

Respond in JSON format with keys: commonThemes, recurringMetrics, attentionAreas, opportunities, recommendedKpis`;
    } else if (analysisType === 'conversion_suggestions') {
      systemPrompt += `
      
For the given note, suggest specific conversions to structured data:
1. KPIs that could be created and tracked
2. Worksheet/calculator ideas
3. Venture opportunities
4. Personal metrics to monitor
5. Action items and goals

Respond in JSON format with keys: suggestedKpis, worksheetIdeas, ventureOpportunities, personalMetrics, actionItems`;
    }

    // Prepare user message based on analysis type
    let userMessage = '';
    if (analysisType === 'pattern_detection' && notes.length > 0) {
      userMessage = `Analyze these business notes for patterns:

${notes.map((note, idx) => `Note ${idx + 1}: ${note.text}`).join('\n\n')}

Existing KPIs: ${existingKpis.map(kpi => kpi.name).join(', ') || 'None'}`;
    } else {
      userMessage = `Analyze this business note:

"${noteText}"

Context: ${JSON.stringify(context)}
Existing tags: ${existingTags.join(', ') || 'None'}
Existing KPIs: ${existingKpis.map(kpi => kpi.name).join(', ') || 'None'}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    console.log(`Scratchpad AI reflection: ${analysisType} for user: ${userId}`);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'OpenAI API error', 
        detail: errorText.slice(0, 200) 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await openAIResponse.json();
    const aiResponse = result.choices?.[0]?.message?.content ?? 'Sorry, I could not analyze the note.';

    // Try to parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback to text response if JSON parsing fails
      analysisResult = { 
        analysis: aiResponse,
        error: 'Could not parse structured response' 
      };
    }

    // Log the analysis for audit
    if (userId) {
      await supabase
        .from('ai_audit')
        .insert([{
          user_id: userId,
          prompt: `Scratchpad ${analysisType}: ${(noteText || '').slice(0, 100)}`,
          response: { analysisResult, analysisType, usage: result.usage },
          created_at: new Date().toISOString()
        }]);
    }

    return new Response(JSON.stringify({
      analysis: analysisResult,
      analysisType,
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scratchpad reflect error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});