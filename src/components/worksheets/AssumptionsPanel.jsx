import { useState } from 'react';
import { Settings, Save, Info, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const AssumptionsPanel = ({ 
  assumptions = [], 
  onAssumptionChange, 
  isEditable = true,
  onExplain 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatValue = (value, type) => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value);
      default:
        return value;
    }
  };

  const parseValue = (inputValue, type) => {
    switch (type) {
      case 'percentage':
        return parseFloat(inputValue) / 100;
      case 'currency':
        return parseFloat(inputValue.replace(/[^0-9.-]/g, ''));
      case 'number':
        return parseFloat(inputValue) || 0;
      default:
        return inputValue;
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      isCollapsed ? "w-12" : "w-80"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Assumptions
              </CardTitle>
              <CardDescription className="text-xs">
                Key variables for calculations
              </CardDescription>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? '→' : '←'}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-3">
          {assumptions.length === 0 ? (
            <div className="text-center py-4">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No assumptions defined for this worksheet
              </p>
            </div>
          ) : (
            assumptions.map((assumption, index) => (
              <div key={assumption.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    {assumption.label}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                    onClick={() => onExplain?.(assumption)}
                  >
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                </div>
                
                {isEditable ? (
                  <input
                    type={assumption.type === 'percentage' || assumption.type === 'number' ? 'number' : 'text'}
                    value={assumption.type === 'percentage' ? (assumption.value * 100) : assumption.value}
                    onChange={(e) => {
                      const newValue = parseValue(e.target.value, assumption.type);
                      onAssumptionChange?.(assumption.key, newValue);
                    }}
                    step={assumption.type === 'percentage' ? '0.1' : '1'}
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                    placeholder={assumption.type === 'percentage' ? '5.0' : '1000'}
                  />
                ) : (
                  <div className="w-full px-2 py-1 text-xs border border-border rounded bg-muted text-muted-foreground">
                    {formatValue(assumption.value, assumption.type)}
                  </div>
                )}
              </div>
            ))
          )}

          {isEditable && (
            <div className="pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Save className="h-3 w-3 mr-1" />
                Auto-saved
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AssumptionsPanel;