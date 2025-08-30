import { useState, useEffect } from 'react';

// Supabase-ready hook for alerts management
export const useAlerts = (ventureId = null) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      
      // Simulate API call - will be replaced with Supabase query
      await new Promise(resolve => setTimeout(resolve, 200));

      // Mock alerts with proper color coding
      const mockAlerts = [
        {
          id: 1,
          venture_id: ventureId,
          type: 'warning', // yellow
          title: "Spending Increase",
          message: "Expenses grew 20% faster this month",
          severity: 'medium',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          is_read: false
        },
        {
          id: 2,
          venture_id: ventureId,
          type: 'alert', // red
          title: "Low Cash Runway",
          message: "Cash runway under 3 months at current burn rate",
          severity: 'high',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          is_read: false
        },
        {
          id: 3,
          venture_id: ventureId,
          type: 'info', // blue
          title: "Revenue Growth",
          message: "Monthly revenue increased by 15%",
          severity: 'low',
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          is_read: true
        }
      ];

      // Filter by venture if specified
      const filteredAlerts = ventureId 
        ? mockAlerts.filter(alert => alert.venture_id === ventureId)
        : mockAlerts.filter(alert => !alert.venture_id);

      setAlerts(filteredAlerts);
      setLoading(false);
    };

    fetchAlerts();
  }, [ventureId]);

  const markAsRead = async (alertId) => {
    try {
      // This will be replaced with Supabase update
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      // This will be replaced with Supabase delete
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { alerts, loading, markAsRead, dismissAlert };
};