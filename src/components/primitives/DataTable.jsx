import React, { useState } from 'react';
import { Edit3, Save, X, Eye, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const DataTable = ({ 
  data = [], 
  columns = [], 
  editable = false,
  mode = 'live', // 'draft' | 'live'
  onSave,
  onEdit,
  className 
}) => {
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleEdit = (rowIndex) => {
    setEditingRow(rowIndex);
    setEditedData(data[rowIndex] || {});
  };

  const handleSave = (rowIndex) => {
    if (onSave) {
      onSave(rowIndex, editedData);
    }
    setEditingRow(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleCellChange = (key, value) => {
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getModeClasses = () => {
    switch (mode) {
      case 'draft':
        return 'border-l-4 border-l-draft bg-blue-50/30';
      case 'live':
        return 'border-l-4 border-l-live bg-green-50/30';
      default:
        return 'border border-border';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'draft':
        return <FileText className="h-4 w-4 text-draft" />;
      case 'live':
        return <Eye className="h-4 w-4 text-live" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode indicator */}
      <div className="flex items-center gap-2">
        {getModeIcon()}
        <span className={cn(
          "text-sm font-medium",
          mode === 'draft' ? 'text-draft' : 'text-live'
        )}>
          {mode === 'draft' ? 'Draft Mode' : 'Live Mode'}
        </span>
      </div>

      {/* Table */}
      <div className={cn(
        "rounded-lg overflow-hidden",
        getModeClasses()
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  >
                    {column.header}
                  </th>
                ))}
                {editable && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-background">
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      {editingRow === rowIndex && column.editable ? (
                        <input
                          type={column.type || 'text'}
                          value={editedData[column.key] || ''}
                          onChange={(e) => handleCellChange(column.key, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <span className="text-sm">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                  {editable && (
                    <td className="px-4 py-3">
                      {editingRow === rowIndex ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSave(rowIndex)}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(rowIndex)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;