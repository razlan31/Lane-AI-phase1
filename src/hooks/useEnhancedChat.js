import { useState, useEffect, useCallback } from 'react';
import { useChatSessions } from './useChatSessions';

export const useEnhancedChat = (ventureId = null) => {
  const {
    sessions: chatSessions,
    messages: allMessages,
    loading,
    error,
    createSession,
    deleteSession,
    updateSession,
    refreshMessages,
    refreshSessions
  } = useChatSessions(ventureId);

  const [activeChatId, setActiveChatId] = useState(null);

  // Auto-select first session when sessions load
  useEffect(() => {
    if (!loading && chatSessions.length > 0 && !activeChatId) {
      setActiveChatId(chatSessions[0].id);
    }
  }, [loading, chatSessions, activeChatId]);

  // Refresh messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      refreshMessages(activeChatId);
    }
  }, [activeChatId, refreshMessages]);

  // Create new chat session
  const createNewChat = useCallback(async (title = null) => {
    const defaultTitle = title || `Chat ${chatSessions.length + 1}`;
    const result = await createSession(defaultTitle);
    
    if (result.success) {
      setActiveChatId(result.data.id);
      // Refresh sessions to get the latest data
      await refreshSessions();
    }
    
    return result;
  }, [createSession, chatSessions.length, refreshSessions]);

  // Add message to session (already handled by useChatSessions)
  const addMessage = useCallback(async (sessionId, content, role = 'user', references = null) => {
    // This is handled by the OpenAI integration now
    // Just refresh the messages to get the latest from the database
    await refreshMessages(sessionId);
  }, [refreshMessages]);

  // Rename chat session
  const renameChat = useCallback(async (sessionId, newTitle) => {
    const result = await updateSession(sessionId, { title: newTitle });
    
    if (result.success) {
      await refreshSessions();
    }
    
    return result;
  }, [updateSession, refreshSessions]);

  // Delete chat session
  const deleteChat = useCallback(async (sessionId) => {
    const result = await deleteSession(sessionId);
    
    if (result.success) {
      // If we deleted the active session, select the first remaining one
      if (sessionId === activeChatId) {
        const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
        setActiveChatId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      // Refresh sessions to get the latest data
      await refreshSessions();
    }
    
    return result;
  }, [deleteSession, activeChatId, chatSessions, refreshSessions]);

  // Auto-generate title based on first message
  const autoGenerateTitle = useCallback(async (sessionId, firstMessage) => {
    if (firstMessage && firstMessage.length > 5) {
      const title = firstMessage.length > 30 
        ? firstMessage.substring(0, 30) + '...' 
        : firstMessage;
      await renameChat(sessionId, title);
    }
  }, [renameChat]);

  // Get current session info
  const activeChatInfo = chatSessions.find(session => session.id === activeChatId);
  
  // Get messages for active chat
  const messages = activeChatId ? (allMessages[activeChatId] || []) : [];

  return {
    chatSessions,
    activeChatId,
    setActiveChatId,
    messages,
    activeChatInfo,
    loading,
    error,
    createNewChat,
    addMessage,
    renameChat,
    deleteChat,
    autoGenerateTitle,
    refreshMessages,
    refreshSessions
  };
};