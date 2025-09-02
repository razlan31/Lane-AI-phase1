import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChatSessions = (ventureId = null) => {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSessions([]);
          setMessages({});
          return;
        }

        let query = supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (ventureId) {
          query = query.eq('venture_id', ventureId);
        }

        const { data: sessionsData, error: sessionsError } = await query;
        if (sessionsError) throw sessionsError;

        setSessions(sessionsData || []);

        // Fetch messages for all sessions
        if (sessionsData && sessionsData.length > 0) {
          const sessionIds = sessionsData.map(s => s.id);
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .in('session_id', sessionIds)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;

          const messagesBySession = (messagesData || []).reduce((acc, msg) => {
            if (!acc[msg.session_id]) {
              acc[msg.session_id] = [];
            }
            acc[msg.session_id].push(msg);
            return acc;
          }, {});

          setMessages(messagesBySession);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [ventureId]);

  const createSession = async (title, initialMessage = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const sessionData = {
        user_id: user.id,
        venture_id: ventureId,
        title: title || 'New Chat',
      };

      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert(sessionData)
        .select('*')
        .single();

      if (sessionError) throw sessionError;

      // Add initial system message
      const systemMessage = {
        session_id: session.id,
        role: 'system',
        content: initialMessage || '👋 Hi, I\'m your AI Co-Pilot. What do you want to work on today?',
      };

      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert(systemMessage)
        .select('*')
        .single();

      if (messageError) throw messageError;

      setSessions(prev => [session, ...prev]);
      setMessages(prev => ({
        ...prev,
        [session.id]: [message]
      }));

      return { success: true, data: session };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addMessage = async (sessionId, content, role = 'user', references = null) => {
    try {
      const messageData = {
        session_id: sessionId,
        role,
        content
      };

      // TODO: Add references field to chat_messages table for audit trail
      // if (references) {
      //   messageData.references = references;
      // }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select('*')
        .single();

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), message]
      }));

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return { success: true, data: message };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateSession = async (sessionId, updates) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select('*')
        .single();

      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setMessages(prev => {
        const updated = { ...prev };
        delete updated[sessionId];
        return updated;
      });

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    sessions,
    messages,
    loading,
    error,
    createSession,
    addMessage,
    updateSession,
    deleteSession
  };
};