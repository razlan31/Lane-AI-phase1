import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePlayground = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch playground sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setSessions([]);
          return;
        }

        const { data, error } = await supabase
          .from('playground_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
        
        // Set most recent session as active if none selected
        if (data && data.length > 0 && !activeSession) {
          setActiveSession(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Create new playground session
  const createSession = async (name = 'New Playground') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('playground_sessions')
        .insert({
          user_id: user.id,
          name,
          canvas: { blocks: [], connections: [] }
        })
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      setActiveSession(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update session canvas
  const updateSession = async (sessionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('playground_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => prev.map(session => 
        session.id === sessionId ? data : session
      ));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(data);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete session
  const deleteSession = async (sessionId) => {
    try {
      const { error } = await supabase
        .from('playground_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(sessions.length > 1 ? sessions[0] : null);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Promote session to venture
  const promoteToVenture = async (sessionId, ventureData) => {
    try {
      // This would create a new venture with the playground data
      // Implementation depends on venture creation logic
      console.log('Promoting session to venture:', sessionId, ventureData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    sessions,
    activeSession,
    setActiveSession,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    promoteToVenture
  };
};