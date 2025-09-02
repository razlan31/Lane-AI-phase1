import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const CsvMappingModal = ({ isOpen, csvData, onClose, onMappingComplete }) => {
  const [mappings, setMappings] = useState({});

  const worksheetFields = [
    { id: 'date', label: 'Date', required: true },
    { id: 'description', label: 'Description', required: true },
    { id: 'amount', label: 'Amount', required: true },
    { id: 'category', label: 'Category', required: false }
  ];

  const handleMapping = (fieldId, headerIndex) => {
    setMappings(prev => ({
      ...prev,
      [fieldId]: headerIndex
    }));
  };

  const handleCreateWorksheet = () => {
    if (!csvData || !onMappingComplete) return;

    // Create mapped worksheet data
    const mappedData = {
      name: 'Imported Cashflow',
      type: 'cashflow',
      source: 'csv_import',
      filename: csvData.filename,
      mappings,
      data: csvData.rows.map(row => {
        const mappedRow = {};
        Object.entries(mappings).forEach(([fieldId, headerIndex]) => {
          mappedRow[fieldId] = row[headerIndex];
        });
        return mappedRow;
      }),
      status: 'draft'
    };

    onMappingComplete(mappedData);
    setMappings({});
    onClose();
  };

  const isValidMapping = () => {
    const requiredFields = worksheetFields.filter(f => f.required);
    return requiredFields.every(field => mappings[field.id] !== undefined);
  };

  if (!csvData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Map columns to fields</DialogTitle>
          <DialogDescription>
            Drag a CSV column to a field. You can edit field labels later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSV Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Preview: {csvData.filename}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {csvData.headers.map((header, index) => (
                        <th key={index} className="text-left p-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-muted-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.rows.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing 3 of {csvData.rows.length} rows
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mapping Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV Columns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Columns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {csvData.headers.map((header, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                    }}
                  >
                    <span className="font-medium">{header}</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      Sample: {csvData.rows[0]?.[index] || 'N/A'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Worksheet Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Worksheet Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {worksheetFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-3 border rounded-lg min-h-[60px] transition-colors"
                    style={{
                      backgroundColor: mappings[field.id] !== undefined ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                      borderColor: mappings[field.id] !== undefined ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const headerIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      handleMapping(field.id, headerIndex);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      {mappings[field.id] !== undefined && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {mappings[field.id] !== undefined ? (
                      <div className="text-xs text-muted-foreground mt-1">
                        Mapped to: {csvData.headers[mappings[field.id]]}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">
                        Drop CSV column here
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview mapped data */}
          {Object.keys(mappings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {worksheetFields.map((field) => (
                          mappings[field.id] !== undefined && (
                            <th key={field.id} className="text-left p-2 font-medium">
                              {field.label}
                            </th>
                          )
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.rows.slice(0, 2).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {worksheetFields.map((field) => (
                            mappings[field.id] !== undefined && (
                              <td key={field.id} className="p-2 text-muted-foreground">
                                {row[mappings[field.id]]}
                              </td>
                            )
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorksheet}
              disabled={!isValidMapping()}
            >
              Create Worksheet
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvMappingModal;