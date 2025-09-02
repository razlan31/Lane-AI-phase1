import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Calculator, Target, TrendingUp, Building } from 'lucide-react';

/**
 * Why Modal - Explains AI Copilot reasoning and shows data trace
 */
const WhyModal = ({ isOpen, onClose, suggestion }) => {
  if (!suggestion) return null;

  const getContextIcon = (type) => {
    switch (type) {
      case 'scratchpad': return <FileText className="w-4 h-4" />;
      case 'tool': return <Calculator className="w-4 h-4" />;
      case 'block': return <Target className="w-4 h-4" />;
      case 'worksheet': return <TrendingUp className="w-4 h-4" />;
      case 'venture': return <Building className="w-4 h-4" />;
      default: return null;
    }
  };

  const getContextLabel = (type) => {
    switch (type) {
      case 'scratchpad': return 'Scratchpad Note';
      case 'tool': return 'Tool Result';
      case 'block': return 'Block';
      case 'worksheet': return 'Worksheet';
      case 'venture': return 'Venture';
      default: return 'Unknown';
    }
  };

  const confidenceLevel = Math.round(suggestion.confidence * 100);
  const confidenceLabel = confidenceLevel >= 90 ? 'High' : 
                         confidenceLevel >= 70 ? 'Medium' : 'Low';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Why did Copilot suggest this?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Based on your data + AI interpretation
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reasoning Card */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">AI Reasoning</h4>
            <p className="text-sm text-muted-foreground">
              {suggestion.reasoning}
            </p>
          </div>

          {/* Data Trace */}
          <div>
            <h4 className="font-medium mb-3">Data Trace</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                {getContextIcon(suggestion.context.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {getContextLabel(suggestion.context.type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Triggered this suggestion
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Source
                </Badge>
              </div>

              {/* Show potential next steps */}
              {suggestion.actions?.filter(action => action.primary).map((action, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                  {action.action === 'run_tool' && <Calculator className="w-4 h-4" />}
                  {action.action === 'attach_block' && <Target className="w-4 h-4" />}
                  {action.action === 'generate_worksheet' && <TrendingUp className="w-4 h-4" />}
                  {action.action === 'add_to_venture' && <Building className="w-4 h-4" />}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {action.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Suggested next step
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Suggested
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Confidence</h4>
              <Badge variant={confidenceLevel >= 90 ? "default" : confidenceLevel >= 70 ? "secondary" : "outline"}>
                {confidenceLevel}% ({confidenceLabel})
              </Badge>
            </div>
            <Progress value={confidenceLevel} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Based on pattern matching and context analysis
            </p>
          </div>

          {/* Original Suggestion */}
          <div className="p-3 border rounded-lg bg-accent/5">
            <div className="text-sm">
              <strong>Original Suggestion:</strong> {suggestion.message}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhyModal;