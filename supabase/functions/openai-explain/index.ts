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
    const { question, context, contextData } = await req.json();
    
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), {
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

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user from auth token (optional for explain endpoint)
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Build context-aware system prompt
    let systemPrompt = `You are Lane AI's explanation system. Provide clear, concise explanations in 2-3 sentences. 
Focus on practical business insights and actionable information. Avoid internal reasoning - just explain the "why" clearly.`;

    if (context === 'kpi') {
      systemPrompt += `\nYou're explaining business KPIs and metrics. Focus on what drives the numbers and their business impact.`;
    } else if (context === 'worksheet') {
      systemPrompt += `\nYou're explaining business calculations and financial models. Focus on the methodology and business logic.`;
    } else if (context === 'block') {
      systemPrompt += `\nYou're explaining business building blocks and strategic elements. Focus on implementation and strategic value.`;
    } else if (context === 'tool') {
      systemPrompt += `\nYou're explaining business tools and their applications. Focus on practical usage and business benefits.`;
    }

    // Add context data if provided
    let userMessage = question;
    if (contextData) {
      userMessage = `Context: ${JSON.stringify(contextData, null, 2)}\n\nQuestion: ${question}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    console.log(`Explain request for context: ${context}, user: ${userId || 'anonymous'}`);

    // Call OpenAI API with a focused model for explanations
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use GPT-3.5 for cost-effective explanations
        messages,
        temperature: 0.3, // Lower temperature for consistent explanations
        max_tokens: 300 // Shorter responses for explanations
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
    const explanation = result.choices?.[0]?.message?.content ?? 'Sorry, I could not generate an explanation.';

    // Log the explanation request for analytics (optional)
    if (userId) {
      await supabase
        .from('ai_audit')
        .insert([{
          user_id: userId,
          prompt: `Explain: ${question}`,
          response: { explanation, context, usage: result.usage },
          created_at: new Date().toISOString()
        }]);
    }

    return new Response(JSON.stringify({ 
      explanation,
      context,
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OpenAI explain error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});