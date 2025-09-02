import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePortfolio = () => {
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch ventures
        const { data: venturesData, error: venturesError } = await supabase
          .from('ventures')
          .select('*')
          .eq('user_id', user.id);

        if (venturesError) throw venturesError;

        setVentures(venturesData || []);

        // Calculate portfolio metrics
        const metrics = calculatePortfolioMetrics(venturesData || []);
        setPortfolioMetrics(metrics);

      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const calculatePortfolioMetrics = (venturesList) => {
    if (!venturesList.length) {
      return {
        total_revenue: 0,
        total_runway: 0,
        total_burn_rate: 0,
        portfolio_roi: 0,
        risk_score: 0,
        diversification_score: 0,
        venture_count: 0
      };
    }

    // Mock calculations - in real app, these would be based on actual KPI data
    const totalRevenue = venturesList.reduce((sum, v) => sum + (v.revenue || 0), 0);
    const totalBurnRate = venturesList.reduce((sum, v) => sum + (v.burn_rate || 0), 0);
    const avgRunway = venturesList.reduce((sum, v) => sum + (v.runway || 0), 0) / venturesList.length;
    
    // Calculate portfolio ROI (simplified)
    const portfolioROI = totalRevenue > 0 ? ((totalRevenue - totalBurnRate) / totalBurnRate) * 100 : 0;
    
    // Calculate risk score (higher is riskier)
    const riskScore = Math.min(100, Math.max(0, 100 - avgRunway * 5));
    
    // Calculate diversification score
    const types = [...new Set(venturesList.map(v => v.type))];
    const diversificationScore = Math.min(100, (types.length / Math.max(1, venturesList.length)) * 100);

    return {
      total_revenue: totalRevenue,
      total_runway: avgRunway,
      total_burn_rate: totalBurnRate,
      portfolio_roi: portfolioROI,
      risk_score: riskScore,
      diversification_score: diversificationScore,
      venture_count: venturesList.length
    };
  };

  const compareVentures = (ventureIds) => {
    const selectedVentures = ventures.filter(v => ventureIds.includes(v.id));
    
    return selectedVentures.map(venture => ({
      ...venture,
      // Add comparison metrics here
      metrics: {
        revenue: venture.revenue || 0,
        burn_rate: venture.burn_rate || 0,
        runway: venture.runway || 0,
        roi: venture.revenue && venture.burn_rate ? 
             ((venture.revenue - venture.burn_rate) / venture.burn_rate) * 100 : 0
      }
    }));
  };

  const findSynergies = (ventureIds) => {
    const selectedVentures = ventures.filter(v => ventureIds.includes(v.id));
    const synergies = [];

    // Simple synergy detection based on venture types
    const typeGroups = selectedVentures.reduce((groups, venture) => {
      const type = venture.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(venture);
      return groups;
    }, {});

    Object.entries(typeGroups).forEach(([type, venturesInType]) => {
      if (venturesInType.length > 1) {
        synergies.push({
          type: 'shared_expertise',
          ventures: venturesInType.map(v => v.id),
          description: `${venturesInType.length} ventures in ${type} can share expertise and resources`,
          potential_value: 'Medium'
        });
      }
    });

    return synergies;
  };

  return {
    portfolioMetrics,
    ventures,
    loading,
    error,
    compareVentures,
    findSynergies,
    calculatePortfolioMetrics
  };
};