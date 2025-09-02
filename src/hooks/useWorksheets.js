import React, { useState, useEffect } from 'react';

// Supabase-ready hook for worksheets management
export const useWorksheets = (ventureId = null) => {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorksheets = async () => {
      setLoading(true);
      try {
        // Simulate API call - will be replaced with Supabase query
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock worksheets - auto-seeded for ventures
        let mockWorksheets = [];
        
        if (ventureId) {
          // Auto-seed venture worksheets as per requirements
          mockWorksheets = [
            {
              id: 1,
              venture_id: ventureId,
              name: "Cashflow Worksheet",
              type: "cashflow",
              status: "live",
              created_at: "2024-01-15",
              data: {
                sheets: [
                  {
                    id: 1,
                    name: "Monthly Cashflow",
                    rows: 12,
                    columns: 6,
                    cells: {}
                  }
                ],
                assumptions: {
                  monthly_revenue: 10000,
                  monthly_expenses: 7500,
                  growth_rate: 0.15
                }
              }
            },
            {
              id: 2,
              venture_id: ventureId,
              name: "ROI Calculator",
              type: "roi",
              status: "draft",
              created_at: "2024-01-16",
              data: {
                sheets: [
                  {
                    id: 1,
                    name: "Investment Analysis",
                    rows: 20,
                    columns: 8,
                    cells: {}
                  }
                ],
                assumptions: {
                  initial_investment: 50000,
                  expected_return: 0.25,
                  time_horizon: 12
                }
              }
            },
            {
              id: 3,
              venture_id: ventureId,
              name: "Break-even Calculator",
              type: "breakeven",
              status: "draft",
              created_at: "2024-01-17",
              data: {
                sheets: [
                  {
                    id: 1,
                    name: "Break-even Analysis",
                    rows: 15,
                    columns: 5,
                    cells: {}
                  }
                ],
                assumptions: {
                  fixed_costs: 5000,
                  variable_cost_per_unit: 15,
                  price_per_unit: 25
                }
              }
            }
          ];
        } else {
          // Global worksheets
          mockWorksheets = [
            {
              id: 4,
              venture_id: null,
              name: "Personal Budget",
              type: "personal",
              status: "live",
              created_at: "2024-01-10",
              data: {
                sheets: [
                  {
                    id: 1,
                    name: "Monthly Budget",
                    rows: 20,
                    columns: 4,
                    cells: {}
                  }
                ]
              }
            }
          ];
        }
        
        setWorksheets(mockWorksheets);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheets();
  }, [ventureId]);

  const createWorksheet = async (worksheetData) => {
    try {
      // This will be replaced with Supabase insert
      const newWorksheet = {
        id: Date.now(),
        venture_id: ventureId,
        status: 'draft',
        created_at: new Date().toISOString(),
        data: {
          sheets: [
            {
              id: 1,
              name: "Sheet 1",
              rows: 50,
              columns: 10,
              cells: {}
            }
          ],
          assumptions: {}
        },
        ...worksheetData
      };
      
      setWorksheets(prev => [...prev, newWorksheet]);
      return { success: true, data: newWorksheet };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateWorksheet = async (id, updates) => {
    try {
      // This will be replaced with Supabase update
      setWorksheets(prev => 
        prev.map(worksheet => 
          worksheet.id === id ? { ...worksheet, ...updates } : worksheet
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const promoteToLive = async (id) => {
    try {
      // This will include dual-confirmation logic
      return await updateWorksheet(id, { status: 'live' });
    } catch (error) {
      return { success: false, error };
    }
  };

  return { 
    worksheets, 
    loading, 
    error, 
    createWorksheet, 
    updateWorksheet, 
    promoteToLive 
  };
};