import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, History, AlertCircle } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { AutosaveStatus } from '@/components/autosave/AutosaveNotifications';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const WorksheetWithAutosave = ({ 
  worksheet, 
  onUpdate, 
  onCalculate,
  className = "" 
}) => {
  const { toast } = useToast();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Initialize autosave for this worksheet
  const {
    content: worksheetContent,
    setContent: setWorksheetContent,
    saveStatus,
    lastSaved,
    versions,
    commit,
    revertToVersion,
    forceRetry,
    hasUnsavedChanges
  } = useAutosave(
    worksheet.id, 
    'worksheet', 
    {
      inputs: worksheet.inputs || {},
      outputs: worksheet.outputs || {},
      type: worksheet.type,
      metadata: worksheet.metadata || {}
    }
  );

  // Update inputs and trigger autosave
  const handleInputChange = (field, value) => {
    setWorksheetContent(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [field]: value
      }
    }));
  };

  // Calculate worksheet and save results
  const handleCalculate = async () => {
    try {
      const result = await onCalculate(worksheet.id, worksheetContent.inputs);
      if (result.success) {
        setWorksheetContent(prev => ({
          ...prev,
          outputs: result.data.outputs,
          metadata: {
            ...prev.metadata,
            lastCalculated: new Date().toISOString()
          }
        }));
        
        toast({
          title: "Calculation Complete",
          description: "Worksheet results have been updated."
        });
      }
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Commit current version
  const handleCommit = async () => {
    const result = await commit(`Manual save - ${new Date().toLocaleString()}`);
    if (result.success) {
      onUpdate?.(worksheet.id, worksheetContent);
    }
  };

  // Handle version revert
  const handleRevertToVersion = async (versionId) => {
    const result = await revertToVersion(versionId);
    if (result.success) {
      setShowVersionHistory(false);
      onUpdate?.(worksheet.id, worksheetContent);
    }
  };

  // Common input fields based on worksheet type
  const getInputFields = () => {
    switch (worksheet.type) {
      case 'roi':
        return [
          { key: 'initialInvestment', label: 'Initial Investment ($)', type: 'number' },
          { key: 'totalRevenue', label: 'Total Revenue ($)', type: 'number' },
          { key: 'totalExpenses', label: 'Total Expenses ($)', type: 'number' }
        ];
      case 'cashflow':
        return [
          { key: 'monthlyRevenue', label: 'Monthly Revenue ($)', type: 'number' },
          { key: 'monthlyExpenses', label: 'Monthly Expenses ($)', type: 'number' },
          { key: 'periodMonths', label: 'Period (Months)', type: 'number' }
        ];
      case 'breakeven':
        return [
          { key: 'fixedCosts', label: 'Fixed Costs ($)', type: 'number' },
          { key: 'pricePerUnit', label: 'Price per Unit ($)', type: 'number' },
          { key: 'variableCostPerUnit', label: 'Variable Cost per Unit ($)', type: 'number' }
        ];
      case 'unitEconomics':
        return [
          { key: 'revenuePerUnit', label: 'Revenue per Unit ($)', type: 'number' },
          { key: 'costPerUnit', label: 'Cost per Unit ($)', type: 'number' },
          { key: 'lifetimeValue', label: 'Customer LTV ($)', type: 'number' },
          { key: 'acquisitionCost', label: 'Customer Acquisition Cost ($)', type: 'number' }
        ];
      default:
        return [];
    }
  };

  const inputFields = getInputFields();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {worksheet.type.toUpperCase()} Worksheet
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
          {/* Input Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputFields.map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    value={worksheetContent.inputs[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button onClick={handleCalculate} className="w-full md:w-auto">
              <AlertCircle className="h-4 w-4 mr-2" />
              Calculate Results
            </Button>
          </div>

          {/* Output Results */}
          {worksheetContent.outputs && Object.keys(worksheetContent.outputs).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(worksheetContent.outputs).map(([key, value]) => (
                  <Card key={key} className="p-3">
                    <div className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-semibold">
                      {typeof value === 'number' ? 
                        (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('ratio') ? 
                          `${value.toFixed(2)}%` : 
                          `$${value.toLocaleString()}`
                        ) : 
                        value
                      }
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {worksheetContent.metadata?.lastCalculated && (
            <div className="text-xs text-muted-foreground text-center">
              Last calculated: {new Date(worksheetContent.metadata.lastCalculated).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorksheetWithAutosave;