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

    // Fetch user profile to determine plan and AI quota
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, subscription_plan, is_founder, ai_quota_remaining, ai_quota_reset_date, ai_requests_used')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const paidPlans = ['pro_promo', 'pro_standard', 'weekly', 'annual'];
    const plan = (profile?.plan || profile?.subscription_plan || 'free') as string;
    const isPaid = paidPlans.includes(plan);

    // Reset quota window if needed: daily for free, monthly for paid
    const now = new Date();
    let quotaRemaining = typeof profile?.ai_quota_remaining === 'number' 
      ? profile!.ai_quota_remaining 
      : (isPaid ? 500 : 10);

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
    if (!isPaid && needsDailyReset()) {
      quotaRemaining = 10;
      didReset = true;
    } else if (isPaid && needsMonthlyReset()) {
      quotaRemaining = 500;
      didReset = true;
    }

    if (didReset) {
      const { error: resetErr } = await supabase
        .from('profiles')
        .update({ ai_quota_remaining: quotaRemaining, ai_quota_reset_date: now.toISOString() })
        .eq('id', userId);
      if (resetErr) console.error('Quota reset update error:', resetErr);
    }

    // Enforce quota before proceeding
    if (quotaRemaining <= 0) {
      const windowText = isPaid ? 'month' : 'day';
      return new Response(JSON.stringify({ error: `AI quota exceeded. Please wait until your ${windowText} resets.` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dynamic cooldown based on plan
    const cooldownMs = isPaid ? 2000 : 10000;

    // Rate limiting: Check last message timestamp for this session
    const { data: lastMsg } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('session_id', sessionId || 'default')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMsg && now.getTime() - new Date(lastMsg.created_at).getTime() < cooldownMs) {
      const seconds = Math.ceil(cooldownMs / 1000);
      return new Response(JSON.stringify({ error: `Rate limit exceeded. Please wait ${seconds} seconds between messages.` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Hard rate limit: 30 user requests per minute across all sessions
    const oneMinAgoIso = new Date(now.getTime() - 60_000).toISOString();
    const { data: userSessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);
    const sessionIds = (userSessions || []).map((s: any) => s.id);

    if (sessionIds.length > 0) {
      const { count: minuteCount } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .eq('role', 'user')
        .gte('created_at', oneMinAgoIso);

      if ((minuteCount || 0) >= 30) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more messages.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Server deduplication within 60s (same prompt)
      const sixtySecAgoIso = new Date(now.getTime() - 60_000).toISOString();
      const { data: dupUserMsg } = await supabase
        .from('chat_messages')
        .select('session_id, created_at')
        .in('session_id', sessionIds)
        .eq('role', 'user')
        .eq('content', message)
        .gte('created_at', sixtySecAgoIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dupUserMsg) {
        const { data: cachedAssistant } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('session_id', dupUserMsg.session_id)
          .eq('role', 'assistant')
          .gt('created_at', dupUserMsg.created_at)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (cachedAssistant?.content) {
          return new Response(JSON.stringify({ 
            sessionId: dupUserMsg.session_id, 
            message: cachedAssistant.content,
            model: 'cached',
            usage: { cached: true }
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
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

    // Enhanced system prompt with AI meta activities capabilities
    systemPrompt += `\n\nYou have special capabilities to help users modify their workspace through conversation:

WORKSHEET OPERATIONS:
- Add custom fields: "Add a marketing expense field to my ROI worksheet"
- Remove fields: "Remove the loan amount field from my personal worksheet"

PERSONAL FINANCE:
- Add debt entries: "Add my student loan debt of $25,000"
- Create goals: "Set a goal to save $10,000 for emergency fund"
- Track activities: "Add gym membership as a monthly commitment"

SCRATCHPAD:
- Create notes: "Create a note about potential investors"
- Link to contexts: "Add a note about the competitor analysis linked to my startup"

VENTURE MANAGEMENT:
- Create ventures: "Create a new venture called TechFlow for my SaaS idea"
- Skip onboarding: "Skip to founder mode setup"

When users request these actions, use the available functions to perform them immediately. Always confirm what you've done and guide users to where they can see the changes.`;

    // Get recent conversation history for context (last 12 messages = 6 turns)
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
      .limit(12);

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

    // Choose model (default to GPT-4o-mini for cost efficiency)
    const model = modelOverride || Deno.env.get('OPENAI_DEFAULT_MODEL') || 'gpt-4o-mini';

    console.log(`Using model: ${model} for user: ${userId}`);

    // Define available functions for AI meta activities
    const functions = [
      {
        name: "modify_worksheet_fields",
        description: "Add or remove custom fields from worksheets",
        parameters: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["add", "remove"] },
            worksheet_id: { type: "string", description: "ID of the worksheet to modify" },
            field: {
              type: "object",
              properties: {
                label: { type: "string" },
                type: { type: "string", enum: ["text", "number", "currency"] },
                value: { type: "string" }
              }
            }
          },
          required: ["action", "worksheet_id"]
        }
      },
      {
        name: "create_personal_entry",
        description: "Create entries in the personal finance section",
        parameters: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["debt", "goal", "activity", "commitment"] },
            data: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" },
                description: { type: "string" },
                monthly_payment: { type: "number" },
                target_date: { type: "string" }
              }
            }
          },
          required: ["type", "data"]
        }
      },
      {
        name: "create_scratchpad_note",
        description: "Create notes in the scratchpad",
        parameters: {
          type: "object",
          properties: {
            text: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            linked_context: {
              type: "object",
              properties: {
                type: { type: "string" },
                id: { type: "string" }
              }
            }
          },
          required: ["text"]
        }
      },
      {
        name: "update_onboarding_progress",
        description: "Skip onboarding steps or complete onboarding",
        parameters: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["skip_to_founder_mode", "complete", "reset"] },
            profile_updates: {
              type: "object",
              properties: {
                is_founder: { type: "boolean" },
                experience_level: { type: "string" },
                venture_type: { type: "string" }
              }
            }
          },
          required: ["action"]
        }
      },
      {
        name: "create_venture",
        description: "Create a new venture through AI conversation",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["startup", "local_business", "side_project", "investment"] },
            stage: { type: "string", enum: ["concept", "planning", "launch", "growth", "mature"] }
          },
          required: ["name", "description"]
        }
      }
    ];

    // Call OpenAI API with function calling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        functions,
        function_call: "auto",
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
    let assistantText = result.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
    let functionCallResult = null;

    // Handle function calls
    const functionCall = result.choices?.[0]?.message?.function_call;
    if (functionCall) {
      console.log('Function call detected:', functionCall);
      
      try {
        const functionArgs = JSON.parse(functionCall.arguments);
        functionCallResult = await handleFunctionCall(functionCall.name, functionArgs, userId, supabase);
        
        if (functionCallResult.success) {
          assistantText = functionCallResult.message;
        } else {
          assistantText = `I apologize, but I couldn't complete that action: ${functionCallResult.error}`;
        }
      } catch (error) {
        console.error('Function call error:', error);
        assistantText = "I apologize, but I encountered an error while trying to perform that action.";
      }
    }

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

    // Decrement AI quota after successful response
    try {
      const newRemaining = Math.max(0, (quotaRemaining ?? (isPaid ? 500 : 10)) - 1);
      const { error: decErr } = await supabase
        .from('profiles')
        .update({ 
          ai_quota_remaining: newRemaining,
          ai_requests_used: (profile?.ai_requests_used ?? 0) + 1,
          ai_quota_reset_date: profile?.ai_quota_reset_date || new Date().toISOString()
        })
        .eq('id', userId);
      if (decErr) console.error('Quota decrement error:', decErr);
    } catch (e) {
      console.error('Quota decrement exception:', e);
    }

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

