import { useState, useEffect } from 'react';

// CACHE BUST: Force Vite to rebuild React chunks after import standardization
import { TrendingUp, DollarSign, AlertTriangle, Users, Target, CreditCard, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Supabase-ready hook for role-based KPI generation
export const useRoleBasedKpis = (userRole, ventureType) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to add new KPIs dynamically and trigger refresh
  const addKpis = (newKpis) => {
    setKpis(prev => [...prev, ...newKpis]);
    setRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadKpis = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setKpis([]);
          setLoading(false);
          return;
        }

        // Fetch ventures for the user
        let { data: ventures, error: venturesError } = await supabase
          .from('ventures')
          .select('id, name')
          .eq('user_id', user.id);
        if (venturesError) throw venturesError;

        // If no ventures, seed sample data
        if (!ventures || ventures.length === 0) {
          await supabase.rpc('create_sample_data_for_user', { user_id: user.id });
          const venturesRefetch = await supabase
            .from('ventures')
            .select('id, name')
            .eq('user_id', user.id);
          ventures = venturesRefetch.data || [];
        }

        // Optional: fetch profile KPI-like fields
        const { data: profile } = await supabase
          .from('profiles')
          .select('ai_requests_used, ai_quota_remaining')
          .eq('id', user.id)
          .maybeSingle();

        let aggregated = [];

        // Add profile-level KPIs if available
        if (profile) {
          if (typeof profile.ai_requests_used === 'number') {
            aggregated.push({
              title: 'AI Requests Used',
              description: 'Profile usage in current period',
              value: profile.ai_requests_used,
              unit: 'number',
              trend: 0,
              trendDirection: 'up',
              icon: Activity,
              state: 'success',
              belongsTo: { type: 'profile' }
            });
          }
          if (typeof profile.ai_quota_remaining === 'number') {
            aggregated.push({
              title: 'AI Quota Remaining',
              description: 'Remaining AI request quota',
              value: profile.ai_quota_remaining,
              unit: 'number',
              trend: 0,
              trendDirection: 'up',
              icon: Activity,
              state: 'success',
              belongsTo: { type: 'profile' }
            });
          }
        }

        // Collect KPIs from each venture
        for (const v of ventures) {
          const { data: vKpis } = await supabase
            .from('kpis')
            .select('id, name, value, confidence_level, updated_at')
            .eq('venture_id', v.id);
          const mapped = (vKpis || [])
            .filter(k => k.value !== null && k.value !== undefined)
            .map(k => ({
              title: k.name,
              description: `Belongs to venture: ${v.name}`,
              value: Number(k.value),
              unit: 'number',
              trend: 0,
              trendDirection: 'up',
              icon: TrendingUp,
              state: k.confidence_level === 'mock' ? 'warning' : 'success',
              belongsTo: { type: 'venture', ventureId: v.id, ventureName: v.name, kpiId: k.id }
            }));
          aggregated = aggregated.concat(mapped);
        }

        if (!isCancelled) {
          setKpis(aggregated);
          setLoading(false);
        }
      } catch (e) {
        if (!isCancelled) {
          console.error('Error loading KPIs:', e);
          setKpis([]);
          setLoading(false);
        }
      }
    };

    loadKpis();

    const handleAutoGenerateKPIs = () => {
      loadKpis();
    };

    window.addEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);

    return () => {
      isCancelled = true;
      window.removeEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    };
  }, [userRole, ventureType, refreshCounter]);

  return { kpis, loading, addKpis, refreshCounter };
};

