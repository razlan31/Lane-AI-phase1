import React, { useState, useEffect } from "react";

// Key for localStorage
const STORAGE_KEY = "ai_copilot_chats_v1";

const AICopilotPage = ({ mode = "default" }) => {
  // Load chat sessions from localStorage
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setChats(parsed);
      setActiveChatId(Object.keys(parsed)[0] || createNewChat());
    } else {
      setActiveChatId(createNewChat());
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  // Helper: Create a new chat
  const createNewChat = () => {
    const id = Date.now().toString();
    const initialMessage = {
      role: "system",
      content:
        mode === "venture"
          ? "🚀 Let's create your new venture! Do you already have all the necessary data to set up this venture, or should we use mock data and let you edit later?"
          : "👋 Hi, I'm your AI Co-Pilot. What do you want to work on today?",
    };
    setChats((prev) => ({
      ...prev,
      [id]: { name: "New Chat", messages: [initialMessage] },
    }));
    setActiveChatId(id);
    return id;
  };

  const deleteChat = (id) => {
    const newChats = { ...chats };
    delete newChats[id];
    setChats(newChats);
    if (activeChatId === id) {
      const remaining = Object.keys(newChats);
      setActiveChatId(remaining[0] || createNewChat());
    }
  };

  const renameChat = (id, name) => {
    setChats((prev) => ({
      ...prev,
      [id]: { ...prev[id], name },
    }));
  };

  const sendMessage = () => {
    if (!input.trim() || !activeChatId) return;
    const newMessage = { role: "user", content: input.trim() };
    const aiResponse = {
      role: "assistant",
      content:
        mode === "venture"
          ? "🤖 Got it! (AI reply stub for venture creation flow)"
          : "🤖 (AI reply stub)",
    };

    setChats((prev) => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMessage, aiResponse],
      },
    }));
    setInput("");
  };

  const activeMessages = chats[activeChatId]?.messages || [];

  return (
    <div className="flex h-full">
      {/* Sidebar - Chat History */}
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-3 border-b">
          <button
            onClick={createNewChat}
            className="w-full bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/90"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.entries(chats).map(([id, chat]) => (
            <div
              key={id}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                id === activeChatId
                  ? "bg-primary/10 font-semibold"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveChatId(id)}
            >
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm"
                value={chat.name}
                onChange={(e) => renameChat(id, e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(id);
                }}
                className="ml-2 text-muted-foreground hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
          {activeMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-card text-card-foreground"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-3">
          <input
            type="text"
            className="flex-1 border rounded-lg px-4 py-3 bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything about your venture..."
          />
          <button
            onClick={sendMessage}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilotPage;
