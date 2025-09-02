import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAlerts = (ventureId = null) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAlerts([]);
          return;
        }

        let query = supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false });

        if (ventureId) {
          query = query.eq('venture_id', ventureId);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        setAlerts(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [ventureId]);

  const createAlert = async (alertData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insert = {
        user_id: user.id,
        venture_id: alertData.venture_id || null,
        type: alertData.type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        metadata: alertData.metadata || {}
      };

      const { data, error } = await supabase
        .from('alerts')
        .insert(insert)
        .select('*')
        .single();

      if (error) throw error;

      setAlerts(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const markAsRead = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const generateWellbeingAlerts = async (personal, ventures) => {
    const alerts = [];

    // Personal Runway Risk
    if (personal && personal.savings && personal.monthly_burn) {
      const runway = personal.savings / personal.monthly_burn;
      if (runway < 3) {
        alerts.push({
          type: 'personal_runway_risk',
          severity: runway < 1 ? 'critical' : 'high',
          title: 'Personal Runway Risk',
          message: `You have only ${runway.toFixed(1)} months of personal runway remaining.`,
          metadata: { runway, savings: personal.savings, burn: personal.monthly_burn }
        });
      }
    }

    // Overcommitment Risk
    if (personal && personal.commitments?.length > 5) {
      alerts.push({
        type: 'overcommitment_risk',
        severity: 'medium',
        title: 'Overcommitment Risk',
        message: `You have ${personal.commitments.length} active commitments. Consider prioritizing.`,
        metadata: { commitments: personal.commitments }
      });
    }

    // Portfolio Overextension
    if (ventures && ventures.length > 3) {
      alerts.push({
        type: 'portfolio_overextension',
        severity: 'medium',
        title: 'Portfolio Overextension',
        message: `Managing ${ventures.length} ventures may spread your resources too thin.`,
        metadata: { venture_count: ventures.length }
      });
    }

    return alerts;
  };

  return {
    alerts,
    loading,
    error,
    createAlert,
    markAsRead,
    dismissAlert,
    generateWellbeingAlerts
  };
};