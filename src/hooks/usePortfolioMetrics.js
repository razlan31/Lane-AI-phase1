import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, BarChart3, AlertTriangle, Plus } from 'lucide-react';

export const usePortfolioMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const calculatePortfolioMetrics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all ventures for the user
      const { data: ventures, error: venturesError } = await supabase
        .from('ventures')
        .select('*')
        .eq('user_id', user.id);

      if (venturesError) throw venturesError;

      // If no ventures, return empty metrics
      if (!ventures || ventures.length === 0) {
        const emptyMetrics = {
          total_revenue: 0,
          total_burn_rate: 0,
          total_runway: 0,
          portfolio_roi: 0,
          risk_score: 0,
          diversification_score: 0,
          metadata: {
            ventures_count: 0,
            kpis_count: 0,
            worksheets_count: 0,
            roi_data_points: 0
          }
        };
        setMetrics(emptyMetrics);
        setLoading(false);
        return;
      }

      // Get all KPIs for user's ventures
      const ventureIds = ventures?.map(v => v.id) || [];
      let allKpis = [];
      
      if (ventureIds.length > 0) {
        const { data: kpis, error: kpisError } = await supabase
          .from('kpis')
          .select('*')
          .in('venture_id', ventureIds);

        if (kpisError) throw kpisError;
        allKpis = kpis || [];
      }

      // Get all worksheets for calculations
      let allWorksheets = [];
      if (ventureIds.length > 0) {
        const { data: worksheets, error: worksheetsError } = await supabase
          .from('worksheets')
          .select('*')
          .in('venture_id', ventureIds);

        if (worksheetsError) throw worksheetsError;
        allWorksheets = worksheets || [];
      }

      // Calculate aggregated metrics
      const portfolioMetrics = calculateAggregatedMetrics(ventures, allKpis, allWorksheets);

      // Store calculated metrics in portfolio_metrics table
      const { error: upsertError } = await supabase
        .from('portfolio_metrics')
        .upsert({
          user_id: user.id,
          ...portfolioMetrics,
          calculated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error('Portfolio metrics upsert error:', upsertError);
      }

      setMetrics(portfolioMetrics);
    } catch (err) {
      console.error('Error calculating portfolio metrics:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to calculate portfolio metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedMetrics = (ventures, kpis, worksheets) => {
    let totalRevenue = 0;
    let totalBurnRate = 0;
    let totalRunway = 0;
    let roiValues = [];
    let riskFactors = [];

    // Aggregate from KPIs
    kpis.forEach(kpi => {
      const value = parseFloat(kpi.value) || 0;
      
      if (kpi.name.toLowerCase().includes('revenue')) {
        totalRevenue += value;
      } else if (kpi.name.toLowerCase().includes('burn') || kpi.name.toLowerCase().includes('expense')) {
        totalBurnRate += value;
      } else if (kpi.name.toLowerCase().includes('runway')) {
        totalRunway = Math.max(totalRunway, value);
      } else if (kpi.name.toLowerCase().includes('roi')) {
        roiValues.push(value);
      }
    });

    // Aggregate from worksheet outputs
    worksheets.forEach(worksheet => {
      if (worksheet.outputs) {
        const outputs = worksheet.outputs;
        
        if (outputs.totalRevenue) {
          totalRevenue += parseFloat(outputs.totalRevenue) || 0;
        }
        if (outputs.monthlyBurn || outputs.averageMonthlyCashflow) {
          totalBurnRate += Math.abs(parseFloat(outputs.monthlyBurn || outputs.averageMonthlyCashflow) || 0);
        }
        if (outputs.roi || outputs.roiPercentage) {
          roiValues.push(parseFloat(outputs.roi || outputs.roiPercentage) || 0);
        }
        if (outputs.runway) {
          totalRunway = Math.max(totalRunway, parseFloat(outputs.runway) || 0);
        }
      }
    });

    // Calculate averages and risk scores
    const portfolioROI = roiValues.length > 0 
      ? roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length 
      : 0;

    // Simple risk scoring based on burn rate vs revenue
    let riskScore = 50; // neutral
    if (totalRevenue > 0) {
      const burnToRevenueRatio = totalBurnRate / totalRevenue;
      if (burnToRevenueRatio > 1.5) riskScore = 80; // high risk
      else if (burnToRevenueRatio > 1) riskScore = 65; // medium-high risk
      else if (burnToRevenueRatio > 0.7) riskScore = 45; // medium risk
      else riskScore = 25; // low risk
    }

    // Diversification score based on venture types and stages
    const ventureTypes = [...new Set(ventures.map(v => v.type))];
    const ventureStages = [...new Set(ventures.map(v => v.stage))];
    const diversificationScore = Math.min(100, (ventureTypes.length + ventureStages.length) * 10);

    return {
      total_revenue: totalRevenue,
      total_burn_rate: totalBurnRate,
      total_runway: totalRunway,
      portfolio_roi: portfolioROI,
      risk_score: riskScore,
      diversification_score: diversificationScore,
      metadata: {
        ventures_count: ventures.length,
        kpis_count: kpis.length,
        worksheets_count: worksheets.length,
        roi_data_points: roiValues.length
      }
    };
  };

  useEffect(() => {
    calculatePortfolioMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refreshMetrics: calculatePortfolioMetrics
  };
};