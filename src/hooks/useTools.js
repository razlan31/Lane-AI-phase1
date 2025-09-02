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

  // Enhanced calculation logic for all 18 tools
  const calculateToolOutputs = (tool, inputs) => {
    switch (tool.id) {
      // Financial Tools
      case 'roi_calculator':
        const investment = inputs.investment || 0;
        const revenue = inputs.revenue || 0;
        const timeframe = inputs.timeframe || 12;
        const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0;
        const paybackPeriod = revenue > 0 ? (investment / (revenue / timeframe)) : 0;
        return {
          roi_percentage: Math.round(roi * 100) / 100,
          payback_period: Math.round(paybackPeriod * 100) / 100,
          net_profit: revenue - investment
        };

      case 'runway_calculator':
        const currentCash = inputs.current_cash || 0;
        const monthlyBurn = inputs.monthly_burn || 0;
        const revenueGrowth = inputs.revenue_growth || 0;
        const runwayMonths = monthlyBurn > 0 ? currentCash / monthlyBurn : Infinity;
        const recommendations = [];
        if (runwayMonths < 3) recommendations.push('Critical: Immediate funding needed');
        if (runwayMonths < 6) recommendations.push('Consider reducing burn rate');
        if (runwayMonths < 12) recommendations.push('Explore additional funding');
        if (runwayMonths > 18) recommendations.push('Runway looks healthy');
        return {
          runway_months: runwayMonths === Infinity ? 999 : Math.round(runwayMonths * 100) / 100,
          runway_date: runwayMonths === Infinity ? 'Indefinite' : new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          recommendations
        };

      case 'breakeven_calculator':
        const fixedCosts = inputs.fixed_costs || 0;
        const variableCost = inputs.variable_cost_per_unit || 0;
        const pricePerUnit = inputs.price_per_unit || 0;
        const contributionMargin = pricePerUnit - variableCost;
        outputs.breakeven_units = Math.ceil(inputs.fixed_costs / contributionMargin);
        outputs.breakeven_revenue = (outputs.breakeven_units * inputs.price_per_unit).toFixed(2);
        break;

      case 'cac_calculator':
        outputs.cac = (inputs.marketing_spend / inputs.customers_acquired).toFixed(2);
        break;

      case 'ltv_calculator':
        outputs.ltv = ((inputs.monthly_revenue * inputs.gross_margin) / inputs.churn_rate).toFixed(2);
        break;

      case 'tam_sam_som':
        outputs.tam = inputs.total_market;
        outputs.sam = (inputs.total_market * inputs.addressable_percent / 100).toFixed(0);
        outputs.som = (outputs.sam * inputs.obtainable_percent / 100).toFixed(0);
        break;

      case 'churn_simulator':
        const churnRate = inputs.monthly_churn_rate / 100;
        const remaining = inputs.customers * Math.pow(1 - churnRate, inputs.months);
        outputs.remaining_customers = Math.floor(remaining);
        outputs.customers_lost = inputs.customers - outputs.remaining_customers;
        break;

      case 'pricing_optimizer':
        const elasticity = inputs.demand_elasticity;
        const priceChange = inputs.price_change / 100;
        const demandChange = -elasticity * priceChange;
        outputs.new_demand = ((1 + demandChange) * 100).toFixed(2);
        outputs.revenue_impact = ((1 + priceChange) * (1 + demandChange) - 1) * 100;
        break;

      case 'funding_calculator':
        const targetRunway = inputs.target_runway;
        const monthlyBurn = inputs.monthly_burn;
        const revenueGrowth = inputs.revenue_growth / 100;
        outputs.funding_needed = (targetRunway * monthlyBurn).toFixed(0);
        outputs.target_revenue = (monthlyBurn * revenueGrowth * targetRunway).toFixed(0);
        break;

      case 'equity_calculator':
        const postMoney = inputs.pre_money_valuation + inputs.investment_amount;
        outputs.post_money_valuation = postMoney;
        outputs.investor_ownership = ((inputs.investment_amount / postMoney) * 100).toFixed(2);
        outputs.dilution_percent = outputs.investor_ownership;
        break;

      default:
        outputs.result = 'Calculation not implemented';
    }

    return outputs;
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