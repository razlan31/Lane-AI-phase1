import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Keyboard, Navigation, Zap, Search, Command, ArrowRight, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function HelpModal({ isOpen, onClose, className }) {
  const [activeTab, setActiveTab] = useState('shortcuts');

  const shortcuts = [
    {
      category: 'Navigation',
      icon: Navigation,
      items: [
        { keys: ['Alt', '1'], description: 'Go to AI Co-Pilot' },
        { keys: ['Alt', '2'], description: 'Go to HQ Dashboard' },
        { keys: ['Alt', '3'], description: 'Go to Workspace' },
        { keys: ['Alt', '4'], description: 'Go to Playground' },
        { keys: ['Alt', '5'], description: 'Go to Scratchpads' },
      ]
    },
    {
      category: 'Actions',
      icon: Zap,
      items: [
        { keys: ['⌘', 'K'], description: 'Open command palette' },
        { keys: ['/'], description: 'Quick search' },
        { keys: ['Alt', 'S'], description: 'Open scratchpad' },
        { keys: ['Alt', 'T'], description: 'Open tools' },
        { keys: ['Alt', 'C'], description: 'Toggle AI Co-Pilot' },
        { keys: ['Alt', 'F'], description: 'Toggle Founder Mode' },
        { keys: ['Esc'], description: 'Close modals/panels' },
      ]
    }
  ];

  const features = [
    {
      title: 'AI Co-Pilot',
      description: 'Your intelligent assistant that provides suggestions and insights based on your business data.',
      tips: [
        'Ask questions about your financial data',
        'Get suggestions for improving metrics',
        'Request explanations for complex calculations'
      ]
    },
    {
      title: 'HQ Dashboard',
      description: 'Central command center with key metrics and business intelligence.',
      tips: [
        'Monitor top 3 critical KPIs',
        'View AI-generated insights',
        'Track portfolio performance'
      ]
    },
    {
      title: 'Workspace',
      description: 'Manage multiple ventures and their individual metrics.',
      tips: [
        'Create separate ventures for different projects',
        'Compare performance across ventures',
        'Access venture-specific tools and reports'
      ]
    },
    {
      title: 'Tools & Calculators',
      description: 'Financial calculators and analysis tools for business planning.',
      tips: [
        'Use ROI calculator for investment decisions',
        'Run cashflow projections',
        'Calculate break-even points'
      ]
    }
  ];

  const tips = [
    {
      title: 'Quick Actions',
      items: [
        'Use the floating action buttons for quick access to frequently used tools',
        'Right-click on charts and data points for context actions',
        'Use drag-and-drop to reorder dashboard elements'
      ]
    },
    {
      title: 'Data Entry',
      items: [
        'Import CSV files for bulk data entry',
        'Use voice input for quick notes',
        'Connect external data sources for real-time updates'
      ]
    },
    {
      title: 'Collaboration',
      items: [
        'Share specific worksheets with team members',
        'Export reports in multiple formats',
        'Use comments and notes for team communication'
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl h-[80vh] flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Help & Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tips & Tricks
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="shortcuts" className="space-y-6">
              {shortcuts.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        {section.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {section.items.map((shortcut, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <span className="text-sm font-medium">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <div key={keyIndex} className="flex items-center gap-1">
                                  <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                                    {key}
                                  </Badge>
                                  {keyIndex < shortcut.keys.length - 1 && (
                                    <span className="text-muted-foreground text-xs">+</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Pro Tips:</h4>
                      <ul className="space-y-1">
                        {feature.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-3 w-3 mt-1 text-primary shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              {tips.map((section, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{tipIndex + 1}</span>
                          </div>
                          <span className="text-sm leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Need more help? Check our documentation or contact support.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button size="sm">
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default HelpModal;