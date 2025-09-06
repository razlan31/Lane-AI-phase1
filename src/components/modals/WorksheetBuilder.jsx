import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { FileSpreadsheet, Calculator, TrendingUp, DollarSign } from 'lucide-react';

const WorksheetBuilder = ({ isOpen, onClose, onCreateWorksheet }) => {
  const [worksheetData, setWorksheetData] = useState({
    name: '',
    type: 'custom',
    description: ''
  });

  const worksheetTypes = [
    {
      id: 'roi',
      name: 'ROI Calculator',
      description: 'Calculate return on investment for projects',
      icon: TrendingUp,
      template: 'roi'
    },
    {
      id: 'cashflow',
      name: 'Cash Flow Tracker',
      description: 'Track money in and money out',
      icon: DollarSign,
      template: 'cashflow'
    },
    {
      id: 'breakeven',
      name: 'Break-Even Analysis',
      description: 'Calculate when you\'ll break even',
      icon: Calculator,
      template: 'breakeven'
    },
    {
      id: 'custom',
      name: 'Custom Worksheet',
      description: 'Build your own calculator',
      icon: FileSpreadsheet,
      template: null
    }
  ];

  const handleCreate = () => {
    if (!worksheetData.name) return;
    
    onCreateWorksheet({
      ...worksheetData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'draft'
    });
    
    // Reset form
    setWorksheetData({
      name: '',
      type: 'custom',
      description: ''
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Worksheet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Worksheet Type Selection */}
          <div>
            <Label className="text-base font-medium">Choose Worksheet Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {worksheetTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      worksheetData.type === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setWorksheetData(prev => ({ ...prev, type: type.id }))}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{type.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Worksheet Name */}
          <div>
            <Label htmlFor="worksheet-name">Worksheet Name</Label>
            <Input
              id="worksheet-name"
              value={worksheetData.name}
              onChange={(e) => setWorksheetData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter worksheet name..."
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="worksheet-description">Description (Optional)</Label>
            <Input
              id="worksheet-description"
              value={worksheetData.description}
              onChange={(e) => setWorksheetData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this worksheet does..."
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!worksheetData.name}
            >
              Create Worksheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorksheetBuilder;