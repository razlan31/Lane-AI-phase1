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

    // Confirmation intents should bypass cooldown ("yes", "ok", "proceed")
    const isConfirm = /^\s*(yes|y|ok|okay|proceed|go ahead|confirm)\s*$/i.test(message);

    // Rate limiting: Check last message timestamp for this session
    const { data: lastMsg } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('session_id', sessionId || 'default')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!isConfirm && lastMsg && now.getTime() - new Date(lastMsg.created_at).getTime() < cooldownMs) {
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
    let systemPrompt = "You are Lane AI, a helpful business intelligence assistant that specializes in creating complete business dashboards automatically.";
    
    if (context === 'venture') {
      systemPrompt = "You are Lane AI, a startup advisor. Help with venture building, business metrics, and strategic decisions. Be concise and practical.";
    } else if (context === 'founder-mode') {
      systemPrompt = "You are Lane AI in Founder Mode. Provide strategic, high-level business insights with a focus on growth and execution. Be direct and actionable.";
    } else if (context === 'scratchpad') {
      systemPrompt = "You are Lane AI helping with business brainstorming. Help organize thoughts, identify patterns, and suggest next steps. Be encouraging and insightful.";
    }

    // Enhanced system prompt with venture creation magic moment
    systemPrompt += `\n\n🚀 MAGIC MOMENT - VENTURE CREATION:

When users mention ANY business idea (food truck, SaaS, consulting, retail, app, service, etc.), IMMEDIATELY trigger the magic moment:

"🎯 Exciting! Let me help you set up a complete business dashboard for your [BUSINESS TYPE]. First, tell me:

**What stage is this project?**
🌱 **New Project** - Just starting, need to plan everything from scratch
📈 **Existing Business** - Already running, want to track and scale operations  
💭 **Brainstorming Ideas** - Exploring concepts, not ready to commit yet

Then choose your data approach:

**A) 📊 Use Industry Benchmarks** - I'll create your venture with realistic mock data from industry averages that you can replace with real numbers later

**B) 🎯 Provide Real Data** - I'll ask targeted questions to build your dashboard with your actual business data (you can skip any you don't have)"

STAGE-SPECIFIC RESPONSES:
🌱 **New Project**: Focus on planning worksheets (business model, market analysis, financial projections, launch timeline, risk assessment)
📈 **Existing Business**: Focus on operational worksheets (current performance, growth metrics, optimization opportunities, scaling plans)
💭 **Brainstorming**: Focus on exploration worksheets (market research, competitive analysis, feasibility studies, concept validation)

BUSINESS TYPE DETECTION:
- Food truck/restaurant: Unit economics, daily sales, inventory, labor costs, location analysis
- SaaS/Software: MRR, churn, CAC, LTV, user acquisition funnels, pricing tiers
- Consulting: Hourly rates, client acquisition, project profitability, capacity planning
- E-commerce: Product margins, shipping costs, conversion rates, inventory turnover
- Local service: Service pricing, customer lifetime value, territory analysis, seasonal trends
- Investment/Real Estate: Property analysis, cash flow, cap rates, portfolio metrics

INDUSTRY MOCK DATA EXAMPLES:
- Food truck: $300-800 daily revenue, 15-20% food costs, $50-100 daily labor
- SaaS: $10-50 MRR per user, 5-10% monthly churn, $50-200 CAC
- Consulting: $75-300/hour rates, 20-40 billable hours/week, 6-month client cycles

COMPREHENSIVE QUESTION FLOW (Option B):
1. Business model & revenue streams
2. Current financial situation (revenue, expenses, projections)
3. Market size and customer segments
4. Key metrics and KPIs you track
5. Major costs and expenses
6. Growth plans and timeline
7. Any existing data or spreadsheets

SMART FLOW RULES (Adaptive Behavior):
- If the user message contains multiple concrete metrics (e.g., numbers with units like $/%, counts, rates) or explicit statements like "we currently have", "our MRR is", "churn is", "AOV =", auto-select:
  - project_stage = existing_business (unless they say it's new/idea)
  - data_approach = real_data
  - Extract as much structured data as possible into user_data: { revenue, monthly_expenses, customer_count, pricing_model, key_metrics: { churn, cac, ltv, aov, arpu, conversion_rate, etc. } }
  - Immediately summarize what you parsed in 1-2 lines and ask ONLY for the top 2-3 missing critical values needed to create the worksheets. Do NOT repeat the A/B choice or stage questions.
- If information is sparse or clearly exploratory, show the stage + A/B choice flow.
- Always batch questions (max 3 at a time), accept "skip", and continue with defaults/benchmarks if skipped.
- Never ask the same question twice; track what you already collected in the conversation.

CONFIRMATION & ACTION:
- After summarizing and collecting any missing essentials, propose: "I'll create the venture and 5-7 worksheets now using [Real Data/Benchmarks]. Proceed?"
- On confirm, call create_complete_venture_with_worksheets with inferred venture.business_type, project_stage, data_approach, and user_data.

Always create 5-7 relevant worksheets automatically based on business type.

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

    // Confirmation fast-path: execute without calling OpenAI to avoid non-2xx on simple "Yes"
    if (isConfirm) {
      const historyText = (recentMessages || []).map((m: any) => (m?.content || '')).join(' ').toLowerCase();
      let inferredType: string = 'other';
      if (/food\s*truck|street\s*food|food\s*cart/.test(historyText)) inferredType = 'food_truck';
      else if (/saas|subscription|mrr/.test(historyText)) inferredType = 'saas';
      else if (/consult(ing|ant)/.test(historyText)) inferredType = 'consulting';

      // Try to attach to most recent venture; otherwise create one quickly
      let targetVentureId: string | null = null;
      let ventureName = inferredType === 'food_truck' ? 'Food Truck' : (inferredType === 'saas' ? 'SaaS Venture' : 'New Venture');

      const { data: lastVenture } = await supabase
        .from('ventures')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastVenture?.id) {
        targetVentureId = lastVenture.id;
        ventureName = lastVenture.name;
      }

      if (!targetVentureId) {
        const { data: v } = await supabase
          .from('ventures')
          .insert({ user_id: userId, name: ventureName, description: `${ventureName} created from confirmation`, type: 'local_business', stage: 'growth' })
          .select()
          .maybeSingle();
        targetVentureId = v?.id || null;
      }

      if (targetVentureId) {
        const templates = getWorksheetTemplates(inferredType, 'real_data', null, 'existing_business');
        const created = [] as any[];
        for (const t of templates) {
          const { data: w } = await supabase
            .from('worksheets')
            .insert({ user_id: userId, venture_id: targetVentureId, type: t.type, template_category: t.type, inputs: { fields: t.fields || [] }, confidence_level: 'actual' })
            .select()
            .maybeSingle();
          if (w) created.push(w);
        }
        const names = templates.map(t => t.name).join(', ');
        return new Response(JSON.stringify({
          sessionId: sid,
          message: `🎉 Created ${created.length} worksheets: ${names} for "${ventureName}". Open your HQ Dashboard to view them.`,
          model: 'fast-path',
          usage: { fast_path: true },
          selectedRole: 'venture_creator',
          roleJustification: 'Confirmation detected; executing action without LLM.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // If we still have no venture id, continue with LLM flow
    }

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
      },
      {
        name: "create_complete_venture_with_worksheets",
        description: "Create a venture with 5-7 worksheets automatically based on business type and data approach",
        parameters: {
          type: "object",
          properties: {
            venture: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                business_type: { type: "string", enum: ["food_truck", "restaurant", "saas", "software", "consulting", "ecommerce", "local_service", "investment", "real_estate", "retail", "app", "other"] },
                type: { type: "string", enum: ["startup", "local_business", "side_project", "investment"] },
                stage: { type: "string", enum: ["concept", "planning", "launch", "growth", "mature"] }
              },
              required: ["name", "description", "business_type"]
            },
            data_approach: { type: "string", enum: ["industry_benchmarks", "real_data"] },
            project_stage: { type: "string", enum: ["new_project", "existing_business", "brainstorming"] },
            user_data: {
              type: "object",
              properties: {
                revenue: { type: "number" },
                monthly_expenses: { type: "number" },
                customer_count: { type: "number" },
                pricing_model: { type: "string" },
                key_metrics: { type: "object" }
              }
            }
          },
          required: ["venture", "data_approach"]
        }
      }
    ];

    // Build OpenAI payload respecting model parameter differences
    const isNewModel = /gpt-5|4\.1|^o3|^o4/.test(model);
    const oaPayload: any = {
      model,
      messages,
      functions,
      function_call: "auto"
    };
    if (isNewModel) {
      oaPayload.max_completion_tokens = 1200; // newer models
    } else {
      oaPayload.max_tokens = 1000; // legacy models
      oaPayload.temperature = 0.7;
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oaPayload),
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
    let proposedAction: any = null;
    let selectedRole = 'assistant';
    let roleJustification = '';

    // Enhanced role detection with business type recognition
    const lowerMsg = message.toLowerCase();
    
    // Business type detection for magic moment
    const businessTypePatterns = {
      food_truck: /(food truck|mobile food|street food|food cart)/,
      restaurant: /(restaurant|cafe|coffee shop|bar|diner|bistro)/,
      saas: /(saas|software.*service|web app|platform|subscription.*software)/,
      software: /(app|software|mobile app|web.*app|application|tech.*product)/,
      consulting: /(consulting|consultant|freelance|professional.*service|advisory)/,
      ecommerce: /(ecommerce|e-commerce|online.*store|online.*shop|selling.*online)/,
      local_service: /(service.*business|local.*business|repair.*shop|salon|spa|clinic)/,
      real_estate: /(real estate|property|rental|investment.*property)/,
      retail: /(retail|store|shop|boutique|selling.*products)/
    };
    
    // Check for business mentions that should trigger venture creation
    let detectedBusinessType = null;
    for (const [type, pattern] of Object.entries(businessTypePatterns)) {
      if (pattern.test(lowerMsg)) {
        detectedBusinessType = type;
        break;
      }
    }
    
    // Enhanced role detection
    const numericMentions = (message.match(/(?:\$?\d[\d,]*(?:\.\d+)?%?)/g) || []).length;
    const hasBizMetrics = /(mrr|arr|revenue|customers|churn|ltv|cac|aov|arpu|conversion|profit|margin|runway|burn|expenses|payroll|units)/i.test(message);
    const dataRich = numericMentions >= 3 || (numericMentions >= 2 && hasBizMetrics);

    if (/(explain|what is|definition|glossary)/.test(lowerMsg)) {
      selectedRole = 'explainer';
      roleJustification = 'You asked for an explanation of a concept.';
    } else if (dataRich) {
      selectedRole = 'venture_creator';
      roleJustification = 'You provided concrete business metrics; proceeding with real-data setup and only asking for missing essentials.';
    } else if (detectedBusinessType && /(starting|launch|create|build|open|begin|new|idea|thinking about)/.test(lowerMsg)) {
      selectedRole = 'venture_creator';
      roleJustification = `You mentioned starting a ${detectedBusinessType.replace('_', ' ')} business - perfect for creating a complete venture dashboard!`;
    } else if (/(idea|brainstorm|business|new product)/.test(lowerMsg)) {
      selectedRole = 'strategist';
      roleJustification = 'You asked about creating or refining a business idea.';
    } else if (/(analyz|why|cause|insight|interpret)/.test(lowerMsg)) {
      selectedRole = 'analyst';
      roleJustification = 'You asked for analysis of your data.';
    } else if (/(how to|steps|guide|onboarding|payment|publish)/.test(lowerMsg)) {
      selectedRole = 'guide';
      roleJustification = 'You asked for step-by-step guidance.';
    } else if (/(journal|today i|reflect|goal)/.test(lowerMsg)) {
      selectedRole = 'journal';
      roleJustification = 'You wrote a personal entry; journal mode is appropriate.';
    }

    // Function call support
    let parsedFunctionName: string | null = null;
    let parsedFunctionArgs: any = null;

    if (functionCall) {
      console.log('Function call detected:', functionCall);
      try {
        parsedFunctionArgs = JSON.parse(functionCall.arguments || '{}');
        parsedFunctionName = functionCall.name;
        // Map function to action without applying (preview for UI)
        if (functionCall.name === 'create_venture') {
          proposedAction = { action: 'update_venture', resourceType: 'ventures', payload: parsedFunctionArgs };
        } else if (functionCall.name === 'create_complete_venture_with_worksheets') {
          proposedAction = { action: 'create_complete_venture', resourceType: 'ventures', payload: parsedFunctionArgs };
          selectedRole = 'strategist';
        } else if (functionCall.name === 'create_personal_entry') {
          proposedAction = { action: 'journal_entry', resourceType: 'personal_journal', payload: parsedFunctionArgs };
          selectedRole = 'journal';
        } else if (functionCall.name === 'modify_worksheet_fields') {
          proposedAction = { action: 'create_worksheet', resourceType: 'worksheets', payload: parsedFunctionArgs };
          selectedRole = 'analyst';
        } else if (functionCall.name === 'create_scratchpad_note') {
          proposedAction = { action: 'create_note', resourceType: 'scratchpad_notes', payload: parsedFunctionArgs };
          selectedRole = selectedRole === 'assistant' ? 'guide' : selectedRole;
        } else if (functionCall.name === 'update_onboarding_progress') {
          proposedAction = { action: 'workflow_guide', resourceType: 'profiles', payload: parsedFunctionArgs };
          selectedRole = 'guide';
        }
      } catch (e) {
        console.error('Function call parse error:', e);
      }
    }

    // If we have a proposed action, validate against available_features registry
    let validation: any = { allowed: false, reason: 'No action proposed' };
    if (proposedAction?.action) {
      const { data: feature } = await supabase
        .from('available_features')
        .select('name, is_active')
        .eq('name', proposedAction.action)
        .maybeSingle();
      validation = (!feature || feature.is_active !== false)
        ? { allowed: true, reason: feature ? 'Feature allowed' : 'No feature flag found; default allow' }
        : { allowed: false, reason: 'Feature not available or disabled' };
    }

    // Execute function call when allowed (no more preview-only)
    if (typeof parsedFunctionName === 'string' && validation.allowed) {
      // Adjust args based on detected context to avoid mock data when real data is present
      if (parsedFunctionName === 'create_complete_venture_with_worksheets' && parsedFunctionArgs) {
        // Force real_data if message is data-rich or user_data provided
        if (!parsedFunctionArgs.data_approach && (dataRich || parsedFunctionArgs.user_data)) {
          parsedFunctionArgs.data_approach = 'real_data';
        }
        if (parsedFunctionArgs.data_approach === 'industry_benchmarks' && (dataRich || parsedFunctionArgs.user_data)) {
          parsedFunctionArgs.data_approach = 'real_data';
        }
        // Default project_stage
        if (!parsedFunctionArgs.project_stage && (dataRich || parsedFunctionArgs.user_data)) {
          parsedFunctionArgs.project_stage = 'existing_business';
        }
        // Ensure venture object has business_type when detectable
        parsedFunctionArgs.venture = parsedFunctionArgs.venture || {};
        if (!parsedFunctionArgs.venture.business_type && detectedBusinessType) {
          parsedFunctionArgs.venture.business_type = detectedBusinessType;
        }
      }

      console.log('Executing function call:', parsedFunctionName, 'with args:', parsedFunctionArgs);
      try {
        const execResult = await handleFunctionCall(parsedFunctionName, parsedFunctionArgs, userId, supabase);
        if (execResult?.success) {
          assistantText = execResult.message || assistantText || 'Action completed successfully.';
        } else {
          assistantText = `I tried to perform the action but ran into an error: ${execResult?.error || 'Unknown error'}.`;
        }
      } catch (execErr) {
        console.error('Function execution error:', execErr);
        assistantText = 'I attempted the action but encountered an unexpected error.';
      }
    } else if (typeof parsedFunctionName === 'string' && !validation.allowed) {
      console.log('Function call blocked by feature flag:', parsedFunctionName, validation);
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
      usage: result.usage,
      selectedRole,
      roleJustification,
      proposedAction: proposedAction ? { ...proposedAction, validation } : null
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
      
      case 'create_complete_venture_with_worksheets':
        return await createCompleteVentureWithWorksheets(args, userId, supabase);
      
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

async function createCompleteVentureWithWorksheets(args: any, userId: string, supabase: any) {
  const { venture, data_approach, user_data, project_stage } = args;
  const { name, description, business_type, type, stage } = venture;
  
  console.log(`Creating complete venture with worksheets: ${name} (${business_type}) - Stage: ${project_stage}`);
  
  // Map project_stage to venture.stage when not provided
  const mappedStage = stage || (project_stage === 'existing_business' ? 'growth' : project_stage === 'new_project' ? 'planning' : 'concept');
  
  // First create the venture
  const { data: newVenture, error: ventureError } = await supabase
    .from('ventures')
    .insert({
      user_id: userId,
      name: name,
      description: description,
      type: type || 'startup',
      stage: mappedStage
    })
    .select()
    .maybeSingle();
  
  if (ventureError) {
    return { success: false, error: ventureError.message };
  }
  
  const ventureId = newVenture.id;
  
  // Industry-specific worksheet templates and mock data
  const worksheetTemplates = getWorksheetTemplates(business_type, data_approach, user_data, project_stage);
  
  // Create worksheets
  const createdWorksheets = [];
  for (const template of worksheetTemplates) {
    const { data: worksheet, error: worksheetError } = await supabase
      .from('worksheets')
      .insert({
        user_id: userId,
        venture_id: ventureId,
        type: template.type,
        template_category: template.type,
        inputs: { fields: template.fields || [] },
        confidence_level: data_approach === 'real_data' ? 'actual' : 'mock'
      })
      .select()
      .maybeSingle();
    
    if (!worksheetError && worksheet) {
      createdWorksheets.push(worksheet);
    }
  }
  
  // Create sample KPIs based on business type
  const kpis = getBusinessTypeKPIs(business_type, data_approach, user_data);
  for (const kpi of kpis) {
    await supabase
      .from('kpis')
      .insert({
        venture_id: ventureId,
        name: kpi.name,
        value: kpi.value,
        confidence_level: kpi.confidence_level || 'estimate'
      });
  }
  
  const approachText = data_approach === 'industry_benchmarks' 
    ? 'with industry benchmark data that you can replace with real numbers later'
    : 'with your provided data';
    
  return { 
    success: true, 
    message: `🎉 Created "${name}" ${approachText}! Generated ${worksheetTemplates.length} worksheets: ${worksheetTemplates.map(t => t.name).join(', ')}. Visit your HQ Dashboard to explore your complete business setup!`,
    data: { 
      venture: newVenture, 
      worksheets: createdWorksheets,
      business_type 
    }
  };
}

function getWorksheetTemplates(businessType: string, dataApproach: string, userData: any, projectStage: string = 'new_project') {
  const isRealData = dataApproach === 'real_data';
  
  // Stage-specific worksheet focus
  const stageWorksheets = {
    new_project: {
      focus: "planning",
      additional: [
        {
          name: "Business Model Canvas",
          type: "strategic",
          fields: [
            { label: "Value Proposition", type: "text", value: isRealData ? "" : "Core value we provide to customers" },
            { label: "Target Customer Segments", type: "text", value: isRealData ? "" : "Primary customer groups" },
            { label: "Revenue Streams", type: "text", value: isRealData ? "" : "How we make money" },
            { label: "Key Partnerships", type: "text", value: isRealData ? "" : "Strategic partners needed" },
            { label: "Key Resources", type: "text", value: isRealData ? "" : "Critical assets required" }
          ]
        },
        {
          name: "Launch Timeline",
          type: "strategic",
          fields: [
            { label: "MVP Target Date", type: "text", value: isRealData ? "" : "3 months" },
            { label: "Beta Launch Date", type: "text", value: isRealData ? "" : "6 months" },
            { label: "Full Launch Date", type: "text", value: isRealData ? "" : "9 months" },
            { label: "Key Milestones", type: "text", value: isRealData ? "" : "Product dev, testing, marketing" }
          ]
        }
      ]
    },
    existing_business: {
      focus: "optimization",
      additional: [
        {
          name: "Current Performance Analysis",
          type: "operations",
          fields: [
            { label: "Current Monthly Revenue", type: "currency", value: isRealData ? (userData?.revenue || "0") : "15000" },
            { label: "Month-over-Month Growth %", type: "number", value: isRealData ? "0" : "8" },
            { label: "Top 3 Challenges", type: "text", value: isRealData ? "" : "Customer acquisition, operational efficiency, cash flow" },
            { label: "Biggest Opportunities", type: "text", value: isRealData ? "" : "Market expansion, product optimization" }
          ]
        },
        {
          name: "Scaling Strategy",
          type: "strategic", 
          fields: [
            { label: "6-Month Revenue Goal", type: "currency", value: isRealData ? "0" : "25000" },
            { label: "Team Growth Plan", type: "text", value: isRealData ? "" : "Hire 2 team members" },
            { label: "Market Expansion", type: "text", value: isRealData ? "" : "2 new geographic markets" },
            { label: "Investment Needed", type: "currency", value: isRealData ? "0" : "50000" }
          ]
        }
      ]
    },
    brainstorming: {
      focus: "exploration",
      additional: [
        {
          name: "Market Research",
          type: "strategic",
          fields: [
            { label: "Market Size Estimate", type: "currency", value: isRealData ? "0" : "5000000" },
            { label: "Key Competitors", type: "text", value: isRealData ? "" : "List 3-5 main competitors" },
            { label: "Competitive Advantage", type: "text", value: isRealData ? "" : "What makes us different" },
            { label: "Target Market Pain Points", type: "text", value: isRealData ? "" : "Problems we solve" }
          ]
        },
        {
          name: "Feasibility Assessment",
          type: "financial",
          fields: [
            { label: "Startup Costs Estimate", type: "currency", value: isRealData ? "0" : "25000" },
            { label: "Time to Revenue", type: "text", value: isRealData ? "" : "6-12 months" },
            { label: "Risk Level (1-10)", type: "number", value: "6" },
            { label: "Confidence Level", type: "text", value: isRealData ? "" : "Medium-High" }
          ]
        }
      ]
    }
  };
  
  const baseTemplates = {
    food_truck: [
      {
        name: "Daily Revenue Tracker",
        type: "financial",
        fields: [
          { label: "Daily Sales Target", type: "currency", value: isRealData ? (userData?.revenue || "500") : "650" },
          { label: "Average Order Value", type: "currency", value: isRealData ? "0" : "12.50" },
          { label: "Daily Customer Count", type: "number", value: isRealData ? (userData?.customer_count || "0") : "52" },
          { label: "Food Cost %", type: "number", value: "28" },
          { label: "Labor Cost %", type: "number", value: "25" }
        ],
        kpis: [
          { name: "Daily Revenue", value: isRealData ? (userData?.revenue || 500) : 650 },
          { name: "Food Cost %", value: 28 },
          { name: "Profit Margin %", value: 35 }
        ]
      },
      {
        name: "Location Analysis",
        type: "operations",
        fields: [
          { label: "Primary Location", type: "text", value: isRealData ? "" : "Downtown Business District" },
          { label: "Peak Hours", type: "text", value: "11:30 AM - 2:00 PM, 5:00 PM - 8:00 PM" },
          { label: "Foot Traffic Score", type: "number", value: isRealData ? "0" : "8" },
          { label: "Monthly Permit Cost", type: "currency", value: isRealData ? "0" : "450" }
        ]
      },
      {
        name: "Menu & Inventory",
        type: "operations",
        fields: [
          { label: "Menu Items Count", type: "number", value: isRealData ? "0" : "12" },
          { label: "Top Selling Item", type: "text", value: isRealData ? "" : "Signature Burger" },
          { label: "Inventory Turnover Days", type: "number", value: "3" },
          { label: "Waste %", type: "number", value: "8" }
        ]
      },
      {
        name: "Unit Economics",
        type: "financial",
        fields: [
          { label: "Cost per Customer", type: "currency", value: "8.20" },
          { label: "Customer Lifetime Value", type: "currency", value: isRealData ? "0" : "125" },
          { label: "Break-even Customers/Day", type: "number", value: "38" }
        ]
      },
      {
        name: "Growth Planning",
        type: "strategic", 
        fields: [
          { label: "Target Locations", type: "number", value: isRealData ? "1" : "3" },
          { label: "Marketing Budget %", type: "number", value: "12" },
          { label: "Expansion Timeline", type: "text", value: isRealData ? "" : "6-12 months" }
        ]
      }
    ],
    saas: [
      {
        name: "MRR & Growth",
        type: "financial",
        fields: [
          { label: "Monthly Recurring Revenue", type: "currency", value: isRealData ? (userData?.revenue || "0") : "25000" },
          { label: "Active Subscribers", type: "number", value: isRealData ? (userData?.customer_count || "0") : "500" },
          { label: "Average Revenue Per User", type: "currency", value: isRealData ? "0" : "50" },
          { label: "Monthly Growth Rate %", type: "number", value: isRealData ? "0" : "15" },
          { label: "Churn Rate %", type: "number", value: "8" }
        ],
        kpis: [
          { name: "MRR", value: isRealData ? (userData?.revenue || 0) : 25000 },
          { name: "Churn Rate %", value: 8 },
          { name: "Growth Rate %", value: 15 }
        ]
      },
      {
        name: "Customer Acquisition",
        type: "marketing",
        fields: [
          { label: "Customer Acquisition Cost", type: "currency", value: isRealData ? "0" : "120" },
          { label: "Customer Lifetime Value", type: "currency", value: isRealData ? "0" : "850" },
          { label: "LTV:CAC Ratio", type: "number", value: "7.1" },
          { label: "Conversion Rate %", type: "number", value: isRealData ? "0" : "3.2" },
          { label: "Trial to Paid %", type: "number", value: "18" }
        ]
      },
      {
        name: "Product Metrics",
        type: "operations",
        fields: [
          { label: "Daily Active Users", type: "number", value: isRealData ? "0" : "280" },
          { label: "Feature Adoption Rate %", type: "number", value: "65" },
          { label: "Support Tickets/Month", type: "number", value: "45" },
          { label: "Net Promoter Score", type: "number", value: "42" }
        ]
      },
      {
        name: "Pricing Tiers",
        type: "strategic",
        fields: [
          { label: "Basic Plan Price", type: "currency", value: isRealData ? (userData?.key_metrics?.basic_price || "0") : "29" },
          { label: "Pro Plan Price", type: "currency", value: isRealData ? (userData?.key_metrics?.pro_price || "0") : "79" },
          { label: "Enterprise Plan Price", type: "currency", value: isRealData ? (userData?.key_metrics?.enterprise_price || "0") : "199" },
          { label: "Most Popular Tier", type: "text", value: "Pro Plan" }
        ]
      },
      {
        name: "Cash Flow Forecast",
        type: "financial",
        fields: [
          { label: "Monthly Operating Costs", type: "currency", value: isRealData ? (userData?.monthly_expenses || "0") : "18000" },
          { label: "Runway Months", type: "number", value: isRealData ? "0" : "18" },
          { label: "Break-even MRR", type: "currency", value: "22000" },
          { label: "Next Funding Round", type: "currency", value: isRealData ? "0" : "500000" }
        ]
      }
    ],
    consulting: [
      {
        name: "Billable Hours & Rates",
        type: "financial",
        fields: [
          { label: "Hourly Rate", type: "currency", value: isRealData ? (userData?.key_metrics?.hourly_rate || "0") : "150" },
          { label: "Target Hours/Week", type: "number", value: isRealData ? "0" : "32" },
          { label: "Current Utilization %", type: "number", value: isRealData ? "0" : "75" },
          { label: "Monthly Revenue Target", type: "currency", value: isRealData ? (userData?.revenue || "0") : "19200" }
        ],
        kpis: [
          { name: "Utilization Rate %", value: 75 },
          { name: "Hourly Rate", value: isRealData ? (userData?.key_metrics?.hourly_rate || 150) : 150 },
          { name: "Monthly Revenue", value: isRealData ? (userData?.revenue || 19200) : 19200 }
        ]
      },
      {
        name: "Client Portfolio",
        type: "operations",
        fields: [
          { label: "Active Clients", type: "number", value: isRealData ? (userData?.customer_count || "0") : "6" },
          { label: "Average Project Value", type: "currency", value: isRealData ? "0" : "12500" },
          { label: "Client Retention Rate %", type: "number", value: "85" },
          { label: "Largest Client % of Revenue", type: "number", value: "35" }
        ]
      },
      {
        name: "Pipeline & Proposals",
        type: "marketing",
        fields: [
          { label: "Proposals Sent/Month", type: "number", value: isRealData ? "0" : "8" },
          { label: "Proposal Win Rate %", type: "number", value: "40" },
          { label: "Average Sales Cycle (Days)", type: "number", value: "21" },
          { label: "Pipeline Value", type: "currency", value: isRealData ? "0" : "75000" }
        ]
      },
      {
        name: "Business Development",
        type: "strategic",
        fields: [
          { label: "Referral Rate %", type: "number", value: "60" },
          { label: "Marketing Budget/Month", type: "currency", value: isRealData ? "0" : "800" },
          { label: "Networking Events/Month", type: "number", value: "4" },
          { label: "Content Pieces/Month", type: "number", value: "6" }
        ]
      },
      {
        name: "Capacity Planning",
        type: "operations",
        fields: [
          { label: "Max Billable Hours/Week", type: "number", value: "40" },
          { label: "Admin Time %", type: "number", value: "20" },
          { label: "Subcontractor Hours/Month", type: "number", value: isRealData ? "0" : "40" },
          { label: "Team Growth Plan", type: "text", value: isRealData ? "" : "Hire 1 associate in Q3" }
        ]
      }
    ]
  };
  
  // Default template for unrecognized business types
  const defaultTemplate = [
    {
      name: "Revenue Model",
      type: "financial",
      fields: [
        { label: "Monthly Revenue", type: "currency", value: isRealData ? (userData?.revenue || "0") : "10000" },
        { label: "Revenue Streams", type: "text", value: isRealData ? "" : "Primary service offering" },
        { label: "Growth Rate %", type: "number", value: isRealData ? "0" : "12" }
      ]
    },
    {
      name: "Cost Structure",
      type: "financial", 
      fields: [
        { label: "Monthly Operating Costs", type: "currency", value: isRealData ? (userData?.monthly_expenses || "0") : "6500" },
        { label: "Fixed Costs", type: "currency", value: "4000" },
        { label: "Variable Costs", type: "currency", value: "2500" }
      ]
    },
    {
      name: "Customer Metrics",
      type: "marketing",
      fields: [
        { label: "Customer Count", type: "number", value: isRealData ? (userData?.customer_count || "0") : "150" },
        { label: "Customer Acquisition Cost", type: "currency", value: "75" },
        { label: "Customer Lifetime Value", type: "currency", value: "500" }
      ]
    }
  ];
  
  
  // Get base business-type templates
  const businessTemplates = baseTemplates[businessType] || defaultTemplate;
  
  // Get stage-specific additional worksheets
  const stageSpecific = stageWorksheets[projectStage]?.additional || [];
  
  // Combine business templates with stage-specific worksheets
  const combinedTemplates = [...businessTemplates, ...stageSpecific];
  
  // Limit to 7 worksheets max, prioritizing business-specific ones
  return combinedTemplates.slice(0, 7);
}

function getBusinessTypeKPIs(businessType: string, dataApproach: string, userData: any) {
  const isRealData = dataApproach === 'real_data';
  
  const kpiSets = {
    food_truck: [
      { name: "Daily Revenue", value: isRealData ? (userData?.revenue || 500) : 650, confidence_level: isRealData ? 'actual' : 'estimate' },
      { name: "Food Cost %", value: 28, confidence_level: 'estimate' },
      { name: "Customer Count/Day", value: isRealData ? (userData?.customer_count || 40) : 52, confidence_level: isRealData ? 'actual' : 'estimate' },
      { name: "Average Order Value", value: 12.50, confidence_level: 'estimate' },
      { name: "Profit Margin %", value: 35, confidence_level: 'estimate' }
    ],
    saas: [
      { name: "Monthly Recurring Revenue", value: isRealData ? (userData?.revenue || 0) : 25000, confidence_level: isRealData ? 'actual' : 'estimate' },
      { name: "Churn Rate %", value: 8, confidence_level: 'estimate' },
      { name: "Customer Acquisition Cost", value: 120, confidence_level: 'estimate' },
      { name: "Lifetime Value", value: 850, confidence_level: 'estimate' },
      { name: "Monthly Growth %", value: 15, confidence_level: 'estimate' }
    ],
    consulting: [
      { name: "Hourly Rate", value: isRealData ? (userData?.key_metrics?.hourly_rate || 150) : 150, confidence_level: isRealData ? 'actual' : 'estimate' },
      { name: "Utilization Rate %", value: 75, confidence_level: 'estimate' },
      { name: "Monthly Revenue", value: isRealData ? (userData?.revenue || 19200) : 19200, confidence_level: isRealData ? 'actual' : 'estimate' },
      { name: "Client Retention %", value: 85, confidence_level: 'estimate' }
    ]
  };
  
  const defaultKPIs = [
    { name: "Monthly Revenue", value: isRealData ? (userData?.revenue || 10000) : 10000, confidence_level: isRealData ? 'actual' : 'estimate' },
    { name: "Customer Count", value: isRealData ? (userData?.customer_count || 100) : 150, confidence_level: isRealData ? 'actual' : 'estimate' },
    { name: "Growth Rate %", value: 12, confidence_level: 'estimate' }
  ];
  
  return kpiSets[businessType] || defaultKPIs;
}