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
    let userId: string | null = null;
    let plan = 'free';
    let isPaid = false;
    let quotaRemaining = 10;
    let aiRequestsUsed = 0;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;

      if (userId) {
        // Fetch profile to determine plan and quota
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, subscription_plan, is_founder, ai_quota_remaining, ai_quota_reset_date, ai_requests_used')
          .eq('id', userId)
          .maybeSingle();
        if (profileError) {
          console.error('Profile fetch error (explain):', profileError);
        }
        const paidPlans = ['pro_promo', 'pro_standard', 'weekly', 'annual'];
        plan = (profile?.plan || profile?.subscription_plan || 'free') as string;
        isPaid = paidPlans.includes(plan) || !!profile?.is_founder;
        aiRequestsUsed = (profile?.ai_requests_used ?? 0);

        const now = new Date();
        quotaRemaining = typeof profile?.ai_quota_remaining === 'number' ? profile!.ai_quota_remaining : (isPaid ? 500 : 10);
        const resetDate = profile?.ai_quota_reset_date ? new Date(profile.ai_quota_reset_date) : null;
        const needsDailyReset = () => {
          if (!resetDate) return true;
          const a = new Date(resetDate); a.setHours(0,0,0,0);
          const b = new Date(now); b.setHours(0,0,0,0);
          return a.getTime() !== b.getTime();
        };
        const needsMonthlyReset = () => {
          if (!resetDate) return true;
          return resetDate.getUTCFullYear() !== now.getUTCFullYear() || resetDate.getUTCMonth() !== now.getUTCMonth();
        };

        let didReset = false;
        if (!isPaid && needsDailyReset()) { quotaRemaining = 10; didReset = true; }
        else if (isPaid && needsMonthlyReset()) { quotaRemaining = 500; didReset = true; }

        if (didReset) {
          const { error: resetErr } = await supabase
            .from('profiles')
            .update({ ai_quota_remaining: quotaRemaining, ai_quota_reset_date: now.toISOString() })
            .eq('id', userId);
          if (resetErr) console.error('Quota reset update error (explain):', resetErr);
        }

        // Cooldown based on plan using last explain audit
        const cooldownMs = isPaid ? 2000 : 10000;
        const { data: lastAudit } = await supabase
          .from('ai_audit')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastAudit && now.getTime() - new Date(lastAudit.created_at).getTime() < cooldownMs) {
          const seconds = Math.ceil(cooldownMs / 1000);
          return new Response(JSON.stringify({ error: `Rate limit exceeded. Please wait ${seconds} seconds between requests.` }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Enforce quota
        if (quotaRemaining <= 0) {
          const windowText = isPaid ? 'month' : 'day';
          return new Response(JSON.stringify({ error: `AI quota exceeded. Please wait until your ${windowText} resets.` }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Hard rate limit and server dedup before OpenAI call
    if (userId) {
      const now = new Date();
      const oneMinAgoIso = new Date(now.getTime() - 60_000).toISOString();

      // Hard rate limit: 30 requests/min per user
      const { count: minuteCount } = await supabase
        .from('ai_audit')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneMinAgoIso);
      if ((minuteCount || 0) >= 30) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more requests.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Server deduplication within 60s (same question)
      const sixtySecAgoIso = new Date(now.getTime() - 60_000).toISOString();
      const explainPrompt = `Explain: ${question}`;
      const { data: dupAudit } = await supabase
        .from('ai_audit')
        .select('response')
        .eq('user_id', userId)
        .eq('prompt', explainPrompt)
        .gte('created_at', sixtySecAgoIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dupAudit?.response?.explanation) {
        return new Response(JSON.stringify({ 
          explanation: dupAudit.response.explanation,
          context,
          usage: { cached: true }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
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
        model: 'gpt-4o-mini', // Use GPT-4o-mini for cost-effective explanations
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

    // Log the explanation request for analytics and decrement quota
    if (userId) {
      try {
        await supabase
          .from('ai_audit')
          .insert([{
            user_id: userId,
            prompt: `Explain: ${question}`,
            response: { explanation, context, usage: result.usage },
            created_at: new Date().toISOString()
          }]);
      } catch (e) {
        console.error('Explain audit log error:', e);
      }

      // Decrement quota after successful response
      try {
        const newRemaining = Math.max(0, (quotaRemaining ?? (isPaid ? 500 : 10)) - 1);
        const { error: decErr } = await supabase
          .from('profiles')
          .update({ 
            ai_quota_remaining: newRemaining,
            ai_requests_used: aiRequestsUsed + 1
          })
          .eq('id', userId);
        if (decErr) console.error('Explain quota decrement error:', decErr);
      } catch (e) {
        console.error('Explain quota decrement exception:', e);
      }
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