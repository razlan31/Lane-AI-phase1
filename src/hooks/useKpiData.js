// Mock data hooks - Supabase-ready structure
import { useState, useEffect } from 'react';

// Generate role-based KPIs based on user profile
export const useRoleBasedKpis = (userRole, ventureType) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateKpis = () => {
      setLoading(true);
      
      // Role-based KPI generation logic
      let generatedKpis = [];
      
      switch (userRole) {
        case 'entrepreneur':
          generatedKpis = [
            { title: "Runway", description: "How long your money will last", value: 18, unit: "months", trend: -2, trendDirection: "down", state: "warning" },
            { title: "Monthly Cashflow", description: "Money in vs money out", value: -15000, unit: "currency", trend: 12, trendDirection: "up", state: "alert" },
            { title: "Obligations", description: "Bills & commitments", value: 85000, unit: "currency", trend: 5, trendDirection: "up" },
            { title: "Burn Rate", description: "Monthly spending rate", value: 12500, unit: "currency", trend: -8, trendDirection: "down", state: "warning" },
            { title: "Revenue Growth", description: "How fast income is growing", value: 23.5, unit: "percentage", trend: 8.2, trendDirection: "up" }
          ];
          break;
        
        case 'student':
          generatedKpis = [
            { title: "Budget", description: "Monthly money available", value: 2500, unit: "currency", trend: 5, trendDirection: "up" },
            { title: "Expenses", description: "What you spend monthly", value: 1800, unit: "currency", trend: 12, trendDirection: "up", state: "warning" },
            { title: "Savings Goal", description: "Target amount to save", value: 5000, unit: "currency", trend: 15, trendDirection: "up" },
            { title: "Net Balance", description: "Money left each month", value: 700, unit: "currency", trend: -8, trendDirection: "down" }
          ];
          break;
        
        case 'dropshipper':
          generatedKpis = [
            { title: "Sales", description: "Revenue from orders", value: 45000, unit: "currency", trend: 18, trendDirection: "up" },
            { title: "Orders", description: "Number of orders", value: 342, unit: "number", trend: 23, trendDirection: "up" },
            { title: "Expenses", description: "Total monthly costs", value: 32000, unit: "currency", trend: 15, trendDirection: "up" },
            { title: "Inventory Turnover", description: "How fast products sell", value: 2.4, unit: "number", trend: 0.3, trendDirection: "up" },
            { title: "Cashflow", description: "Money in vs out", value: 13000, unit: "currency", trend: 5, trendDirection: "up" }
          ];
          break;
        
        default:
          generatedKpis = [
            { title: "Runway", description: "How long your money will last", value: 18, unit: "months", trend: -2, trendDirection: "down", state: "warning" },
            { title: "Monthly Cashflow", description: "Money in vs money out", value: -15000, unit: "currency", trend: 12, trendDirection: "up", state: "alert" },
            { title: "Obligations", description: "Bills & commitments", value: 85000, unit: "currency", trend: 5, trendDirection: "up" }
          ];
      }
      
      setKpis(generatedKpis);
      setLoading(false);
    };

    generateKpis();
  }, [userRole, ventureType]);

  return { kpis, loading };
};

// Venture-specific KPIs
export const useVentureKpis = (ventureId) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentureKpis = async () => {
      if (!ventureId) {
        setKpis([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      // Mock API call - replace with Supabase
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const ventureKpis = [
        { title: "Monthly Revenue", description: "Total money earned from sales", value: 8500, unit: "currency", trend: 15, trendDirection: "up" },
        { title: "Customer Count", description: "Number of active customers", value: 342, unit: "number", trend: 23, trendDirection: "up" },
        { title: "Avg Order Value", description: "Average per purchase", value: 24.85, unit: "currency", trend: 8, trendDirection: "up" },
        { title: "Conversion Rate", description: "Visitors who buy", value: 3.2, unit: "percentage", trend: 0.5, trendDirection: "up" }
      ];
      
      setKpis(ventureKpis);
      setLoading(false);
    };

    fetchVentureKpis();
  }, [ventureId]);

  return { kpis, loading };
};

// Portfolio ventures data
export const usePortfolioVentures = () => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentures = async () => {
      setLoading(true);
      // Mock API call - replace with Supabase
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockVentures = [
        {
          id: 1,
          name: "Coffee Kiosk",
          type: "retail",
          stage: "growing",
          previewKpis: [
            { label: "Revenue", value: 8500, unit: "currency" },
            { label: "Customers", value: 342, unit: "number" },
            { label: "Runway", value: 18, unit: "months" }
          ]
        },
        {
          id: 2,
          name: "SaaS Tool",
          type: "tech",
          stage: "mvp",
          previewKpis: [
            { label: "MRR", value: 2400, unit: "currency" },
            { label: "Users", value: 89, unit: "number" },
            { label: "Churn", value: 5.2, unit: "percentage" }
          ]
        }
      ];
      
      setVentures(mockVentures);
      setLoading(false);
    };

    fetchVentures();
  }, []);

  return { ventures, loading };
};