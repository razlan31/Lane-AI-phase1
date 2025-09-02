import React, { useState } from "react";
import { useAICopilotStore } from "../../hooks/useAICopilotStore";
import { useVentures } from "../../hooks/useVentures";
import { useAutobuild } from "../../hooks/useAutobuild";
import VentureCardsFlow from "../venture/VentureCardsFlow";

/**
 * New Venture Modal
 * - Toggle between AI Chat and Quick Setup
 * - AI Chat shows chat interface directly in modal
 * - Quick Setup shows step-by-step venture creation flow
 */
const NewVentureModal = ({ isOpen, onClose, onCreateVenture }) => {
  const { activeChatId, addMessage, chats } = useAICopilotStore();
  const { createVenture } = useVentures();
  const { autobuildVenture, loading: autobuildLoading } = useAutobuild();
  const [mode, setMode] = useState("ai-chat"); // "ai-chat" | "quick-setup"
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const currentChat = activeChatId ? chats[activeChatId] : null;

  const handleSendMessage = () => {
    if (!input.trim() || !activeChatId) return;
    
    addMessage(activeChatId, {
      role: "user",
      content: input,
    });
    
    // Add AI response
    addMessage(activeChatId, {
      role: "assistant", 
      content: "I'll help you create your venture. Let me ask a few questions to get started...",
    });
    
    setInput("");
  };

  const handleQuickSetupComplete = async (ventureData) => {
    const result = await autobuildVenture(ventureData);
    if (result.success) {
      onCreateVenture?.(result.data);
      onClose();
    } else {
      console.error("Failed to create venture:", result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <h2 className="text-xl font-semibold">Create New Venture</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setMode("ai-chat")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "ai-chat"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Chat
              </button>
              <button
                onClick={() => setMode("quick-setup")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "quick-setup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Quick Setup
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* AI Chat Mode */}
        {mode === "ai-chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentChat?.messages?.length > 0 ? (
                <div className="space-y-4">
                  {currentChat.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <span className="text-2xl mb-2 block">🚀</span>
                  <p>Let's create your new venture! Do you already have all the necessary data to set up this venture, or should we use mock data and let you edit later?</p>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything about your venture..."
                  className="flex-1 px-3 py-2 border rounded-lg bg-background"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Setup Mode */}
        {mode === "quick-setup" && (
          <div className="flex-1 overflow-y-auto">
            <VentureCardsFlow
              onContinue={handleQuickSetupComplete}
              onCancel={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewVentureModal;
