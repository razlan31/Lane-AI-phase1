import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { HelpCircle, Loader2 } from 'lucide-react';

export const ExplainButton = ({ context, contextData, onExplain, size = "sm", className = "" }) => {
  const [showModal, setShowModal] = useState(false);
  const [explanation, setExplanation] = useState('');
  const { explainConcept, loading } = useOpenAIChat();

  const handleExplain = async () => {
    if (onExplain) {
      onExplain(contextData, context);
      return;
    }

    setShowModal(true);
    
    // Generate explanation using OpenAI
    const question = typeof context === 'string' ? context : 
                    contextData?.title ? `Explain ${contextData.title}` : 
                    'Explain this concept';
    
    const result = await explainConcept(question, 'general', contextData);
    
    if (result.success) {
      setExplanation(result.data.explanation);
    } else {
      setExplanation('Sorry, I could not generate an explanation at this time.');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={handleExplain}
        className={`opacity-60 hover:opacity-100 transition-opacity ${className}`}
        title="Ask AI to explain this"
      >
        <HelpCircle className="w-3 h-3" />
        <span className="ml-1 text-xs">Why?</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              AI Explanation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating explanation...
              </div>
            ) : (
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-foreground leading-relaxed">
                  {explanation || 'Click to generate explanation...'}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};