// Function call handlers
async function handleFunctionCall(functionName: string, args: any, userId: string, supabase: any) {
  console.log(`Handling function call: ${functionName}`, args);

  try {
    switch (functionName) {
      case 'modify_worksheet_fields':
        return await modifyWorksheetFields(args, userId, supabase);
      
      case 'create_personal_entry':
        return await createPersonalEntry(args, userId, supabase);
      
      case 'create_scratchpad_note':
        return await createScratchpadNote(args, userId, supabase);
      
      case 'update_onboarding_progress':
        return await updateOnboardingProgress(args, userId, supabase);
      
      case 'create_venture':
        return await createVenture(args, userId, supabase);
      
      default:
        return { success: false, error: 'Unknown function' };
    }
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    return { success: false, error: error.message };
  }
}

async function modifyWorksheetFields(args: any, userId: string, supabase: any) {
  const { action, worksheet_id, field } = args;
  
  // Get worksheet
  const { data: worksheet, error: fetchError } = await supabase
    .from('worksheets')
    .select('*')
    .eq('id', worksheet_id)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (fetchError || !worksheet) {
    return { success: false, error: 'Worksheet not found' };
  }

  let customFields = worksheet.custom_fields || [];
  
  if (action === 'add' && field) {
    // Add new field
    const newField = {
      id: `custom_${Date.now()}`,
      label: field.label,
      type: field.type || 'text',
      value: field.value || ''
    };
    customFields.push(newField);
    
    const { error: updateError } = await supabase
      .from('worksheets')
      .update({ custom_fields: customFields })
      .eq('id', worksheet_id);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { 
      success: true, 
      message: `Added custom field "${field.label}" to your worksheet. You can now edit its value in the worksheet interface.` 
    };
  }
  
  if (action === 'remove' && field?.label) {
    // Remove field by label
    customFields = customFields.filter((f: any) => f.label !== field.label);
    
    const { error: updateError } = await supabase
      .from('worksheets')
      .update({ custom_fields: customFields })
      .eq('id', worksheet_id);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { 
      success: true, 
      message: `Removed custom field "${field.label}" from your worksheet.` 
    };
  }
  
  return { success: false, error: 'Invalid action or missing field data' };
}

