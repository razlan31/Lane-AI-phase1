import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';

const CsvUploadModal = ({ isOpen, onClose, onFileUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleUpload = async () => {
    if (selectedFile && onFileUploaded) {
      try {
        // Read the actual CSV file
        const text = await selectedFile.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          alert('The CSV file appears to be empty.');
          return;
        }
        
        // Parse CSV (simple comma-separated parsing)
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        ).filter(row => row.length === headers.length);
        
        const csvData = {
          filename: selectedFile.name,
          headers: headers,
          rows: rows,
          totalRows: rows.length,
          fileSize: selectedFile.size
        };
        
        console.log('Parsed CSV data:', csvData);
        onFileUploaded(csvData);
        setSelectedFile(null);
        onClose();
        
      } catch (error) {
        console.error('Error reading CSV file:', error);
        alert('Error reading the CSV file. Please make sure it\'s a valid CSV format.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file. Map columns to fields. Preview before creating.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <Card
              className={`border-2 border-dashed transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-2">Drop your CSV file here</p>
                <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile}
            >
              Upload & Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvUploadModal;