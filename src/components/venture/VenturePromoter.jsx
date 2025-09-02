import React, { useState } from 'react';
import { ArrowRight, Building, FileText, Users, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVentures } from '@/hooks/useVentures';

export const VenturePromoter = ({ isOpen, onClose, sourceData, sourceType }) => {
  const [ventureName, setVentureName] = useState('');
  const [ventureDescription, setVentureDescription] = useState('');
  const [ventureType, setVentureType] = useState('startup');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createVenture } = useVentures();

  const handleCreateVenture = async () => {
    if (!ventureName.trim()) return;
    
    setIsCreating(true);
    try {
      const ventureData = {
        name: ventureName,
        description: ventureDescription,
        type: ventureType,
        stage: 'ideation'
      };
      
      const result = await createVenture(ventureData);
      if (result.success) {
        // TODO: Link source data to the new venture
        onClose();
      }
    } catch (error) {
      console.error('Error creating venture:', error);
    }
    setIsCreating(false);
  };

  const getSourcePreview = () => {
    switch (sourceType) {
      case 'playground':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">From Playground Session</h4>
            <div className="text-sm text-muted-foreground">
              {sourceData?.blocks?.length || 0} blocks configured
            </div>
            <div className="flex flex-wrap gap-1">
              {sourceData?.blocks?.slice(0, 5).map((block, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {block.name}
                </Badge>
              ))}
              {sourceData?.blocks?.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{sourceData.blocks.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        );
      
      case 'blocks':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">From Selected Blocks</h4>
            <div className="text-sm text-muted-foreground">
              {sourceData?.length || 0} blocks selected
            </div>
            <div className="flex flex-wrap gap-1">
              {sourceData?.slice(0, 5).map((block, index) => (
                <Badge key={block.id} variant="outline" className="text-xs">
                  {block.name}
                </Badge>
              ))}
              {sourceData?.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{sourceData.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        );
      
      case 'tools':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">From Tool Results</h4>
            <div className="text-sm text-muted-foreground">
              {sourceData?.length || 0} tool runs to include
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Creating a new venture from scratch
          </div>
        );
    }
  };

  const ventureTypes = [
    { value: 'startup', label: 'Startup', icon: Rocket },
    { value: 'enterprise', label: 'Enterprise Project', icon: Building },
    { value: 'consulting', label: 'Consulting', icon: Users },
    { value: 'research', label: 'Research Project', icon: FileText }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Create New Venture
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Source Preview */}
          {sourceData && (
            <Card className="p-4 bg-muted/50">
              {getSourcePreview()}
            </Card>
          )}
          
          {/* Venture Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Venture Name</label>
              <Input
                placeholder="Enter venture name..."
                value={ventureName}
                onChange={(e) => setVentureName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-3 text-sm border rounded-md resize-none h-20"
                placeholder="Describe your venture..."
                value={ventureDescription}
                onChange={(e) => setVentureDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Venture Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ventureTypes.map(type => {
                  const TypeIcon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={ventureType === type.value ? 'default' : 'outline'}
                      className="h-12 justify-start"
                      onClick={() => setVentureType(type.value)}
                    >
                      <TypeIcon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Promotion Preview */}
          <Card className="p-4 border-dashed">
            <h4 className="font-medium mb-3">What will be included:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Venture workspace with dashboard
              </div>
              {sourceType === 'playground' && (
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  All playground blocks as venture blocks
                </div>
              )}
              {sourceType === 'blocks' && (
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Selected blocks linked to venture
                </div>
              )}
              {sourceType === 'tools' && (
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Tool results as initial KPIs
                </div>
              )}
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Auto-generated worksheets from blocks
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                Initial timeline and activity tracking
              </div>
            </div>
          </Card>
          
          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVenture}
              disabled={!ventureName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Venture'}
              <Rocket className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};