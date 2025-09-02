import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayground } from '@/hooks/usePlayground';
import { useBlocks } from '@/hooks/useBlocks';
import AICopilot from '@/components/copilot/AICopilot';
import { BlockDetailModal } from '@/components/blocks/BlockDetailModal';
import { 
  GripVertical, 
  Plus, 
  Save, 
  TrendingUp,
  Target,
  Calculator,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';

const PlaygroundCanvas = ({ className = "" }) => {
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const canvasRef = useRef(null);

  const { 
    activeSession, 
    createSession, 
    updateSession, 
    promoteToVenture,
    sessions 
  } = usePlayground();

  const { 
    blocks,
    loading: blocksLoading,
    updateBlockStatus
  } = useBlocks();

  const blocksByCategory = blocks.reduce((acc, block) => {
    const category = block.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(block);
    return acc;
  }, {});

  const categories = [
    { name: 'Business Model', icon: TrendingUp, color: 'text-blue-600' },
    { name: 'Market', icon: Target, color: 'text-green-600' },
    { name: 'Finance', icon: DollarSign, color: 'text-yellow-600' },
    { name: 'Operations', icon: Users, color: 'text-purple-600' },
    { name: 'Product', icon: Calculator, color: 'text-red-600' },
    { name: 'Other', icon: FileText, color: 'text-gray-600' }
  ];

  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement = {
      id: `element_${Date.now()}`,
      blockId: draggedBlock.id,
      block: draggedBlock,
      position: { x, y },
      size: { width: 200, height: 120 },
      connections: []
    };

    setCanvasElements(prev => [...prev, newElement]);
    setDraggedBlock(null);

    if (activeSession) {
      const updatedCanvas = {
        ...activeSession.canvas,
        blocks: [...(activeSession.canvas?.blocks || []), newElement]
      };
      updateSession(activeSession.id, { canvas: updatedCanvas });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
  };

  const handleStatusChange = async (blockId, newStatus) => {
    await updateBlockStatus(blockId, newStatus);
  };

  const handlePromoteToVenture = async () => {
    if (!activeSession || canvasElements.length === 0) return;
    
    const ventureData = {
      name: activeSession.name || 'New Venture',
      description: `Generated from playground session: ${activeSession.name}`,
      blocks: canvasElements.map(el => el.block),
      structure: canvasElements
    };

    await promoteToVenture(activeSession.id, ventureData);
  };

  return (
    <div className={`flex h-full ${className}`}>
      <div className="w-80 border-r border-border bg-card/50 overflow-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Block Palette</h3>
            <Badge variant="secondary">{blocks.length} blocks</Badge>
          </div>

          <Tabs defaultValue="Financial" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto text-xs">
              {categories.slice(0, 9).map(category => {
                const Icon = category.icon;
                const categoryBlocks = blocksByCategory[category.name] || [];
                return (
                  <TabsTrigger 
                    key={category.name} 
                    value={category.name}
                    className="flex flex-col gap-1 h-auto py-2 px-1"
                  >
                    <Icon className={`h-3 w-3 ${category.color}`} />
                    <span className="text-xs truncate">{category.name.split(' ')[0]}</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryBlocks.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => {
              const categoryBlocks = blocksByCategory[category.name] || [];
              if (categoryBlocks.length === 0) return null;

              return (
                <TabsContent key={category.name} value={category.name} className="space-y-2 max-h-96 overflow-auto">
                  {categoryBlocks.map(block => (
                    <Card
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onClick={() => handleBlockClick(block)}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{block.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {block.description || 'No description available'}
                            </p>
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {block.tags && (
                          <div className="flex gap-1 mt-2">
                            {block.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 bg-background/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">
                {activeSession?.name || 'Playground'}
              </h2>
              <Badge variant="outline">
                {canvasElements.length} blocks
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => createSession()}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                onClick={handlePromoteToVenture}
                disabled={canvasElements.length === 0}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Promote to Venture
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-br from-background to-accent/10 relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {canvasElements.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Empty Canvas</p>
                  <p className="text-sm">Drag blocks from the palette to start building</p>
                </div>
              </div>
            ) : (
              canvasElements.map(element => (
                <Card
                  key={element.id}
                  className={`absolute cursor-pointer transition-all hover:shadow-lg ${
                    selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height
                  }}
                  onClick={() => handleElementClick(element)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{element.block.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {element.block.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {element.block.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="w-80 border-l border-border bg-card/50 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Properties</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Block Name</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedElement.block.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedElement.block.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Add Tool
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Add Worksheet
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Add KPI
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedBlock && (
        <BlockDetailModal
          block={selectedBlock}
          isOpen={!!selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default PlaygroundCanvas;