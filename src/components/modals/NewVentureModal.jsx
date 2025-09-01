import React, { useState } from "react";
import { useAICopilotStore } from "../../hooks/useAICopilotStore";

/**
 * New Venture Modal
 * - Reuses AI Co-Pilot chat for creation flow
 * - Lets user either chat or pick cards
 */
const NewVentureModal = ({ isOpen, onClose }) => {
  const { activeChatId, addMessage } = useAICopilotStore();
  const [mode, setMode] = useState("choose"); // "choose" | "chat" | "cards"

  if (!isOpen) return null;

  const startChatFlow = () => {
    if (activeChatId) {
      addMessage(activeChatId, {
        role: "system",
        content:
          "🚀 Venture creation started. Do you already have the necessary data, or should we use mock data?",
      });
    }
    setMode("chat");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create a New Venture</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Choose Mode */}
        {mode === "choose" && (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              How do you want to create your new venture?
            </p>
            <div className="flex gap-4">
              <button
                onClick={startChatFlow}
                className="flex-1 bg-primary text-primary-foreground p-4 rounded-lg hover:bg-primary/90"
              >
                💬 Use AI Chat
              </button>
              <button
                onClick={() => setMode("cards")}
                className="flex-1 bg-card border p-4 rounded-lg hover:bg-accent"
              >
                📑 Use Venture Cards
              </button>
            </div>
          </div>
        )}

        {/* AI Chat Flow */}
        {mode === "chat" && (
          <div className="flex-1">
            <p className="text-muted-foreground mb-2">
              AI Co-Pilot is guiding you through venture setup. Continue in the
              chat window →
            </p>
            <button
              onClick={() => setMode("choose")}
              className="text-sm text-primary hover:underline"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Cards Flow */}
        {mode === "cards" && (
          <div className="grid grid-cols-3 gap-4">
            {["Startup", "Dropshipping", "Student Project"].map((type) => (
              <div
                key={type}
                className="border rounded-lg p-4 cursor-pointer hover:bg-muted"
                onClick={() => {
                  console.log("Selected venture type:", type);
                  onClose();
                }}
              >
                <h3 className="font-semibold">{type}</h3>
                <p className="text-sm text-muted-foreground">
                  Quick setup for {type.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewVentureModal;
