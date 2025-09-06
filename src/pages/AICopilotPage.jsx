import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Mic, 
  History, 
  Bot, 
  User,
  Paperclip,
  FileText,
  Image,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { useDebouncedChatInput } from '@/hooks/useDebounce';
import { PromptReuseChip } from '@/components/ui/prompt-reuse-chip';
import { VoiceInputButton } from '@/components/VoiceInputButton';
import { detectChatCommands, generateCommandResponse } from '@/utils/aiChatBuilder';
import { getCapabilities } from '@/utils/capabilities';
import WorksheetBuilder from '@/components/modals/WorksheetBuilder';
import { PersonalFieldModal } from '@/components/modals/PersonalFieldModal';
import AIMutationPreviewModal from '@/components/modals/AIMutationPreviewModal';
import ScenarioSandbox from '@/components/scenarios/ScenarioSandbox';
import { useScenarios } from '@/hooks/useScenarios';

const AICopilotPage = ({ mode = 'general', ventureId = null }) => {
  const {
    chatSessions,
    activeChatId,
    setActiveChatId,
    messages,
    activeChatInfo,
    loading,
    createNewChat,
    addMessage,
    renameChat,
    deleteChat,
    autoGenerateTitle
  } = useEnhancedChat();

  const { sendMessage: sendOpenAIMessage, loading: aiLoading } = useOpenAIChat();

  const { 
    inputValue, 
    debouncedValue, 
    isTyping, 
    setInputValue, 
    clearInput 
  } = useDebouncedChatInput('', 750);
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [lastUserPrompts, setLastUserPrompts] = useState([]);
  const [showWorksheetBuilder, setShowWorksheetBuilder] = useState(false);
  const [showPersonalFieldModal, setShowPersonalFieldModal] = useState(false);
  const [roleInfo, setRoleInfo] = useState({ role: null, reason: '' });
  const [proposedAction, setProposedAction] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showScenarioSandbox, setShowScenarioSandbox] = useState(false);
  const [auditModal, setAuditModal] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scenario hook
  const { 
    evaluateScenario, 
    detectScenarioIntent, 
    currentScenario,
    evaluating 
  } = useScenarios();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize first chat if none exist
  useEffect(() => {
    if (!loading && chatSessions.length === 0) {
      createNewChat('New Chat');
    }
  }, [loading, chatSessions.length, createNewChat]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length || !activeChatId) return;

    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setUploadedFiles(prev => [...prev, ...fileData]);

    // Send file upload message
    await addMessage(
      activeChatId,
      `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
      'user',
      fileData
    );

    // Generate AI response
    setTimeout(async () => {
      const response = generateFileResponse(files);
      await addMessage(activeChatId, response, 'assistant');
    }, 1000);

    event.target.value = '';
  };

  // Handle sending message
  const handleSendMessage = async () => {
    console.log('AICopilotPage handleSendMessage called', { inputValue, activeChatId, aiLoading });
    
    if (!inputValue.trim() || aiLoading) return;

    // Create a new chat if none exists
    if (!activeChatId) {
      console.log('No active chat, creating new one...');
      await createNewChat('New Chat');
      return; // The effect will trigger and set activeChatId, then user can try again
    }

    const userMessage = inputValue.trim();
    console.log('Sending message:', userMessage);
    
    // Check for scenario intent first
    if (detectScenarioIntent(userMessage)) {
      clearInput();
      
      // Track prompt for reuse
      setLastUserPrompts(prev => {
        const updated = [userMessage, ...prev.filter(p => p !== userMessage)];
        return updated.slice(0, 3);
      });

      // Evaluate scenario immediately
      await addMessage(activeChatId, userMessage, 'user');
      
      const result = await evaluateScenario(userMessage, { ventureId });
      if (result.success) {
        if (result.data.needs_clarification) {
          const clarificationMsg = `I need more information:\n\n${result.data.questions.map(q => `• ${q}`).join('\n')}`;
          await addMessage(activeChatId, clarificationMsg, 'assistant');
        } else {
          let responseMsg = `**Scenario Analysis Complete** 🧮\n\n`;
          
          if (result.data.computed_results) {
            responseMsg += `**Key Results:**\n`;
            Object.entries(result.data.computed_results).forEach(([key, value]) => {
              if (typeof value === 'number') {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const formattedValue = key.includes('cost') || key.includes('revenue') || key.includes('balance') ? 
                  `$${value.toLocaleString()}` : value.toLocaleString();
                responseMsg += `• ${label}: ${formattedValue}\n`;
              }
            });
          }
          
          responseMsg += `\n**Confidence:** ${result.data.confidence_score >= 0.8 ? 'High' : result.data.confidence_score >= 0.6 ? 'Medium' : 'Low'}\n\n`;
          responseMsg += `Would you like to save this as a calculation log or convert it to a structured worksheet?`;
          
          await addMessage(activeChatId, responseMsg, 'assistant');
        }
      } else {
        await addMessage(activeChatId, 'I encountered an error evaluating your scenario. Please try rephrasing it.', 'assistant');
      }
      
      return;
    }
    
    // Check for chat builder commands before sending to AI
    const command = detectChatCommands(userMessage);
    if (command) {
      // Get user capabilities for feature gating
      const capabilities = getCapabilities({}); // Will be replaced with actual profile
      const commandResponse = generateCommandResponse(command, capabilities);
      
      if (commandResponse) {
        clearInput();
        
        // Track prompt for reuse
        setLastUserPrompts(prev => {
          const updated = [userMessage, ...prev.filter(p => p !== userMessage)];
          return updated.slice(0, 3);
        });

        // Handle different command actions
        if (commandResponse.suggestedAction === 'personal_field_form') {
          setShowPersonalFieldModal(true);
        } else if (commandResponse.suggestedAction === 'worksheet_builder_form') {
          setShowWorksheetBuilder(true);
        }
        
        // Add response to chat
        await addMessage(activeChatId, userMessage, 'user');
        setTimeout(async () => {
          await addMessage(activeChatId, commandResponse.message, 'assistant');
        }, 500);
        
        return;
      }
    }

    clearInput();

    // Track recent prompts for reuse
    setLastUserPrompts(prev => {
      const updated = [userMessage, ...prev.filter(p => p !== userMessage)];
      return updated.slice(0, 3); // Keep last 3 unique prompts
    });

    // Auto-generate title if this is the first user message
    const currentMessages = messages || [];
    const userMessages = currentMessages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      autoGenerateTitle(activeChatId, userMessage);
    }

    try {
      // Send message to OpenAI
      const result = await sendOpenAIMessage(userMessage, activeChatId, 'global');
      
      if (!result.success) {
        // Re-enable input if there was an error
        setInputValue(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Re-enable input if there was an error
      setInputValue(userMessage);
    }
  };

  // Handle voice input
  const handleVoiceTranscript = (transcript) => {
    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
  };

  // Handle chat renaming
  const handleStartRename = () => {
    setNewTitle(activeChatInfo?.title || '');
    setIsRenaming(true);
  };

  const handleSaveRename = async () => {
    if (newTitle.trim() && activeChatId) {
      await renameChat(activeChatId, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewTitle('');
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    await createNewChat();
  };

  // Handle chat deletion
  const handleDeleteChat = async () => {
    if (activeChatId && chatSessions.length > 1) {
      await deleteChat(activeChatId);
    }
  };

  // Generate AI responses
  const generateAIResponse = (input, context) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('coffee') || lowercaseInput.includes('kiosk')) {
      return "Great! I'll set up a Coffee Kiosk venture for you. I'm creating:\n\n• Revenue & Sales Dashboard\n• Daily Sales tracker\n• Inventory management\n• Customer analytics\n• Profit calculator\n\nShould I also add expense tracking worksheets?";
    }
    
    if (lowercaseInput.includes('saas') || lowercaseInput.includes('software')) {
      return "Perfect! Creating a SaaS business setup:\n\n• MRR Dashboard\n• Customer acquisition tracker\n• Churn analysis\n• Unit economics model\n• Runway calculator\n\nWould you like me to add subscription analytics?";
    }
    
    return "I understand you want to work on that. Let me help by creating:\n\n• Custom dashboard for your needs\n• Relevant worksheets and calculators\n• Key performance indicators\n• Progress tracking tools\n\nCould you tell me more about your specific requirements?";
  };

  const generateFileResponse = (files) => {
    const hasSpreadsheet = files.some(f => f.type.includes('csv') || f.type.includes('excel'));
    const hasPDF = files.some(f => f.type.includes('pdf'));
    
    if (hasSpreadsheet) {
      return "Perfect! I found financial data. Creating:\n\n📊 Revenue Dashboard\n📈 P&L Analysis\n💰 Cash Flow tracker\n📋 Monthly reports\n🎯 Key metrics\n\nProcessing your data now...";
    }
    
    if (hasPDF) {
      return "Analyzing your PDF documents. Creating:\n\n📊 Business insights\n📝 Key metrics extraction\n📈 Performance tracking\n📋 Document summary\n\nExtracting insights...";
    }
    
    return "Files uploaded successfully! Analyzing to create relevant dashboards and worksheets...";
  };

  const isNewChat = !messages || messages.length <= 1;

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar for Session Control */}
      <div className="flex items-center gap-4 p-4 border-b bg-background">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-5 h-5 flex-shrink-0" />
          {isRenaming ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-sm h-8 px-2"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveRename} className="h-8 w-8 p-0">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelRename} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="font-medium truncate flex-1">
                {activeChatInfo?.title || 'AI Co-Pilot'}
              </span>
              {roleInfo.role && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {roleInfo.role.charAt(0).toUpperCase() + roleInfo.role.slice(1)} Mode
                </span>
              )}
              <Button size="sm" variant="ghost" onClick={handleStartRename} className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowHistory(true)} className="h-8 w-8 p-0">
            <History className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleNewChat} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDeleteChat} 
            className="flex-shrink-0"
            disabled={chatSessions.length <= 1}
          >
            <Trash2 className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Delete</span>
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
            <div className="flex gap-3 max-w-2xl mx-auto mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScenarioSandbox(true)}
                className="h-10 px-3 text-sm"
                title="Open Scenario Sandbox"
              >
                🧮
              </Button>
              <VoiceInputButton 
                onTranscript={handleVoiceTranscript}
                className="h-10 w-10 p-0"
                size="sm"
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  console.log('AICopilotPage input change:', e.target.value);
                  setInputValue(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={loading ? "Setting up chat..." : !activeChatId ? "Creating chat session..." : "Try: 'If I hire 3 people at $2k/month and charge $500/project, how many projects to break even?'"}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={aiLoading || evaluating || loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || aiLoading || evaluating || loading || !activeChatId}
                className="h-10 w-10 p-0"
              >
                {evaluating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Prompt Reuse Chips */}
            {lastUserPrompts.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2 max-w-2xl mx-auto">
                {lastUserPrompts.map((prompt, idx) => (
                  <PromptReuseChip
                    key={idx}
                    prompt={prompt}
                    onReuse={(reusedPrompt) => setInputValue(reusedPrompt)}
                  />
                ))}
              </div>
            )}
            
            {isTyping && (
              <div className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
                Typing...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-lg",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.files && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-1 bg-background/20 px-2 py-1 rounded text-xs">
                            {file.type.includes('csv') ? <FileText className="h-3 w-3" /> : 
                             file.type.includes('image') ? <Image className="h-3 w-3" /> : 
                             <Paperclip className="h-3 w-3" />}
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorksheetBuilder
        isOpen={showWorksheetBuilder}
        onClose={() => setShowWorksheetBuilder(false)}
        initialData={roleInfo}
      />
      
      <PersonalFieldModal
        isOpen={showPersonalFieldModal}
        onClose={() => setShowPersonalFieldModal(false)}
        fieldName={roleInfo.role}
        reason={roleInfo.reason}
      />
      
      <AIMutationPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        proposedAction={proposedAction}
        onConfirm={() => console.log('Confirmed:', proposedAction)}
      />
      
      {showScenarioSandbox && (
        <ScenarioSandbox onClose={() => setShowScenarioSandbox(false)} />
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