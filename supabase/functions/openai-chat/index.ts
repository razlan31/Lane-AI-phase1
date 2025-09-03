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
    const { message, sessionId, context, modelOverride } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Rate limiting: Check last message timestamp
    const { data: lastMsg } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('session_id', sessionId || 'default')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const minIntervalMs = 2000; // 2 seconds between messages
    if (lastMsg && new Date().getTime() - new Date(lastMsg.created_at).getTime() < minIntervalMs) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait 2 seconds between messages.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create or get session
    const sid = sessionId || `session_${Date.now()}_${userId}`;
    
    // Ensure session exists
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .upsert({ 
        id: sid, 
        user_id: userId, 
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    }

    // Save user message
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sid,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      }]);

    if (msgError) {
      console.error('Message save error:', msgError);
    }

    // Prepare system context based on context type
    let systemPrompt = "You are Lane AI, a helpful business intelligence assistant. Provide concise, actionable insights.";
    
    if (context === 'venture') {
      systemPrompt = "You are Lane AI, a startup advisor. Help with venture building, business metrics, and strategic decisions. Be concise and practical.";
    } else if (context === 'founder-mode') {
      systemPrompt = "You are Lane AI in Founder Mode. Provide strategic, high-level business insights with a focus on growth and execution. Be direct and actionable.";
    } else if (context === 'scratchpad') {
      systemPrompt = "You are Lane AI helping with business brainstorming. Help organize thoughts, identify patterns, and suggest next steps. Be encouraging and insightful.";
    }

    // Get recent conversation history for context (last 10 messages)
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent history (excluding the just-saved user message)
    if (recentMessages && recentMessages.length > 1) {
      const historyMessages = recentMessages.slice(0, -1); // Exclude the just-saved message
      messages.push(...historyMessages);
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Choose model (default to GPT-3.5 for cost efficiency)
    const model = modelOverride || Deno.env.get('OPENAI_DEFAULT_MODEL') || 'gpt-3.5-turbo';

    console.log(`Using model: ${model} for user: ${userId}`);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
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
    const assistantText = result.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    // Save assistant response
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sid,
        role: 'assistant',
        content: assistantText,
        created_at: new Date().toISOString()
      }]);

    if (assistantMsgError) {
      console.error('Assistant message save error:', assistantMsgError);
    }

    // Update session timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sid);

    return new Response(JSON.stringify({ 
      sessionId: sid, 
      message: assistantText,
      model: model,
      usage: result.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OpenAI chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});