import { useState, useCallback } from "react";

// CACHE BUST v2: Force Vite to rebuild React chunks after import standardization  
// AI Co-Pilot store for managing chat sessions

/**
 * AI Co-Pilot Store Hook
 * - Manages multiple chat sessions
 * - Shared across components (modals, pages)
 * - Persistent chat history
 */
export const useAICopilotStore = () => {
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);

  const createNewChat = useCallback((initialMessage = null) => {
    const chatId = `chat_${Date.now()}`;
    const defaultMessage = {
      role: "system",
      content: "👋 Hi, I'm your AI Co-Pilot. What do you want to work on today?",
    };
    
    const newChat = {
      id: chatId,
      name: "New Chat",
      messages: [initialMessage || defaultMessage],
      createdAt: new Date(),
    };

    setChats(prev => ({
      ...prev,
      [chatId]: newChat,
    }));
    setActiveChatId(chatId);
    return chatId;
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    
    if (activeChatId === chatId) {
      const remainingChats = Object.keys(chats).filter(id => id !== chatId);
      setActiveChatId(remainingChats.length > 0 ? remainingChats[0] : null);
    }
  }, [activeChatId, chats]);

  const renameChat = useCallback((chatId, newName) => {
    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        name: newName,
      },
    }));
  }, []);

  const addMessage = useCallback((chatId, message) => {
    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages: [...prev[chatId].messages, message],
      },
    }));
  }, []);

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    deleteChat,
    renameChat,
    addMessage,
  };
};

export default useAICopilotStore;