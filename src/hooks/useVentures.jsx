import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth.jsx';

const VenturesContext = createContext();

export const VenturesProvider = ({ children }) => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setVentures([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const fetchVentures = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: venturesData, error: venturesError } = await supabase
          .from('ventures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .abortSignal(abortController.signal);
          
        if (venturesError) throw venturesError;

        const ventureIds = (venturesData ?? []).map(v => v.id);
        let kpisByVenture = {};
        
        if (ventureIds.length > 0 && !abortController.signal.aborted) {
          const { data: kpisData, error: kpisError } = await supabase
            .from('kpis')
            .select('id, venture_id, name, value, confidence, created_at')
            .in('venture_id', ventureIds)
            .abortSignal(abortController.signal);
            
          if (kpisError) throw kpisError;
          
          kpisByVenture = (kpisData ?? []).reduce((acc, k) => {
            acc[k.venture_id] = acc[k.venture_id] || [];
            acc[k.venture_id].push({
              title: k.name,
              value: k.value,
              unit: 'number',
              trend: 0,
              trendDirection: 'up'
            });
            return acc;
          }, {});
        }

        const normalized = (venturesData ?? []).map(v => ({
          ...v,
          status: v.stage ? 'active' : 'draft',
          kpis: kpisByVenture[v.id] || []
        }));

        if (isMounted && !abortController.signal.aborted) {
          setVentures(normalized);
          setError(null);
        }
      } catch (err) {
        // Ignore abort errors - they're expected during component unmount
        if (err.name === 'AbortError') {
          return;
        }
        if (!abortController.signal.aborted && isMounted) {
          console.error('Ventures fetch error:', err);
          setError(err);
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVentures();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user]);

  const createVenture = async (ventureData) => {
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    try {
      const insert = {
        user_id: user.id,
        name: ventureData.name,
        description: ventureData.description || null,
        type: ventureData.type || null,
        stage: ventureData.stage || null
      };
      
      const { data, error } = await supabase
        .from('ventures')
        .insert(insert)
        .select('*')
        .maybeSingle();
        
      if (error) throw error;
      
      const newVenture = { 
        ...data, 
        status: data.stage ? 'active' : 'draft', 
        kpis: [] 
      };
      
      setVentures(prev => [newVenture, ...prev]);
      return { success: true, data: newVenture };
    } catch (error) {
      console.error('Create venture error:', error);
      return { success: false, error };
    }
  };

  const updateVenture = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('ventures')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .maybeSingle();
        
      if (error) throw error;
      
      setVentures(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
      return { success: true };
    } catch (error) {
      console.error('Update venture error:', error);
      return { success: false, error };
    }
  };

  const seedTestVentures = async () => {
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    try {
      const venturePayloads = [
        {
          user_id: user.id,
          name: 'Gourmet Street Eats',
          description: 'Mobile food truck serving artisanal burgers and craft sodas in downtown area',
          type: 'local_business',
          stage: 'operational'
        },
        {
          user_id: user.id,
          name: 'TechGadget Hub',
          description: 'Dropshipping business specializing in consumer electronics and smart home devices',
          type: 'ecommerce',
          stage: 'growth'
        },
        {
          user_id: user.id,
          name: 'Digital Craft Studio',
          description: 'Freelance web design and development services for SMBs',
          type: 'service_business',
          stage: 'operational'
        },
        {
          user_id: user.id,
          name: 'FitTracker Pro',
          description: 'Mobile fitness tracking app with social features and personalized workout plans',
          type: 'startup',
          stage: 'mvp'
        }
      ];

      // Avoid duplicates by name for this user
      const names = venturePayloads.map(v => v.name);
      const { data: existing, error: existingErr } = await supabase
        .from('ventures')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', names);
      if (existingErr) throw existingErr;

      const existingNames = new Set((existing ?? []).map(v => v.name));
      const toInsert = venturePayloads.filter(v => !existingNames.has(v.name));

      let inserted = [];
      if (toInsert.length > 0) {
        const { data: insertedData, error: insertErr } = await supabase
          .from('ventures')
          .insert(toInsert)
          .select('*');
        if (insertErr) throw insertErr;
        inserted = insertedData ?? [];
      }

      // Combine with any existing ones (so we can add KPIs for both)
      const allVentures = [
        ...((existing ?? []).map(v => ({ ...v }))),
        ...inserted
      ];

      // Helper to insert KPIs per venture without duplicates
      const insertKpisFor = async (ventureId, kpis) => {
        const { data: existingKpis, error: kErr } = await supabase
          .from('kpis')
          .select('id, name')
          .eq('venture_id', ventureId);
        if (kErr) throw kErr;
        const existSet = new Set((existingKpis ?? []).map(k => k.name));
        const kpisToInsert = kpis
          .filter(k => !existSet.has(k.name))
          .map(k => ({ venture_id: ventureId, name: k.name, value: k.value, confidence: k.confidence, confidence_level: k.confidence }));
        if (kpisToInsert.length > 0) {
          const { error: insKpiErr } = await supabase.from('kpis').insert(kpisToInsert);
          if (insKpiErr) throw insKpiErr;
        }
      };

      // Define KPI sets
      const kpiSetsByName = {
        'Gourmet Street Eats': [
          { name: 'Monthly Revenue', value: 12500, confidence: 'actual' },
          { name: 'Daily Customers', value: 85, confidence: 'actual' },
          { name: 'Average Order Value', value: 14.7, confidence: 'actual' },
          { name: 'Monthly Burn Rate', value: 8200, confidence: 'estimate' }
        ],
        'TechGadget Hub': [
          { name: 'Monthly Revenue', value: 28900, confidence: 'actual' },
          { name: 'Conversion Rate', value: 3.2, confidence: 'actual' },
          { name: 'Customer Acquisition Cost', value: 45, confidence: 'estimate' },
          { name: 'Monthly Orders', value: 420, confidence: 'actual' }
        ],
        'Digital Craft Studio': [
          { name: 'Monthly Revenue', value: 8500, confidence: 'actual' },
          { name: 'Active Clients', value: 6, confidence: 'actual' },
          { name: 'Average Project Value', value: 2800, confidence: 'actual' },
          { name: 'Monthly Expenses', value: 1200, confidence: 'actual' }
        ],
        'FitTracker Pro': [
          { name: 'Monthly Active Users', value: 2400, confidence: 'actual' },
          { name: 'Monthly Recurring Revenue', value: 1850, confidence: 'actual' },
          { name: 'User Retention Rate', value: 68, confidence: 'estimate' },
          { name: 'Development Costs', value: 15000, confidence: 'actual' }
        ]
      };

      // Insert KPIs for each
      for (const v of allVentures) {
        const id = v.id;
        const name = v.name;
        const kpis = kpiSetsByName[name];
        if (id && kpis) {
          await insertKpisFor(id, kpis);
        }
      }

      // Build normalized entries for newly inserted ventures with basic kpis display
      const normalizedInserted = inserted.map(v => ({
        ...v,
        status: v.stage ? 'active' : 'draft',
        kpis: (kpiSetsByName[v.name] || []).map(k => ({
          title: k.name,
          value: k.value,
          unit: 'number',
          trend: 0,
          trendDirection: 'up'
        }))
      }));

      setVentures(prev => [
        ...normalizedInserted,
        ...prev
      ]);

      return { success: true, created: normalizedInserted.length };
    } catch (error) {
      console.error('Seed test ventures error:', error);
      return { success: false, error };
    }
  };

  const deleteVenture = async (ventureId) => {
    if (!user || !ventureId) {
      return { success: false, error: new Error('Invalid parameters') };
    }

    try {
      // First verify the venture belongs to the user
      const { data: venture, error: ventureError } = await supabase
        .from('ventures')
        .select('id, name, user_id')
        .eq('id', ventureId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (ventureError) throw ventureError;
      if (!venture) {
        return { success: false, error: new Error('Venture not found or access denied') };
      }

      // Delete in proper order to maintain referential integrity
      const deletions = [
        // Delete KPIs first
        supabase.from('kpis').delete().eq('venture_id', ventureId),
        
        // Delete blocks
        supabase.from('blocks').delete().eq('venture_id', ventureId),
        
        // Delete notes
        supabase.from('notes').delete().eq('venture_id', ventureId),
        
        // Delete worksheets
        supabase.from('worksheets').delete().eq('venture_id', ventureId),
        
        // Delete chat sessions
        supabase.from('chat_sessions').delete().eq('venture_id', ventureId),
        
        // Delete timeline events
        supabase.from('timeline_events').delete().eq('venture_id', ventureId),
        
        // Delete manual logs
        supabase.from('manual_logs').delete().eq('venture_id', ventureId)
      ];

      // Execute all related deletions
      const results = await Promise.allSettled(deletions);
      
      // Check for any failures in related data deletion
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some related data deletions failed:', failures);
        // Continue with venture deletion anyway
      }

      // Finally delete the venture itself
      const { error: deleteError } = await supabase
        .from('ventures')
        .delete()
        .eq('id', ventureId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setVentures(prev => prev.filter(v => v.id !== ventureId));

      return { 
        success: true, 
        deletedVenture: venture.name,
        relatedDataResults: results 
      };

    } catch (error) {
      console.error('Delete venture error:', error);
      return { success: false, error };
    }
  };

  const value = {
    ventures,
    loading,
    error,
    createVenture,
    updateVenture,
    deleteVenture,
    seedTestVentures
  };

  return (
    <VenturesContext.Provider value={value}>
      {children}
    </VenturesContext.Provider>
  );
};

export const useVentures = () => {
  const context = useContext(VenturesContext);
  if (!context) {
    console.error('useVentures called outside of VenturesProvider! Component stack:', new Error().stack);
    throw new Error('useVentures must be used within a VenturesProvider. Check that your component is wrapped with VenturesProvider in index.jsx');
  }
  return context;
};