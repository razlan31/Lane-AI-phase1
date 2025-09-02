import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTools } from '@/hooks/useTools';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import AICopilot from '@/components/copilot/AICopilot';
import { Calculator, TrendingUp, DollarSign, Users, AlertTriangle, User, X } from 'lucide-react';

/**
 * Tools Panel - Calculator drawer for micro-calculations
 * Second step in Auto-Promotion Flow
 */
const ToolsPanel = ({ isOpen, onClose, className = "" }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolInputs, setToolInputs] = useState({});
  const [toolResult, setToolResult] = useState(null);
  
  const {
    tools,
    toolRuns,
    loading,
    runTool,
    convertToKPI,
    getSuggestedBlocks,
    getToolsByCategory
  } = useTools();

  const { activeSuggestion, generateSuggestion, dismissSuggestion } = useCopilotManager();

  const categoryIcons = {
    Finance: DollarSign,
    Marketing: TrendingUp,
    Customers: Users,
    Risk: AlertTriangle,
    Personal: User,
    Growth: TrendingUp
  };

  const handleInputChange = (field, value) => {
    setToolInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    
    const result = await runTool(selectedTool.id, toolInputs);
    if (result.success) {
      setToolResult(result);
      
      // Generate AI suggestion for tool result
      await generateSuggestion(
        { type: 'tool', sourceId: result.data.id },
        { toolId: selectedTool.id, outputs: result.outputs }
      );
    }
  };

  const handleSuggestionAction = async (suggestion, action) => {
    if (action.action === 'attach_block' && toolResult) {
      console.log('Attaching to block:', action.blockId);
      // Implementation would depend on venture context
    }
    
    await dismissSuggestion(suggestion.id, action.primary);
  };

  const renderToolInput = (field, type) => {
    const value = toolInputs[field] || '';
    
    if (type === 'array<number>') {
      return (
        <Input
          placeholder="Enter numbers separated by commas"
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n)))}
        />
      );
    }
    
    return (
      <Input
        type={type === 'number' ? 'number' : 'text'}
        placeholder={`Enter ${field.replace(/_/g, ' ')}`}
        value={value}
        onChange={(e) => handleInputChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
      />
    );
  };

  const renderToolResult = () => {
    if (!toolResult) return null;
    
    return (
      <Card className="p-4 mt-4 bg-primary/5">
        <h4 className="font-semibold mb-3">Results</h4>
        <div className="space-y-2">
          {Object.entries(toolResult.outputs).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-4 top-20 w-96 max-h-[80vh] z-50 ${className}`}>
      <Card className="p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tools</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Copilot Suggestions */}
        {activeSuggestion && activeSuggestion.context.type === 'tool' && (
          <AICopilot
            context={activeSuggestion.context}
            suggestion={activeSuggestion}
            onSuggestionAction={handleSuggestionAction}
            layout="strip"
            className="mb-4"
          />
        )}

        {/* Tool Categories */}
        <div className="max-h-[70vh] overflow-y-auto">
          {!selectedTool ? (
            <Tabs defaultValue="Finance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Finance">Finance</TabsTrigger>
                <TabsTrigger value="Marketing">Marketing</TabsTrigger>
                <TabsTrigger value="Risk">Risk</TabsTrigger>
              </TabsList>
              
              {['Finance', 'Marketing', 'Risk', 'Personal', 'Growth'].map(category => {
                const categoryTools = getToolsByCategory(category);
                const Icon = categoryIcons[category] || Calculator;
                
                return (
                  <TabsContent key={category} value={category} className="space-y-2">
                    {categoryTools.map(tool => (
                      <Card 
                        key={tool.id} 
                        className="p-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTool(tool)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">{tool.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {tool.category}
                        </Badge>
                      </Card>
                    ))}
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            /* Selected Tool Interface */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedTool(null);
                    setToolInputs({});
                    setToolResult(null);
                  }}
                >
                  ← Back
                </Button>
                <h4 className="font-semibold">{selectedTool.name}</h4>
              </div>
              
              <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
              
              {/* Tool Inputs */}
              <div className="space-y-3">
                <h5 className="font-medium">Inputs</h5>
                {Object.entries(selectedTool.input_schema).map(([field, type]) => (
                  <div key={field}>
                    <label className="text-sm font-medium capitalize">
                      {field.replace(/_/g, ' ')}
                    </label>
                    {renderToolInput(field, type)}
                  </div>
                ))}
                
                <Button onClick={handleRunTool} className="w-full">
                  Calculate
                </Button>
              </div>
              
              {/* Tool Results with AI Suggestion */}
              {renderToolResult()}
              
              {/* Inline AI suggestion for tool results */}
              {toolResult && activeSuggestion && activeSuggestion.context.type === 'tool' && (
                <AICopilot
                  context={activeSuggestion.context}
                  suggestion={activeSuggestion}
                  onSuggestionAction={handleSuggestionAction}
                  layout="inline"
                  className="mt-2"
                />
              )}
            </div>
          )}
        </div>

        {/* Recent Runs */}
        {toolRuns.length > 0 && !selectedTool && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">Recent Calculations</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {toolRuns.slice(0, 5).map(run => (
                <div key={run.id} className="text-sm p-2 bg-muted/50 rounded">
                  <div className="font-medium">{run.tool_id.replace('_', ' ')}</div>
                  <div className="text-muted-foreground">
                    {new Date(run.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ToolsPanel;