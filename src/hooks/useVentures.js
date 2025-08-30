import { useState, useEffect } from 'react';

// Supabase-ready hook for ventures management
export const useVentures = () => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVentures = async () => {
      setLoading(true);
      try {
        // Simulate API call - will be replaced with Supabase query
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Mock ventures data
        const mockVentures = [
          {
            id: 1,
            name: "Coffee Kiosk",
            description: "Downtown coffee cart business",
            type: "food_service",
            status: "active",
            created_at: "2024-01-15",
            kpis: [
              { title: "Daily Revenue", value: 340, unit: "currency", trend: 8, trendDirection: "up" },
              { title: "Customers", value: 45, unit: "number", trend: 12, trendDirection: "up" },
              { title: "Profit Margin", value: 28, unit: "percentage", trend: -2, trendDirection: "down" }
            ]
          },
          {
            id: 2,
            name: "SaaS Startup",
            description: "B2B productivity tool",
            type: "technology",
            status: "active",
            created_at: "2024-02-01",
            kpis: [
              { title: "MRR", value: 2800, unit: "currency", trend: 25, trendDirection: "up" },
              { title: "Users", value: 156, unit: "number", trend: 18, trendDirection: "up" },
              { title: "Churn Rate", value: 3.2, unit: "percentage", trend: -1, trendDirection: "down" }
            ]
          },
          {
            id: 3,
            name: "E-commerce Store",
            description: "Online fashion retailer",
            type: "retail",
            status: "draft",
            created_at: "2024-02-10",
            kpis: [
              { title: "Sales", value: 1200, unit: "currency", trend: 15, trendDirection: "up" },
              { title: "Orders", value: 28, unit: "number", trend: 22, trendDirection: "up" },
              { title: "AOV", value: 42.85, unit: "currency", trend: -5, trendDirection: "down" }
            ]
          }
        ];
        
        setVentures(mockVentures);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVentures();
  }, []);

  const createVenture = async (ventureData) => {
    try {
      // This will be replaced with Supabase insert
      const newVenture = {
        id: Date.now(),
        ...ventureData,
        status: 'draft',
        created_at: new Date().toISOString(),
        kpis: []
      };
      
      setVentures(prev => [...prev, newVenture]);
      return { success: true, data: newVenture };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateVenture = async (id, updates) => {
    try {
      // This will be replaced with Supabase update
      setVentures(prev => 
        prev.map(venture => 
          venture.id === id ? { ...venture, ...updates } : venture
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { ventures, loading, error, createVenture, updateVenture };
};