import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Keyboard, 
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  Lightbulb,
  Calculator,
  BarChart3,
  FileText,
  Settings,
  Target
} from 'lucide-react';

const ComprehensiveHelpSystem = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('quick-start');
  const [filteredContent, setFilteredContent] = useState([]);

  const helpContent = {
    'quick-start': {
      title: 'Quick Start Guide',
      icon: Zap,
      items: [
        {
          title: 'Getting Started in 5 Minutes',
          description: 'Learn the basics of LaneAI and create your first worksheet',
          type: 'guide',
          duration: '5 min',
          difficulty: 'Beginner',
          steps: [
            'Complete the onboarding flow to set up your profile',
            'Navigate to the Workspace and create your first venture',
            'Add a financial worksheet using our templates',
            'Explore the AI chat for instant help and insights',
            'Save and export your work'
          ]
        },
        {
          title: 'Navigation Essentials',
          description: 'Master the interface and keyboard shortcuts',
          type: 'reference',
          shortcuts: [
            { key: 'Ctrl+K', action: 'Open command palette' },
            { key: 'Ctrl+/', action: 'Toggle help' },
            { key: 'Ctrl+N', action: 'New worksheet' },
            { key: 'Ctrl+S', action: 'Save current work' },
            { key: 'Escape', action: 'Close modals/cancel actions' }
          ]
        }
      ]
    },
    'features': {
      title: 'Feature Guides',
      icon: BookOpen,
      items: [
        {
          title: 'AI-Powered Worksheets',
          description: 'Create intelligent financial models with AI assistance',
          type: 'feature',
          icon: Calculator,
          features: [
            'Smart formula suggestions',
            'Automatic calculation validation',
            'Scenario modeling',
            'Real-time collaboration'
          ]
        },
        {
          title: 'Advanced Analytics',
          description: 'Generate insights from your business data',
          type: 'feature',
          icon: BarChart3,
          features: [
            'KPI dashboards',
            'Trend analysis',
            'Performance metrics',
            'Custom reports'
          ]
        },
        {
          title: 'Export & Sharing',
          description: 'Share your work in multiple formats',
          type: 'feature',
          icon: FileText,
          features: [
            'PDF reports',
            'Excel exports',
            'Presentation mode',
            'Email sharing'
          ]
        }
      ]
    },
    'tutorials': {
      title: 'Video Tutorials',
      icon: Video,
      items: [
        {
          title: 'Building Your First Financial Model',
          description: 'Step-by-step video guide to creating a comprehensive financial model',
          type: 'video',
          duration: '12 min',
          views: '15K',
          rating: 4.8
        },
        {
          title: 'Using AI Chat for Business Insights',
          description: 'Learn how to leverage our AI assistant for better decision making',
          type: 'video',
          duration: '8 min',
          views: '8.2K',
          rating: 4.9
        },
        {
          title: 'Advanced Reporting Features',
          description: 'Create professional reports with charts, insights, and exports',
          type: 'video',
          duration: '15 min',
          views: '5.1K',
          rating: 4.7
        }
      ]
    },
    'faq': {
      title: 'FAQ',
      icon: HelpCircle,
      items: [
        {
          question: 'How do I reset my password?',
          answer: 'Go to Settings > Account > Change Password. You can also use the "Forgot Password" link on the login page.',
          category: 'Account'
        },
        {
          question: 'Can I collaborate with my team?',
          answer: 'Yes! You can share worksheets and ventures with team members. Use the Share button in any worksheet to invite collaborators.',
          category: 'Collaboration'
        },
        {
          question: 'How is my data secured?',
          answer: 'We use enterprise-grade encryption and follow SOC 2 Type II compliance. Your data is encrypted at rest and in transit.',
          category: 'Security'
        },
        {
          question: 'What file formats can I export?',
          answer: 'You can export to PDF, Excel, CSV, and JSON formats. We also support direct integrations with popular business tools.',
          category: 'Export'
        }
      ]
    }
  };

  const keyboardShortcuts = [
    { category: 'Navigation', shortcuts: [
      { key: 'Ctrl+K', action: 'Open command palette' },
      { key: 'Ctrl+1-9', action: 'Switch between tabs' },
      { key: 'Ctrl+B', action: 'Toggle sidebar' }
    ]},
    { category: 'Worksheets', shortcuts: [
      { key: 'Ctrl+N', action: 'New worksheet' },
      { key: 'Ctrl+S', action: 'Save worksheet' },
      { key: 'Ctrl+D', action: 'Duplicate worksheet' }
    ]},
    { category: 'AI Features', shortcuts: [
      { key: 'Ctrl+/', action: 'Open AI chat' },
      { key: 'Ctrl+E', action: 'Explain selection' },
      { key: 'Ctrl+I', action: 'AI suggestions' }
    ]}
  ];

  useEffect(() => {
    if (searchQuery) {
      const allItems = Object.values(helpContent).flatMap(section => 
        section.items.map(item => ({ ...item, section: section.title }))
      );
      
      const filtered = allItems.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredContent(filtered);
    } else {
      setFilteredContent([]);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Help & Documentation
              </CardTitle>
              <CardDescription>
                Everything you need to master LaneAI
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles, tutorials, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          {searchQuery ? (
            /* Search Results */
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="font-semibold mb-4">
                Search Results ({filteredContent.length})
              </h3>
              <div className="space-y-3">
                {filteredContent.map((item, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title || item.question}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description || item.answer}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {item.section}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Tabbed Content */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
                <TabsTrigger value="quick-start" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Quick Start
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="tutorials" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Tutorials
                </TabsTrigger>
                <TabsTrigger value="faq" className="flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="shortcuts" className="flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  Shortcuts
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                {Object.entries(helpContent).map(([key, section]) => (
                  <TabsContent key={key} value={key} className="p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <section.icon className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {section.items.map((item, index) => (
                        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            {item.icon && (
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <item.icon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">
                                {item.title || item.question}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {item.description || item.answer}
                              </p>
                              
                              {/* Metadata badges */}
                              <div className="flex items-center gap-2 mb-3">
                                {item.duration && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {item.duration}
                                  </Badge>
                                )}
                                {item.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.difficulty}
                                  </Badge>
                                )}
                                {item.views && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {item.views}
                                  </Badge>
                                )}
                                {item.rating && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    {item.rating}
                                  </Badge>
                                )}
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Steps or features */}
                              {item.steps && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Steps:</h4>
                                  <ol className="text-sm text-muted-foreground space-y-1">
                                    {item.steps.map((step, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                                          {i + 1}
                                        </span>
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              {item.features && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Key Features:</h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {item.features.map((feature, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <Target className="h-3 w-3 text-primary" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {item.shortcuts && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Keyboard Shortcuts:</h4>
                                  <div className="space-y-1">
                                    {item.shortcuts.map((shortcut, i) => (
                                      <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{shortcut.action}</span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                          {shortcut.key}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
                
                {/* Keyboard Shortcuts Tab */}
                <TabsContent value="shortcuts" className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Keyboard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {keyboardShortcuts.map((category, index) => (
                      <Card key={index} className="p-4">
                        <h3 className="font-semibold mb-4">{category.category}</h3>
                        <div className="space-y-2">
                          {category.shortcuts.map((shortcut, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                              <Badge variant="outline" className="font-mono text-xs">
                                {shortcut.key}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveHelpSystem;