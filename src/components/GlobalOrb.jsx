import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import AICopilot from '@/components/copilot/AICopilot';
import { useToast } from '@/hooks/use-toast';

const GlobalOrb = ({ className = "", context = null, ventureId = null }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  
  const { 
    sessions, 
    messages, 
    createSession, 
    addMessage 
  } = useChatSessions(ventureId);

  const { 
    activeSuggestion, 
    generateSuggestion, 
    dismissSuggestion 
  } = useCopilotManager();

  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    // Hide orb in VentureHub
    const currentPath = window.location.pathname;
    const isInVentureHub = currentPath.includes('venture-') || 
                          window.location.hash.includes('venture-') ||
                          document.title.includes('Venture');
    
    setIsVisible(!isInVentureHub);
  }, []);

  useEffect(() => {
    if (context && isExpanded && !activeSessionId) {
      // Create new session with context
      const createContextSession = async () => {
        const result = await createSession('Context Chat', context);
        if (result.success) {
          setActiveSessionId(result.data.id);
        }
      };
      createContextSession();
    }
  }, [context, isExpanded, activeSessionId, createSession]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && sessions.length === 0) {
      createSession('Quick Chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSessionId) return;
    
    const userInput = input;
    setInput('');
    
    await addMessage(activeSessionId, userInput, 'user');
    
    // Mock AI response
    setTimeout(async () => {
      await addMessage(
        activeSessionId, 
        `I can help you with: ${userInput}. Let me provide some insights based on your context.`,
        'assistant'
      );
    }, 1000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {!isExpanded ? (
        // Orb State with Suggestion Indicator
        <div className="relative">
          <Button
            onClick={handleToggle}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
          </Button>
          {activeSuggestion && (
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
      ) : (
        // Expanded Chat Panel
        <div className="bg-background border border-border rounded-lg shadow-xl w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* AI Suggestion */}
          {activeSuggestion && (
            <div className="p-3 border-b">
              <AICopilot 
                suggestion={activeSuggestion}
                context={context}
                layout="strip"
                onSuggestionAction={(action) => {
                  if (action === 'accept') {
                    dismissSuggestion(activeSuggestion.id, true);
                  } else {
                    dismissSuggestion(activeSuggestion.id, false);
                  }
                }}
              />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeSessionId && messages[activeSessionId]?.map((message, index) => (
              <div
                key={message.id || index}
                className={`p-2 rounded text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-6'
                    : 'bg-muted mr-6'
                }`}
              >
                {message.content}
              </div>
            ))}
            
            {context && (
              <div className="text-xs text-muted-foreground p-2 bg-accent/20 rounded border">
                <Badge variant="secondary" className="text-xs">Context</Badge>
                <span className="ml-2">{context}</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <VoiceInputButton 
                onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                disabled={!activeSessionId}
              />
              <Button 
                size="sm" 
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-3"
              >
                <MessageSquare className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalOrb;