import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { Brain, Calculator, FileText, Target, TrendingUp, Bot, Loader2 } from 'lucide-react';

const WhyModal = ({ isOpen, onClose, suggestion }) => {
  const [explanation, setExplanation] = useState('');
  const { explainConcept, loading } = useOpenAIChat();

  useEffect(() => {
    if (isOpen && suggestion) {
      generateExplanation();
    }
  }, [isOpen, suggestion]);

  const generateExplanation = async () => {
    if (!suggestion) return;

    const isResponse = suggestion.context?.type === 'chat_response';
    const question = isResponse 
      ? `Why did you give this response: "${suggestion.message}"? Explain the reasoning behind this AI response and what factors influenced it.`
      : `Why did you suggest: "${suggestion.message}"?`;
    
    const contextData = {
      suggestion: suggestion.message,
      context: suggestion.context,
      confidence: suggestion.confidence,
      priority: suggestion.priority,
      isResponse
    };

    const result = await explainConcept(question, suggestion.context?.type || 'general', contextData);
    
    if (result.success) {
      setExplanation(result.data.explanation);
    } else {
      setExplanation('Sorry, I could not generate an explanation at this time.');
    }
  };

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

  if (!suggestion) return null;

  const ContextIcon = getContextIcon(suggestion.context?.type);
  const confidencePercent = Math.round((suggestion.confidence || 0.8) * 100);
  const isResponse = suggestion.context?.type === 'chat_response';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {isResponse ? 'Why this response?' : 'Why this suggestion?'}
          </DialogTitle>
          <DialogDescription>
            {isResponse ? 'AI-powered explanation of the response reasoning' : 'AI-powered explanation of the suggestion logic'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-muted/30">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ContextIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">AI Explanation</h4>
                  <p className="text-xs text-muted-foreground">
                    Context: {getContextLabel(suggestion.context?.type)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs ml-auto">
                  {confidencePercent}% confidence
                </Badge>
              </div>
              
              <div className="pl-2 border-l-2 border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">
                  "{suggestion.message}"
                </p>
                
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating explanation...
                  </div>
                ) : explanation ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {explanation}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Click "Explain Why" to get an AI-powered explanation
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2 pt-2">
            {!explanation && !loading && (
              <Button size="sm" variant="outline" onClick={generateExplanation}>
                Explain Why
              </Button>
            )}
            <Button size="sm" onClick={onClose}>
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhyModal;