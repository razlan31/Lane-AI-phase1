import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sparkles, Target, TrendingUp, Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ScratchpadReflectionPanel = ({ 
  noteText, 
  reflection, 
  loading = false,
  onApplySuggestion,
  onConvert,
  className = ""
}) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!reflection && !loading) return null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card className={cn("border-dashed border-primary/30 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" />
          AI Reflection
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Analyzing your note...</p>
          </div>
        ) : (
          <>
            {/* Suggested Tags */}
            {reflection?.suggestedTags?.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('tags')}
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    Suggested Tags
                  </h4>
                  <ArrowRight className={cn(
                    "h-3 w-3 transition-transform",
                    expandedSection === 'tags' && "rotate-90"
                  )} />
                </div>
                
                {expandedSection === 'tags' && (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {reflection.suggestedTags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-primary/20"
                          onClick={() => onApplySuggestion?.('tag', tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onApplySuggestion?.('all-tags', reflection.suggestedTags)}
                      className="h-6 text-xs"
                    >
                      Apply All Tags
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* KPI Connections */}
            {reflection?.kpiConnections?.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('kpis')}
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    KPI Connections
                  </h4>
                  <ArrowRight className={cn(
                    "h-3 w-3 transition-transform",
                    expandedSection === 'kpis' && "rotate-90"
                  )} />
                </div>
                
                {expandedSection === 'kpis' && (
                  <div className="mt-2 space-y-2">
                    {reflection.kpiConnections.map((kpi, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded border-l-2 border-primary">
                        <div className="font-medium">{kpi.name || kpi}</div>
                        {kpi.reason && (
                          <div className="text-muted-foreground mt-1">{kpi.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conversion Suggestions */}
            {reflection?.conversionSuggestions?.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('conversions')}
                >
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-3 w-3" />
                    Conversion Ideas
                  </h4>
                  <ArrowRight className={cn(
                    "h-3 w-3 transition-transform",
                    expandedSection === 'conversions' && "rotate-90"
                  )} />
                </div>
                
                {expandedSection === 'conversions' && (
                  <div className="mt-2 space-y-2">
                    {reflection.conversionSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                        <div className="font-medium">{suggestion.type || suggestion}</div>
                        {suggestion.description && (
                          <div className="text-muted-foreground mt-1">{suggestion.description}</div>
                        )}
                        {suggestion.type && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onConvert?.(suggestion)}
                            className="h-5 text-xs mt-1"
                          >
                            Convert
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Items */}
            {reflection?.actionItems?.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('actions')}
                >
                  <h4 className="text-sm font-medium">Action Items</h4>
                  <ArrowRight className={cn(
                    "h-3 w-3 transition-transform",
                    expandedSection === 'actions' && "rotate-90"
                  )} />
                </div>
                
                {expandedSection === 'actions' && (
                  <div className="mt-2 space-y-1">
                    {reflection.actionItems.map((action, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                        • {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Insights */}
            {reflection?.insights && (
              <div className="text-xs p-3 bg-primary/10 rounded border">
                <div className="font-medium mb-1">💡 Key Insights</div>
                <div className="text-muted-foreground">{reflection.insights}</div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScratchpadReflectionPanel;