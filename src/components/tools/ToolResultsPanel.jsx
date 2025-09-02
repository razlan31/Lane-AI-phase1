import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Link, BarChart3 } from 'lucide-react';
import { useBlocks } from '@/hooks/useBlocks';

export const ToolResultsPanel = ({ toolRun, suggestedBlocks = [] }) => {
  const { createBlock, generateWorksheetFromBlocks } = useBlocks();

  // Handle linking to a block (enhanced)
  const handleLinkToBlock = (blockId) => {
    console.log('Linking to block:', blockId);
    // Create connection between tool run and block
    if (toolRun?.id) {
      // This would integrate with block management system
      console.log(`Creating link: Tool ${toolRun.tool_id} → Block ${blockId}`);
    }
  };

  // Handle converting tool output to KPI (enhanced)
  const handleConvertToKPI = async () => {
    if (!toolRun?.outputs) return;
    
    try {
      // Extract primary metric from tool output
      const primaryOutput = Object.keys(toolRun.outputs)[0];
      const value = toolRun.outputs[primaryOutput];
      
      console.log('Converting to KPI:', {
        toolId: toolRun.tool_id,
        output: primaryOutput,
        value,
        runId: toolRun.id
      });
      
      // This would create a KPI record
      // For now, just log the conversion
      console.log(`Created KPI: ${primaryOutput.toUpperCase()} = ${value}`);
    } catch (error) {
      console.error('Error converting to KPI:', error);
    }
  };

  if (!toolRun) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tool Results & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Output Summary */}
        <div>
          <h4 className="font-medium mb-2">Output Summary</h4>
          <div className="bg-muted/50 rounded-lg p-3">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(toolRun.outputs, null, 2)}
            </pre>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleConvertToKPI}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Convert to KPI
          </Button>
          <Button size="sm" variant="outline">
            <Link className="h-4 w-4 mr-1" />
            Save as Note
          </Button>
        </div>

        {/* Suggested Blocks */}
        {suggestedBlocks.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Suggested Next Blocks</h4>
            <div className="space-y-2">
              {suggestedBlocks.map(block => (
                <div 
                  key={block.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-sm">{block.name}</h5>
                    <p className="text-xs text-muted-foreground">
                      {block.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {block.category}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleLinkToBlock(block.id)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};