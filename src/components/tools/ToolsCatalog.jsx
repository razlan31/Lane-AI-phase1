import React, { useState, useMemo } from 'react';
import { Search, Calculator, BarChart3, Settings, Target, Play, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTools } from '@/hooks/useTools';

const categoryConfig = {
  financial: { label: 'Financial', color: 'green', icon: Calculator },
  marketing: { label: 'Marketing', color: 'purple', icon: BarChart3 },
  operations: { label: 'Operations', color: 'orange', icon: Settings },
  strategy: { label: 'Strategy', color: 'blue', icon: Target }
};

export const ToolsCatalog = ({ onToolSelect }) => {
  const { tools, loading, runTool, getToolsByCategory } = useTools();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolInputs, setToolInputs] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [toolResult, setToolResult] = useState(null);

  const filteredTools = useMemo(() => {
    let filtered = tools;
    
    if (selectedCategory !== 'all') {
      filtered = getToolsByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [tools, selectedCategory, searchQuery, getToolsByCategory]);

  const categories = Object.keys(categoryConfig);
  const totalTools = tools.length;

  const handleToolClick = (tool) => {
    if (onToolSelect) {
      onToolSelect(tool);
    } else {
      setSelectedTool(tool);
      setToolInputs({});
      setToolResult(null);
    }
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    
    setIsRunning(true);
    try {
      const result = await runTool(selectedTool.id, toolInputs);
      if (result.success) {
        setToolResult(result.data);
      }
    } catch (error) {
      console.error('Error running tool:', error);
    }
    setIsRunning(false);
  };

  const renderToolInput = (property, schema) => {
    const inputId = property;
    const inputValue = toolInputs[property] || '';
    
    return (
      <div key={property} className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {schema.description || property}
          {selectedTool?.input_schema.required?.includes(property) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <Input
          id={inputId}
          type={schema.type === 'number' ? 'number' : 'text'}
          placeholder={schema.description}
          value={inputValue}
          onChange={(e) => setToolInputs(prev => ({
            ...prev,
            [property]: schema.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          }))}
          className="w-full"
        />
      </div>
    );
  };

  const renderToolResult = () => {
    if (!toolResult) return null;
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Results</h4>
        <div className="bg-muted/50 p-4 rounded-lg">
          {Object.entries(toolResult.outputs || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-primary font-semibold">
                {typeof value === 'number' ? 
                  (value % 1 === 0 ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 })) : 
                  value
                }
              </span>
            </div>
          ))}
        </div>
        
        {toolResult.outputs?.recommendations && Array.isArray(toolResult.outputs.recommendations) && (
          <div className="space-y-2">
            <h5 className="font-medium">Recommendations</h5>
            <ul className="space-y-1">
              {toolResult.outputs.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tools...</p>
        </div>
      </div>
    );
  }

  const renderTool = (tool) => {
    const CategoryIcon = categoryConfig[tool.category]?.icon || Calculator;
    
    return (
      <Card 
        key={tool.id}
        className="p-4 cursor-pointer transition-all hover:shadow-md"
        onClick={() => handleToolClick(tool)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${categoryConfig[tool.category]?.color}-100`}>
            <CategoryIcon className={`h-4 w-4 text-${categoryConfig[tool.category]?.color}-600`} />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{tool.name}</h3>
              <Badge 
                variant="secondary" 
                className={`text-xs bg-${categoryConfig[tool.category]?.color}-100 text-${categoryConfig[tool.category]?.color}-700`}
              >
                {categoryConfig[tool.category]?.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {Object.keys(tool.input_schema?.properties || {}).length} inputs
              </span>
              <Button size="sm" variant="ghost">
                <Play className="h-3 w-3 mr-1" />
                Run Tool
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tools Catalog</h2>
          <p className="text-muted-foreground">
            Access {totalTools} powerful business calculation tools
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Tools ({totalTools})</TabsTrigger>
          {categories.map(category => {
            const count = getToolsByCategory(category).length;
            const CategoryIcon = categoryConfig[category].icon;
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4" />
                {categoryConfig[category].label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map(renderTool)}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory(category).filter(tool => 
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(renderTool)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredTools.length} tools matching "{searchQuery}"
        </div>
      )}

      {/* Tool Runner Modal */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTool?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedTool && (
            <div className="space-y-6">
              <p className="text-muted-foreground">{selectedTool.description}</p>
              
              {/* Input Form */}
              <div className="space-y-4">
                <h4 className="font-medium">Configure Tool</h4>
                {Object.entries(selectedTool.input_schema?.properties || {}).map(([property, schema]) =>
                  renderToolInput(property, schema)
                )}
              </div>
              
              {/* Run Button */}
              <Button 
                onClick={handleRunTool} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Running...' : 'Run Tool'}
              </Button>
              
              {/* Results */}
              {renderToolResult()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};