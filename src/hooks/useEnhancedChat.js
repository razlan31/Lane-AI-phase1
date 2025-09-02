import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedChat = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all chat sessions for the user
  useEffect(() => {
    const fetchChatSessions = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setChatSessions([]);
          setLoading(false);
          return;
        }

        // Mock data for now - replace with real Supabase query
        const mockSessions = [
          {
            id: 'session_1',
            title: 'Coffee Shop Analysis',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user.id
          }
        ];

        setChatSessions(mockSessions);
        if (mockSessions.length > 0 && !activeChatId) {
          setActiveChatId(mockSessions[0].id);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, [activeChatId]);

  // Create new chat session
  const createNewChat = async (title = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const chatId = `chat_${Date.now()}`;
      const autoTitle = title || `Chat ${new Date().toLocaleDateString()}`;
      
      const newSession = {
        id: chatId,
        title: autoTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };

      setChatSessions(prev => [newSession, ...prev]);
      setActiveChatId(chatId);
      
      // Initialize with welcome message
      setMessages(prev => ({
        ...prev,
        [chatId]: [{
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: "👋 Hi! I'm your AI Co-Pilot. Upload files (CSV, Excel, PDF) or tell me about your business, and I'll build dashboards and worksheets for you.",
          created_at: new Date().toISOString()
        }]
      }));

      return { success: true, chatId };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Add message to chat
  const addMessage = async (chatId, content, role = 'user', files = null) => {
    try {
      const messageId = `msg_${Date.now()}`;
      const message = {
        id: messageId,
        role,
        content,
        files,
        created_at: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      }));

      // Update session timestamp
      setChatSessions(prev => prev.map(session => 
        session.id === chatId 
          ? { ...session, updated_at: new Date().toISOString() }
          : session
      ));

      return { success: true, messageId };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Rename chat session
  const renameChat = async (chatId, newTitle) => {
    try {
      setChatSessions(prev => prev.map(session => 
        session.id === chatId 
          ? { ...session, title: newTitle, updated_at: new Date().toISOString() }
          : session
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Delete chat session
  const deleteChat = async (chatId) => {
    try {
      setChatSessions(prev => prev.filter(session => session.id !== chatId));
      setMessages(prev => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });
      
      if (activeChatId === chatId) {
        const remainingSessions = chatSessions.filter(s => s.id !== chatId);
        setActiveChatId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Auto-generate title based on first user message
  const autoGenerateTitle = async (chatId, firstMessage) => {
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 47) + '...'
      : firstMessage;
    
    return await renameChat(chatId, title);
  };

  // Get active chat messages
  const getActiveChatMessages = () => {
    return activeChatId ? (messages[activeChatId] || []) : [];
  };

  // Get active chat info
  const getActiveChatInfo = () => {
    return chatSessions.find(session => session.id === activeChatId) || null;
  };

  return {
    chatSessions,
    activeChatId,
    setActiveChatId,
    messages: getActiveChatMessages(),
    activeChatInfo: getActiveChatInfo(),
    loading,
    error,
    createNewChat,
    addMessage,
    renameChat,
    deleteChat,
    autoGenerateTitle
  };
};