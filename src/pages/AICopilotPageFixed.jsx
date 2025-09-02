import React, { useState } from 'react';
import { Bot, Plus, Send, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AICopilotPageFixed = ({ mode = 'general', ventureId = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: mode === 'venture' 
        ? "👋 Hi, I'm your AI Co-Pilot for venture analysis. I can help you with KPIs, worksheets, market research, and strategic planning."
        : "👋 Hi, I'm your AI Co-Pilot. What do you want to work on today?",
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I understand you're working on that. Let me help you break it down into actionable steps. Would you like me to suggest some relevant tools or blocks for this?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    {
      title: "Financial Analysis",
      description: "ROI, cash flow, and runway calculations",
      action: () => toast.info("Opening financial tools...")
    },
    {
      title: "Market Research", 
      description: "Customer analysis and market sizing",
      action: () => toast.info("Opening market research tools...")
    },
    {
      title: "Strategic Planning",
      description: "Roadmaps and goal setting",
      action: () => toast.info("Opening strategic planning tools...")
    }
  ];

  return (
    <div className="h-full flex flex-col bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Co-Pilot</h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'venture' ? 'Venture Analysis Mode' : 'General Assistance Mode'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Chat</CardTitle>
              <CardDescription>Ask me anything about your business</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  • ROI Calculator run
                </div>
                <div className="text-sm text-muted-foreground">
                  • Market sizing worksheet
                </div>
                <div className="text-sm text-muted-foreground">
                  • Financial dashboard updated
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICopilotPageFixed;