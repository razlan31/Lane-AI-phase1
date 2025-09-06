import { useState, useEffect } from 'react';

// CACHE BUST: Force Vite to rebuild React chunks after import standardization
import { TrendingUp, DollarSign, AlertTriangle, Users, Target, CreditCard } from 'lucide-react';

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
    const generateKpis = async () => {
      setLoading(true);
      
      // Simulate API call - will be replaced with Supabase function
      await new Promise(resolve => setTimeout(resolve, 300));

      switch (userRole) {
        case 'entrepreneur':
          roleKpis = [
            {
              title: "Revenue Growth",
              description: "How fast your income is increasing over time",
              value: 23.5,
              unit: "percentage",
              trend: 8.2,
              trendDirection: "up",
              icon: TrendingUp,
              state: "success"
            },
            {
              title: "Burn Rate",
              description: "How much money you're spending each month",
              value: 12500,
              unit: "currency",
              trend: -8,
              trendDirection: "down",
              icon: DollarSign,
              state: "warning"
            },
            {
              title: "Customer Acquisition",
              description: "Number of new customers gained this period",
              value: 47,
              unit: "number",
              trend: 12,
              trendDirection: "up",
              icon: Users,
              state: "success"
            },
            {
              title: "Product-Market Fit",
              description: "How well your product meets customer needs",
              value: 7.8,
              unit: "score",
              trend: 0.5,
              trendDirection: "up",
              icon: Target
            },
            {
              title: "Risk Indicators",
              description: "Warning signs that need your attention",
              value: 3,
              unit: "alerts",
              trend: 1,
              trendDirection: "up",
              icon: AlertTriangle,
              state: "alert"
            }
          ];
          break;

        case 'student':
          roleKpis = [
            {
              title: "Monthly Budget",
              description: "Total money available to spend this month",
              value: 1200,
              unit: "currency",
              trend: -5,
              trendDirection: "down",
              icon: DollarSign
            },
            {
              title: "Expenses",
              description: "Money spent on necessities and wants",
              value: 980,
              unit: "currency",
              trend: 15,
              trendDirection: "up",
              icon: CreditCard,
              state: "warning"
            },
            {
              title: "Savings Goal",
              description: "Progress toward your savings target",
              value: 65,
              unit: "percentage",
              trend: 8,
              trendDirection: "up",
              icon: Target,
              state: "success"
            },
            {
              title: "Net Balance",
              description: "Money left after expenses",
              value: 220,
              unit: "currency",
              trend: -12,
              trendDirection: "down",
              icon: TrendingUp
            }
          ];
          break;

        case 'dropshipper':
          roleKpis = [
            {
              title: "Sales Revenue",
              description: "Total money earned from product sales",
              value: 8500,
              unit: "currency",
              trend: 22,
              trendDirection: "up",
              icon: TrendingUp,
              state: "success"
            },
            {
              title: "Order Volume",
              description: "Number of orders processed this period",
              value: 142,
              unit: "number",
              trend: 18,
              trendDirection: "up",
              icon: Users
            },
            {
              title: "Ad Spend",
              description: "Money invested in advertising campaigns",
              value: 2100,
              unit: "currency",
              trend: 10,
              trendDirection: "up",
              icon: DollarSign
            },
            {
              title: "Profit Margin",
              description: "Percentage of revenue kept as profit",
              value: 28.5,
              unit: "percentage",
              trend: -2,
              trendDirection: "down",
              icon: Target,
              state: "warning"
            },
            {
              title: "Inventory Turnover",
              description: "How quickly products are selling",
              value: 4.2,
              unit: "ratio",
              trend: 0.8,
              trendDirection: "up",
              icon: AlertTriangle
            }
          ];
          break;

        default:
          // Default entrepreneur KPIs
          roleKpis = [
            {
              title: "Revenue",
              description: "Total income from all sources",
              value: 15000,
              unit: "currency",
              trend: 12,
              trendDirection: "up",
              icon: TrendingUp
            },
            {
              title: "Expenses",
              description: "Total money spent on operations",
              value: 8500,
              unit: "currency",
              trend: 5,
              trendDirection: "up",
              icon: DollarSign
            }
          ];
      }

      setKpis(roleKpis);
      setLoading(false);
    };

    if (userRole) {
      generateKpis();
    }

    // Set up event listener for auto-generate KPIs
    const handleAutoGenerateKPIs = (event) => {
      const { type, count } = event.detail;
      const additionalKpis = generateAdditionalKpis(count, kpis, userRole);
      if (additionalKpis.length > 0) {
        addKpis(additionalKpis);
      }
    };

    window.addEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    };
  }, [userRole, ventureType, kpis]);

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