import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, User } from 'lucide-react';

export const PersonalFieldModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  existingFields = [] 
}) => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('number');
  const [defaultValue, setDefaultValue] = useState('');
  const [description, setDescription] = useState('');

  const fieldTypes = [
    { value: 'number', label: 'Number' },
    { value: 'currency', label: 'Currency ($)' },
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'text', label: 'Text' },
    { value: 'date', label: 'Date' }
  ];

  const suggestedFields = [
    { name: 'Health Score', type: 'number', description: 'Personal wellness rating (1-10)' },
    { name: 'Side Hustle Revenue', type: 'currency', description: 'Monthly income from side projects' },
    { name: 'Investment Portfolio', type: 'currency', description: 'Total investment value' },
    { name: 'Fitness Goal Progress', type: 'percentage', description: 'Progress towards fitness targets' },
    { name: 'Skill Development Hours', type: 'number', description: 'Weekly hours spent learning' },
    { name: 'Debt Balance', type: 'currency', description: 'Total outstanding debt' },
    { name: 'Emergency Fund', type: 'currency', description: 'Emergency savings amount' },
    { name: 'Monthly Subscriptions', type: 'currency', description: 'Total subscription costs' }
  ];

  const handleSave = () => {
    if (!fieldName.trim()) return;

    const newField = {
      name: fieldName.trim(),
      type: fieldType,
      value: defaultValue,
      description: description.trim(),
      created_at: new Date().toISOString()
    };

    onSave(newField);
    
    // Reset form
    setFieldName('');
    setFieldType('number');
    setDefaultValue('');
    setDescription('');
    onClose();
  };

  const handleSuggestionSelect = (suggestion) => {
    setFieldName(suggestion.name);
    setFieldType(suggestion.type);
    setDescription(suggestion.description);
    setDefaultValue('');
  };

  const isFieldExists = existingFields.some(field => 
    field.name.toLowerCase() === fieldName.toLowerCase()
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add Personal Metric
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Suggested Fields */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Popular Metrics
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedFields.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="justify-start h-auto p-3 text-left"
                  disabled={existingFields.some(f => 
                    f.name.toLowerCase() === suggestion.name.toLowerCase()
                  )}
                >
                  <div>
                    <div className="font-medium text-sm">{suggestion.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-medium mb-4 block">
              Custom Field
            </Label>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g., Monthly Reading Goal"
                    className={`mt-1 ${isFieldExists ? 'border-destructive' : ''}`}
                  />
                  {isFieldExists && (
                    <div className="text-xs text-destructive mt-1">
                      A field with this name already exists
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <select
                    id="field-type"
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="field-description">Description (Optional)</Label>
                <Input
                  id="field-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this tracks"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="default-value">Default Value (Optional)</Label>
                <Input
                  id="default-value"
                  type={fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage' ? 'number' : 'text'}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Starting value"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {fieldName && (
            <div>
              <Label className="text-base font-medium mb-2 block">Preview</Label>
              <Card className="p-4 bg-muted/50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{fieldName}</Label>
                  <div className="h-9 px-3 bg-background border rounded flex items-center text-sm text-muted-foreground">
                    {defaultValue || `Enter ${fieldType}...`}
                  </div>
                  {description && (
                    <div className="text-xs text-muted-foreground">
                      {description}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!fieldName.trim() || isFieldExists}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalFieldModal;