import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useScenarios = () => {
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(null);
  const { toast } = useToast();

  const evaluateScenario = useCallback(async (scenarioText, context = {}) => {
    setEvaluating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('scenario-eval', {
        body: {
          scenarioText: scenarioText.trim(),
          context
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      setCurrentScenario({ ...data, original_text: scenarioText });
      return { success: true, data };
    } catch (error) {
      console.error('Scenario evaluation error:', error);
      toast({
        title: "Evaluation Failed",
        description: error.message || 'Failed to evaluate scenario',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setEvaluating(false);
    }
  }, [toast]);

  const saveAsCalculation = useCallback(async (scenarioData, scenarioText) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('calculations_log')
        .insert({
          user_id: user.id,
          scenario_text: scenarioText,
          assumptions: scenarioData.assumptions || {},
          result: scenarioData.computed_results || {},
          confidence: scenarioData.confidence_score || 0.5,
          explanation: scenarioData.explanation_text || ''
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Calculation Saved",
        description: "Scenario has been saved to your calculation log."
      });

      return { success: true, data };
    } catch (error) {
      console.error('Save calculation error:', error);
      toast({
        title: "Save Failed",
        description: error.message || 'Failed to save calculation',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const convertToWorksheet = useCallback(async (scenarioData, title, fieldsToInclude = [], ventureId = null) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // First get preview
      const { data: previewData, error: previewError } = await supabase.functions.invoke('create-worksheet-from-scenario', {
        body: {
          scenarioData,
          title: title.trim(),
          fieldsToInclude,
          ventureId,
          confirm: false
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (previewError) throw previewError;

      // Then confirm creation
      const { data, error } = await supabase.functions.invoke('create-worksheet-from-scenario', {
        body: {
          scenarioData,
          title: title.trim(),
          fieldsToInclude,
          ventureId,
          confirm: true
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data.applied) {
        toast({
          title: "Worksheet Created",
          description: `Successfully created worksheet "${title}"`
        });
        return { success: true, data };
      } else {
        return { success: false, error: 'Worksheet creation was not confirmed' };
      }
    } catch (error) {
      console.error('Convert to worksheet error:', error);
      toast({
        title: "Conversion Failed",
        description: error.message || 'Failed to create worksheet',
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const getCalculationLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('calculations_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Get calculation logs error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentScenario = useCallback(() => {
    setCurrentScenario(null);
  }, []);

  const detectScenarioIntent = useCallback((message) => {
    const scenarioKeywords = [
      /scenario:/i,
      /what if/i,
      /how many.*to break even/i,
      /simulate.*cashflow/i,
      /calculate.*roi/i,
      /if i hire.*people/i,
      /revenue grows.*monthly/i,
      /invest.*marketing/i
    ];

    return scenarioKeywords.some(pattern => pattern.test(message));
  }, []);

  return {
    loading,
    evaluating,
    saving,
    currentScenario,
    evaluateScenario,
    saveAsCalculation,
    convertToWorksheet,
    getCalculationLogs,
    clearCurrentScenario,
    detectScenarioIntent
  };
};