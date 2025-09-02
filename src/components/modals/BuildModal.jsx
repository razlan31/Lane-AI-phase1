import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { 
  MessageCircle, 
  Upload, 
  Gamepad2, 
  Plus,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import GoalChatMode from '../modes/GoalChatMode';
import TemplatesGallery from '../templates/TemplatesGallery';
import PlaygroundMode from '../modes/PlaygroundMode';

const BuildModal = ({ 
  isOpen, 
  onClose, 
  onCreateVenture,
  onImportCsv,
  onSelectTemplate,
  onPromoteFromPlayground 
}) => {
  const [activeTab, setActiveTab] = useState('chat');

  const handleChatBuildComplete = (ventureData) => {
    if (onCreateVenture) {
      onCreateVenture(ventureData);
    }
    onClose();
  };

  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    onClose();
  };

  const handlePlaygroundPromote = (canvasData) => {
    if (onPromoteFromPlayground) {
      onPromoteFromPlayground(canvasData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Build New Venture</DialogTitle>
          <DialogDescription>
            Choose how you want to start building your new venture
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Build
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import/Seed
            </TabsTrigger>
            <TabsTrigger value="playground" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Playground
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            {/* Chat Build Tab */}
            <TabsContent value="chat" className="mt-0 h-full">
              <div className="space-y-6">
                <div className="text-center py-8">
                  <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Chat-Guided Builder</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Tell me about your business goals and I'll create a custom workspace with the right tools and templates.
                  </p>
                  
                  <div className="max-w-2xl mx-auto">
                    <GoalChatMode 
                      onComplete={handleChatBuildComplete}
                      embedded={true}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Import/Seed Tab */}
            <TabsContent value="import" className="mt-0 h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CSV Import */}
                  <div className="border border-border rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Import Your Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a CSV file and map your data to create worksheets
                    </p>
                    <Button onClick={onImportCsv} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>
                  </div>

                  {/* Quick Start Templates */}
                  <div className="border border-border rounded-lg p-6 text-center">
                    <FileSpreadsheet className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Use Templates</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start with pre-built templates for common business scenarios
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab('templates')} className="w-full">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                </div>

                {/* Templates Gallery (Hidden tab content) */}
                {activeTab === 'templates' && (
                  <div className="mt-6">
                    <TemplatesGallery 
                      onSelectTemplate={handleTemplateSelect}
                      embedded={true}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Playground Tab */}
            <TabsContent value="playground" className="mt-0 h-full">
              <div className="space-y-6">
                <div className="text-center py-4">
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Freeform Canvas</h3>
                  <p className="text-muted-foreground mb-6">
                    Drag and drop components to build your custom workspace
                  </p>
                </div>
                
                <div className="border border-border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <PlaygroundMode 
                    onPromoteToWorkspace={handlePlaygroundPromote}
                    embedded={true}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuildModal;