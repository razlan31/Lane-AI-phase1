import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Target, AlertTriangle, TrendingUp, Lightbulb, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWorksheets } from '../../hooks/useWorksheets';
import { useVentures } from '../../hooks/useVentures';
import { supabase } from '@/integrations/supabase/client';

const WarRoomBoard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [promoteLoading, setPromoteLoading] = useState(null);
  const { createWorksheet } = useWorksheets();
  const { createVenture } = useVentures();
  
  const categories = [
    { id: 'all', label: 'All Items', color: 'bg-muted' },
    { id: 'opportunities', label: 'Opportunities', color: 'bg-green-100 border-green-200' },
    { id: 'risks', label: 'Risks', color: 'bg-red-100 border-red-200' },
    { id: 'pivots', label: 'Pivots', color: 'bg-blue-100 border-blue-200' },
    { id: 'ventures', label: 'New Ventures', color: 'bg-purple-100 border-purple-200' }
  ];

  const items = [
    {
      id: 1,
      category: 'opportunities',
      title: 'Partner with Local Coffee Shops',
      description: 'Explore wholesale opportunities with established cafes',
      impact: 'high',
      effort: 'medium',
      timeline: '2-3 months',
      confidence: 75,
      actions: ['Research partners', 'Create partnership deck', 'Schedule meetings']
    },
    {
      id: 2,
      category: 'risks',
      title: 'Rising Supply Costs',
      description: 'Coffee bean prices increased 20% this quarter',
      impact: 'high',
      effort: 'low',
      timeline: 'immediate',
      confidence: 90,
      actions: ['Lock in supplier contracts', 'Explore alternative suppliers', 'Consider price adjustment']
    },
    {
      id: 3,
      category: 'pivots',
      title: 'Shift to Subscription Model',
      description: 'Move from one-time sales to monthly coffee subscriptions',
      impact: 'high',
      effort: 'high',
      timeline: '4-6 months',
      confidence: 60,
      actions: ['Validate demand', 'Build subscription platform', 'Test with beta customers']
    },
    {
      id: 4,
      category: 'ventures',
      title: 'Coffee Equipment Rentals',
      description: 'Rent premium coffee machines to offices and events',
      impact: 'medium',
      effort: 'high',
      timeline: '6+ months',
      confidence: 45,
      actions: ['Market research', 'Source equipment', 'Build logistics network']
    },
    {
      id: 5,
      category: 'opportunities',
      title: 'Corporate Catering Contracts',
      description: 'Target office buildings for daily coffee service',
      impact: 'high',
      effort: 'medium',
      timeline: '1-2 months',
      confidence: 80,
      actions: ['Identify target buildings', 'Create service packages', 'Pilot program']
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const getItemIcon = (category) => {
    switch (category) {
      case 'opportunities': return Target;
      case 'risks': return AlertTriangle;
      case 'pivots': return TrendingUp;
      case 'ventures': return Lightbulb;
      default: return Target;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Enhanced promote to scenario functionality
  const promoteToScenario = async (item) => {
    setPromoteLoading(item.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create worksheet based on item type
      let worksheetType = 'scenario_analysis';
      if (item.category === 'risks') worksheetType = 'risk_assessment';
      if (item.category === 'opportunities') worksheetType = 'opportunity_analysis';
      if (item.category === 'ventures') worksheetType = 'venture_validation';

      const worksheetData = {
        type: worksheetType,
        inputs: {
          war_room_item: item,
          scenario_type: item.category,
          title: item.title,
          description: item.description,
          impact: item.impact,
          effort: item.effort,
          confidence: item.confidence,
          actions: item.actions,
          source: 'war_room_board'
        },
        outputs: {
          summary: `Scenario analysis for: ${item.title}`,
          risk_level: item.impact === 'high' ? 'high' : 'medium',
          recommended_actions: item.actions,
          timeline: item.timeline
        },
        confidence_level: 'estimate'
      };

      const result = await createWorksheet(worksheetData);
      
      if (result) {
        // Create timeline event
        await supabase
          .from('timeline_events')
          .insert({
            user_id: user.id,
            kind: 'worksheet_created',
            title: `Scenario Created: ${item.title}`,
            body: `War room item "${item.title}" was promoted to a scenario analysis worksheet`,
            payload: {
              source: 'war_room_board',
              item_id: item.id,
              worksheet_id: result.id,
              category: item.category
            }
          });

        console.log('Successfully promoted to scenario:', result.id);
      }
    } catch (error) {
      console.error('Error promoting to scenario:', error);
    } finally {
      setPromoteLoading(null);
    }
  };

  const openItemDetails = (item) => {
    // This would open a detailed modal for the item
    console.log('Opening details for:', item.title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">War Room Board</h2>
          <p className="text-sm text-muted-foreground">Strategic opportunities, risks, and pivots</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              selectedCategory === category.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const Icon = getItemIcon(item.category);
          const categoryConfig = categories.find(c => c.id === item.category);
          
          return (
            <Card 
              key={item.id} 
              className={cn(
                "p-4 hover:shadow-md transition-all cursor-pointer border-l-4",
                categoryConfig?.color
              )}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Impact:</span>
                    <span className={cn("px-2 py-0.5 rounded-full font-medium", getImpactColor(item.impact))}>
                      {item.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Effort:</span>
                    <span className={cn("px-2 py-0.5 rounded-full font-medium", getEffortColor(item.effort))}>
                      {item.effort}
                    </span>
                  </div>
                </div>

                {/* Timeline & Confidence */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.timeline}</span>
                  <div className="flex items-center gap-1">
                    <span>Confidence:</span>
                    <span className="font-medium">{item.confidence}%</span>
                  </div>
                </div>

                {/* Actions Preview */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Next Actions:</div>
                  <div className="space-y-1">
                    {item.actions.slice(0, 2).map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <span className="text-muted-foreground">{action}</span>
                      </div>
                    ))}
                    {item.actions.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{item.actions.length - 2} more actions
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs h-7"
                    onClick={() => promoteToScenario(item)}
                    disabled={promoteLoading === item.id}
                  >
                    {promoteLoading === item.id ? (
                      'Promoting...'
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Promote to Scenario
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => openItemDetails(item)}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No items in this category</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by adding strategic opportunities, risks, or potential pivots.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default WarRoomBoard;