import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export const ExplainButton = ({ context, onExplain, size = "sm", className = "" }) => {
  const handleClick = () => {
    onExplain(context);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={`opacity-60 hover:opacity-100 transition-opacity ${className}`}
      title="Ask AI to explain this"
    >
      <HelpCircle className="w-3 h-3" />
      <span className="ml-1 text-xs">Why?</span>
    </Button>
  );
};