import { useState, useEffect } from 'react';

// CACHE BUST: Force Vite to rebuild React chunks after import standardization
import { TrendingUp, DollarSign, AlertTriangle, Users, Target, CreditCard } from 'lucide-react';

// Supabase-ready hook for role-based KPI generation
export const useRoleBasedKpis = (userRole, ventureType) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to add new KPIs dynamically
  const addKpis = (newKpis) => {
    setKpis(prev => [...prev, ...newKpis]);
  };

  useEffect(() => {
    const generateKpis = async () => {
      setLoading(true);
      
      // Simulate API call - will be replaced with Supabase function
      await new Promise(resolve => setTimeout(resolve, 300));

      let roleKpis = [];

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
      const additionalKpis = generateAdditionalKpis(count);
      addKpis(additionalKpis);
    };

    window.addEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    };
  }, [userRole, ventureType]);

  return { kpis, loading, addKpis };
};

// Function to generate additional KPIs - moved outside component for reusability
const generateAdditionalKpis = (count) => {
    const additionalKpiPool = [
      {
        title: "Customer Acquisition Cost",
        description: "Cost to acquire each new customer",
        value: 125,
        unit: "currency",
        trend: -8,
        trendDirection: "down",
        icon: DollarSign,
        state: "warning"
      },
      {
        title: "Monthly Recurring Revenue",
        description: "Predictable monthly income from subscriptions",
        value: 15000,
        unit: "currency",
        trend: 25,
        trendDirection: "up",
        icon: TrendingUp,
        state: "success"
      },
      {
        title: "Churn Rate",
        description: "Percentage of customers who cancel",
        value: 5.2,
        unit: "percentage",
        trend: -2,
        trendDirection: "down",
        icon: AlertTriangle,
        state: "warning"
      },
      {
        title: "Average Revenue Per User",
        description: "Revenue generated per active user",
        value: 89,
        unit: "currency",
        trend: 12,
        trendDirection: "up",
        icon: Users
      },
      {
        title: "Conversion Rate",
        description: "Percentage of visitors who become customers",
        value: 3.8,
        unit: "percentage",
        trend: 15,
        trendDirection: "up",
        icon: Target,
        state: "success"
      },
      {
        title: "Customer Lifetime Value",
        description: "Total revenue expected from a customer",
        value: 1840,
        unit: "currency",
        trend: 18,
        trendDirection: "up",
        icon: TrendingUp,
        state: "success"
      },
      {
        title: "Net Promoter Score",
        description: "Customer satisfaction and loyalty metric",
        value: 42,
        unit: "score",
        trend: 8,
        trendDirection: "up",
        icon: Target
      }
    ];

  // Return random selection of KPIs
  const shuffled = additionalKpiPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};