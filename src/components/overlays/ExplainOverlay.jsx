import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { HelpCircle, MessageCircle } from 'lucide-react';

const ExplainOverlay = ({ 
  children, 
  contextData, 
  contextType = 'metric', 
  onExplainClick,
  className 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleExplainClick = (e) => {
    e.stopPropagation();
    onExplainClick?.(contextData, contextType);
  };

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Explain Button - Appears on Hover */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
            onClick={handleExplainClick}
          >
            <HelpCircle className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Enhanced KPI Card with Explain functionality
const ExplainableKpiCard = ({ 
  title, 
  value, 
  trend, 
  state, 
  size, 
  className,
  onExplainClick,
  ...props 
}) => {
  const contextData = {
    title,
    value,
    trend,
    state,
    type: 'kpi'
  };

  return (
    <ExplainOverlay
      contextData={contextData}
      contextType="kpi"
      onExplainClick={onExplainClick}
      className={className}
    >
      {/* Import and use the actual KpiCard here */}
      <div className={cn(
        "border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow",
        size === 'sm' && "p-3",
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn(
            "font-medium text-muted-foreground",
            size === 'sm' ? "text-xs" : "text-sm"
          )}>
            {title}
          </h3>
        </div>
        <div className={cn(
          "font-bold",
          size === 'sm' ? "text-lg" : "text-2xl"
        )}>
          {value}
        </div>
        {trend && (
          <div className={cn(
            "text-xs text-muted-foreground mt-1",
            trend > 0 && "text-success",
            trend < 0 && "text-destructive"
          )}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </ExplainOverlay>
  );
};

// Enhanced Data Table with Explain functionality
const ExplainableDataTable = ({ 
  data, 
  columns, 
  onExplainClick,
  className,
  ...props 
}) => {
  const contextData = {
    type: 'table',
    rowCount: data?.length || 0,
    columns: columns?.map(col => col.key) || [],
    sampleData: data?.slice(0, 3) || []
  };

  return (
    <ExplainOverlay
      contextData={contextData}
      contextType="table"
      onExplainClick={onExplainClick}
      className={className}
    >
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns?.map(column => (
                <th key={column.key} className="px-4 py-3 text-left text-sm font-medium">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, index) => (
              <tr key={index} className="border-t border-border hover:bg-muted/50">
                {columns?.map(column => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ExplainOverlay>
  );
};

// Explain Context Provider
const ExplainContextProvider = ({ children, onExplainRequest }) => {
  const handleExplainClick = (contextData, contextType) => {
    // Prepare context for AI Chat
    const explainContext = {
      type: contextType,
      data: contextData,
      timestamp: new Date().toISOString(),
      prompt: generateExplainPrompt(contextData, contextType)
    };

    onExplainRequest?.(explainContext);
  };

  const generateExplainPrompt = (contextData, contextType) => {
    switch (contextType) {
      case 'kpi':
        return `Explain this KPI: ${contextData.title} with value ${contextData.value}. What does this metric mean and why is it important for my business?`;
      
      case 'table':
        return `Explain this data table with ${contextData.rowCount} rows and columns: ${contextData.columns.join(', ')}. What insights can I gain from this data?`;
      
      case 'worksheet':
        return `Explain this worksheet and help me understand how to use it effectively for financial planning.`;
      
      default:
        return `Explain this data and provide insights about what it means for my business.`;
    }
  };

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onExplainClick: handleExplainClick
          });
        }
        return child;
      })}
    </div>
  );
};

// Quick Explain Button (standalone)
const QuickExplainButton = ({ 
  contextData, 
  contextType = 'general',
  onExplainClick,
  size = 'sm',
  variant = 'secondary'
}) => {
  const handleClick = () => {
    onExplainClick?.(contextData, contextType);
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      className="gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Explain
    </Button>
  );
};

export { 
  ExplainOverlay, 
  ExplainableKpiCard, 
  ExplainableDataTable,
  ExplainContextProvider,
  QuickExplainButton
};