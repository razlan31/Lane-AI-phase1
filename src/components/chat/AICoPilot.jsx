import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Minimize2, Maximize2, Sparkles, Bot, User, Lightbulb, Upload, Paperclip, FileText, Image, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

const AICoPilot = ({ 
  isOpen = true, 
  onToggle, 
  context = 'global', // 'global', 'venture', 'founder-mode'
  ventureId = null,
  className 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI Co-Pilot. Upload files (CSV, Excel, PDF) or tell me about your business, and I'll build dashboards and worksheets for you.",
      timestamp: new Date(),
      suggestions: [
        "Upload my business data",
        "I run a coffee shop",
        "Create revenue tracking",
        "Help me hit $20k monthly"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Send file upload message
    const fileMessage = {
      id: Date.now(),
      type: 'user',
      content: `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date(),
      files: newFiles
    };

    setMessages(prev => [...prev, fileMessage]);

    // AI response to file upload
    setTimeout(() => {
      const aiResponse = generateFileResponse(files);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        actions: [
          { label: "Create Dashboard", action: "create_dashboard" },
          { label: "Build Worksheets", action: "build_worksheets" },
          { label: "Generate KPIs", action: "generate_kpis" }
        ]
      }]);
    }, 1500);

    setShowFileUpload(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response based on context
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue.trim(), context);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        actions: generateActions(inputValue.trim())
      }]);
    }, 1000);
  };

  const generateFileResponse = (files) => {
    const fileTypes = files.map(f => f.type);
    
    if (fileTypes.some(type => type.includes('csv') || type.includes('excel'))) {
      return "Perfect! I found financial data in your files. I'm creating:\n\n📊 Revenue Dashboard with trends\n📈 P&L Worksheet from your data\n💰 Cash Flow tracker\n📋 Monthly/quarterly reports\n🎯 Key performance indicators\n\nProcessing your data now... This will take 30 seconds.";
    }
    
    if (fileTypes.some(type => type.includes('pdf'))) {
      return "I'm analyzing your PDF documents. Creating:\n\n📊 Business insights dashboard\n📝 Key metrics extraction\n📈 Performance tracking\n📋 Document insights summary\n\nExtracting data from your documents...";
    }
    
    return "Files uploaded successfully! I'm analyzing your data to create relevant dashboards and worksheets. This will take a moment...";
  };

  const generateAIResponse = (input, context) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('coffee') || lowercaseInput.includes('kiosk') || lowercaseInput.includes('cafe')) {
      return "Great! I'll set up a Coffee Kiosk venture for you. I'm creating:\n\n• Venture Dashboard with Revenue, Cashflow & Runway tracking\n• Daily Sales worksheet\n• Monthly Expenses tracker\n• Customer Traffic analysis\n• Break-even calculator\n\nShould I also add inventory management worksheets?";
    }
    
    if (lowercaseInput.includes('saas') || lowercaseInput.includes('software') || lowercaseInput.includes('tech')) {
      return "Perfect! Creating a SaaS business setup:\n\n• MRR (Monthly Recurring Revenue) dashboard\n• Customer Acquisition Cost worksheet\n• Churn analysis tracker\n• Runway calculator with burn rate\n• Unit economics model\n\nWould you like me to add subscription cohort analysis?";
    }
    
    if (lowercaseInput.includes('goal') || lowercaseInput.includes('target') || lowercaseInput.includes('need')) {
      return "I'll help you track that goal! Let me create:\n\n• Goal tracking dashboard\n• Progress worksheets\n• Milestone timeline\n• Resource allocation tracker\n• Success metrics KPIs\n\nWhat's your target timeframe for achieving this?";
    }
    
    if (lowercaseInput.includes('revenue') || lowercaseInput.includes('sales') || lowercaseInput.includes('money')) {
      return "I'll build revenue tracking tools:\n\n• Revenue dashboard with trends\n• Sales pipeline worksheet\n• Monthly/quarterly forecasts\n• Conversion funnel analysis\n• Profit margin calculator\n\nShould I include customer segment breakdowns?";
    }

    // Default response
    return "I understand you want to work on that. Let me help by creating:\n\n• Custom dashboard for your specific needs\n• Relevant worksheets and calculators\n• Key performance indicators\n• Progress tracking tools\n\nCould you tell me more about what type of business or project this is for?";
  };

  const generateActions = (input) => {
    return [
      { label: "Create Dashboard", action: "create_dashboard" },
      { label: "Add Worksheets", action: "add_worksheets" },
      { label: "Generate KPIs", action: "generate_kpis" }
    ];
  };

  const getContextTitle = () => {
    switch (context) {
      case 'venture':
        return 'Venture Co-Pilot';
      case 'founder-mode':
        return 'Strategic Co-Pilot';
      default:
        return 'AI Co-Pilot';
    }
  };

  const getContextIcon = () => {
    switch (context) {
      case 'founder-mode':
        return Lightbulb;
      default:
        return Bot;
    }
  };

  if (!isOpen) return null;

  const ContextIcon = getContextIcon();

  return (
    <Card className={cn(
      "fixed right-4 top-20 w-96 flex flex-col bg-card border-border shadow-lg z-40",
      isMinimized ? "h-12" : "h-[500px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <ContextIcon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{getContextTitle()}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "flex gap-2",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}>
                {message.type === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] p-2 rounded-lg text-sm",
                  message.type === 'user' 
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
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => setInputValue(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  {message.actions && (
                    <div className="flex gap-1 mt-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            switch (action.action) {
                              case 'create_dashboard':
                                window.dispatchEvent(new CustomEvent('openAIChat', {
                                  detail: { 
                                    message: 'Create a dashboard for my business with key metrics and visualizations',
                                    context: 'dashboard-creation'
                                  }
                                }));
                                break;
                              case 'build_worksheets':
                                window.dispatchEvent(new CustomEvent('openWorksheetBuilder'));
                                break;
                              case 'add_worksheets':
                                window.dispatchEvent(new CustomEvent('openWorksheetBuilder'));
                                break;
                              case 'generate_kpis':
                                window.dispatchEvent(new CustomEvent('openAIChat', {
                                  detail: { 
                                    message: 'Generate relevant KPIs and metrics for my business based on my industry and goals',
                                    context: 'kpi-generation'
                                  }
                                }));
                                break;
                              default:
                                console.log('Action:', action.action);
                            }
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
              >
                <Paperclip className="h-3 w-3" />
              </Button>
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
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Upload files or describe your business..."
                className="flex-1 text-sm px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-8 w-8 p-0"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Upload className="h-3 w-3" />
              <span>Upload CSV, Excel, PDF or type: "I run a coffee shop"</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AICoPilot;