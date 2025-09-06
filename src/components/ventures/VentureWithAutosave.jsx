import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Save, History, Edit3 } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { AutosaveStatus } from '@/components/autosave/AutosaveNotifications';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const VentureWithAutosave = ({ 
  venture, 
  onUpdate,
  className = "" 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Initialize autosave for this venture
  const {
    content: ventureContent,
    setContent: setVentureContent,
    saveStatus,
    lastSaved,
    versions,
    commit,
    revertToVersion,
    forceRetry,
    hasUnsavedChanges
  } = useAutosave(
    venture.id, 
    'venture', 
    {
      name: venture.name || '',
      description: venture.description || '',
      type: venture.type || '',
      stage: venture.stage || '',
      metadata: venture.metadata || {}
    }
  );

  // Update field and trigger autosave
  const handleFieldChange = (field, value) => {
    setVentureContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Commit current version
  const handleCommit = async () => {
    const result = await commit(`Manual save - ${new Date().toLocaleString()}`);
    if (result.success) {
      onUpdate?.(venture.id, ventureContent);
      toast({
        title: "Changes Committed",
        description: "Venture details have been saved."
      });
    }
  };

  // Handle version revert
  const handleRevertToVersion = async (versionId) => {
    const result = await revertToVersion(versionId);
    if (result.success) {
      setShowVersionHistory(false);
      onUpdate?.(venture.id, ventureContent);
      toast({
        title: "Version Restored",
        description: "Venture has been reverted to the selected version."
      });
    }
  };

  const ventureTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'local_business', label: 'Local Business' },
    { value: 'franchise', label: 'Franchise' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'product', label: 'Product Business' },
    { value: 'service', label: 'Service Business' },
    { value: 'other', label: 'Other' }
  ];

  const ventureStages = [
    { value: 'concept', label: 'Concept' },
    { value: 'planning', label: 'Planning' },
    { value: 'mvp', label: 'MVP' },
    { value: 'launched', label: 'Launched' },
    { value: 'growing', label: 'Growing' },
    { value: 'scaling', label: 'Scaling' },
    { value: 'mature', label: 'Mature' }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {isEditing ? 'Edit Venture' : ventureContent.name || 'Venture Details'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <AutosaveStatus 
                status={saveStatus}
                lastSaved={lastSaved}
                onRetry={forceRetry}
              />
              
              <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History ({versions.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Version History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {versions.map(version => (
                      <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={version.status === 'committed' ? 'default' : 'secondary'}>
                              Version {version.version_number}
                            </Badge>
                            <Badge variant="outline">
                              {version.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(version.created_at).toLocaleString()}
                          </p>
                          {version.content.commit_message && (
                            <p className="text-sm mt-1">{version.content.commit_message}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevertToVersion(version.id)}
                        >
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'View' : 'Edit'}
              </Button>

              {hasUnsavedChanges && (
                <Button onClick={handleCommit} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Commit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Venture Name</Label>
                <Input
                  id="name"
                  value={ventureContent.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter venture name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={ventureContent.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe your venture..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Venture Type</Label>
                  <select
                    id="type"
                    value={ventureContent.type || ''}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select type</option>
                    {ventureTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="stage">Current Stage</Label>
                  <select
                    id="stage"
                    value={ventureContent.stage || ''}
                    onChange={(e) => handleFieldChange('stage', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select stage</option>
                    {ventureStages.map(stage => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{ventureContent.name || 'Untitled Venture'}</h3>
                {ventureContent.description && (
                  <p className="text-muted-foreground mt-2">{ventureContent.description}</p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {ventureContent.type && (
                  <Badge variant="secondary">
                    {ventureTypes.find(t => t.value === ventureContent.type)?.label || ventureContent.type}
                  </Badge>
                )}
                {ventureContent.stage && (
                  <Badge variant="outline">
                    {ventureStages.find(s => s.value === ventureContent.stage)?.label || ventureContent.stage}
                  </Badge>
                )}
              </div>

              {Object.keys(ventureContent.metadata || {}).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Additional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(ventureContent.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last saved info */}
          {lastSaved && (
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Last updated: {lastSaved.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VentureWithAutosave;