async function createPersonalEntry(args: any, userId: string, supabase: any) {
  const { type, data } = args;
  
  // Get existing personal data
  const { data: personal, error: fetchError } = await supabase
    .from('personal')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  let personalData = personal || {
    user_id: userId,
    goals: [],
    activities: [],
    commitments: []
  };
  
  const newEntry = {
    id: `${type}_${Date.now()}`,
    name: data.name,
    created_at: new Date().toISOString(),
    ...data
  };
  
  switch (type) {
    case 'goal':
      personalData.goals = [...(personalData.goals || []), newEntry];
      break;
    case 'activity':
      personalData.activities = [...(personalData.activities || []), newEntry];
      break;
    case 'commitment':
      personalData.commitments = [...(personalData.commitments || []), newEntry];
      break;
    case 'debt':
      // For debt, we'll add it as a goal to pay it off
      const debtGoal = {
        id: `debt_${Date.now()}`,
        name: `Pay off ${data.name}`,
        amount: data.amount,
        monthly_payment: data.monthly_payment,
        type: 'debt_payoff',
        created_at: new Date().toISOString()
      };
      personalData.goals = [...(personalData.goals || []), debtGoal];
      break;
  }
  
  const { error: upsertError } = await supabase
    .from('personal')
    .upsert(personalData);
  
  if (upsertError) {
    return { success: false, error: upsertError.message };
  }
  
  return { 
    success: true, 
    message: `Added ${type} "${data.name}" to your personal finance section. You can view and edit it in the Personal tab.` 
  };
}

async function createScratchpadNote(args: any, userId: string, supabase: any) {
  const { text, tags, linked_context } = args;
  
  const { error: insertError } = await supabase
    .from('scratchpad_notes')
    .insert({
      user_id: userId,
      text,
      tags: tags || [],
      linked_context: linked_context || null
    });
  
  if (insertError) {
    return { success: false, error: insertError.message };
  }
  
  return { 
    success: true, 
    message: `Created a new scratchpad note: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}". You can find it in your scratchpad.` 
  };
}

async function updateOnboardingProgress(args: any, userId: string, supabase: any) {
  const { action, profile_updates } = args;
  
  let updates: any = {};
  
  switch (action) {
    case 'skip_to_founder_mode':
      updates = {
        onboarded: true,
        is_founder: true,
        ...profile_updates
      };
      break;
    case 'complete':
      updates = {
        onboarded: true,
        ...profile_updates
      };
      break;
    case 'reset':
      updates = {
        onboarded: false,
        is_founder: false
      };
      break;
  }
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (updateError) {
    return { success: false, error: updateError.message };
  }
  
  return { 
    success: true, 
    message: `Onboarding ${action.replace('_', ' ')} completed! Your profile has been updated accordingly.` 
  };
}

async function createVenture(args: any, userId: string, supabase: any) {
  const { name, description, type, stage } = args;
  
  const { data: venture, error: insertError } = await supabase
    .from('ventures')
    .insert({
      user_id: userId,
      name,
      description,
      type: type || 'startup',
      stage: stage || 'concept'
    })
    .select()
    .maybeSingle();
  
  if (insertError) {
    return { success: false, error: insertError.message };
  }
  
  return { 
    success: true, 
    message: `Created new venture "${name}"! You can now start adding KPIs and worksheets to track its progress.`,
    data: venture
  };
}