import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTools } from '@/hooks/useTools';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import AICopilot from '@/components/copilot/AICopilot';
import { ToolResultsPanel } from './ToolResultsPanel';
import { Calculator, TrendingUp, DollarSign, Users, AlertTriangle, User, X } from 'lucide-react';

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

  const toolCategories = [
    { id: 'financial', icon: DollarSign, color: 'text-green-600' },
    { id: 'marketing', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'risk', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'operations', icon: Users, color: 'text-purple-600' },
    { id: 'personal', icon: User, color: 'text-orange-600' },
    { id: 'growth', icon: TrendingUp, color: 'text-emerald-600' }
  ];

  const handleRunTool = async () => {
    if (!selectedTool) return;

    const result = await runTool(selectedTool.id, toolInputs);
    if (result.success) {
      setToolResult(result);
      
      await generateSuggestion(
        { type: 'tool', sourceId: selectedTool.id },
        { toolId: selectedTool.id, outputs: result.outputs }
      );
    }
  };

  const handleSuggestionAction = async (suggestion, action) => {
    if (action.action === 'run_tool') {
      const tool = tools.find(t => t.id === action.toolId);
      if (tool) {
        setSelectedTool(tool);
        setToolInputs({});
        setToolResult(null);
      }
    }
    
    await dismissSuggestion(suggestion.id, action.action !== 'dismiss');
  };

  const renderToolInput = (field, type) => {
    switch (type) {
      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.replace('_', ' ')}`}
            value={toolInputs[field] || ''}
            onChange={(e) => setToolInputs(prev => ({
              ...prev,
              [field]: parseFloat(e.target.value) || 0
            }))}
            className="w-full"
          />
        );
      default:
        return (
          <Input
            placeholder={`Enter ${field.replace('_', ' ')}`}
            value={toolInputs[field] || ''}
            onChange={(e) => setToolInputs(prev => ({
              ...prev,
              [field]: e.target.value
            }))}
            className="w-full"
          />
        );
    }
  };

  // Enhanced result handling with functional buttons
  const handleConvertToKPI = async () => {
    if (!toolResult?.data?.id) return;
    
    try {
      // This would normally get venture ID from context, using mock for now
      const ventureId = 'sample-venture-id'; // Replace with actual venture selection
      const result = await convertToKPI(toolResult.data.id, ventureId, null);
      
      if (result) {
        console.log('Successfully converted to KPI:', result);
        // Show success notification
      }
    } catch (error) {
      console.error('Error converting to KPI:', error);
    }
  };

  const handleLinkToBlock = async () => {
    if (!toolResult?.data?.id) return;
    
    try {
      // Get suggested blocks for this tool
      const suggestedBlocks = await getSuggestedBlocks(selectedTool.id);
      
      if (suggestedBlocks.length > 0) {
        // For demo, link to first suggested block
        const blockId = suggestedBlocks[0].id;
        console.log('Linking to block:', blockId);
        // This would open a block selection modal in a real implementation
      }
    } catch (error) {
      console.error('Error linking to block:', error);
    }
  };

  const renderToolResult = () => {
    if (!toolResult) return null;

    return (
      <Card className="mt-4 bg-accent/50">
        <CardHeader>
          <CardTitle className="text-sm">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Results Display */}
          <div className="space-y-2">
            {Object.entries(toolResult.outputs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground capitalize">
                  {key.replace('_', ' ')}:
                </span>
                <Badge variant="secondary">{Array.isArray(value) ? value.join(', ') : value}</Badge>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={handleConvertToKPI}
              disabled={!toolResult?.data?.id}
            >
              Convert to KPI
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={handleLinkToBlock}
              disabled={!toolResult?.data?.id}
            >
              Link to Block
            </Button>
          </div>

          {/* Additional suggestion if available */}
          {activeSuggestion && activeSuggestion.context.sourceId === selectedTool?.id && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
              <p className="text-blue-700 font-medium">{activeSuggestion.message}</p>
              <div className="flex gap-1 mt-1">
                {activeSuggestion.actions?.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.primary ? "default" : "ghost"}
                    className="h-6 text-xs px-2"
                    onClick={() => handleSuggestionAction(activeSuggestion, action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${className}`}>
      <Card className="absolute right-4 top-4 bottom-4 w-96 flex flex-col max-h-screen">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tools
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {activeSuggestion && activeSuggestion.context.type === 'tool' && (
            <AICopilot
              context={activeSuggestion.context}
              suggestion={activeSuggestion}
              onSuggestionAction={handleSuggestionAction}
              layout="strip"
              className="mb-4"
            />
          )}

          <Tabs defaultValue="categories" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Tools</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="flex-1 overflow-auto">
              {!selectedTool ? (
                <div className="space-y-4">
                  {toolCategories.map(category => {
                    const categoryTools = getToolsByCategory(category.id);
                    if (categoryTools.length === 0) return null;

                    const Icon = category.icon;
                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${category.color}`} />
                          <h3 className="font-medium text-sm">{category.id}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {categoryTools.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {categoryTools.map(tool => (
                            <Button
                              key={tool.id}
                              variant="outline"
                              className="justify-start text-left h-auto p-3"
                              onClick={() => setSelectedTool(tool)}
                            >
                              <div>
                                <div className="font-medium text-sm">{tool.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {tool.description}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTool(null)}
                    >
                      ← Back
                    </Button>
                    <h3 className="font-medium">{selectedTool.name}</h3>
                  </div>

                  <div className="space-y-3">
                    {selectedTool.input_schema && Object.entries(selectedTool.input_schema.properties || {}).map(([field, schema]) => (
                      <div key={field} className="space-y-1">
                        <label className="text-sm font-medium capitalize">
                          {field.replace('_', ' ')}
                        </label>
                        {renderToolInput(field, schema.type)}
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleRunTool} className="w-full">
                    Calculate
                  </Button>

                  {renderToolResult()}

                  {/* Tool Results Panel with suggested blocks */}
                  {toolResult && (
                    <ToolResultsPanel 
                      toolRun={toolResult} 
                      suggestedBlocks={getSuggestedBlocks(selectedTool?.id, toolResult.outputs)}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="flex-1 overflow-auto">
              <div className="space-y-2">
                {toolRuns.slice(0, 10).map(run => (
                  <Card key={run.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{run.tool_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(run.outputs || {}).length} outputs
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolsPanel;