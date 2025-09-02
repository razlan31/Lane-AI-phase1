import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePlayground } from '@/hooks/usePlayground';
import { useBlocks } from '@/hooks/useBlocks';
import AICopilot from '@/components/copilot/AICopilot';
import { 
  Layout, 
  Plus, 
  Save, 
  Upload, 
  Trash2, 
  Target,
  Calculator,
  FileText,
  TrendingUp
} from 'lucide-react';

/**
 * Playground Canvas - Drag-and-drop experimentation space
 * Third step in Auto-Promotion Flow
 */
const PlaygroundCanvas = ({ className = "" }) => {
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const canvasRef = useRef(null);
  
  const {
    activeSession,
    createSession,
    updateSession,
    promoteToVenture
  } = usePlayground();
  
  const { blocks } = useBlocks();

  // Handle drag start from block palette
  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedBlock || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newElement = {
      id: `${draggedBlock.id}_${Date.now()}`,
      blockId: draggedBlock.id,
      block: draggedBlock,
      position: { x, y },
      size: { width: 200, height: 100 },
      connections: []
    };

    setCanvasElements(prev => [...prev, newElement]);
    setDraggedBlock(null);
    
    // Update session with new canvas state
    if (activeSession) {
      updateSession(activeSession.id, {
        canvas: { 
          blocks: [...canvasElements, newElement], 
          connections: [] 
        }
      });
    }

    // AI suggestion for structure
    if (canvasElements.length === 0) {
      setAiSuggestions([{
        message: "Great start! Want me to suggest related blocks that work well with this one?",
        confidence: 80,
        actions: [
          { label: 'Suggest Structure', primary: true, action: 'suggest_structure' },
          { label: 'Continue Manually', primary: false, action: 'dismiss' }
        ]
      }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle element selection
  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  // Connect two elements
  const connectElements = (fromId, toId) => {
    setCanvasElements(prev => 
      prev.map(element => 
        element.id === fromId 
          ? { ...element, connections: [...element.connections, toId] }
          : element
      )
    );
  };

  // Promote playground to venture
  const handlePromoteToVenture = async () => {
    if (!activeSession) return;
    
    const success = await promoteToVenture(activeSession.id, {
      name: activeSession.name || 'New Venture',
      blocks: canvasElements.map(el => el.blockId)
    });
    
    if (success) {
      setAiSuggestions([{
        message: "Playground promoted to Draft Venture! Ready to add KPIs and Worksheets?",
        confidence: 100,
        actions: [
          { label: 'Go to Venture', primary: true, action: 'go_to_venture' },
          { label: 'Stay Here', primary: false, action: 'dismiss' }
        ]
      }]);
    }
  };

  const handleSuggestionAction = async (suggestion, action) => {
    if (action.action === 'suggest_structure') {
      // AI would suggest related blocks based on the current block
      console.log('Suggesting structure for blocks:', canvasElements);
    } else if (action.action === 'go_to_venture') {
      // Navigate to venture view
      console.log('Navigating to venture');
    }
    setAiSuggestions([]);
  };

  // Get blocks grouped by category for the palette
  const blocksByCategory = blocks.reduce((acc, block) => {
    if (!acc[block.category]) acc[block.category] = [];
    acc[block.category].push(block);
    return acc;
  }, {});

  return (
    <div className={`flex h-full ${className}`}>
      {/* Block Palette */}
      <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Block Palette</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryBlocks.slice(0, 5).map(block => (
                  <Card
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                    className="p-3 cursor-grab hover:bg-muted/50 active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="font-medium text-sm">{block.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {block.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">
              {activeSession?.name || 'New Playground'}
            </h2>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => createSession()}>
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handlePromoteToVenture}>
              <Upload className="w-4 h-4 mr-1" />
              Promote to Venture
            </Button>
          </div>
        </div>

        {/* AI Copilot */}
        {aiSuggestions.length > 0 && (
          <div className="p-4">
            <AICopilot
              context={{ type: 'playground' }}
              suggestions={aiSuggestions}
              onSuggestionAction={handleSuggestionAction}
            />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-grid-pattern"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Canvas Elements */}
            {canvasElements.map(element => (
              <div
                key={element.id}
                className={`absolute bg-white border-2 rounded-lg p-3 shadow-sm cursor-pointer ${
                  selectedElement?.id === element.id ? 'border-primary' : 'border-gray-200'
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height
                }}
                onClick={() => handleElementClick(element)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="font-medium text-sm">{element.block.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {element.block.description}
                </p>
                <Badge variant="secondary" className="text-xs mt-2">
                  {element.block.category}
                </Badge>
              </div>
            ))}

            {/* Drop Zone Message */}
            {canvasElements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Layout className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">Drag blocks here to start modeling</p>
                  <p className="text-sm">Build your venture structure visually</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Element Properties Panel */}
        {selectedElement && (
          <div className="border-t p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Properties</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedElement(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Block Name</label>
                <p className="text-sm text-muted-foreground">{selectedElement.block.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Badge variant="secondary">{selectedElement.block.category}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calculator className="w-4 h-4 mr-1" />
                  Add Tool
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Add Worksheet
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Add KPI
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundCanvas;