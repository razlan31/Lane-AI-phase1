import React, { useState } from 'react';
import { 
  Crown, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Filter,
  SortAsc
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import AICoPilot from '../chat/AICoPilot';

const FounderMode = ({ onClose, className }) => {
  const [activeTab, setActiveTab] = useState('war-room');
  const [priorityItems, setPriorityItems] = useState([
    { id: 1, title: 'Launch MVP v2.0', type: 'milestone', priority: 1, status: 'in-progress' },
    { id: 2, title: 'Hire Senior Developer', type: 'resource', priority: 2, status: 'pending' },
    { id: 3, title: 'Customer Discovery Calls', type: 'research', priority: 3, status: 'active' },
    { id: 4, title: 'Fundraising Strategy', type: 'financial', priority: 4, status: 'planning' }
  ]);

  const [decisionQueue] = useState([
    { 
      id: 1, 
      title: 'Pricing Model Change', 
      description: 'Switch from freemium to free trial model',
      urgency: 'high',
      impact: 'high',
      deadline: '2024-02-15'
    },
    { 
      id: 2, 
      title: 'Tech Stack Migration', 
      description: 'Move from current framework to Next.js',
      urgency: 'medium',
      impact: 'high',
      deadline: '2024-03-01'
    },
    { 
      id: 3, 
      title: 'Team Expansion', 
      description: 'Add 2 engineers vs 1 senior engineer',
      urgency: 'low',
      impact: 'medium',
      deadline: '2024-02-28'
    }
  ]);

  const [warRoomBoard, setWarRoomBoard] = useState([
    {
      id: 1,
      type: 'opportunity',
      title: 'Enterprise Sales Channel',
      description: 'Large corp reached out for custom deployment',
      impact: 'high',
      effort: 'medium',
      timeline: '2-3 months'
    },
    {
      id: 2,
      type: 'risk',
      title: 'Competitor Launch',
      description: 'Direct competitor launching similar feature',
      impact: 'high',
      effort: 'low',
      timeline: 'Immediate'
    },
    {
      id: 3,
      type: 'pivot',
      title: 'B2B Focus',
      description: 'Data shows better retention in B2B segment',
      impact: 'high',
      effort: 'high',
      timeline: '6 months'
    },
    {
      id: 4,
      type: 'new-venture',
      title: 'AI Consulting Arm',
      description: 'Multiple clients asking for AI implementation help',
      impact: 'medium',
      effort: 'medium',
      timeline: '3-4 months'
    }
  ]);

  const getCardStyle = (type) => {
    const styles = {
      opportunity: 'border-green-200 bg-green-50',
      risk: 'border-red-200 bg-red-50',
      pivot: 'border-blue-200 bg-blue-50',
      'new-venture': 'border-purple-200 bg-purple-50'
    };
    return styles[type] || 'border-gray-200 bg-gray-50';
  };

  const getCardIcon = (type) => {
    const icons = {
      opportunity: TrendingUp,
      risk: AlertTriangle,
      pivot: ArrowRight,
      'new-venture': Lightbulb
    };
    return icons[type] || Target;
  };

  const renderPriorityStack = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Priority Stack</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
      
      <div className="space-y-2">
        {priorityItems.map((item, index) => (
          <Card key={item.id} className="p-4 cursor-move hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {item.type} • {item.status}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDecisionQueue = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Decision Queue</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button size="sm" variant="outline">
            <SortAsc className="h-4 w-4 mr-1" />
            Sort
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {decisionQueue.map((decision) => (
          <Card key={decision.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{decision.title}</h4>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    decision.urgency === 'high' && "bg-red-100 text-red-700",
                    decision.urgency === 'medium' && "bg-yellow-100 text-yellow-700",
                    decision.urgency === 'low' && "bg-green-100 text-green-700"
                  )}>
                    {decision.urgency} urgency
                  </span>
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    decision.impact === 'high' && "bg-purple-100 text-purple-700",
                    decision.impact === 'medium' && "bg-blue-100 text-blue-700",
                    decision.impact === 'low' && "bg-gray-100 text-gray-700"
                  )}>
                    {decision.impact} impact
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{decision.description}</p>
                <div className="text-xs text-muted-foreground">
                  Deadline: {new Date(decision.deadline).toLocaleDateString()}
                </div>
              </div>
              <Button size="sm">
                Review
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompass = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Strategic Compass</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Plot Item
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="relative w-full h-96 border border-border rounded-lg">
          {/* Axis labels */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
            High Opportunity
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
            Low Opportunity
          </div>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-medium">
            High Risk
          </div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium">
            Low Risk
          </div>
          
          {/* Center lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
          
          {/* Sample plotted items */}
          <div className="absolute top-16 right-16 w-3 h-3 bg-green-500 rounded-full" title="Enterprise Channel"></div>
          <div className="absolute top-24 left-20 w-3 h-3 bg-red-500 rounded-full" title="Competitor Risk"></div>
          <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-blue-500 rounded-full" title="B2B Pivot"></div>
          <div className="absolute bottom-16 right-1/3 w-3 h-3 bg-purple-500 rounded-full" title="AI Consulting"></div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Drag items onto the matrix to visualize risk vs opportunity
        </div>
      </Card>
    </div>
  );

  const renderWarRoomBoard = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">War Room Board</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Card
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warRoomBoard.map((item) => {
          const Icon = getCardIcon(item.type);
          return (
            <Card key={item.id} className={cn("p-4", getCardStyle(item.type))}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <span className="px-2 py-1 text-xs rounded-full bg-white/50 capitalize">
                      {item.type.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-x-4">
                      <span>Impact: <strong>{item.impact}</strong></span>
                      <span>Effort: <strong>{item.effort}</strong></span>
                    </div>
                    <span className="text-muted-foreground">{item.timeline}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {item.type === 'opportunity' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        → Create Scenario
                      </Button>
                    )}
                    {item.type === 'risk' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        → Add to Queue
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs">
                      Discuss with AI
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 overflow-auto",
      className
    )}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-amber-600" />
            <div>
              <h1 className="text-xl font-bold">Founder Mode</h1>
              <p className="text-sm text-muted-foreground">Strategic War Room</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="priority-stack">Priority Stack</TabsTrigger>
              <TabsTrigger value="decision-queue">Decision Queue</TabsTrigger>
              <TabsTrigger value="compass">Compass</TabsTrigger>
              <TabsTrigger value="war-room">War Room Board</TabsTrigger>
            </TabsList>

            <TabsContent value="priority-stack" className="space-y-6">
              {renderPriorityStack()}
            </TabsContent>

            <TabsContent value="decision-queue" className="space-y-6">
              {renderDecisionQueue()}
            </TabsContent>

            <TabsContent value="compass" className="space-y-6">
              {renderCompass()}
            </TabsContent>

            <TabsContent value="war-room" className="space-y-6">
              {renderWarRoomBoard()}
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Co-Pilot Panel */}
        <div className="w-96 border-l border-border bg-card/50">
          <AICoPilot 
            context="founder-mode" 
            isOpen={true}
            className="relative right-0 top-0 w-full h-full border-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default FounderMode;