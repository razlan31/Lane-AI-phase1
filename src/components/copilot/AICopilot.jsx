import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WhyModal from './WhyModal';
import { Brain, Calculator, FileText, Target, TrendingUp, Bot } from 'lucide-react';

/**
 * AI Copilot component that provides contextual suggestions
 * with different layouts based on context (Scratchpad, Tool, Block, etc.)
 */
const AICopilot = ({ 
  context,
  suggestion,
  onSuggestionAction,
  layout = 'default', // 'strip', 'card', 'inline'
  className = ""
}) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  if (!suggestion) return null;

  const getContextIcon = (type) => {
    switch (type) {
      case 'scratchpad': return <FileText className="w-4 h-4" />;
      case 'tool': return <Calculator className="w-4 h-4" />;
      case 'block': return <Target className="w-4 h-4" />;
      case 'worksheet': return <TrendingUp className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const handleActionClick = (action) => {
    onSuggestionAction?.(suggestion, action);
  };

  // Strip layout for inline suggestions (Scratchpad, Tool results)
  if (layout === 'strip') {
    return (
      <>
        <div className={`flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg ${className}`}>
          <div className="flex items-center gap-2 text-primary">
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">Suggestion:</span>
          </div>
          
          <span className="text-sm flex-1">{suggestion.message}</span>
          
          <div className="flex items-center gap-2">
            {suggestion.actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? "default" : "outline"}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="text-xs h-7"
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
        </div>

        <WhyModal 
          isOpen={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          suggestion={suggestion}
        />
      </>
    );
  }

  // Inline layout for subtle suggestions (inside cards, modals)
  if (layout === 'inline') {
    return (
      <>
        <div className={`flex items-center justify-between p-2 bg-accent/50 rounded border-l-4 border-primary ${className}`}>
          <div className="flex items-center gap-2">
            <Bot className="w-3 h-3 text-primary" />
            <span className="text-xs">{suggestion.message}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {suggestion.actions?.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? "default" : "ghost"}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="text-xs h-6 px-2"
              >
                {action.label}
              </Button>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWhyModal(true)}
              className="text-xs text-muted-foreground h-6 px-1"
            >
              ?
            </Button>
          </div>
        </div>

        <WhyModal 
          isOpen={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          suggestion={suggestion}
        />
      </>
    );
  }

  // Default card layout
  return (
    <>
      <Card className={`p-4 bg-primary/5 border-primary/20 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 text-primary">
            {getContextIcon(context?.type)}
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">AI Copilot</span>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {suggestion.message}
            </p>
            
            {suggestion.confidence && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(suggestion.confidence * 100)}% confident
              </Badge>
            )}
            
            <div className="flex gap-2">
              {suggestion.actions?.map((action, index) => (
                <Button
                  key={index}
                  variant={action.primary ? "default" : "outline"}
                  size="sm"
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
          </div>
        </div>
      </Card>

      <WhyModal 
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        suggestion={suggestion}
      />
    </>
  );
};

export default AICopilot;