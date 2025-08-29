import React from 'react';
import { Search, Bell, User, Command } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const TopBar = ({ onSearchClick, onProfileClick, className }) => {
  return (
    <header className={cn(
      "h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">L</span>
          </div>
          <span className="font-semibold text-foreground">LaneAI</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={onSearchClick}
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Search or press</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onProfileClick}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;