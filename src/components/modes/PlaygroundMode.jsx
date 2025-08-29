import React, { useState } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Calculator, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Save,
  Upload,
  Move,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const PlaygroundMode = ({ onPromoteToWorkspace, className }) => {
  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [draggedBlock, setDraggedBlock] = useState(null);

  const blockTypes = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Custom calculation block',
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'chart',
      name: 'Chart',
      description: 'Data visualization',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'metrics',
      name: 'Metrics',
      description: 'KPI display',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'pie',
      name: 'Pie Chart',
      description: 'Proportional data',
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const addBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType.id,
      name: blockType.name,
      icon: blockType.icon,
      color: blockType.color,
      bgColor: blockType.bgColor,
      x: Math.random() * 300,
      y: Math.random() * 200,
      data: getDefaultData(blockType.id)
    };
    setCanvasBlocks([...canvasBlocks, newBlock]);
  };

  const getDefaultData = (type) => {
    switch (type) {
      case 'calculator':
        return { formula: 'Revenue - Expenses', result: 0 };
      case 'chart':
        return { values: [10, 20, 30, 25], labels: ['Q1', 'Q2', 'Q3', 'Q4'] };
      case 'metrics':
        return { value: 85, unit: '%', trend: 12 };
      case 'pie':
        return { segments: [40, 30, 20, 10], labels: ['A', 'B', 'C', 'D'] };
      default:
        return {};
    }
  };

  const removeBlock = (blockId) => {
    setCanvasBlocks(canvasBlocks.filter(block => block.id !== blockId));
  };

  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedBlock) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCanvasBlocks(blocks => 
        blocks.map(block => 
          block.id === draggedBlock.id 
            ? { ...block, x, y }
            : block
        )
      );
      setDraggedBlock(null);
    }
  };

  const handlePromoteToWorkspace = () => {
    if (onPromoteToWorkspace && canvasBlocks.length > 0) {
      onPromoteToWorkspace(canvasBlocks);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Playground</h1>
          <p className="text-muted-foreground">Freeform canvas for custom worksheets and dashboards</p>
        </div>
        <div className="flex items-center gap-2">
          {canvasBlocks.length > 0 && (
            <Button onClick={handlePromoteToWorkspace}>
              <Upload className="h-4 w-4 mr-2" />
              Promote to Workspace
            </Button>
          )}
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Canvas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Block Palette */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Block Palette</h3>
          <div className="space-y-2">
            {blockTypes.map((blockType) => {
              const Icon = blockType.icon;
              return (
                <Card 
                  key={blockType.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addBlock(blockType)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center",
                        blockType.bgColor
                      )}>
                        <Icon className={cn("h-4 w-4", blockType.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{blockType.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {blockType.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Canvas</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Move className="h-4 w-4" />
                  Drag blocks to arrange
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div 
                className="relative w-full h-full bg-muted/10 rounded-lg border-2 border-dashed border-muted"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {canvasBlocks.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Empty Canvas</h3>
                    <p className="text-sm text-muted-foreground">
                      Click blocks from the palette to add them to your canvas
                    </p>
                  </div>
                ) : (
                  canvasBlocks.map((block) => {
                    const Icon = block.icon;
                    return (
                      <div
                        key={block.id}
                        className="absolute cursor-move"
                        style={{ left: block.x, top: block.y }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                      >
                        <Card className="w-48 shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center",
                                  block.bgColor
                                )}>
                                  <Icon className={cn("h-3 w-3", block.color)} />
                                </div>
                                <span className="text-sm font-medium">{block.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeBlock(block.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <div className="text-xs text-muted-foreground">
                              {block.type === 'calculator' && 'Formula: ' + block.data.formula}
                              {block.type === 'metrics' && `${block.data.value}${block.data.unit}`}
                              {block.type === 'chart' && `${block.data.values.length} data points`}
                              {block.type === 'pie' && `${block.data.segments.length} segments`}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundMode;