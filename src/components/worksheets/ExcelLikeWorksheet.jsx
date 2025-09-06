import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Plus, 
  Minus, 
  Calculator,
  FileSpreadsheet,
  X,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorksheets } from '@/hooks/useWorksheets';

const ExcelLikeWorksheet = ({ worksheet, onClose, ventureId }) => {
  const [data, setData] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [formula, setFormula] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { updateWorksheet } = useWorksheets(ventureId);
  const { toast } = useToast();

  // Initialize worksheet data
  useEffect(() => {
    if (worksheet) {
      initializeWorksheetData();
    }
  }, [worksheet]);

  const initializeWorksheetData = () => {
    const inputs = worksheet.inputs || {};
    const outputs = worksheet.outputs || {};
    
    // Create a spreadsheet structure based on worksheet type
    let rows = [];
    
    // Header row
    rows.push(['Field', 'Value', 'Type', 'Formula']);
    
    // Input rows
    if (typeof inputs === 'object' && !Array.isArray(inputs)) {
      Object.entries(inputs).forEach(([key, value]) => {
        rows.push([
          key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value || 0,
          'Input',
          ''
        ]);
      });
    }
    
    // Add a separator row
    rows.push(['--- Calculations ---', '', '', '']);
    
    // Output/calculation rows
    if (typeof outputs === 'object' && !Array.isArray(outputs)) {
      Object.entries(outputs).forEach(([key, value]) => {
        rows.push([
          key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value || 0,
          'Output',
          `=CALCULATE(${key})`
        ]);
      });
    }
    
    // Add some empty rows for user calculations
    for (let i = 0; i < 10; i++) {
      rows.push(['', '', 'User', '']);
    }
    
    setData(rows);
  };

  const getCellValue = (row, col) => {
    return data[row]?.[col] || '';
  };

  const setCellValue = (row, col, value) => {
    const newData = [...data];
    if (!newData[row]) {
      newData[row] = [];
    }
    newData[row][col] = value;
    setData(newData);
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    const cellValue = getCellValue(row, col);
    if (cellValue.toString().startsWith('=')) {
      setFormula(cellValue);
    } else {
      setFormula('');
    }
    setIsEditing(false);
  };

  const handleCellDoubleClick = (row, col) => {
    setIsEditing(true);
    setSelectedCell({ row, col });
  };

  const handleCellChange = (row, col, value) => {
    setCellValue(row, col, value);
    if (row === 0) return; // Don't auto-save header changes
    
    // Auto-save changes
    setTimeout(() => saveWorksheet(), 1000);
  };

  const handleFormulaChange = (value) => {
    setFormula(value);
    setCellValue(selectedCell.row, selectedCell.col, value);
  };

  const addRow = () => {
    const newData = [...data];
    newData.push(['', '', 'User', '']);
    setData(newData);
  };

  const deleteRow = (rowIndex) => {
    if (rowIndex === 0) return; // Don't delete header
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
  };

  const saveWorksheet = async () => {
    try {
      // Convert spreadsheet data back to worksheet format
      const inputs = {};
      const outputs = {};
      
      data.forEach((row, index) => {
        if (index === 0 || !row[0]) return; // Skip header and empty rows
        
        const [field, value, type] = row;
        const key = field.toLowerCase().replace(/\s+/g, '_');
        
        if (type === 'Input') {
          inputs[key] = parseFloat(value) || value;
        } else if (type === 'Output') {
          outputs[key] = parseFloat(value) || value;
        }
      });

      await updateWorksheet(worksheet.id, {
        inputs,
        outputs,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Worksheet Saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculateCell = (row, col) => {
    const formula = getCellValue(row, col);
    if (!formula.toString().startsWith('=')) return;
    
    // Simple calculation logic - in a real app you'd use a proper formula engine
    try {
      const calculation = formula.slice(1); // Remove '='
      // This is a simplified example - you'd implement proper formula parsing
      if (calculation.includes('SUM')) {
        // Example: =SUM(B2:B5)
        const result = 'Calculated Value';
        setCellValue(row, col, result);
      }
    } catch (error) {
      setCellValue(row, col, '#ERROR');
    }
  };

  const exportToCSV = () => {
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet-${worksheet.type}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getColumnLetter = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, etc.
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background w-[95vw] h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">
                {worksheet.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Worksheet
              </h2>
              <p className="text-sm text-muted-foreground">Excel-like spreadsheet interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={saveWorksheet} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={addRow} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="flex items-center gap-2 p-3 border-b bg-muted/20">
          <span className="text-sm font-medium min-w-[60px]">
            {getColumnLetter(selectedCell.col)}{selectedCell.row + 1}
          </span>
          <Input
            value={formula || getCellValue(selectedCell.row, selectedCell.col)}
            onChange={(e) => handleFormulaChange(e.target.value)}
            placeholder="Enter value or formula (=SUM, =CALCULATE, etc.)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                calculateCell(selectedCell.row, selectedCell.col);
                setIsEditing(false);
              }
            }}
          />
          <Button 
            onClick={() => calculateCell(selectedCell.row, selectedCell.col)}
            size="sm"
            variant="outline"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Column Headers */}
            <div className="flex sticky top-0 bg-muted/50 border-b">
              <div className="w-12 h-8 border-r flex items-center justify-center text-xs font-medium">
                #
              </div>
              {['A', 'B', 'C', 'D', 'E', 'F'].map((letter, index) => (
                <div 
                  key={letter} 
                  className="w-32 h-8 border-r flex items-center justify-center text-xs font-medium"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="flex hover:bg-muted/30">
                {/* Row Number */}
                <div className="w-12 h-10 border-r border-b flex items-center justify-center text-xs font-medium bg-muted/20">
                  <span>{rowIndex + 1}</span>
                  {rowIndex > 0 && (
                    <Button
                      onClick={() => deleteRow(rowIndex)}
                      size="sm"
                      variant="ghost"
                      className="ml-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Data Cells */}
                {[0, 1, 2, 3, 4, 5].map((colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-32 h-10 border-r border-b relative ${
                      selectedCell.row === rowIndex && selectedCell.col === colIndex
                        ? 'ring-2 ring-primary bg-primary/5'
                        : ''
                    } ${rowIndex === 0 ? 'bg-muted/40 font-medium' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {isEditing && selectedCell.row === rowIndex && selectedCell.col === colIndex ? (
                      <Input
                        autoFocus
                        value={getCellValue(rowIndex, colIndex)}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditing(false);
                          }
                        }}
                        className="w-full h-full border-0 bg-transparent p-1 text-xs"
                      />
                    ) : (
                      <div className="p-1 text-xs truncate h-full flex items-center">
                        {colIndex === 2 && rowIndex > 0 && (
                          <Badge 
                            variant={
                              getCellValue(rowIndex, colIndex) === 'Input' ? 'default' :
                              getCellValue(rowIndex, colIndex) === 'Output' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {getCellValue(rowIndex, colIndex)}
                          </Badge>
                        )}
                        {colIndex !== 2 && getCellValue(rowIndex, colIndex)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 border-t bg-muted/20 text-xs">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>Rows: {data.length}</span>
            <span>Selected: {getColumnLetter(selectedCell.col)}{selectedCell.row + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            <span>Auto-calculating...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelLikeWorksheet;