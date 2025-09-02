import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Download, FileText, Table, Image, Mail, Lock } from 'lucide-react';
import LockWrapper from '../primitives/LockWrapper';

const ExportModal = ({ isOpen, onClose, data = {} }) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      description: 'Compatible with Excel, Google Sheets',
      icon: Table,
      available: true
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional formatted report',
      icon: FileText,
      available: false,
      requiresPlan: 'pro'
    },
    {
      id: 'image',
      name: 'PNG Image',
      description: 'Dashboard screenshot',
      icon: Image,
      available: false,
      requiresPlan: 'founders'
    },
    {
      id: 'email',
      name: 'Email Report',
      description: 'Send to stakeholders',
      icon: Mail,
      available: false,
      requiresPlan: 'pro'
    }
  ];

  const handleExport = async () => {
    if (!exportFormats.find(f => f.id === selectedFormat)?.available) {
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedFormat === 'csv') {
        // Generate CSV data
        const csvData = generateCSV(data);
        downloadCSV(csvData, `laneai-export-${Date.now()}.csv`);
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data) => {
    // Generate sample CSV data based on available data
    const headers = ['Metric', 'Value', 'Unit', 'Trend', 'Status'];
    const rows = [
      ['Runway', '12', 'months', '+8.2%', 'Warning'],
      ['Monthly Cashflow', '-$5,400', 'currency', '-15.3%', 'Alert'],
      ['Obligations', '$12,850', 'currency', '+3.1%', 'Live'],
      ['Revenue Growth', '23.5%', 'percentage', '+12.1%', 'Live'],
      ['Customer Acquisition', '142', 'number', '+18.7%', 'Live'],
      ['Burn Rate', '$8,750', 'currency', '+5.2%', 'Warning']
    ];

    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csv;
  };

  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="font-medium mb-3">Choose export format</h3>
            <div className="space-y-2">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                const content = (
                  <Card
                    key={format.id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-all border-2 ${
                      selectedFormat === format.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    } ${!format.available ? 'opacity-60' : ''}`}
                    onClick={() => format.available && setSelectedFormat(format.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {format.name}
                          {!format.available && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                    </div>
                  </Card>
                );

                if (!format.available && format.requiresPlan) {
                  return (
                    <LockWrapper 
                      key={format.id}
                      feature={`export_${format.id}`}
                      requiredTier={format.requiresPlan}
                      showTooltip={true}
                    >
                      {content}
                    </LockWrapper>
                  );
                }

                return content;
              })}
            </div>
          </div>

          {/* Export Options */}
          {selectedFormat === 'csv' && (
            <div className="space-y-3">
              <h3 className="font-medium">Export options</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include trends and calculations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include timestamps</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Include raw data only</span>
                </label>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="text-xs text-muted-foreground">
              {selectedFormat === 'csv' && 'Spreadsheet with 6 KPIs and trend data'}
              {selectedFormat === 'pdf' && 'Professional report with charts and analysis'}
              {selectedFormat === 'image' && 'High-resolution dashboard screenshot'}
              {selectedFormat === 'email' && 'Formatted report sent to specified recipients'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !exportFormats.find(f => f.id === selectedFormat)?.available}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;