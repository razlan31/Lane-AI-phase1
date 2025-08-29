import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { MessageCircle, Send, Paperclip, Pin, MoreHorizontal, Command } from 'lucide-react';

const AIChatShell = ({ isOpen, onToggle, initialContext = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [threads, setThreads] = useState([{ id: 1, title: 'General', active: true }]);
  const [activeThread, setActiveThread] = useState(1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      threadId: activeThread
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I understand you need help with that. Let me analyze the data...",
        sender: 'ai',
        timestamp: new Date(),
        threadId: activeThread
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const threadMessages = messages.filter(msg => msg.threadId === activeThread);

  return (
    <>
      {/* Floating Orb */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={onToggle}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={onToggle}>
        <DialogContent className="max-w-4xl h-[600px] p-0">
          <div className="flex h-full">
            {/* Sidebar - Threads */}
            <div className="w-64 border-r border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Threads</h3>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {threads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={cn(
                      "p-2 rounded-md cursor-pointer text-sm transition-colors",
                      thread.id === activeThread 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "hover:bg-muted"
                    )}
                  >
                    {thread.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <DialogHeader className="p-4 border-b border-border">
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  AI Assistant
                  <Button size="sm" variant="ghost">
                    <Pin className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {threadMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm mt-2">Try asking about your data, metrics, or workflows</p>
                  </div>
                ) : (
                  threadMessages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3 text-sm",
                          message.sender === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything about your data..."
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[40px] max-h-32 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      rows="1"
                    />
                  </div>
                  <Button size="sm" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSend} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘K</kbd> for command palette
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Command Bar Component
const CommandBar = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  
  const commands = [
    { id: 1, title: 'Show runway analysis', description: 'Get current runway projection' },
    { id: 2, title: 'Generate weekly brief', description: 'Create this week\'s summary report' },
    { id: 3, title: 'Explain cash flow', description: 'Break down cash flow metrics' },
    { id: 4, title: 'Create new worksheet', description: 'Start a new financial worksheet' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map(command => (
            <div
              key={command.id}
              className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
              onClick={onClose}
            >
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{command.description}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AIChatShell, CommandBar };