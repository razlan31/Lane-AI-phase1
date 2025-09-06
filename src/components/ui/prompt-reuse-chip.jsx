import { RotateCcw } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export const PromptReuseChip = ({ 
  prompt, 
  onReuse, 
  className,
  variant = 'outline'
}) => {
  if (!prompt || prompt.length < 5) return null;

  const displayText = prompt.length > 40 
    ? `${prompt.slice(0, 37)}...` 
    : prompt;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => onReuse(prompt)}
      className={cn(
        "h-7 text-xs gap-1 max-w-xs flex-shrink-0 border-dashed",
        "hover:border-solid transition-all duration-200",
        "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <RotateCcw className="h-3 w-3" />
      <span className="truncate">Ask this again?</span>
      <span className="hidden sm:inline text-muted-foreground">"{displayText}"</span>
    </Button>
  );
};

export default PromptReuseChip;