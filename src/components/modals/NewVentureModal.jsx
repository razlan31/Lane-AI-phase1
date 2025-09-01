import React, { useState } from "react";
import AICopilotPage from "../../pages/AICopilotPage";

/**
 * New Venture Modal
 * - Default mode: AI Chat (venture-specific flow)
 * - Alternative mode: Cards flow (old 3/6 card system)
 */
const NewVentureModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("chat"); // "chat" | "cards"

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">🚀 Create New Venture</h2>
          <div className="space-x-2">
            <button
              onClick={() => setMode("chat")}
              className={`px-3 py-1 rounded ${
                mode === "chat"
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setMode("cards")}
              className={`px-3 py-1 rounded ${
                mode === "cards"
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Cards
            </button>
            <button
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === "chat" ? (
            <AICopilotPage mode="venture" />
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Cards flow coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewVentureModal;