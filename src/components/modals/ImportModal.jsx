import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Upload, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import ImportEngine from '../../utils/importEngine';

const ImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validation, setValidation] = useState(null);
  const [mergeStrategy, setMergeStrategy] = useState('skip');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = async (selectedFile) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.json', '.csv'];
    
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JSON or CSV file",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    
    // Validate file
    try {
      const validation = await ImportEngine.importData(selectedFile, { validateOnly: true });
      setValidation(validation);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "File Validation Failed",
        description: error.message,
        variant: "destructive"
      });
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    
    try {
      const result = await ImportEngine.importData(file, { 
        mergeStrategy,
        validateOnly: false 
      });
      
      toast({
        title: "Import Complete",
        description: `Successfully imported data with ${JSON.stringify(result.results)}`,
      });
      
      onImportComplete?.(result);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred during import",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setValidation(null);
    setShowPreview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!file ? (
            // File Upload Area
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Import your data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: JSON, CSV (max 10MB)
              </p>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input').click()}
              >
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".json,.csv"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            // File Preview and Options
            <div className="space-y-4">
              {/* File Info */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetImport}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Validation Results */}
              {validation && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {validation.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <h3 className="font-medium">
                      {validation.valid ? 'File Validated Successfully' : 'Validation Issues'}
                    </h3>
                  </div>
                  
                  {validation.preview && (
                    <div className="text-sm space-y-1">
                      {validation.preview.ventures && (
                        <div>• {validation.preview.ventures} ventures</div>
                      )}
                      {validation.preview.kpis && (
                        <div>• {validation.preview.kpis} KPIs</div>
                      )}
                      {validation.preview.worksheets && (
                        <div>• {validation.preview.worksheets} worksheets</div>
                      )}
                      {validation.preview.hasPersonalData && (
                        <div>• Personal data included</div>
                      )}
                      {validation.preview.rowCount && (
                        <div>• {validation.preview.rowCount} rows to import</div>
                      )}
                    </div>
                  )}

                  {validation.conflicts && validation.conflicts.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                      <div className="text-sm font-medium text-amber-800 mb-1">
                        Conflicts Detected:
                      </div>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {validation.conflicts.map((conflict, index) => (
                          <li key={index}>
                            • {conflict.type}: "{conflict.name}" {conflict.action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Import Options */}
              {validation?.valid && (
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Import Options</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">
                        What to do with existing data:
                      </label>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="skip"
                            checked={mergeStrategy === 'skip'}
                            onChange={(e) => setMergeStrategy(e.target.value)}
                            className="rounded"
                          />
                          <span className="text-sm">Skip duplicates (keep existing)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="overwrite"
                            checked={mergeStrategy === 'overwrite'}
                            onChange={(e) => setMergeStrategy(e.target.value)}
                            className="rounded"
                          />
                          <span className="text-sm">Overwrite duplicates (replace with imported)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {file && validation?.valid && (
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;