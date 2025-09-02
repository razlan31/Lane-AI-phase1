import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Clock, FileText, BarChart3, Calculator, MessageSquare, Plus, Workflow } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useBlocks } from '@/hooks/useBlocks';
import { QuickNoteModal } from '@/components/notes/QuickNoteModal';

const STATUS_ICONS = {
  'planned': Circle,
  'in-progress': Clock,
  'complete': CheckCircle2
};

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned', icon: Circle },
  { value: 'in-progress', label: 'In Progress', icon: Clock },
  { value: 'complete', label: 'Complete', icon: CheckCircle2 }
];

export const BlockDetailModal = ({ block, isOpen, onClose, onStatusChange }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const { notes } = useNotes('block', block.id);
  const { generateWorksheetFromBlocks, getBlockDependencies } = useBlocks();

  const handleStatusChange = (newStatus) => {
    onStatusChange(block.id, newStatus);
  };

  const handleGenerateWorksheet = async () => {
    await generateWorksheetFromBlocks([block.id], block.venture_id);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{block.name}</span>
              <Badge variant="secondary">{block.category}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const isActive = block.status === option.value;
                  
                  return (
                    <Button
                      key={option.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(option.value)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{block.description}</p>
            </div>

            {/* Tags */}
            {block.tags && block.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {block.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateWorksheet}
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Generate Worksheet
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Venture
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Workflow className="w-4 h-4" />
                View Dependencies
              </Button>
            </div>

            {/* Linked Content Tabs */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes ({notes.length})
                </TabsTrigger>
                <TabsTrigger value="kpis" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  KPIs (0)
                </TabsTrigger>
                <TabsTrigger value="worksheets" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Worksheets (0)
                </TabsTrigger>
                <TabsTrigger value="decisions" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Decisions (0)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Block Notes</h3>
                    <Button 
                      size="sm" 
                      onClick={() => setShowNoteModal(true)}
                    >
                      Add Note
                    </Button>
                  </div>
                  
                  {notes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No notes yet. Add your first note to track progress and insights.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-2">
                            {new Date(note.created_at).toLocaleDateString()}
                          </div>
                          <div className="whitespace-pre-wrap">{note.content}</div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {note.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="kpis" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  KPI linking coming soon...
                </div>
              </TabsContent>

              <TabsContent value="worksheets" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  Worksheet linking coming soon...
                </div>
              </TabsContent>

              <TabsContent value="decisions" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  Decision tracking coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        contextType="block"
        contextId={block.id}
        defaultContent={`Note for ${block.name}:\n\n`}
      />
    </>
  );
};