// Function to generate additional KPIs based on user role and avoid duplicates
const generateAdditionalKpis = (count, existingKpis = [], userRole = 'entrepreneur') => {
  // Get existing KPI titles to avoid duplicates
  const existingTitles = existingKpis.map(kpi => kpi.title.toLowerCase());

  // Role-specific KPI pools with realistic data ranges
  const kpiPools = {
    entrepreneur: [
      {
        title: "Customer Acquisition Cost",
        description: "Average cost to acquire each new customer",
        value: Math.floor(Math.random() * 200) + 50, // $50-$250
        unit: "currency",
        trend: Math.floor(Math.random() * 20) - 10, // -10% to +10%
        trendDirection: Math.random() > 0.5 ? "up" : "down",
        icon: DollarSign,
        state: "warning"
      },
      {
        title: "Monthly Recurring Revenue",
        description: "Predictable monthly income from subscriptions",
        value: Math.floor(Math.random() * 50000) + 5000, // $5K-$55K
        unit: "currency",
        trend: Math.floor(Math.random() * 30) + 5, // 5% to 35%
        trendDirection: "up",
        icon: TrendingUp,
        state: "success"
      },
      {
        title: "Customer Lifetime Value",
        description: "Total revenue expected from average customer",
        value: Math.floor(Math.random() * 2000) + 500, // $500-$2500
        unit: "currency",
        trend: Math.floor(Math.random() * 25) + 5, // 5% to 30%
        trendDirection: "up",
        icon: Users,
        state: "success"
      },
      {
        title: "Churn Rate",
        description: "Percentage of customers who cancel monthly",
        value: (Math.random() * 10 + 2).toFixed(1), // 2.0% to 12.0%
        unit: "percentage",
        trend: Math.floor(Math.random() * 5) - 2, // -2% to +3%
        trendDirection: Math.random() > 0.7 ? "up" : "down",
        icon: AlertTriangle,
        state: "warning"
      },
      {
        title: "Gross Margin",
        description: "Revenue minus cost of goods sold",
        value: Math.floor(Math.random() * 40) + 40, // 40% to 80%
        unit: "percentage",
        trend: Math.floor(Math.random() * 10) - 2, // -2% to +8%
        trendDirection: Math.random() > 0.3 ? "up" : "down",
        icon: Target
      }
    ],
    student: [
      {
        title: "Study Hours Per Week",
        description: "Time spent on academic activities",
        value: Math.floor(Math.random() * 30) + 20, // 20-50 hours
        unit: "hours",
        trend: Math.floor(Math.random() * 10) - 3, // -3 to +7
        trendDirection: Math.random() > 0.4 ? "up" : "down",
        icon: Target
      },
      {
        title: "Part-time Income",
        description: "Monthly earnings from work",
        value: Math.floor(Math.random() * 1500) + 500, // $500-$2000
        unit: "currency",
        trend: Math.floor(Math.random() * 15) + 2, // 2% to 17%
        trendDirection: "up",
        icon: DollarSign
      },
      {
        title: "GPA Progress",
        description: "Current academic performance",
        value: (Math.random() * 1.5 + 2.5).toFixed(2), // 2.50 to 4.00
        unit: "score",
        trend: Math.floor(Math.random() * 8) - 2, // -2% to +6%
        trendDirection: Math.random() > 0.3 ? "up" : "down",
        icon: TrendingUp
      }
    ],
    dropshipper: [
      {
        title: "Average Order Value",
        description: "Mean value per customer order",
        value: Math.floor(Math.random() * 80) + 25, // $25-$105
        unit: "currency",
        trend: Math.floor(Math.random() * 15) + 2, // 2% to 17%
        trendDirection: "up",
        icon: DollarSign
      },
      {
        title: "Conversion Rate",
        description: "Percentage of visitors who purchase",
        value: (Math.random() * 5 + 1).toFixed(1), // 1.0% to 6.0%
        unit: "percentage",
        trend: Math.floor(Math.random() * 8) - 2, // -2% to +6%
        trendDirection: Math.random() > 0.4 ? "up" : "down",
        icon: Target
      },
      {
        title: "Return on Ad Spend",
        description: "Revenue generated per dollar spent on ads",
        value: (Math.random() * 4 + 2).toFixed(1), // 2.0x to 6.0x
        unit: "ratio",
        trend: Math.floor(Math.random() * 20) - 5, // -5% to +15%
        trendDirection: Math.random() > 0.3 ? "up" : "down",
        icon: TrendingUp
      }
    ]
  };

  // Get appropriate KPI pool based on user role
  const availableKpis = kpiPools[userRole] || kpiPools.entrepreneur;
  
  // Filter out KPIs that already exist
  const newKpis = availableKpis.filter(kpi => 
    !existingTitles.includes(kpi.title.toLowerCase())
  );
  
  // If we don't have enough unique KPIs, return what we have
  if (newKpis.length === 0) {
    console.log('No new KPIs available - all role-specific KPIs already exist');
    return [];
  }
  
  // Shuffle and return the requested count
  const shuffled = newKpis.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, newKpis.length));
};