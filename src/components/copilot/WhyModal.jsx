import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Calculator, FileText, Target, TrendingUp, Bot } from 'lucide-react';

const WhyModal = ({ isOpen, onClose, suggestion }) => {
  if (!suggestion) return null;

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

  const getContextLabel = (type) => {
    switch (type) {
      case 'scratchpad': return 'Scratchpad';
      case 'tool': return 'Tool Output';
      case 'block': return 'Block';
      case 'worksheet': return 'Worksheet';
      case 'venture': return 'Venture';
      default: return 'Context';
    }
  };

  const ContextIcon = getContextIcon(suggestion.context?.type);
  const confidencePercent = Math.round((suggestion.confidence || 0.8) * 100);
  const confidenceLabel = confidencePercent >= 90 ? 'Very High' : 
                         confidencePercent >= 70 ? 'High' : 
                         confidencePercent >= 50 ? 'Medium' : 'Low';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Why this suggestion?
          </DialogTitle>
          <DialogDescription>
            Understanding the AI's reasoning and data context
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">AI Reasoning</h4>
            <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded">
              {suggestion.reasoning || 'Based on pattern analysis and context matching.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Data Trace</h4>
            <div className="flex items-center gap-2 p-2 bg-accent/30 rounded">
              <ContextIcon className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                {getContextLabel(suggestion.context?.type)} Context
              </span>
              <Badge variant="outline" className="text-xs">
                {suggestion.context?.sourceId ? 'ID: ' + suggestion.context.sourceId.slice(0, 8) : 'Live'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Confidence Level</h4>
            <div className="space-y-2">
              <Progress value={confidencePercent} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{confidencePercent}%</span>
                <Badge variant={confidencePercent >= 70 ? "default" : "secondary"}>
                  {confidenceLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Suggestion</h4>
            <p className="text-sm text-foreground bg-primary/5 p-3 rounded border border-primary/20">
              {suggestion.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhyModal;