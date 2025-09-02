import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useScratchpad } from '@/hooks/useScratchpad';

export const ScratchpadSuggestions = ({ text, className = "" }) => {
  const { suggestTools } = useScratchpad();

  const suggestions = suggestTools(text);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <h4 className="font-medium text-amber-900">Suggested Tools</h4>
          <Badge variant="outline" className="text-xs">
            {suggestions.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-amber-200"
            >
              <div>
                <h5 className="font-medium text-sm">{suggestion.tool.name}</h5>
                <p className="text-xs text-muted-foreground">
                  {suggestion.tool.description}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.tool.category}
                  </Badge>
                  <span className="text-xs text-amber-700">
                    Match: {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  // Navigate to tool or open tool modal
                  console.log('Opening tool:', suggestion.tool.id);
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};