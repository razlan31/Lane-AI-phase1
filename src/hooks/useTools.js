import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTools = () => {
  const [tools, setTools] = useState([]);
  const [toolRuns, setToolRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tools catalog and user's tool runs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tools catalog
        const { data: toolsData, error: toolsError } = await supabase
          .from('tools')
          .select('*')
          .order('category', { ascending: true });

        if (toolsError) throw toolsError;
        setTools(toolsData || []);

        // Fetch user's tool runs
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: runsData, error: runsError } = await supabase
            .from('tool_runs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (runsError) throw runsError;
          setToolRuns(runsData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run a tool with inputs
  const runTool = async (toolId, inputs) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const tool = tools.find(t => t.id === toolId);
      if (!tool) throw new Error('Tool not found');

      // Calculate outputs based on tool logic
      const outputs = calculateToolOutputs(tool, inputs);

      // Save tool run
      const { data, error } = await supabase
        .from('tool_runs')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          inputs,
          outputs
        })
        .select()
        .single();

      if (error) throw error;

      setToolRuns(prev => [data, ...prev]);
      return { success: true, data, outputs };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // New tool_* IDs with scoped variables per case and backward-compatible input names
  const calculateToolOutputs = (tool, inputs) => {
    switch (tool.id) {
      // -----------------------------
      // Finance Tools
      // -----------------------------
      case 'tool_roi_calc': {
        const investmentAmount = Number(inputs.investment ?? inputs.initial_investment ?? 0);
        const returnAmount = Number(inputs.return ?? inputs.revenue ?? 0);
        const roiPercent = investmentAmount > 0 ? ((returnAmount - investmentAmount) / investmentAmount) * 100 : 0;
        return { roi_percent: Math.round(roiPercent * 10) / 10 };
      }

      case 'tool_runway_calc': {
        const runwayCashBalance = Number(inputs.cash_balance ?? inputs.current_cash ?? 0);
        const runwayMonthlyBurn = Number(inputs.monthly_burn ?? 0);
        const months = runwayMonthlyBurn > 0 ? runwayCashBalance / runwayMonthlyBurn : 999;
        return { runway_months: Math.round(months * 10) / 10 };
      }

      case 'tool_breakeven_calc': {
        const breakevenFixedCosts = Number(inputs.fixed_costs ?? 0);
        const breakevenPricePerUnit = Number(inputs.price_per_unit ?? 0);
        const breakevenVariableCost = Number(inputs.variable_cost_per_unit ?? 0);
        const cm = breakevenPricePerUnit - breakevenVariableCost;
        const units = cm > 0 ? breakevenFixedCosts / cm : 0;
        return { breakeven_units: Math.round(units) };
      }

      case 'tool_cashflow_proj': {
        const cashflowStartingBalance = Number(inputs.starting_balance ?? inputs.starting_cash ?? 0);
        const inflows = (inputs.monthly_inflows ?? inputs.monthly_revenue ?? []);
        const outflows = (inputs.monthly_outflows ?? inputs.monthly_expenses ?? []);
        let balance = cashflowStartingBalance;
        const balances = [];
        const n = Math.max(Array.isArray(inflows) ? inflows.length : 0, Array.isArray(outflows) ? outflows.length : 0, 12);
        for (let i = 0; i < n; i++) {
          const inVal = Number(Array.isArray(inflows) ? (inflows[i] ?? 0) : inflows ?? 0);
          const outVal = Number(Array.isArray(outflows) ? (outflows[i] ?? 0) : outflows ?? 0);
          balance += (inVal - outVal);
          balances.push(Math.round(balance));
        }
        return { ending_balance: balances };
      }

      case 'tool_debt_repay': {
        const debtPrincipal = Number(inputs.principal ?? 0);
        const debtAnnualRate = Number(inputs.annual_rate ?? 0) / 100;
        const debtTermMonths = Number(inputs.term_months ?? 0);
        const monthlyRate = debtAnnualRate / 12;
        const monthlyPayment = monthlyRate > 0
          ? (debtPrincipal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -debtTermMonths))
          : (debtPrincipal / Math.max(debtTermMonths, 1));
        return {
          monthly_payment: Math.round(monthlyPayment * 100) / 100,
          total_interest: Math.round((monthlyPayment * debtTermMonths - debtPrincipal) * 100) / 100
        };
      }

      case 'tool_valuation_est': {
        const valuationAnnualRevenue = Number(inputs.annual_revenue ?? 0);
        const valuationMultiple = Number(inputs.multiple ?? 1);
        return { valuation: Math.round(valuationAnnualRevenue * valuationMultiple) };
      }

      // -----------------------------
      // Marketing Tools
      // -----------------------------
      case 'tool_cac_calc': {
        const cacSpend = Number(inputs.marketing_spend ?? 0);
        const cacNewCustomers = Number(inputs.new_customers ?? inputs.customers_acquired ?? 1);
        return { cac: Math.round((cacSpend / cacNewCustomers) * 100) / 100 };
      }

      case 'tool_ltv_calc': {
        const ltvArpu = Number(inputs.arpu ?? inputs.avg_order_value ?? 0);
        const ltvGrossMargin = Number(inputs.gross_margin ?? 0) / 100;
        const ltvRetentionMonths = Number(inputs.retention_months ?? inputs.customer_lifespan ?? 0);
        return { ltv: Math.round((ltvArpu * ltvGrossMargin * ltvRetentionMonths) * 100) / 100 };
      }

      case 'tool_funnel_dropoff': {
        const funnelStages = Array.isArray(inputs.stages) ? inputs.stages : [];
        const dropoffRates = [];
        for (let i = 1; i < funnelStages.length; i++) {
          const rate = 1 - (Number(funnelStages[i]) / Math.max(Number(funnelStages[i - 1]), 1));
          dropoffRates.push(Math.round(rate * 1000) / 10);
        }
        const conversionRate = funnelStages.length > 1
          ? Math.round((Number(funnelStages[funnelStages.length - 1]) / Math.max(Number(funnelStages[0]), 1)) * 1000) / 10
          : 0;
        return { dropoff_rates: dropoffRates, conversion_rate: conversionRate };
      }

      case 'tool_roas_calc': {
        const roasSpend = Number(inputs.ad_spend ?? 0);
        const roasRevenue = Number(inputs.revenue_generated ?? 0);
        return { roas: roasSpend > 0 ? Math.round((roasRevenue / roasSpend) * 100) / 100 : 0 };
      }

      // -----------------------------
      // Risk Tools
      // -----------------------------
      case 'tool_sensitivity': {
        const base = Number(inputs.base_value ?? 0);
        const pct = Number(inputs.variation_percent ?? 0) / 100;
        const low = base * (1 - pct);
        const high = base * (1 + pct);
        return { range: [Math.round(low * 100) / 100, Math.round(high * 100) / 100] };
      }

      case 'tool_concentration_risk': {
        const values = Array.isArray(inputs.values) ? inputs.values.map(Number) : [];
        const total = values.reduce((a, b) => a + b, 0);
        const index = total > 0 ? values.reduce((a, b) => a + Math.pow(b / total, 2), 0) : 0;
        return { concentration_index: Math.round(index * 100) / 100 };
      }

      case 'tool_portfolio_diversification': {
        const revs = Array.isArray(inputs.venture_revenues) ? inputs.venture_revenues.map(Number) : [];
        const mean = revs.length ? revs.reduce((a, b) => a + b, 0) / revs.length : 0;
        const variance = revs.length ? revs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / revs.length : 0;
        const score = 1 / (1 + variance);
        return { diversification_score: Math.round(score * 100) / 100 };
      }

      // -----------------------------
      // Personal Tools
      // -----------------------------
      case 'tool_personal_runway': {
        const personalSavings = Number(inputs.savings ?? 0);
        const personalMonthlyExpenses = Number(inputs.monthly_expenses ?? 0);
        const monthsRunway = personalMonthlyExpenses > 0 ? personalSavings / personalMonthlyExpenses : 0;
        return { months_runway: Math.round(monthsRunway * 10) / 10 };
      }

      case 'tool_workload_balance': {
        const workloadWorkHours = Number(inputs.work_hours ?? 0);
        const workloadPersonalHours = Number(inputs.personal_hours ?? 0);
        const total = workloadWorkHours + workloadPersonalHours;
        const score = total > 0 ? (workloadWorkHours / total) * 100 : 0;
        return { balance_score: Math.round(score * 10) / 10 };
      }

      case 'tool_burnout_risk': {
        const burnoutWorkHours = Number(inputs.work_hours ?? 0);
        const burnoutStressLevel = Number(inputs.stress_level ?? 0);
        const risk = Math.min(100, (burnoutWorkHours / 60) * 50 + burnoutStressLevel * 5);
        return { burnout_risk_percent: Math.round(risk * 10) / 10 };
      }

      // -----------------------------
      // Growth Tools
      // -----------------------------
      case 'tool_viral_coeff': {
        const invitations = Number(inputs.invitations_sent ?? 0);
        const conv = Number(inputs.conversion_rate ?? 0) / 100;
        return { viral_coefficient: Math.round(invitations * conv * 100) / 100 };
      }

      case 'tool_pipeline_velocity': {
        const opps = Number(inputs.opportunities ?? 0);
        const deal = Number(inputs.deal_size ?? 0);
        const win = Number(inputs.win_rate ?? 0) / 100;
        const days = Number(inputs.sales_cycle_days ?? 1);
        const velocity = days > 0 ? (opps * deal * win) / days : 0;
        return { pipeline_velocity: Math.round(velocity * 100) / 100 };
      }

      default:
        return { result: 'Calculation not implemented' };
    }
  };
  const linkToContext = async (runId, contextType, contextId) => {
    try {
      const linkedContext = { type: contextType, id: contextId };
      
      const { data, error } = await supabase
        .from('tool_runs')
        .update({ linked_context: linkedContext })
        .eq('id', runId)
        .select()
        .single();

      if (error) throw error;

      setToolRuns(prev => prev.map(run => 
        run.id === runId ? data : run
      ));
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Convert tool output to KPI
  const convertToKPI = async (runId, ventureId, blockId) => {
    try {
      const run = toolRuns.find(r => r.id === runId);
      if (!run) throw new Error('Tool run not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create KPI from tool output
      const primaryOutput = Object.keys(run.outputs)[0];
      const value = run.outputs[primaryOutput];

      const toolDef = tools.find(t => t.id === run.tool_id);
      const kpiName = (toolDef?.name || run.tool_id).toUpperCase();

      const { data, error } = await supabase
        .from('kpis')
        .insert({
          venture_id: ventureId,
          name: kpiName,
          value: parseFloat(value) || value,
          confidence_level: 'estimate'
        })
        .select()
        .single();

      if (error) throw error;

      // Link the tool run to this KPI
      await linkToContext(runId, 'kpi', data.id);
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Get suggested blocks for a tool
  const getSuggestedBlocks = async (toolId) => {
    try {
      const { data, error } = await supabase
        .from('tool_block_links')
        .select(`
          block_id,
          blocks!inner(*)
        `)
        .eq('tool_id', toolId);

      if (error) throw error;
      return data.map(link => link.blocks);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Filter tools by category
  const getToolsByCategory = (category) => {
    return tools.filter(tool => tool.category === category);
  };

  // Get recent tool runs
  const getRecentRuns = (limit = 10) => {
    return toolRuns.slice(0, limit);
  };

  return {
    tools,
    toolRuns,
    loading,
    error,
    runTool,
    linkToContext,
    convertToKPI,
    getSuggestedBlocks,
    getToolsByCategory,
    getRecentRuns
  };
};