import { useState } from 'react';
import { MessageCircle, Send, X, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const VentureChatPanel = ({ 
  isOpen, 
  onClose, 
  ventureId, 
  ventureName,
  initialContext = null 
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: `Hi! I'm your AI assistant for ${ventureName}. I can help you analyze data, create worksheets, and answer questions about your venture.`,
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I understand you want to analyze that. Let me help you with that data point. Would you like me to create a worksheet or update your existing projections?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Context: {ventureName}
        </p>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1",
              msg.type === 'user' ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg text-sm",
                msg.type === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : msg.type === 'system'
                  ? "bg-muted text-muted-foreground border border-border"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {msg.content}
            </div>
            <span className="text-xs text-muted-foreground">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        
        {/* Initial Context Message */}
        {initialContext && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Context</span>
            </div>
            <p className="text-sm text-blue-800">{initialContext}</p>
          </div>
        )}
      </CardContent>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about your venture..."
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VentureChatPanel;