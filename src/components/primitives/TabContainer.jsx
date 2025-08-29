import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../lib/utils';

const TabContainer = ({ 
  tabs = [], 
  defaultValue,
  value,
  onValueChange,
  className,
  orientation = 'horizontal' 
}) => {
  return (
    <Tabs 
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn("w-full", className)}
    >
      <TabsList className={cn(
        "grid w-full",
        orientation === 'horizontal' 
          ? `grid-cols-${Math.min(tabs.length, 4)}` 
          : "flex-col h-auto"
      )}>
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="flex items-center gap-2"
            disabled={tab.disabled}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className="mt-6 space-y-4"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabContainer;