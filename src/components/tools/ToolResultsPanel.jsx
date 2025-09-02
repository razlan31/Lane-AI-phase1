import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Link, BarChart3 } from 'lucide-react';
import { useBlocks } from '@/hooks/useBlocks';
import { supabase } from '@/integrations/supabase/client';

export const ToolResultsPanel = ({ toolRun, suggestedBlocks = [], onConvertToKPI, loading = false }) => {
  const { createBlock, generateWorksheetFromBlocks } = useBlocks();

  // Handle linking to a block (enhanced with database integration)
  const handleLinkToBlock = async (blockId) => {
    try {
      console.log('Linking tool run to block:', blockId);
      
      // Create connection between tool run and block in database
      if (toolRun?.id) {
        const { data, error } = await supabase
          .from('tool_runs')
          .update({ 
            linked_context: {
              type: 'block',
              id: blockId,
              linked_at: new Date().toISOString()
            }
          })
          .eq('id', toolRun.id)
          .select()
          .single();

        if (error) throw error;
        
        console.log(`Successfully linked Tool ${toolRun.tool_id} → Block ${blockId}`);
        
        // Show success feedback
        // toast({ title: "Success", description: "Tool output linked to block!" });
      }
    } catch (error) {
      console.error('Error linking to block:', error);
    }
  };

  // Handle converting tool output to KPI (enhanced with database integration)
  const handleConvertToKPI = async () => {
    if (!toolRun?.outputs) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract primary metric from tool output
      const primaryOutput = Object.keys(toolRun.outputs)[0];
      const value = toolRun.outputs[primaryOutput];
      
      // Determine KPI name from tool type
      const kpiName = getKPINameFromTool(toolRun.tool_id, primaryOutput);
      
      // Create KPI record
      const { data, error } = await supabase
        .from('kpis')
        .insert({
          venture_id: toolRun.venture_id || null,
          name: kpiName,
          value: parseFloat(value) || 0,
          confidence_level: 'tool_generated'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Link the tool run to this KPI
      await supabase
        .from('tool_runs')
        .update({ 
          linked_context: {
            type: 'kpi',
            id: data.id,
            linked_at: new Date().toISOString()
          }
        })
        .eq('id', toolRun.id);
      
      console.log(`Created KPI: ${kpiName} = ${value}`, data);
      
      // Show success feedback
      // toast({ title: "KPI Created", description: `${kpiName} has been added to your venture metrics.` });
    } catch (error) {
      console.error('Error converting to KPI:', error);
    }
  };

  // Helper function to determine KPI name from tool
  const getKPINameFromTool = (toolId, outputKey) => {
    const kpiMap = {
      'tool_roi_calc': 'ROI Percentage',
      'tool_runway_calc': 'Runway (Months)', 
      'tool_cac_calc': 'Customer Acquisition Cost',
      'tool_ltv_calc': 'Customer Lifetime Value',
      'tool_breakeven_calc': 'Break-even Units',
      'tool_cashflow_proj': 'Projected Cash Flow',
      'tool_roas_calc': 'Return on Ad Spend',
      'tool_funnel_dropoff': 'Conversion Rate',
      'tool_valuation_est': 'Business Valuation'
    };
    
    return kpiMap[toolId] || outputKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <Button 
            size="sm" 
            onClick={onConvertToKPI || handleConvertToKPI}
            disabled={loading}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {loading ? 'Creating...' : 'Convert to KPI'}
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