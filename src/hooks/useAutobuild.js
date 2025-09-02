import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutobuild = () => {
  const [loading, setLoading] = useState(false);

  const autobuildVenture = async (ventureData) => {
    setLoading(true);
    try {
      // 1. Create the venture first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ventureInsert = {
        user_id: user.id,
        name: ventureData.name,
        description: ventureData.description || null,
        type: ventureData.type || null,
        stage: ventureData.stage || null
      };

      const { data: venture, error: ventureError } = await supabase
        .from('ventures')
        .insert(ventureInsert)
        .select('*')
        .single();

      if (ventureError) throw ventureError;

      // 2. Generate KPIs with confidence levels
      const kpis = generateKPIs(ventureData);
      await createKPIs(venture.id, kpis);

      // 3. Generate Worksheets with confidence levels
      const worksheets = generateWorksheets(ventureData);
      await createWorksheets(venture.id, worksheets);

      // 4. Assign relevant blocks
      const relevantBlocks = await getRelevantBlocks(ventureData);
      await assignBlocks(venture.id, relevantBlocks);

      return { success: true, data: { ...venture, status: venture.stage ? 'active' : 'draft', kpis: [] } };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const generateKPIs = (ventureData) => {
    const baseKPIs = [
      {
        name: 'Monthly Revenue',
        value: 0,
        confidence_level: 'mock'
      },
      {
        name: 'Customer Acquisition Cost',
        value: 0,
        confidence_level: 'mock'
      },
      {
        name: 'Customer Lifetime Value',
        value: 0,
        confidence_level: 'mock'
      },
      {
        name: 'Monthly Active Users',
        value: 0,
        confidence_level: 'mock'
      },
      {
        name: 'Gross Margin',
        value: 0,
        confidence_level: 'mock'
      }
    ];

    // Add industry-specific KPIs based on venture type
    if (ventureData.type === 'saas') {
      baseKPIs.push(
        {
          name: 'Monthly Recurring Revenue',
          value: 0,
          confidence_level: 'mock'
        },
        {
          name: 'Churn Rate',
          value: 0,
          confidence_level: 'mock'
        }
      );
    } else if (ventureData.type === 'ecommerce') {
      baseKPIs.push(
        {
          name: 'Average Order Value',
          value: 0,
          confidence_level: 'mock'
        },
        {
          name: 'Conversion Rate',
          value: 0,
          confidence_level: 'mock'
        }
      );
    }

    return baseKPIs;
  };

  const generateWorksheets = (ventureData) => {
    const baseWorksheets = [
      {
        type: 'cashflow',
        inputs: {
          monthly_revenue_target: 10000,
          monthly_expenses: 7500,
          growth_rate: 0.15
        },
        confidence_level: 'estimate'
      },
      {
        type: 'roi',
        inputs: {
          initial_investment: 50000,
          expected_return: 0.25,
          time_horizon: 12
        },
        confidence_level: 'estimate'
      },
      {
        type: 'breakeven',
        inputs: {
          fixed_costs: 5000,
          variable_cost_per_unit: 15,
          price_per_unit: 25
        },
        confidence_level: 'estimate'
      }
    ];

    // Add stage-specific worksheets
    if (ventureData.stage === 'seed' || ventureData.stage === 'idea') {
      baseWorksheets.push({
        type: 'market-sizing',
        inputs: {
          tam: 1000000000,
          sam: 100000000,
          som: 10000000
        },
        confidence_level: 'estimate'
      });
    }

    return baseWorksheets;
  };

  const createKPIs = async (ventureId, kpis) => {
    try {
      const kpiInserts = kpis.map(kpi => ({
        venture_id: ventureId,
        name: kpi.name,
        value: kpi.value,
        confidence_level: kpi.confidence_level
      }));

      const { error } = await supabase
        .from('kpis')
        .insert(kpiInserts);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating KPIs:', error);
    }
  };

  const createWorksheets = async (ventureId, worksheets) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const worksheetInserts = worksheets.map(worksheet => ({
        venture_id: ventureId,
        user_id: user.id,
        type: worksheet.type,
        inputs: worksheet.inputs,
        confidence_level: worksheet.confidence_level
      }));

      const { error } = await supabase
        .from('worksheets')
        .insert(worksheetInserts);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating worksheets:', error);
    }
  };

  const getRelevantBlocks = async (ventureData) => {
    try {
      // Get blocks that are relevant to this venture type and stage
      const { data: blocks, error } = await supabase
        .from('blocks')
        .select('id, category, name, description')
        .is('venture_id', null); // Only get template blocks

      if (error) throw error;

      // Filter blocks based on venture characteristics
      const relevantCategories = ['Finance', 'Market', 'Product', 'Strategy'];
      
      if (ventureData.stage === 'seed' || ventureData.stage === 'idea') {
        relevantCategories.push('Legal');
      }
      
      if (ventureData.type === 'saas') {
        relevantCategories.push('Product', 'Marketing');
      }

      return (blocks || []).filter(block => 
        relevantCategories.includes(block.category)
      ).slice(0, 20); // Limit to 20 most relevant blocks
    } catch (error) {
      console.error('Error getting relevant blocks:', error);
      return [];
    }
  };

  const assignBlocks = async (ventureId, blocks) => {
    try {
      // Create copies of template blocks for this venture
      const blockInserts = blocks.map(block => ({
        venture_id: ventureId,
        category: block.category,
        name: block.name,
        description: block.description || `Auto-assigned: ${block.name}`,
        status: 'planned'
      }));

      const { error } = await supabase
        .from('blocks')
        .insert(blockInserts);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning blocks:', error);
    }
  };

  return {
    autobuildVenture,
    loading
  };
};