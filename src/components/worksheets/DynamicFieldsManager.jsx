import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DynamicFieldsManager = ({ 
  worksheetId, 
  worksheetType, 
  fields = [], 
  onFieldsUpdate 
}) => {
  const [customFields, setCustomFields] = useState(fields);
  const [aiPrompt, setAiPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const addField = (fieldData = {}) => {
    const newField = {
      id: Date.now(),
      name: fieldData.name || 'New Field',
      type: fieldData.type || 'number',
      label: fieldData.label || fieldData.name || 'New Field',
      value: fieldData.value || '',
      required: fieldData.required || false,
      placeholder: fieldData.placeholder || '',
      ...fieldData
    };
    
    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    onFieldsUpdate?.(updatedFields);
  };

  const updateField = (id, updates) => {
    const updatedFields = customFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    );
    setCustomFields(updatedFields);
    onFieldsUpdate?.(updatedFields);
  };

  const removeField = (id) => {
    const updatedFields = customFields.filter(field => field.id !== id);
    setCustomFields(updatedFields);
    onFieldsUpdate?.(updatedFields);
  };

  const handleAIFieldGeneration = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Enter a prompt",
        description: "Please describe the field you want to add.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // Call OpenAI function to generate field structure
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are a financial worksheet assistant. Parse the user's request and return ONLY a JSON object for a new field with this structure:
              {
                "name": "field_name",
                "label": "Display Label",
                "type": "number|text|percentage|currency",
                "placeholder": "placeholder text",
                "required": true|false,
                "category": "income|expense|asset|liability"
              }`
            },
            {
              role: 'user',
              content: `Add this field to my ${worksheetType} worksheet: ${aiPrompt}`
            }
          ]
        }
      });

      if (error) throw error;

      // Parse AI response to extract field definition
      let fieldData;
      try {
        // Extract JSON from response
        const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          fieldData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        // Fallback: create basic field from prompt
        fieldData = {
          name: aiPrompt.toLowerCase().replace(/\s+/g, '_'),
          label: aiPrompt,
          type: 'number',
          placeholder: 'Enter value',
          required: false
        };
      }

      addField(fieldData);
      setAiPrompt('');
      
      toast({
        title: "Field Added",
        description: `Added "${fieldData.label}" to your worksheet.`
      });

      // Save to database
      if (worksheetId) {
        await saveFieldsToDatabase();
      }

    } catch (error) {
      console.error('Error generating field:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate field. Please try adding manually.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const saveFieldsToDatabase = async () => {
    try {
      await supabase
        .from('worksheets')
        .update({ 
          custom_fields: customFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', worksheetId);
    } catch (error) {
      console.error('Error saving fields:', error);
    }
  };

  const getFieldTypeIcon = (type) => {
    switch (type) {
      case 'currency': return '$';
      case 'percentage': return '%';
      case 'number': return '#';
      default: return 'T';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dynamic Fields</h3>
        <Button onClick={() => addField()} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* AI Field Generation */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">AI Field Assistant</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., 'Add marketing expense field' or 'Add customer acquisition cost'"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAIFieldGeneration()}
          />
          <Button 
            onClick={handleAIFieldGeneration}
            disabled={processing}
            size="sm"
          >
            {processing ? 'Adding...' : 'Add Field'}
          </Button>
        </div>
      </div>

      {/* Custom Fields List */}
      <div className="space-y-3">
        {customFields.map(field => (
          <div key={field.id} className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor={`name-${field.id}`}>Field Name</Label>
                <Input
                  id={`name-${field.id}`}
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder="field_name"
                />
              </div>
              <div>
                <Label htmlFor={`label-${field.id}`}>Display Label</Label>
                <Input
                  id={`label-${field.id}`}
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Display Name"
                />
              </div>
              <div>
                <Label htmlFor={`type-${field.id}`}>Type</Label>
                <select
                  id={`type-${field.id}`}
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="percentage">Percentage</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div>
                <Label htmlFor={`value-${field.id}`}>Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground">
                    {getFieldTypeIcon(field.type)}
                  </span>
                  <Input
                    id={`value-${field.id}`}
                    type={field.type === 'text' ? 'text' : 'number'}
                    value={field.value}
                    onChange={(e) => updateField(field.id, { value: e.target.value })}
                    placeholder={field.placeholder}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(field.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {customFields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No custom fields yet. Use the AI assistant or add manually.
          </div>
        )}
      </div>

      {customFields.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          Custom fields are automatically saved to your worksheet.
        </div>
      )}
    </Card>
  );
};

export default DynamicFieldsManager;