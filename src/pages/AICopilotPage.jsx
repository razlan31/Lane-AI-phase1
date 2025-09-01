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
  const [showWelcome, setShowWelcome] = useState(mode === "default");

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
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Welcome Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          {/* AI Robot Icon */}
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="text-4xl">🤖</div>
          </div>

          {/* Title and Subtitle */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to AI Co-Pilot
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Your AI-first business assistant. Just describe what you need and I'll build it for you.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="bg-card border rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h3 className="font-semibold text-foreground">Natural Language</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                "I run a coffee shop and need to track daily sales"
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="font-semibold text-foreground">Goal-Based</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                "I need to reach $10k monthly revenue"
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="font-semibold text-foreground">Auto-Generated</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Dashboards, worksheets, and KPIs built for you
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <h3 className="font-semibold text-foreground">Always Learning</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Adapts to your business as it grows
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              className="flex-1 border rounded-lg px-4 py-3 bg-background"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Describe what you want to build..."
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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
        {messages.map((msg, idx) => (
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
  );
};

export default AICopilotPage;