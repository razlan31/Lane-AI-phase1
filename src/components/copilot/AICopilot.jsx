import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Calculator, FileText, Target, TrendingUp } from 'lucide-react';

/**
 * AI Copilot component that provides contextual suggestions
 * during the Auto-Promotion Flow (Scratchpad → Tools → Blocks → Worksheets → Ventures)
 */
const AICopilot = ({ 
  context,
  suggestions = [],
  onSuggestionAction,
  className = ""
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || suggestions.length === 0) {
    return null;
  }

  const getContextIcon = (type) => {
    switch (type) {
      case 'scratchpad': return <FileText className="w-4 h-4" />;
      case 'tool': return <Calculator className="w-4 h-4" />;
      case 'block': return <Target className="w-4 h-4" />;
      case 'worksheet': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getContextLabel = (type) => {
    switch (type) {
      case 'scratchpad': return 'Scratchpad';
      case 'tool': return 'Tool';
      case 'block': return 'Block';
      case 'worksheet': return 'Worksheet';
      default: return 'AI Copilot';
    }
  };

  return (
    <Card className={`p-4 bg-primary/5 border-primary/20 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 text-primary">
          {getContextIcon(context?.type)}
          <span className="text-sm font-medium">
            {getContextLabel(context?.type)} Assistant
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          ×
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {suggestion.message}
            </p>
            
            {suggestion.confidence && (
              <Badge variant="secondary" className="text-xs">
                {suggestion.confidence}% confident
              </Badge>
            )}
            
            <div className="flex gap-2">
              {suggestion.actions?.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={action.primary ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSuggestionAction?.(suggestion, action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AICopilot;