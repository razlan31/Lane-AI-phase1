import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Save, FileText, AlertTriangle, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';

const ScenarioSandbox = ({ onClose }) => {
  const [scenarioText, setScenarioText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveType, setSaveType] = useState('calculation'); // 'calculation' or 'worksheet'
  const [worksheetTitle, setWorksheettitle] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const evaluateScenario = async () => {
    if (!scenarioText.trim()) {
      toast.error("Please enter a scenario to evaluate");
      return;
    }

    setLoading(true);
    setResult(null);
    setNeedsClarification(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('scenario-eval', {
        body: {
          scenarioText: scenarioText.trim(),
          context: {}
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data.needs_clarification) {
        setNeedsClarification(true);
        setResult({ questions: data.questions, parsed_variables: data.parsed_variables });
      } else {
        setResult(data);
        // Initialize worksheet title from suggested schema
        if (data.suggested_schema?.title) {
          setWorksheettitle(data.suggested_schema.title);
        }
        // Initialize all fields as selected
        if (data.suggested_schema?.fields) {
          setSelectedFields(data.suggested_schema.fields.map(f => f.name));
        }
      }
    } catch (error) {
      console.error('Scenario evaluation error:', error);
      toast.error(error.message || 'Failed to evaluate scenario');
    } finally {
      setLoading(false);
    }
  };

  const saveAsCalculation = async () => {
    if (!result || result.needs_clarification) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('calculations_log')
        .insert({
          user_id: user.id,
          scenario_text: scenarioText,
          assumptions: result.assumptions || {},
          result: result.computed_results || {},
          confidence: result.confidence_score || 0.5,
          explanation: result.explanation_text || ''
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success("Scenario has been saved to your calculation log.");

      onClose?.();
    } catch (error) {
      console.error('Save calculation error:', error);
      toast.error(error.message || 'Failed to save calculation');
    } finally {
      setSaving(false);
    }
  };

  const saveAsWorksheet = async () => {
    if (!result || result.needs_clarification || !worksheetTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a worksheet title",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-worksheet-from-scenario', {
        body: {
          scenarioData: result,
          title: worksheetTitle.trim(),
          fieldsToInclude: selectedFields,
          confirm: true
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (error) throw error;

      if (data.applied) {
        toast({
          title: "Worksheet Created",
          description: `Successfully created worksheet "${worksheetTitle}"`
        });
        setShowSaveModal(false);
        onClose?.();
      } else {
        toast({
          title: "Worksheet Preview",
          description: data.message || "Worksheet preview ready"
        });
      }
    } catch (error) {
      console.error('Save worksheet error:', error);
      toast({
        title: "Save Failed",
        description: error.message || 'Failed to create worksheet',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const exampleScenarios = [
    "If I hire 3 people at $2,000/month and charge $500 per project, how many projects per month to break even?",
    "Simulate 12-month cashflow if revenue grows 5% monthly starting at $5,000 and monthly expenses are $4,200",
    "What ROI would I get if I invest $10,000 in marketing and it brings 50 new customers worth $200 each?"
  ];

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex justify-center items-start pt-8 px-4 h-full">
          <Card className="w-full max-w-4xl h-[85vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Scenario Sandbox
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
              {/* Input Section */}
              <div className="space-y-3">
                <Label htmlFor="scenario">Describe your business scenario:</Label>
                <Textarea
                  id="scenario"
                  placeholder="e.g., If I hire 3 people at $2,000/month and charge $500 per project, how many projects per month to break even?"
                  value={scenarioText}
                  onChange={(e) => setScenarioText(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
                
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={evaluateScenario} 
                    disabled={loading || !scenarioText.trim()}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    {loading ? 'Evaluating...' : 'Evaluate Scenario'}
                  </Button>
                  
                  {result && !needsClarification && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={saveAsCalculation}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save as Calculation
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSaveModal(true)}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Convert to Worksheet
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Example Scenarios */}
              {!result && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Try these examples:</Label>
                  <div className="space-y-2">
                    {exampleScenarios.map((example, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => setScenarioText(example)}
                        className="h-auto p-2 text-left text-xs text-muted-foreground hover:text-foreground justify-start"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Section */}
              <div className="flex-1 overflow-auto">
                {needsClarification && result?.questions && (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">I need more information:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.questions.map((question, index) => (
                            <li key={index} className="text-sm">{question}</li>
                          ))}
                        </ul>
                        {result.parsed_variables && Object.keys(result.parsed_variables).length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium">I found these values:</p>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {Object.entries(result.parsed_variables).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key.replace(/_/g, ' ')}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {result && !needsClarification && (
                  <div className="space-y-4">
                    {/* Confidence & Summary */}
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(result.confidence_score)}>
                        {getConfidenceLabel(result.confidence_score)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Calculated using deterministic math engine
                      </span>
                    </div>

                    {/* Computation Results */}
                    {result.computed_results && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Calculation Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(result.computed_results).map(([key, value]) => {
                              if (typeof value === 'object' && value !== null) {
                                return null; // Skip complex objects for summary view
                              }
                              return (
                                <div key={key} className="space-y-1">
                                  <div className="text-sm text-muted-foreground">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  <div className="font-semibold">
                                    {typeof value === 'number' ? 
                                      (key.includes('cost') || key.includes('revenue') || key.includes('balance') ? 
                                        `$${value.toLocaleString()}` : 
                                        value.toLocaleString()
                                      ) : 
                                      value
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Assumptions */}
                    {result.assumptions && Object.keys(result.assumptions).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Assumptions Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(result.assumptions).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key.replace(/_/g, ' ')}: {value}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Explanation */}
                    {result.explanation_text && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Step-by-Step Explanation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm">{result.explanation_text}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save as Worksheet Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convert to Worksheet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="worksheet-title">Worksheet Title</Label>
              <Input
                id="worksheet-title"
                value={worksheetTitle}
                onChange={(e) => setWorksheettitle(e.target.value)}
                placeholder="Enter worksheet title"
              />
            </div>

            {result?.suggested_schema?.fields && (
              <div className="space-y-3">
                <Label>Fields to Include</Label>
                <div className="grid grid-cols-2 gap-2">
                  {result.suggested_schema.fields.map((field) => (
                    <div key={field.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.name}
                        checked={selectedFields.includes(field.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFields(prev => [...prev, field.name]);
                          } else {
                            setSelectedFields(prev => prev.filter(f => f !== field.name));
                          }
                        }}
                      />
                      <Label htmlFor={field.name} className="text-sm">
                        {field.label} ({field.type})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveAsWorksheet} 
                disabled={saving || !worksheetTitle.trim()}
              >
                {saving ? 'Creating...' : 'Create Worksheet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScenarioSandbox;