import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Lightbulb, AlertCircle, TrendingUp } from 'lucide-react';
import { useCopilotManager } from '@/hooks/useCopilotManager';

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200'
};

const PRIORITY_ICONS = {
  high: AlertCircle,
  medium: TrendingUp,
  low: Lightbulb
};

export const SuggestionDisplay = ({ 
  context = 'global',
  className = "",
  inline = false 
}) => {
  const { activeSuggestion, dismissSuggestion } = useCopilotManager();

  if (!activeSuggestion) {
    return null;
  }

  const PriorityIcon = PRIORITY_ICONS[activeSuggestion.priority] || Lightbulb;
  const priorityColor = PRIORITY_COLORS[activeSuggestion.priority] || PRIORITY_COLORS.low;

  const handleAccept = () => {
    dismissSuggestion(activeSuggestion.id, true);
    
    // Execute the suggestion action if available
    if (activeSuggestion.action) {
      activeSuggestion.action();
    }
  };

  const handleDismiss = () => {
    dismissSuggestion(activeSuggestion.id, false);
  };

  if (inline) {
    return (
      <div className={`flex items-center gap-2 p-2 border rounded-lg ${priorityColor} ${className}`}>
        <PriorityIcon className="h-4 w-4" />
        <span className="text-sm font-medium flex-1">{activeSuggestion.title}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleAccept}>
            Accept
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${priorityColor} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <PriorityIcon className="h-5 w-5" />
            <h4 className="font-medium">{activeSuggestion.title}</h4>
            <Badge variant="outline" className="text-xs">
              {activeSuggestion.priority}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-sm mb-3">{activeSuggestion.description}</p>
        
        {activeSuggestion.context && (
          <div className="text-xs text-muted-foreground mb-3">
            <strong>Context:</strong> {activeSuggestion.context}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAccept}>
            {activeSuggestion.actionText || 'Accept'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};