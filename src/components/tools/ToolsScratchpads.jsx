import { useState } from 'react';
import { 
  Calculator, 
  FileSpreadsheet, 
  Plus, 
  ArrowRight,
  Wrench,
  Zap,
  Archive
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import WorksheetRenderer from '../worksheets/WorksheetRenderer';
import CleanScratchpadPanel from '../scratchpad/CleanScratchpadPanel';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';

const ToolsScratchpads = ({ 
  onPromoteToWorkspace,
  ventures = []
}) => {
  const [activeTab, setActiveTab] = useState('scratchpads');
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);

  // Custom scratchpad worksheets
  const scratchpadWorksheets = [
    {
      id: 'scratch-1',
      name: 'Loan Calculator',
      type: 'custom',
      description: 'Calculate loan payments and interest',
      state: 'draft',
      createdAt: new Date('2024-01-15'),
      lastModified: new Date('2024-01-20')
    },
    {
      id: 'scratch-2', 
      name: 'Investment Portfolio',
      type: 'custom',
      description: 'Track investment returns and allocation',
      state: 'draft',
      createdAt: new Date('2024-01-10'),
      lastModified: new Date('2024-01-22')
    },
    {
      id: 'scratch-3',
      name: 'Customer LTV Model',
      type: 'custom', 
      description: 'Calculate customer lifetime value',
      state: 'draft',
      createdAt: new Date('2024-01-12'),
      lastModified: new Date('2024-01-18')
    }
  ];

  // Quick calculator templates
  const quickTemplates = [
    {
      id: 'template-roi',
      name: 'ROI Calculator',
      description: 'Quick return on investment calculation',
      icon: Calculator
    },
    {
      id: 'template-loan',
      name: 'Loan Calculator', 
      description: 'Monthly payment and interest calculations',
      icon: Calculator
    },
    {
      id: 'template-budget',
      name: 'Personal Budget',
      description: 'Income and expense tracking',
      icon: FileSpreadsheet
    },
    {
      id: 'template-savings',
      name: 'Savings Goal',
      description: 'Track progress toward financial goals',
      icon: Calculator
    }
  ];

  const handleCreateTemplate = (templateId) => {
    console.log('Creating worksheet from template:', templateId);
    // Create new scratchpad worksheet from template
  };

  const handleOpenWorksheet = (worksheet) => {
    setSelectedWorksheet(worksheet);
  };

  const handlePromoteWorksheet = (worksheetId, targetVentureId) => {
    if (onPromoteToWorkspace) {
      onPromoteToWorkspace(worksheetId, targetVentureId);
    }
    setShowPromoteModal(false);
    console.log(`Promoted worksheet ${worksheetId} to venture ${targetVentureId}`);
  };

  const PromoteModal = ({ worksheet, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote to Workspace</DialogTitle>
          <DialogDescription>
            Move this scratchpad to a venture workspace where it will become a permanent worksheet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Move "{worksheet?.name}" from scratchpads to a venture workspace.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Target Venture:</label>
            <select className="w-full rounded border border-border px-3 py-2 bg-background">
              <option value="">Choose venture...</option>
              {ventures.map(venture => (
                <option key={venture.id} value={venture.id}>{venture.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => handlePromoteWorksheet(worksheet?.id, 1)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Promote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              Tools & Scratchpads
            </h1>
            <p className="text-sm text-muted-foreground">
              Sandbox for experiments and custom calculators
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archive Old
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 mx-6 mt-4">
            <TabsTrigger value="scratchpads" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              My Scratchpads
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Templates
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            {/* Scratchpads Tab */}
            <TabsContent value="scratchpads" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Your Scratchpads</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom worksheets and experiments
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowScratchpad(true)}>
                    Open Notepad
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Scratchpad
                  </Button>
                </div>
              </div>

              {/* Scratchpad List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {scratchpadWorksheets.map((worksheet) => (
                  <div 
                    key={worksheet.id} 
                    className="border border-border rounded-lg p-4 space-y-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{worksheet.name}</h4>
                        <p className="text-sm text-muted-foreground">{worksheet.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Modified {worksheet.lastModified.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {worksheet.state === 'draft' ? 'Draft' : 'Live'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenWorksheet(worksheet)}
                      >
                        Open
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPromoteModal(true)}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {scratchpadWorksheets.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No scratchpads yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create custom calculators and experiment with ideas
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Scratchpad
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-medium">Quick Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Ready-to-use calculator templates for common tasks
                </p>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div 
                      key={template.id}
                      className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleCreateTemplate(template.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="h-4 w-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Promote Modal */}
      <PromoteModal 
        worksheet={selectedWorksheet}
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
      />

      {/* Worksheet Renderer Modal */}
      {selectedWorksheet && (
        <Dialog open={!!selectedWorksheet} onOpenChange={() => setSelectedWorksheet(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedWorksheet?.name}</DialogTitle>
              <DialogDescription>
                Edit your scratchpad worksheet. Changes are automatically saved.
              </DialogDescription>
            </DialogHeader>
            <WorksheetRenderer 
              worksheetId={selectedWorksheet.id}
              onSave={() => console.log('Save worksheet')}
              onClose={() => setSelectedWorksheet(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Clean Scratchpad Panel */}
      <CleanScratchpadPanel 
        isOpen={showScratchpad} 
        onClose={() => setShowScratchpad(false)} 
      />
    </div>
  );
};

export default ToolsScratchpads;