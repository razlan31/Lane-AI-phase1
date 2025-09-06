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
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { useEnhancedChat } from '../../hooks/useEnhancedChat';
import { useOpenAIChat } from '../../hooks/useOpenAIChat';
import { useDebouncedChatInput } from '../../hooks/useDebounce';
import { PromptReuseChip } from '../ui/prompt-reuse-chip';
import { VoiceInputButton } from '../VoiceInputButton';
import { detectChatCommands, generateCommandResponse } from '../../utils/aiChatBuilder';
import { getCapabilities } from '../../utils/capabilities';
import WorksheetBuilder from '../modals/WorksheetBuilder';
import { PersonalFieldModal } from '../modals/PersonalFieldModal';
import AIMutationPreviewModal from '../modals/AIMutationPreviewModal';
import ScenarioSandbox from '../scenarios/ScenarioSandbox';
import { useScenarios } from '@/hooks/useScenarios';

const EnhancedAIChat = ({ 
  isOpen = true, 
  onToggle, 
  context = 'global',
  ventureId = null,
  className 
}) => {
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
    console.log('handleSendMessage called', { inputValue, activeChatId, aiLoading });
    if (!inputValue.trim() || !activeChatId || aiLoading) return;

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
      const result = await sendOpenAIMessage(userMessage, activeChatId, context);
      
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

  if (!isOpen) return null;

  return (
    <>
      <Card className={cn(
        "fixed right-4 top-20 w-96 flex flex-col bg-card border-border shadow-lg z-40 h-[600px]",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-2 flex-1">
            <Bot className="h-4 w-4 text-primary" />
            {isRenaming ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-sm h-6 px-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveRename()}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveRename} className="h-6 w-6 p-0">
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelRename} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <span className="font-medium text-sm truncate flex-1">
                  {activeChatInfo?.title || 'AI Co-Pilot'}
                </span>
                {roleInfo.role && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {roleInfo.role.charAt(0).toUpperCase() + roleInfo.role.slice(1)} Mode
                  </span>
                )}
                <Button size="sm" variant="ghost" onClick={handleStartRename} className="h-6 w-6 p-0">
                  <Edit3 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setShowHistory(true)} className="h-6 w-6 p-0">
              <History className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleNewChat} className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDeleteChat} 
              className="h-6 w-6 p-0"
              disabled={chatSessions.length <= 1}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {onToggle && (
              <Button size="sm" variant="ghost" onClick={onToggle} className="h-6 w-6 p-0">
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex gap-2",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}>
              {message.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-2 rounded-lg text-sm",
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
              </div>
              {message.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-card/50">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
            >
              <Upload className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScenarioSandbox(true)}
              className="h-8 px-2 text-xs"
              title="Open Scenario Sandbox"
            >
              🧮
            </Button>
            <VoiceInputButton 
              onTranscript={handleVoiceTranscript}
              className="h-8 w-8 p-0"
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
                console.log('Input change:', e.target.value);
                setInputValue(e.target.value);
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Try: 'If I hire 3 people at $2k/month and charge $500/project, how many projects to break even?'"
              className="flex-1 text-sm px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={aiLoading || evaluating}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || aiLoading || evaluating}
              className="h-8 w-8 p-0"
            >
              {evaluating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
          
          {/* Prompt Reuse Chips */}
          {lastUserPrompts.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {lastUserPrompts.map((prompt, idx) => (
                <PromptReuseChip
                  key={idx}
                  prompt={prompt}
                  onReuse={(reusedPrompt) => setInputValue(reusedPrompt)}
                />
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            {isTyping ? "Typing..." : 
             evaluating ? "Evaluating scenario..." :
             aiLoading ? "AI is thinking..." : 
             "Try scenario questions like 'What if I hire 3 people?' or upload files"}
          </div>
        </div>
      </Card>

      {/* Chat History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                  session.id === activeChatId && "bg-muted border-primary"
                )}
                onClick={() => {
                  setActiveChatId(session.id);
                  setShowHistory(false);
                }}
              >
                <div className="font-medium text-sm">{session.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(session.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Builder Modals */}
      <WorksheetBuilder
        isOpen={showWorksheetBuilder}
        onClose={() => setShowWorksheetBuilder(false)}
        onSave={(worksheetData) => {
          console.log('Saving worksheet:', worksheetData);
          // TODO: Save to database
        }}
      />

      <PersonalFieldModal
        isOpen={showPersonalFieldModal}
        onClose={() => setShowPersonalFieldModal(false)}
        onSave={(fieldData) => {
          console.log('Saving personal field:', fieldData);
          // TODO: Save to database
        }}
      />

      {/* Scenario Sandbox Modal */}
      {showScenarioSandbox && (
        <ScenarioSandbox onClose={() => setShowScenarioSandbox(false)} />
      )}
    </>
  );
};

export default EnhancedAIChat;