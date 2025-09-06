import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import financialEngine from '../utils/financialEngine';

export const useWorksheets = (ventureId = null) => {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorksheets();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('worksheets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'worksheets',
          filter: ventureId ? `venture_id=eq.${ventureId}` : 'venture_id=is.null'
        },
        (payload) => {
          console.log('Worksheet updated:', payload);
          fetchWorksheets(); // Refresh on changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ventureId]);

  const fetchWorksheets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('worksheets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ventureId) {
        query = query.eq('venture_id', ventureId);
      } else {
        query = query.is('venture_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      setWorksheets(data || []);
    } catch (err) {
      console.error('Error fetching worksheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWorksheet = async (worksheetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newWorksheet = {
        user_id: user.id,
        venture_id: ventureId || null,
        type: worksheetData.type || 'custom',
        inputs: worksheetData.inputs || {},
        outputs: worksheetData.outputs || {},
        confidence_level: 'draft',
        ...worksheetData
      };

      const { data, error } = await supabase
        .from('worksheets')
        .insert(newWorksheet)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      setWorksheets(prev => [data, ...prev]);
      
      toast({
        title: "Worksheet Created",
        description: "Your worksheet has been created successfully."
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating worksheet:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const updateWorksheet = async (id, updates) => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .update(updates)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      setWorksheets(prev => 
        prev.map(worksheet => 
          worksheet.id === id ? { ...worksheet, ...data } : worksheet
        )
      );

      return { success: true, data };
    } catch (error) {
      console.error('Error updating worksheet:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const calculateWorksheet = async (id, inputs) => {
    try {
      const worksheet = worksheets.find(w => w.id === id);
      if (!worksheet) throw new Error('Worksheet not found');

      // Validate inputs
      const validation = financialEngine.validateInputs(worksheet.type, inputs);
      if (!validation.valid) {
        throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
      }

      // Calculate outputs using financial engine
      const outputs = financialEngine.calculate(worksheet.type, inputs);
      if (outputs.error) {
        throw new Error(outputs.error);
      }

      // Update worksheet with new inputs and outputs
      const result = await updateWorksheet(id, {
        inputs,
        outputs,
        confidence_level: 'calculated'
      });

      if (result.success) {
        // Update related KPIs if this is a venture worksheet
        if (ventureId) {
          await updateKPIsFromWorksheet(worksheet.type, outputs);
        }
      }

      return result;
    } catch (error) {
      console.error('Error calculating worksheet:', error);
      return { success: false, error: error.message };
    }
  };

  const updateKPIsFromWorksheet = async (worksheetType, outputs) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ventureId) return;

      // Map worksheet outputs to KPIs
      const kpiMappings = {
        roi: [
          { name: 'ROI Percentage', value: outputs.roi, confidence_level: 'calculated' },
          { name: 'Net Profit', value: outputs.netProfit, confidence_level: 'calculated' }
        ],
        cashflow: [
          { name: 'Monthly Cashflow', value: outputs.averageMonthlyCashflow, confidence_level: 'calculated' },
          { name: 'Total Cashflow', value: outputs.totalCashflow, confidence_level: 'calculated' }
        ],
        breakeven: [
          { name: 'Break-even Units', value: outputs.breakEvenUnits, confidence_level: 'calculated' },
          { name: 'Break-even Revenue', value: outputs.breakEvenRevenue, confidence_level: 'calculated' }
        ],
        unitEconomics: [
          { name: 'Unit Profit', value: outputs.unitProfit, confidence_level: 'calculated' },
          { name: 'LTV/CAC Ratio', value: outputs.ltvCacRatio, confidence_level: 'calculated' }
        ]
      };

      const kpis = kpiMappings[worksheetType] || [];
      
      for (const kpi of kpis) {
        // Upsert KPI
        await supabase
          .from('kpis')
          .upsert({
            venture_id: ventureId,
            name: kpi.name,
            value: kpi.value,
            confidence_level: kpi.confidence_level
          }, { 
            onConflict: 'venture_id,name' 
          });
      }
    } catch (error) {
      console.error('Error updating KPIs:', error);
    }
  };

  const deleteWorksheet = async (id) => {
    try {
      const { error } = await supabase
        .from('worksheets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorksheets(prev => prev.filter(w => w.id !== id));
      
      toast({
        title: "Worksheet Deleted",
        description: "The worksheet has been deleted successfully."
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const autoSave = async (id, data) => {
    try {
      // Enhanced auto-save with versioning
      setSaving(true);
      
      // Update the main worksheet
      const result = await updateWorksheet(id, data);
      
      if (result.success) {
        // Create a version entry for this save
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('versions')
            .upsert({
              parent_id: id,
              parent_type: 'worksheet',
              user_id: user.id,
              content: data,
              status: 'draft'
            }, {
              onConflict: 'parent_id,parent_type,user_id,status'
            });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  return { 
    worksheets, 
    loading, 
    error,
    saving,
    createWorksheet, 
    updateWorksheet,
    calculateWorksheet,
    deleteWorksheet,
    autoSave,
    fetchWorksheets
  };
};