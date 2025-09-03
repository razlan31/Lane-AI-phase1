import { create } from 'zustand';

export const useAICopilotStore = create((set) => ({
  ventures: [],
  chats: {},
  activeChatId: null,
  
  // Venture management
  addVenture: (venture) =>
    set((state) => ({
      ventures: [...state.ventures, venture],
    })),
  clearVentures: () => set({ ventures: [] }),
  
  // Chat management
  createNewChat: (initialMessage = null) => {
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

    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: newChat,
      },
      activeChatId: chatId,
    }));
    
    return chatId;
  },
  
  deleteChat: (chatId) =>
    set((state) => {
      const updated = { ...state.chats };
      delete updated[chatId];
      
      const remainingChats = Object.keys(updated);
      const newActiveChatId = state.activeChatId === chatId 
        ? (remainingChats.length > 0 ? remainingChats[0] : null)
        : state.activeChatId;
      
      return {
        chats: updated,
        activeChatId: newActiveChatId,
      };
    }),
  
  renameChat: (chatId, newName) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          name: newName,
        },
      },
    })),
  
  addMessage: (chatId, message) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: {
          ...state.chats[chatId],
          messages: [...state.chats[chatId].messages, message],
        },
      },
    })),
  
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
}));