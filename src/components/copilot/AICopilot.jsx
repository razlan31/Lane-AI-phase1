import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WhyModal from './WhyModal';
import { Brain, Calculator, FileText, Target, TrendingUp, Bot } from 'lucide-react';

const AICopilot = ({ 
  context,
  suggestion,
  onSuggestionAction,
  layout = 'card',
  className = ""
}) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  const getContextIcon = (type) => {
    switch (type) {
      case 'scratchpad': return FileText;
      case 'tool': return Calculator;
      case 'block': return Target;
      case 'worksheet': return Brain;
      case 'venture': return TrendingUp;
      default: return Bot;
    }
  };

  const handleActionClick = (action) => {
    onSuggestionAction?.(suggestion, action);
  };

  if (!suggestion) return null;

  const ContextIcon = getContextIcon(context?.type || 'general');

  if (layout === 'strip') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg ${className}`}>
        <ContextIcon className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground flex-1">{suggestion.message}</span>
        <div className="flex gap-1">
          {suggestion.actions?.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={action.primary ? "default" : "ghost"}
              onClick={() => handleActionClick(action)}
              className="h-7 px-2 text-xs"
            >
              {action.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWhyModal(true)}
            className="text-xs text-muted-foreground hover:text-foreground h-7"
          >
            Why?
          </Button>
        </div>

        <WhyModal 
          isOpen={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          suggestion={suggestion}
        />
      </div>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ContextIcon className="h-4 w-4 text-primary" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {suggestion.message}
                </p>
                {suggestion.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>

            {suggestion.actions && (
              <div className="flex gap-2">
                {suggestion.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={action.primary ? "default" : "outline"}
                    onClick={() => handleActionClick(action)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhyModal(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Why?
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhyModal 
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        suggestion={suggestion}
      />
    </Card>
  );
};

export default AICopilot;