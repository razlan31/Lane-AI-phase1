import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTools } from '@/hooks/useTools';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import AICopilot from '@/components/copilot/AICopilot';
import { ToolResultsPanel } from './ToolResultsPanel';
import ToolInputForm from './ToolInputForm';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, DollarSign, Users, AlertTriangle, User, X } from 'lucide-react';

const ToolsPanel = ({ isOpen, onClose, className = "" }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolInputs, setToolInputs] = useState({});
  const [toolResult, setToolResult] = useState(null);
  
  const {
    tools,
    toolRuns,
    loading: toolsLoading,
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
    { id: 'growth', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'strategy', icon: Calculator, color: 'text-indigo-600' }
  ];

  const handleRunTool = async () => {
    if (!selectedTool) return;
    
    setLoading(true);
    try {
      const result = await runTool(selectedTool.id, toolInputs);
      
      if (result.success) {
        setToolResult(result);
        toast.success(`${selectedTool.name} has finished processing your inputs.`);

        // Generate AI suggestion for this tool run
        await generateSuggestion('tool', {
          toolId: selectedTool.id,
          outputs: result.outputs
        });
      } else {
        toast.error(result.error || "An error occurred while running the tool.");
      }
    } catch (error) {
      console.error('Error running tool:', error);
      toast.error("Failed to execute tool. Please try again.");
    } finally {
      setLoading(false);
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

  // Enhanced result handling with functional buttons
  const handleConvertToKPI = async () => {
    if (!toolResult?.data?.id) return;
    
    try {
      setLoading(true);
      const result = await convertToKPI(toolResult.data.id, null, 'Generated KPI');
      
      if (result) {
        toast({
          title: "KPI Created",
          description: `Successfully converted tool output to KPI: ${result.name}`,
        });
      } else {
        toast({
          title: "KPI Creation Failed",
          description: "Could not create KPI from tool output.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error converting to KPI:', error);
      toast({
        title: "Error",
        description: "Failed to create KPI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          {activeSuggestion && activeSuggestion.context === 'tool' && (
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
                          <h3 className="font-medium text-sm capitalize">{category.id}</h3>
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

                  {/* Enhanced Tool Input Form */}
                  <ToolInputForm
                    tool={selectedTool}
                    inputs={toolInputs}
                    onInputChange={(field, value) => setToolInputs(prev => ({
                      ...prev,
                      [field]: value
                    }))}
                    onRun={handleRunTool}
                    loading={loading}
                  />

                  {/* Tool Results with Enhanced Integration */}
                  {toolResult && (
                    <ToolResultsPanel 
                      toolRun={toolResult.data || toolResult} 
                      suggestedBlocks={getSuggestedBlocks(selectedTool?.id, toolResult?.outputs)}
                      onConvertToKPI={handleConvertToKPI}
                      loading={loading}
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