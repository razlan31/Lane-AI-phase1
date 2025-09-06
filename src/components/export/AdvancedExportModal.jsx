import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Download, 
  FileText, 
  Table, 
  Image, 
  Mail, 
  Share2,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AdvancedExportModal({ isOpen, onClose, data, className }) {
  const [activeTab, setActiveTab] = useState('formats');
  const [selectedFormats, setSelectedFormats] = useState(['pdf']);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeData: true,
    includeMetadata: true,
    dateRange: 'all',
    quality: 'high',
    template: 'professional',
    branding: true,
    watermark: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState([
    {
      id: 1,
      format: 'PDF',
      name: 'Q4-Financial-Report.pdf',
      size: '2.4 MB',
      created: '2024-01-15 14:30',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 2,
      format: 'Excel',
      name: 'Cashflow-Analysis.xlsx',
      size: '856 KB',
      created: '2024-01-14 09:15',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 3,
      format: 'PowerPoint',
      name: 'Executive-Summary.pptx',
      size: '4.1 MB',
      created: '2024-01-12 16:45',
      status: 'completed',
      downloadUrl: '#'
    }
  ]);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional PDF with charts and analysis',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      features: ['Charts & Graphs', 'Professional Layout', 'Print Ready', 'Password Protection'],
      size: '~2-5 MB',
      estimatedTime: '30-60 seconds'
    },
    {
      id: 'excel',
      name: 'Excel Workbook',
      description: 'Interactive spreadsheet with formulas and data',
      icon: Table,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      features: ['Live Formulas', 'Multiple Sheets', 'Pivot Tables', 'Data Validation'],
      size: '~500KB-2MB',
      estimatedTime: '15-30 seconds'
    },
    {
      id: 'pptx',
      name: 'PowerPoint',
      description: 'Presentation slides with key insights',
      icon: Image,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      features: ['Executive Summary', 'Key Metrics', 'Visual Charts', 'Speaker Notes'],
      size: '~3-8 MB',
      estimatedTime: '45-90 seconds'
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Raw data export for further analysis',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      features: ['Raw Data', 'Universal Format', 'Small Size', 'Quick Export'],
      size: '~50-500KB',
      estimatedTime: '5-10 seconds'
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Structured data for API integration',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      features: ['Structured Format', 'API Ready', 'Metadata Included', 'Lightweight'],
      size: '~10-100KB',
      estimatedTime: '2-5 seconds'
    },
    {
      id: 'email',
      name: 'Email Report',
      description: 'Send formatted report via email',
      icon: Mail,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      features: ['Auto Delivery', 'Custom Recipients', 'Scheduled Sending', 'HTML Format'],
      size: 'Email size',
      estimatedTime: 'Immediate'
    }
  ];

  const templates = [
    { id: 'professional', name: 'Professional', description: 'Clean corporate design' },
    { id: 'modern', name: 'Modern', description: 'Contemporary minimalist style' },
    { id: 'executive', name: 'Executive', description: 'High-level summary format' },
    { id: 'detailed', name: 'Detailed', description: 'Comprehensive analysis format' }
  ];

  const handleFormatToggle = (formatId) => {
    setSelectedFormats(prev => 
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate file generation for each format
      const newExports = selectedFormats.map(formatId => {
        const format = exportFormats.find(f => f.id === formatId);
        return {
          id: Date.now() + Math.random(),
          format: format.name,
          name: `Export-${Date.now()}.${formatId}`,
          size: format.size,
          created: new Date().toLocaleString(),
          status: 'completed',
          downloadUrl: '#'
        };
      });

      setExportHistory(prev => [...newExports, ...prev]);
      
      // Auto-download if single format
      if (selectedFormats.length === 1) {
        console.log('Auto-downloading:', selectedFormats[0]);
      }

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDownload = (exportItem) => {
    console.log('Downloading:', exportItem);
    // In a real app, this would trigger the actual download
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-6xl h-[90vh] flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Advanced Export & Sharing
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Export your data in multiple formats with professional formatting
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="formats">Export Formats</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="history">Export History</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="formats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormats.includes(format.id);
                  
                  return (
                    <Card 
                      key={format.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover-lift",
                        isSelected && "ring-2 ring-primary bg-primary/5"
                      )}
                      onClick={() => handleFormatToggle(format.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={cn("p-3 rounded-lg", format.bgColor)}>
                            <Icon className={cn("h-6 w-6", format.color)} />
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{format.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {format.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {format.features.map(feature => (
                            <div key={feature} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Size:</span>
                            <span>{format.size}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Time:</span>
                            <span>{format.estimatedTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {selectedFormats.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Files will be generated and available for download
                    </p>
                  </div>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting || selectedFormats.length === 0}
                    className="min-w-[120px]"
                  >
                    {isExporting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isExporting && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Export Progress</span>
                        <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        Generating {selectedFormats.length} file{selectedFormats.length > 1 ? 's' : ''}...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="options" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Charts & Graphs</span>
                      <input 
                        type="checkbox" 
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev, 
                          includeCharts: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Raw Data</span>
                      <input 
                        type="checkbox" 
                        checked={exportOptions.includeData}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev, 
                          includeData: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Metadata</span>
                      <input 
                        type="checkbox" 
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev, 
                          includeMetadata: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Presentation Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template</label>
                      <select 
                        value={exportOptions.template}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev, 
                          template: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                      >
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} - {template.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Quality</label>
                      <select 
                        value={exportOptions.quality}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev, 
                          quality: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                      >
                        <option value="low">Low (Faster)</option>
                        <option value="medium">Medium</option>
                        <option value="high">High (Recommended)</option>
                        <option value="ultra">Ultra (Slower)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Exports</h3>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="space-y-3">
                {exportHistory.map((item) => (
                  <Card key={item.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{item.format}</span>
                              <span>{item.size}</span>
                              <span>{item.created}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={item.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled Exports
                  </CardTitle>
                  <CardDescription>
                    Automatically generate and send reports on a schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Scheduled exports coming soon</p>
                    <p className="text-sm">Set up recurring reports and automated delivery</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AdvancedExportModal;