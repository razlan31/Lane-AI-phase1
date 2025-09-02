import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Calculator, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToolInputForm = ({ tool, inputs, onInputChange, onRun, loading = false, errors = {} }) => {
  if (!tool || !tool.input_schema) return null;

  const schema = tool.input_schema;
  const fields = schema.properties || {};

  const validateField = (fieldName, value) => {
    const field = fields[fieldName];
    if (!field) return null;

    // Required field validation
    if (schema.required?.includes(fieldName) && (!value || value === '')) {
      return 'This field is required';
    }

    // Type validation
    if (value && value !== '') {
      switch (field.type) {
        case 'number':
          const num = parseFloat(value);
          if (isNaN(num)) return 'Must be a valid number';
          if (field.minimum !== undefined && num < field.minimum) {
            return `Must be at least ${field.minimum}`;
          }
          if (field.maximum !== undefined && num > field.maximum) {
            return `Must be at most ${field.maximum}`;
          }
          break;
        case 'integer':
          const int = parseInt(value);
          if (isNaN(int) || int !== parseFloat(value)) return 'Must be a whole number';
          break;
        case 'string':
          if (field.minLength && value.length < field.minLength) {
            return `Must be at least ${field.minLength} characters`;
          }
          if (field.maxLength && value.length > field.maxLength) {
            return `Must be at most ${field.maxLength} characters`;
          }
          break;
      }
    }

    return null;
  };

  const isFormValid = () => {
    // Check all required fields
    const requiredFields = schema.required || [];
    for (const field of requiredFields) {
      if (!inputs[field] || inputs[field] === '') return false;
    }

    // Check for any validation errors
    for (const [fieldName, value] of Object.entries(inputs)) {
      if (validateField(fieldName, value)) return false;
    }

    return true;
  };

  const renderField = (fieldName, field) => {
    const value = inputs[fieldName] || '';
    const error = validateField(fieldName, value);
    const isRequired = schema.required?.includes(fieldName);

    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName} className="flex items-center gap-2">
          {field.title || fieldName.replace(/_/g, ' ')}
          {isRequired && <span className="text-red-500">*</span>}
        </Label>
        
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}

        {field.type === 'array' ? (
          <Input
            id={fieldName}
            placeholder={field.example ? `e.g., ${field.example}` : 'Enter comma-separated values'}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => {
              const arrayValue = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              onInputChange(fieldName, arrayValue);
            }}
            className={cn(error && "border-red-500")}
          />
        ) : field.enum ? (
          <select
            id={fieldName}
            value={value}
            onChange={(e) => onInputChange(fieldName, e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              error && "border-red-500"
            )}
          >
            <option value="">Select {field.title || fieldName}</option>
            {field.enum.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <Input
            id={fieldName}
            type={field.type === 'number' || field.type === 'integer' ? 'number' : 'text'}
            placeholder={field.example || `Enter ${field.title || fieldName}`}
            value={value}
            onChange={(e) => {
              let newValue = e.target.value;
              if (field.type === 'number') {
                newValue = newValue === '' ? '' : parseFloat(newValue) || 0;
              } else if (field.type === 'integer') {
                newValue = newValue === '' ? '' : parseInt(newValue) || 0;
              }
              onInputChange(fieldName, newValue);
            }}
            min={field.minimum}
            max={field.maximum}
            step={field.type === 'integer' ? 1 : 'any'}
            className={cn(error && "border-red-500")}
          />
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {!error && value && field.type === 'number' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Valid input
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {tool.name} Input
        </CardTitle>
        {tool.description && (
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([fieldName, field]) => 
          renderField(fieldName, field)
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {schema.required?.length || 0} required fields
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Object.keys(fields).length} total fields
            </Badge>
          </div>

          <Button 
            onClick={onRun}
            disabled={!isFormValid() || loading}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Running...' : 'Run Tool'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolInputForm;