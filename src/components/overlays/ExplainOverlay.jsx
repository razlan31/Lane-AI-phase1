import React, { useState } from 'react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const ExplainOverlay = ({ 
  isOpen, 
  onClose, 
  context, 
  title = "AI Explanation",
  children 
}) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    // Mock AI explanation - replace with real AI call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setExplanation(`This metric shows ${context}. Based on current trends, this indicates a ${Math.random() > 0.5 ? 'positive' : 'concerning'} pattern that requires attention.`);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {children || (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Context:</p>
                <p className="text-sm text-muted-foreground">{context}</p>
              </div>
              
              {!explanation ? (
                <div className="text-center">
                  <Button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Analyzing...' : 'Explain with AI'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">AI Explanation</h4>
                    <p className="text-sm text-blue-800">{explanation}</p>
                  </div>
                  <Button variant="outline" onClick={() => setExplanation('')}>
                    Ask Follow-up Question
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplainOverlay;