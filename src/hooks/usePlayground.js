import React, { useState, useEffect } from 'react';
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

  // Promote session to venture - ENHANCED IMPLEMENTATION
  const promoteToVenture = async (sessionId, ventureData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      // Create new venture
      const { data: venture, error: ventureError } = await supabase
        .from('ventures')
        .insert({
          user_id: user.id,
          name: ventureData.name || session.name,
          description: ventureData.description || `Venture created from playground: ${session.name}`,
          type: ventureData.type || 'startup',
          stage: ventureData.stage || 'concept'
        })
        .select()
        .single();

      if (ventureError) throw ventureError;

      // Convert playground blocks to actual blocks
      const canvas = session.canvas || { blocks: [] };
      if (canvas.blocks && canvas.blocks.length > 0) {
        const blockPromises = canvas.blocks.map(block => 
          supabase
            .from('blocks')
            .insert({
              venture_id: venture.id,
              name: block.name || block.type,
              category: block.category || 'Operations',
              description: `Converted from playground: ${block.type}`,
              status: 'planned',
              tags: ['playground-generated']
            })
            .select()
            .single()
        );

        const blockResults = await Promise.all(blockPromises);
        const createdBlocks = blockResults.filter(result => !result.error).map(result => result.data);

        // Create links between playground and blocks
        if (createdBlocks.length > 0) {
          const linkPromises = createdBlocks.map(block =>
            supabase
              .from('playground_links')
              .insert({
                session_id: sessionId,
                block_id: block.id,
                position: canvas.blocks.find(b => b.name === block.name)?.position
              })
          );

          await Promise.all(linkPromises);
        }
      }

      // Create timeline event for promotion
      await supabase
        .from('timeline_events')
        .insert({
          user_id: user.id,
          venture_id: venture.id,
          kind: 'venture_created',
          title: 'Venture Created from Playground',
          body: `Venture "${venture.name}" was created from playground session "${session.name}"`,
          payload: {
            source: 'playground',
            session_id: sessionId,
            block_count: canvas.blocks?.length || 0
          }
        });

      // Mark session as promoted
      await updateSession(sessionId, {
        description: `Promoted to venture: ${venture.name}`,
        canvas: {
          ...canvas,
          promoted: true,
          venture_id: venture.id,
          promoted_at: new Date().toISOString()
        }
      });

      return { success: true, venture, blocksCreated: canvas.blocks?.length || 0 };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Enhanced canvas manipulation
  const addBlockToCanvas = async (sessionId, blockData) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const canvas = session.canvas || { blocks: [], connections: [] };
      const newBlock = {
        id: Date.now().toString(),
        ...blockData,
        position: blockData.position || { x: Math.random() * 400, y: Math.random() * 300 }
      };

      const updatedCanvas = {
        ...canvas,
        blocks: [...(canvas.blocks || []), newBlock]
      };

      return await updateSession(sessionId, { canvas: updatedCanvas });
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const removeBlockFromCanvas = async (sessionId, blockId) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const canvas = session.canvas || { blocks: [], connections: [] };
      const updatedCanvas = {
        ...canvas,
        blocks: (canvas.blocks || []).filter(block => block.id !== blockId),
        connections: (canvas.connections || []).filter(conn => 
          conn.from !== blockId && conn.to !== blockId
        )
      };

      return await updateSession(sessionId, { canvas: updatedCanvas });
    } catch (err) {
      setError(err.message);
      return null;
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
    promoteToVenture,
    addBlockToCanvas,
    removeBlockFromCanvas
  };
};