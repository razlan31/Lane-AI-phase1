import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Clock, FileText, BarChart3, Calculator, MessageSquare, Plus, Workflow } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useBlocks } from '@/hooks/useBlocks';
import { QuickNoteModal } from '@/components/notes/QuickNoteModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [blockKpis, setBlockKpis] = useState([]);
  const [blockWorksheets, setBlockWorksheets] = useState([]);
  const [blockDependencies, setBlockDependencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notes } = useNotes('block', block.id);
  const { generateWorksheetFromBlocks, getBlockDependencies } = useBlocks();
  const { toast } = useToast();

  // Fetch related data when modal opens
  useEffect(() => {
    if (isOpen && block?.id) {
      fetchBlockData();
    }
  }, [isOpen, block?.id]);

  const fetchBlockData = async () => {
    if (!block?.id) return;
    
    setLoading(true);
    try {
      // Fetch KPIs related to this block
      const { data: kpis } = await supabase
        .from('kpis')
        .select('*')
        .eq('venture_id', block.venture_id)
        .ilike('name', `%${block.name}%`)
        .order('created_at', { ascending: false });

      setBlockKpis(kpis || []);

      // Fetch worksheets that reference this block
      const { data: worksheets } = await supabase
        .from('worksheets')
        .select('*')
        .contains('inputs', { blocks: [{ id: block.id }] })
        .order('created_at', { ascending: false });

      setBlockWorksheets(worksheets || []);

      // Fetch block dependencies
      const dependencies = await getBlockDependencies(block.id);
      setBlockDependencies(dependencies || []);

    } catch (error) {
      console.error('Error fetching block data:', error);
      toast({
        title: "Error",
        description: "Failed to load block data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(block.id, newStatus);
    toast({
      title: "Status Updated",
      description: `Block status changed to ${newStatus}`,
    });
  };

  const handleGenerateWorksheet = async () => {
    try {
      setLoading(true);
      const result = await generateWorksheetFromBlocks([block.id], block.venture_id);
      
      if (result) {
        toast({
          title: "Worksheet Generated",
          description: `Created worksheet from ${block.name}`,
        });
        fetchBlockData(); // Refresh to show new worksheet
      } else {
        toast({
          title: "Generation Failed",
          description: "Could not generate worksheet from this block.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating worksheet:', error);
      toast({
        title: "Error",
        description: "Failed to generate worksheet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

            {/* Linked Content Tabs - ENHANCED */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes ({notes.length})
                </TabsTrigger>
                <TabsTrigger value="kpis" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  KPIs ({blockKpis.length})
                </TabsTrigger>
                <TabsTrigger value="worksheets" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Worksheets ({blockWorksheets.length})
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  Dependencies ({blockDependencies.length})
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Related KPIs</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Link KPI
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading KPIs...</div>
                  ) : blockKpis.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No KPIs linked to this block yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blockKpis.map(kpi => (
                        <div key={kpi.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{kpi.name}</h4>
                              <p className="text-2xl font-bold text-primary mt-1">{kpi.value}</p>
                            </div>
                            <Badge variant="outline">{kpi.confidence_level}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {new Date(kpi.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="worksheets" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Related Worksheets</h3>
                    <Button 
                      size="sm" 
                      onClick={handleGenerateWorksheet}
                      disabled={loading}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      {loading ? 'Generating...' : 'Generate Worksheet'}
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading worksheets...</div>
                  ) : blockWorksheets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No worksheets created from this block yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blockWorksheets.map(worksheet => (
                        <div key={worksheet.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{worksheet.type.replace('_', ' ')}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {worksheet.outputs?.summary || 'No summary available'}
                              </p>
                            </div>
                            <Badge variant="outline">{worksheet.confidence_level}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {new Date(worksheet.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dependencies" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Block Dependencies</h3>
                    <Button size="sm" variant="outline">
                      <Workflow className="h-4 w-4 mr-1" />
                      View Graph
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading dependencies...</div>
                  ) : blockDependencies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No dependencies defined for this block.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blockDependencies.map(dep => (
                        <div key={dep.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{dep.dependent_block_id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Type: {dep.dependency_type}
                              </p>
                            </div>
                            <Badge variant="outline">Strength: {dep.strength}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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