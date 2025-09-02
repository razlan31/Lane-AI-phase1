import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import KpiCard from './primitives/KpiCard';
import { ExplainOverlay } from './overlays/ExplainOverlay';
import { PromotionGate } from './modals/PromotionGate';
import { Save, Edit3, RotateCcw, Calculator, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

const WorksheetRenderer = ({ worksheetId, ventureId, onSave, onClose }) => {
  const [worksheet, setWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({});
  const [assumptions, setAssumptions] = useState({});
  const [mode, setMode] = useState('draft'); // 'draft' | 'live'
  const [isEditing, setIsEditing] = useState(false);
  const [showPromotionGate, setShowPromotionGate] = useState(false);
  const [showAutosave, setShowAutosave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Mock Supabase data - in real app this would come from Supabase
  const mockWorksheetConfigs = {
    'cashflow': {
      id: 'cashflow',
      title: 'Cashflow Analysis',
      description: 'Track money in vs money out',
      inputs: [
        { id: 'monthly_revenue', label: 'Monthly Revenue', type: 'currency', defaultValue: 0 },
        { id: 'monthly_expenses', label: 'Monthly Expenses', type: 'currency', defaultValue: 0 },
        { id: 'one_time_revenue', label: 'One-time Revenue', type: 'currency', defaultValue: 0 },
        { id: 'one_time_expenses', label: 'One-time Expenses', type: 'currency', defaultValue: 0 }
      ],
      outputs: [
        { 
          id: 'net_cashflow', 
          label: 'Net Cashflow',
          description: 'Total money coming in minus going out',
          formula: 'monthly_revenue - monthly_expenses + one_time_revenue - one_time_expenses'
        },
        { 
          id: 'monthly_net', 
          label: 'Monthly Net',
          description: 'Recurring monthly profit or loss',
          formula: 'monthly_revenue - monthly_expenses'
        }
      ],
      assumptions: [
        { id: 'growth_rate', label: 'Monthly Growth Rate (%)', defaultValue: 5 },
        { id: 'expense_inflation', label: 'Expense Inflation (%)', defaultValue: 2 }
      ]
    },
    'roi': {
      id: 'roi',
      title: 'ROI Calculator',
      description: 'Calculate return on investment',
      inputs: [
        { id: 'initial_investment', label: 'Initial Investment', type: 'currency', defaultValue: 0 },
        { id: 'monthly_return', label: 'Monthly Return', type: 'currency', defaultValue: 0 },
        { id: 'time_period', label: 'Time Period (months)', type: 'number', defaultValue: 12 }
      ],
      outputs: [
        { 
          id: 'total_return', 
          label: 'Total Return',
          description: 'Total money gained over the period',
          formula: 'monthly_return * time_period'
        },
        { 
          id: 'roi_percentage', 
          label: 'ROI Percentage',
          description: 'Return as a percentage of initial investment',
          formula: '((monthly_return * time_period) / initial_investment) * 100'
        }
      ],
      assumptions: [
        { id: 'market_volatility', label: 'Market Volatility Factor', defaultValue: 0.1 },
        { id: 'risk_adjustment', label: 'Risk Adjustment (%)', defaultValue: 10 }
      ]
    }
  };

  // Load worksheet configuration
  useEffect(() => {
    const loadWorksheet = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const config = mockWorksheetConfigs[worksheetId] || mockWorksheetConfigs['cashflow'];
      setWorksheet(config);
      
      // Initialize values with defaults
      const initialValues = {};
      config.inputs.forEach(input => {
        initialValues[input.id] = input.defaultValue || 0;
      });
      setValues(initialValues);
      
      // Initialize assumptions
      const initialAssumptions = {};
      config.assumptions.forEach(assumption => {
        initialAssumptions[assumption.id] = assumption.defaultValue || 0;
      });
      setAssumptions(initialAssumptions);
      
      setLoading(false);
    };

    if (worksheetId) {
      loadWorksheet();
    }
  }, [worksheetId]);

  // Calculate outputs based on current values
  const calculateOutputs = () => {
    if (!worksheet) return {};
    
    const outputs = {};
    worksheet.outputs.forEach(output => {
      try {
        // Simple formula evaluation - in real app would use proper formula engine
        let formula = output.formula;
        Object.keys(values).forEach(key => {
          formula = formula.replace(new RegExp(key, 'g'), values[key] || 0);
        });
        
        // Basic math evaluation (unsafe in production - use proper parser)
        outputs[output.id] = eval(formula);
      } catch (error) {
        outputs[output.id] = 0;
      }
    });
    
    return outputs;
  };

  const outputs = calculateOutputs();

  // Handle input changes with autosave
  const handleInputChange = (inputId, value) => {
    setValues(prev => ({ ...prev, [inputId]: parseFloat(value) || 0 }));
    
    // Show autosave indicator
    setShowAutosave(true);
    setTimeout(() => {
      setShowAutosave(false);
      setLastSaved(new Date());
    }, 1000);
  };

  const handleAssumptionChange = (assumptionId, value) => {
    setAssumptions(prev => ({ ...prev, [assumptionId]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    console.log('Saving worksheet:', { worksheetId, values, assumptions, mode });
    if (onSave) {
      onSave({ worksheetId, values, assumptions, mode });
    }
    setLastSaved(new Date());
  };

  const handlePromoteToLive = () => {
    setShowPromotionGate(true);
  };

  const confirmPromotion = () => {
    setMode('live');
    setShowPromotionGate(false);
    handleSave();
  };

  const handleExplainClick = (contextData, contextType) => {
    console.log('Opening AI Chat with context:', { contextData, contextType });
    // In real app, this would open AI chat with preloaded context
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Worksheet not found</p>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className={cn(
              "text-2xl font-semibold",
              isEditing && "border-b border-dashed border-muted-foreground"
            )}>
              {worksheet.title}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{worksheet.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode indicator */}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            mode === 'draft' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"
          )}>
            {mode === 'draft' ? 'Draft' : 'Live'}
          </div>
          
          {/* Actions */}
          {mode === 'draft' && (
            <Button onClick={handlePromoteToLive} variant="default" size="sm">
              Promote to Live
            </Button>
          )}
          
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button variant="ghost" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Autosave indicator */}
      {showAutosave && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          Auto-saving changes...
        </div>
      )}

      {lastSaved && !showAutosave && (
        <div className="text-xs text-muted-foreground">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Inputs Section */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Inputs</h2>
            <div className="space-y-4">
              {worksheet.inputs.map(input => (
                <ExplainOverlay
                  key={input.id}
                  contextData={{ 
                    label: input.label, 
                    type: input.type, 
                    value: values[input.id] 
                  }}
                  contextType="input"
                  onExplainClick={handleExplainClick}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{input.label}</label>
                    <input
                      type="number"
                      value={values[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={input.type === 'currency' ? '$0.00' : '0'}
                    />
                  </div>
                </ExplainOverlay>
              ))}
            </div>
          </div>
        </div>

        {/* Assumptions Panel */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Assumptions</h2>
            <div className="space-y-4">
              {worksheet.assumptions.map(assumption => (
                <div key={assumption.id} className="space-y-2">
                  <label className="text-sm font-medium">{assumption.label}</label>
                  <input
                    type="number"
                    value={assumptions[assumption.id] || ''}
                    onChange={(e) => handleAssumptionChange(assumption.id, e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outputs Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            <div className="space-y-4">
              {worksheet.outputs.map(output => (
                <ExplainOverlay
                  key={output.id}
                  contextData={{ 
                    label: output.label, 
                    value: outputs[output.id],
                    formula: output.formula,
                    description: output.description
                  }}
                  contextType="output"
                  onExplainClick={handleExplainClick}
                >
                  <KpiCard
                    title={output.label}
                    description={output.description}
                    value={outputs[output.id]}
                    unit={output.id.includes('percentage') ? 'percentage' : 'currency'}
                    state={mode}
                    size="sm"
                  />
                </ExplainOverlay>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Gate Modal */}
      <PromotionGate
        isOpen={showPromotionGate}
        onClose={() => setShowPromotionGate(false)}
        onConfirm={confirmPromotion}
        itemType="worksheet"
        itemName={worksheet.title}
        currentState="draft"
        targetState="live"
        impactDescription="This will make the worksheet visible to all team members and lock certain editing capabilities."
      />
    </div>
  );
};

export default WorksheetRenderer;