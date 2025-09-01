import React, { useState } from "react";

/**
 * AI Co-Pilot Chat Page
 * - Always-on chat interface
 * - Handles history + input
 * - Can also be reused inside modals (venture creation)
 */
const AICopilotPage = ({ mode = "default" }) => {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        mode === "venture"
          ? "🚀 Let's create your new venture! Do you already have all the necessary data to set up this venture, or should we use mock data and let you edit later?"
          : "👋 Hi, I'm your AI Co-Pilot. What do you want to work on today?",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input.trim() };
    setMessages([
      ...messages,
      newMessage,
      {
        role: "assistant",
        content:
          mode === "venture"
            ? "🤖 Got it! (AI reply stub for venture creation flow)"
            : "🤖 (AI reply stub)",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-lg ${
              msg.role === "user"
                ? "bg-blue-100 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything about your venture..."
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AICopilotPage;