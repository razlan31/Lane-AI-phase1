import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { formulaEngine } from '../../utils/formulaEngine';
import { Plus, Trash2, Calculator, AlertCircle } from 'lucide-react';

export const WorksheetBuilder = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  className 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fields, setFields] = useState(initialData?.fields || [
    { name: 'Revenue', type: 'number', value: '', formula: '' },
    { name: 'Costs', type: 'number', value: '', formula: '' },
    { name: 'Profit', type: 'calculated', value: '', formula: 'REVENUE - COSTS' }
  ]);
  const [errors, setErrors] = useState({});

  const fieldTypes = [
    { value: 'number', label: 'Number Input' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'calculated', label: 'Calculated Field' },
    { value: 'text', label: 'Text' }
  ];

  const addField = () => {
    setFields(prev => [...prev, { 
      name: `Field ${prev.length + 1}`, 
      type: 'number', 
      value: '', 
      formula: '' 
    }]);
  };

  const removeField = (index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    setFields(prev => prev.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ));

    // Validate formula if it's a calculated field
    if (key === 'formula') {
      validateFormula(index, value);
    }
  };

  const validateFormula = (index, formula) => {
    if (!formula) {
      setErrors(prev => ({ ...prev, [`formula_${index}`]: null }));
      return;
    }

    const availableFields = fields
      .filter((_, i) => i !== index)
      .map(f => f.name.toUpperCase().replace(/\s+/g, '_'));

    const validation = formulaEngine.validateFieldFormula(formula, availableFields);
    
    if (!validation.valid) {
      setErrors(prev => ({ 
        ...prev, 
        [`formula_${index}`]: validation.error 
      }));
    } else {
      setErrors(prev => ({ ...prev, [`formula_${index}`]: null }));
    }
  };

  const handleSave = () => {
    // Validate all formulas before saving
    let hasErrors = false;
    const availableFields = fields.map(f => f.name.toUpperCase().replace(/\s+/g, '_'));

    fields.forEach((field, index) => {
      if (field.type === 'calculated' && field.formula) {
        const validation = formulaEngine.validateFieldFormula(
          field.formula, 
          availableFields.filter((_, i) => i !== index)
        );
        if (!validation.valid) {
          hasErrors = true;
          setErrors(prev => ({ 
            ...prev, 
            [`formula_${index}`]: validation.error 
          }));
        }
      }
    });

    if (hasErrors) return;

    const worksheetData = {
      name,
      description,
      fields: fields.map(field => ({
        ...field,
        // Sanitize formula for calculated fields
        formula: field.type === 'calculated' && field.formula 
          ? formulaEngine.sanitizeFormula(field.formula)
          : field.formula
      })),
      type: 'custom',
      created_at: new Date().toISOString()
    };

    onSave(worksheetData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {initialData ? 'Edit Calculator' : 'Build Custom Calculator'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calc-name">Calculator Name</Label>
              <Input
                id="calc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., ROI Calculator, Break-even Analysis"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="calc-desc">Description</Label>
              <Input
                id="calc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this calculates"
                className="mt-1"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Fields & Formulas</Label>
              <Button onClick={addField} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div>
                      <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                      <Input
                        id={`field-name-${index}`}
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        placeholder="Field name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`field-type-${index}`}>Type</Label>
                      <select
                        id={`field-type-${index}`}
                        value={field.type}
                        onChange={(e) => updateField(index, 'type', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {field.type !== 'calculated' && (
                      <div>
                        <Label htmlFor={`field-value-${index}`}>Default Value</Label>
                        <Input
                          id={`field-value-${index}`}
                          type={field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? 'number' : 'text'}
                          value={field.value}
                          onChange={(e) => updateField(index, 'value', e.target.value)}
                          placeholder="Default value"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {field.type === 'calculated' && (
                      <div>
                        <Label htmlFor={`field-formula-${index}`}>Formula</Label>
                        <Input
                          id={`field-formula-${index}`}
                          value={field.formula}
                          onChange={(e) => updateField(index, 'formula', e.target.value)}
                          placeholder="e.g., REVENUE - COSTS"
                          className={`mt-1 ${errors[`formula_${index}`] ? 'border-destructive' : ''}`}
                        />
                        {errors[`formula_${index}`] && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {errors[`formula_${index}`]}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-end">
                      <Button
                        onClick={() => removeField(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive"
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-base font-medium mb-2 block">Preview</Label>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2">
                {name || 'Calculator Name'} - {description || 'Description'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {fields.map((field, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs">{field.name}</Label>
                    <div className="h-8 px-2 bg-background border rounded text-xs flex items-center">
                      {field.type === 'calculated' ? (
                        <span className="text-muted-foreground">= {field.formula}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {field.value || 'Enter value...'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {initialData ? 'Update Calculator' : 'Create Calculator'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorksheetBuilder;