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

  // Enhanced calculation logic with scoped variables per case
  const calculateToolOutputs = (tool, inputs) => {
    switch (tool.id) {
      // Financial Tools
      case 'roi_calculator': {
        const investment = Number(inputs.investment || 0);
        const revenue = Number(inputs.revenue || 0);
        const timeframe = Number(inputs.timeframe || 12);
        const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0;
        const paybackPeriod = revenue > 0 ? (investment / (revenue / timeframe)) : 0;
        return {
          roi_percentage: Math.round(roi * 100) / 100,
          payback_period: Math.round(paybackPeriod * 100) / 100,
          net_profit: Math.round((revenue - investment) * 100) / 100
        };
      }

      case 'runway_calculator': {
        const runwayCurrentCash = Number(inputs.current_cash || 0);
        const runwayMonthlyBurn = Number(inputs.monthly_burn || 0);
        const runwayMonths = runwayMonthlyBurn > 0 ? runwayCurrentCash / runwayMonthlyBurn : Infinity;
        const recs = [];
        if (runwayMonths < 3) recs.push('Critical: Immediate funding needed');
        if (runwayMonths < 6) recs.push('Consider reducing burn rate');
        if (runwayMonths < 12) recs.push('Explore additional funding');
        if (runwayMonths > 18) recs.push('Runway looks healthy');
        return {
          runway_months: runwayMonths === Infinity ? 999 : Math.round(runwayMonths * 100) / 100,
          runway_date: runwayMonths === Infinity ? 'Indefinite' : new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recommendations: recs
        };
      }

      case 'breakeven_calculator': {
        const beFixed = Number(inputs.fixed_costs || 0);
        const beVarCost = Number(inputs.variable_cost_per_unit || 0);
        const bePrice = Number(inputs.price_per_unit || 0);
        const beContribution = bePrice - beVarCost;
        const beUnits = beContribution > 0 ? beFixed / beContribution : 0;
        return {
          breakeven_units: Math.ceil(beUnits),
          breakeven_revenue: Math.round(Math.ceil(beUnits) * bePrice),
          contribution_margin: Math.round(beContribution * 100) / 100
        };
      }

      // Marketing Tools
      case 'cac_calculator': {
        const cacSpend = Number(inputs.marketing_spend || 0);
        const cacCustomers = Number(inputs.customers_acquired || 1);
        const cacValue = cacSpend / cacCustomers;
        const efficiency = cacValue < 50 ? 95 : cacValue < 150 ? 75 : cacValue < 300 ? 50 : 25;
        return {
          cac: Math.round(cacValue * 100) / 100,
          cac_by_channel: { overall: Math.round(cacValue * 100) / 100 },
          efficiency_score: efficiency
        };
      }

      case 'ltv_calculator': {
        const ltvAov = Number(inputs.avg_order_value || 0);
        const ltvFreq = Number(inputs.purchase_frequency || 0);
        const ltvLifespan = Number(inputs.customer_lifespan || 0);
        const ltvMargin = Number(inputs.gross_margin || 0);
        const annualValue = ltvAov * ltvFreq;
        const ltv = annualValue * ltvLifespan;
        const lifetimeProfit = ltv * (ltvMargin / 100);
        return {
          ltv: Math.round(ltv),
          annual_value: Math.round(annualValue),
          lifetime_profit: Math.round(lifetimeProfit)
        };
      }

      case 'market_sizer':
      case 'tam_sam_som': {
        const totalMarket = Number(inputs.total_population || inputs.total_market || 0);
        const targetPercent = Number(inputs.target_demographic_percent || inputs.addressable_percent || 0);
        const avgSpending = Number(inputs.avg_spending || 0);
        const obtainable = Number(inputs.obtainable_percent || inputs.market_penetration || 0);
        const tam = totalMarket * avgSpending || Number(inputs.total_market || 0);
        const sam = tam * (targetPercent / 100);
        const som = sam * (obtainable / 100);
        return { tam: Math.round(tam), sam: Math.round(sam), som: Math.round(som) };
      }

      case 'churn_simulator': {
        const churnRate = Number(inputs.monthly_churn_rate || 0) / 100;
        const startCustomers = Number(inputs.customers || 0);
        const months = Number(inputs.months || 0);
        const remaining = startCustomers * Math.pow(1 - churnRate, months);
        return {
          remaining_customers: Math.floor(remaining),
          customers_lost: startCustomers - Math.floor(remaining)
        };
      }

      case 'pricing_optimizer': {
        const elasticity = Number(inputs.demand_elasticity || 0);
        const priceChange = Number(inputs.price_change || 0) / 100;
        const demandChange = -elasticity * priceChange;
        return {
          new_demand: Math.round((1 + demandChange) * 10000) / 100,
          revenue_impact: Math.round(((1 + priceChange) * (1 + demandChange) - 1) * 10000) / 100
        };
      }

      case 'funding_calculator': {
        const targetRunway = Number(inputs.target_runway || 0);
        const fundingMonthlyBurn = Number(inputs.monthly_burn || 0);
        const fundingRevenueGrowth = Number(inputs.revenue_growth || 0) / 100;
        return {
          funding_needed: Math.round(targetRunway * fundingMonthlyBurn),
          target_revenue: Math.round(fundingMonthlyBurn * fundingRevenueGrowth * targetRunway)
        };
      }

      case 'equity_calculator': {
        const preMoney = Number(inputs.pre_money_valuation || 0);
        const investmentAmount = Number(inputs.investment_amount || 0);
        const postMoney = preMoney + investmentAmount;
        const investorOwnership = postMoney > 0 ? (investmentAmount / postMoney) * 100 : 0;
        return {
          post_money_valuation: Math.round(postMoney),
          investor_ownership: Math.round(investorOwnership * 100) / 100,
          dilution_percent: Math.round(investorOwnership * 100) / 100
        };
      }

      default:
        return { result: 'Calculation not implemented' };
    }
  };

  // Link tool run to block/kpi/worksheet
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

      const { data, error } = await supabase
        .from('kpis')
        .insert({
          venture_id: ventureId,
          name: run.tool_id.replace('_calculator', '').toUpperCase(),
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