import { useState, useEffect } from 'react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { Bot, Plus, Trash2, ChevronDown, Send, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VoiceInputButton } from '@/components/VoiceInputButton';

const AICopilotPage = ({ mode = 'general', ventureId = null }) => {
  const { 
    sessions, 
    messages, 
    loading,
    createSession, 
    addMessage,
    deleteSession
  } = useChatSessions(ventureId);
  
  const [input, setInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [auditModal, setAuditModal] = useState(null);

  useEffect(() => {
    // Set active session to the most recent one
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    // Create initial session if none exist
    if (!loading && sessions.length === 0) {
      const systemMessage = mode === 'venture' 
        ? "👋 Hi, I'm your AI Co-Pilot for venture analysis. I can help you with KPIs, worksheets, market research, and strategic planning."
        : "👋 Hi, I'm your AI Co-Pilot. What do you want to work on today?";
      
      createSession('New Chat', systemMessage);
    }
  }, [loading, sessions.length, createSession, mode]);

  const sendMessage = async () => {
    if (!input.trim() || !activeSessionId) return;
    
    const userInput = input;
    setInput('');
    
    // Add user message
    await addMessage(activeSessionId, userInput, 'user');
    
    // Add assistant response (mock for now - will be replaced with real AI)
    setTimeout(async () => {
      await addMessage(
        activeSessionId, 
        `I understand you want to work on: ${userInput}. Let me help you with that! 

Based on your input, I can suggest:
• Creating relevant KPIs to track progress
• Setting up worksheets for analysis
• Assigning relevant blocks to track completion

Would you like me to proceed with any of these suggestions?`,
        'assistant'
      );
    }, 1000);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const sessionMessages = activeSessionId ? (messages[activeSessionId] || []) : [];
  const isNewChat = sessionMessages.length <= 1;

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar for Session Control */}
      <div className="flex items-center gap-4 p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Co-Pilot</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={activeSessionId || ''} 
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="bg-white border rounded px-3 py-2 min-w-[200px]"
          >
            <option value="">Select Chat</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createSession('New Chat')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => activeSessionId && deleteSession(activeSessionId)}
            disabled={!activeSessionId}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Welcome Screen */}
      {isNewChat ? (
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
            {/* Robot Icon */}
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-12 h-12 text-primary" />
            </div>

            {/* Title + Subtitle */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome to AI Co-Pilot
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Your AI-powered business assistant. Describe what you need and I'll help you build dashboards, 
                worksheets, KPIs, and track your venture progress.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <CardTitle className="text-base">Natural Language</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    "I run a coffee shop and need to track daily sales and inventory"
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <CardTitle className="text-base">Goal-Based Planning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    "I need to reach $10k monthly revenue in 6 months"
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <CardTitle className="text-base">Auto-Generated Tools</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Dashboards, worksheets, KPIs, and 130+ venture blocks created for you
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    <CardTitle className="text-base">Audit Trail</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every AI suggestion is backed by data - click "Why?" to see the reasoning
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Describe what you want to build or analyze..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!activeSessionId}
              />
              <VoiceInputButton 
                onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                disabled={!activeSessionId}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || !activeSessionId}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {sessionMessages.slice(1).map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs opacity-70 hover:opacity-100"
                        onClick={() => setAuditModal(message)}
                      >
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Why?
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!activeSessionId}
              />
              <VoiceInputButton 
                onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                disabled={!activeSessionId}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || !activeSessionId}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      <Dialog open={!!auditModal} onOpenChange={() => setAuditModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why this response?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">AI Response</h4>
              <div className="p-3 bg-gray-50 rounded">
                {auditModal?.content}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Referenced Items</h4>
              <div className="text-sm text-muted-foreground">
                This feature will show linked notes, KPIs, worksheets, and blocks that influenced this response.
                
                <div className="mt-3 p-3 border rounded">
                  <div className="text-xs font-medium mb-1">Coming Soon:</div>
                  <ul className="text-xs space-y-1">
                    <li>• Referenced venture blocks</li>
                    <li>• Linked KPIs and metrics</li>
                    <li>• Connected worksheets</li>
                    <li>• Related notes and decisions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AICopilotPage;