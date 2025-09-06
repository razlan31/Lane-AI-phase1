import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Deterministic calculation engine - NO AI for numeric computations
class ScenarioCalculator {
  static parseScenario(scenarioText) {
    const variables = new Map();
    const assumptions = {};
    let missingInputs = [];

    // Extract numeric patterns
    const numberPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:people|employees|staff|workers)/gi,
      /\$(\d+(?:,\d+)*(?:\.\d+)?)/g,
      /(\d+(?:\.\d+)?)\s*(?:%|percent)/gi,
      /(\d+(?:\.\d+)?)\s*(?:months?|years?|days?)/gi,
      /(\d+(?:\.\d+)?)\s*(?:projects?|clients?|customers?)/gi
    ];

    // Basic variable extraction
    if (scenarioText.match(/hire|people|employees/i)) {
      const hireMatch = scenarioText.match(/(\d+)\s*(?:people|employees|staff)/i);
      if (hireMatch) variables.set('employee_count', parseFloat(hireMatch[1]));
    }

    if (scenarioText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/)) {
      const salaryMatch = scenarioText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per\s+month|\/month|monthly)/i);
      if (salaryMatch) {
        variables.set('monthly_salary', parseFloat(salaryMatch[1].replace(/,/g, '')));
      }

      const projectMatch = scenarioText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:per\s+project|\/project)/i);
      if (projectMatch) {
        variables.set('revenue_per_project', parseFloat(projectMatch[1].replace(/,/g, '')));
      }

      const startingRevMatch = scenarioText.match(/starting\s+at\s+\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (startingRevMatch) {
        variables.set('starting_revenue', parseFloat(startingRevMatch[1].replace(/,/g, '')));
      }

      const expenseMatch = scenarioText.match(/expenses?\s+(?:are|of)\s+\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (expenseMatch) {
        variables.set('monthly_expenses', parseFloat(expenseMatch[1].replace(/,/g, '')));
      }
    }

    if (scenarioText.match(/(\d+(?:\.\d+)?)\s*%/)) {
      const growthMatch = scenarioText.match(/(?:grows?|growth)\s+(\d+(?:\.\d+)?)\s*%/i);
      if (growthMatch) {
        variables.set('growth_rate', parseFloat(growthMatch[1]) / 100);
      }
    }

    if (scenarioText.match(/(\d+)\s*months?/i)) {
      const monthMatch = scenarioText.match(/(\d+)\s*months?/i);
      if (monthMatch) {
        variables.set('period_months', parseFloat(monthMatch[1]));
      }
    }

    return { variables, assumptions, missingInputs };
  }

  static calculateBreakeven(variables) {
    const employeeCount = variables.get('employee_count') || 0;
    const monthlySalary = variables.get('monthly_salary') || 0;
    const revenuePerProject = variables.get('revenue_per_project') || 0;
    const otherExpenses = variables.get('other_monthly_expenses') || 0;

    if (!revenuePerProject) {
      return { error: 'Missing revenue per project' };
    }

    const totalMonthlyCost = (employeeCount * monthlySalary) + otherExpenses;
    const projectsNeeded = Math.ceil(totalMonthlyCost / revenuePerProject);

    return {
      monthly_cost: totalMonthlyCost,
      revenue_per_project: revenuePerProject,
      projects_needed_breakeven: projectsNeeded,
      annual_revenue_needed: projectsNeeded * revenuePerProject * 12,
      confidence: revenuePerProject > 0 ? 0.9 : 0.3
    };
  }

  static calculateCashflow(variables) {
    const startingRevenue = variables.get('starting_revenue') || 0;
    const monthlyExpenses = variables.get('monthly_expenses') || 0;
    const growthRate = variables.get('growth_rate') || 0;
    const periodMonths = variables.get('period_months') || 12;

    if (!startingRevenue || !monthlyExpenses) {
      return { error: 'Missing starting revenue or monthly expenses' };
    }

    const cashflowTable = [];
    let currentRevenue = startingRevenue;
    let cumulativeBalance = 0;

    for (let month = 1; month <= periodMonths; month++) {
      const netCashflow = currentRevenue - monthlyExpenses;
      cumulativeBalance += netCashflow;

      cashflowTable.push({
        month,
        revenue: Math.round(currentRevenue),
        expenses: monthlyExpenses,
        net_cashflow: Math.round(netCashflow),
        cumulative_balance: Math.round(cumulativeBalance)
      });

      currentRevenue *= (1 + growthRate);
    }

    const finalBalance = cumulativeBalance;
    const averageMonthlyGrowth = Math.round((currentRevenue - startingRevenue) / periodMonths);

    return {
      cashflow_table: cashflowTable,
      final_balance: Math.round(finalBalance),
      total_revenue: Math.round(cashflowTable.reduce((sum, row) => sum + row.revenue, 0)),
      total_expenses: Math.round(cashflowTable.reduce((sum, row) => sum + row.expenses, 0)),
      average_monthly_growth: averageMonthlyGrowth,
      runway_months: finalBalance < 0 ? cashflowTable.findIndex(row => row.cumulative_balance < 0) : null,
      confidence: (startingRevenue && monthlyExpenses && growthRate >= 0) ? 0.85 : 0.4
    };
  }

  static calculateGeneral(variables, scenarioText) {
    // Detect scenario type and route to appropriate calculator
    if (scenarioText.match(/break\s*even|breakeven|projects?\s+per\s+month/i)) {
      return this.calculateBreakeven(variables);
    }
    
    if (scenarioText.match(/cashflow|cash\s+flow|monthly.*grow/i)) {
      return this.calculateCashflow(variables);
    }

    // Default calculation for unrecognized patterns
    return {
      message: 'Scenario type not fully recognized',
      extracted_variables: Object.fromEntries(variables),
      confidence: 0.2
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenarioText, context = {}, userId } = await req.json();

    if (!scenarioText) {
      return new Response(JSON.stringify({ error: 'scenarioText is required' }), {
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

    // Step 1: Parse scenario deterministically
    const { variables, assumptions, missingInputs } = ScenarioCalculator.parseScenario(scenarioText);
    console.log('Parsed variables:', Object.fromEntries(variables));

    // Step 2: Check for missing essential inputs
    let clarifyingQuestions = [];
    if (scenarioText.match(/break\s*even/i) && !variables.has('revenue_per_project')) {
      clarifyingQuestions.push('What is your revenue per project or client?');
    }
    if (scenarioText.match(/hire|employee/i) && !variables.has('monthly_salary')) {
      clarifyingQuestions.push('What is the monthly salary per employee?');
    }
    if (scenarioText.match(/cashflow/i) && !variables.has('starting_revenue')) {
      clarifyingQuestions.push('What is your current monthly revenue?');
    }

    if (clarifyingQuestions.length > 0) {
      return new Response(JSON.stringify({
        needs_clarification: true,
        questions: clarifyingQuestions,
        parsed_variables: Object.fromEntries(variables)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Run deterministic calculations
    const result = ScenarioCalculator.calculateGeneral(variables, scenarioText);
    
    if (result.error) {
      return new Response(JSON.stringify({
        needs_clarification: true,
        questions: [result.error],
        parsed_variables: Object.fromEntries(variables)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Use OpenAI for explanation formatting only
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    let explanation = 'Calculation completed successfully.';
    
    if (openAIApiKey) {
      try {
        const explainResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are explaining business calculations. Be concise, clear, and show step-by-step reasoning. Focus only on explanation, not computation.'
              },
              {
                role: 'user',
                content: `Explain this calculation result for the scenario "${scenarioText}":
                
Variables used: ${JSON.stringify(Object.fromEntries(variables), null, 2)}
Calculation result: ${JSON.stringify(result, null, 2)}

Provide a clear, step-by-step explanation of what was calculated and why.`
              }
            ],
            max_tokens: 500,
            temperature: 0.3
          }),
        });

        if (explainResponse.ok) {
          const explainData = await explainResponse.json();
          explanation = explainData.choices?.[0]?.message?.content || explanation;
        }
      } catch (e) {
        console.error('OpenAI explanation error:', e);
        // Continue without explanation if OpenAI fails
      }
    }

    // Step 5: Generate suggested schema for worksheet conversion
    const suggestedSchema = {
      title: scenarioText.slice(0, 50) + (scenarioText.length > 50 ? '...' : ''),
      fields: Array.from(variables.entries()).map(([key, value]) => ({
        name: key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: typeof value === 'number' ? 'number' : 'text',
        defaultValue: value
      }))
    };

    return new Response(JSON.stringify({
      scenario_id: `scenario_${Date.now()}_${user.id}`,
      assumptions: Object.fromEntries(variables),
      computed_results: result,
      confidence_score: result.confidence || 0.5,
      explanation_text: explanation,
      suggested_schema: suggestedSchema,
      calculation_meta: {
        engine: 'deterministic_js',
        timestamp: new Date().toISOString(),
        user_id: user.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scenario eval error:', error);
    return new Response(JSON.stringify({ 
      error: 'Scenario evaluation failed', 
      detail: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});