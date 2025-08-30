import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Eye, Edit3, Save, X, Plus, Layers, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import DataTable from '../primitives/DataTable';
import KpiCard from '../primitives/KpiCard';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import AssumptionsPanel from './AssumptionsPanel';
import VentureChatPanel from '../chat/VentureChatPanel';
import { cn } from '../../lib/utils';
import { getTemplateById } from '../templates/WorksheetTemplates';

const WorksheetRenderer = ({ 
  ventureId, 
  worksheetId, 
  templateId = null,
  initialData = null 
}) => {
  const [mode, setMode] = useState('draft'); // 'draft' | 'live'
  const [worksheets, setWorksheets] = useState([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState(null);
  const [assumptions, setAssumptions] = useState([]);

  // Enhanced mock worksheet data with multi-sheet support
  const createWorksheetFromTemplate = (templateId) => {
    const template = getTemplateById(templateId);
    if (!template) return null;

    return {
      id: Date.now(),
      title: template.title,
      type: template.id,
      venture_id: ventureId,
      mode: "draft",
      config: {
        ...template.config,
        sheets: template.config.sheets.map(sheet => ({
          ...sheet,
          id: `${sheet.id}_${Date.now()}`
        }))
      }
    };
  };

  const mockWorksheets = initialData ? [initialData] : [
    {
      id: 1,
      title: "Cashflow Projection",
      type: "cashflow",
      venture_id: ventureId,
      mode: "live",
      config: {
        sheets: [
          {
            id: 'main',
            name: 'Monthly Cashflow',
            columns: [
              { key: "month", label: "Month", type: "text", editable: true },
              { key: "revenue", label: "Revenue", type: "currency", editable: true },
              { key: "expenses", label: "Expenses", type: "currency", editable: true },
              { key: "net", label: "Net Cashflow", type: "currency", editable: false, formula: "revenue - expenses" }
            ],
            data: [
              { month: "Jan 2024", revenue: 8500, expenses: 6200 },
              { month: "Feb 2024", revenue: 9200, expenses: 6400 },
              { month: "Mar 2024", revenue: 10100, expenses: 6800 }
            ],
            assumptions: [
              { key: 'growth_rate', label: 'Monthly Growth Rate', value: 0.08, type: 'percentage' },
              { key: 'expense_ratio', label: 'Expense Ratio', value: 0.7, type: 'percentage' }
            ]
          }
        ],
        kpis: [
          { title: "Net Cashflow", formula: "SUM(net)", unit: "currency", trend: 12, trendDirection: "up" },
          { title: "Burn Rate", formula: "AVERAGE(expenses)", unit: "currency", trend: -5, trendDirection: "down" }
        ]
      }
    }
  ];

  useEffect(() => {
    const loadWorksheets = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let worksheetData = mockWorksheets;
      
      // If templateId provided, create from template
      if (templateId) {
        const templateWorksheet = createWorksheetFromTemplate(templateId);
        if (templateWorksheet) {
          worksheetData = [templateWorksheet, ...mockWorksheets];
        }
      }
      
      setWorksheets(worksheetData);
      setSelectedWorksheet(worksheetData[0]);
      
      // Set assumptions from the first sheet
      if (worksheetData[0]?.config?.sheets?.[0]?.assumptions) {
        setAssumptions(worksheetData[0].config.sheets[0].assumptions);
      }
      
      setLoading(false);
    };

    loadWorksheets();
  }, [ventureId, templateId]);

  const handleModeToggle = () => {
    setMode(mode === 'draft' ? 'live' : 'draft');
  };

  const handleWorksheetSelect = (worksheet) => {
    setSelectedWorksheet(worksheet);
    setMode(worksheet.mode);
    setActiveSheet(0);
    // Update assumptions from the first sheet
    if (worksheet.config?.sheets?.[0]?.assumptions) {
      setAssumptions(worksheet.config.sheets[0].assumptions);
    }
  };

  const handleAssumptionChange = (key, value) => {
    setAssumptions(prev => prev.map(assumption => 
      assumption.key === key ? { ...assumption, value } : assumption
    ));
    // In real app: trigger recalculation and autosave
  };

  const handleExplainClick = (context) => {
    setChatContext(context);
    setIsChatOpen(true);
  };

  const handleSave = (rowIndex, updatedData) => {
    console.log('Save worksheet data:', { rowIndex, updatedData });
    // In real app: call Supabase to save worksheet data
  };

  const handleEdit = (rowIndex) => {
    console.log('Edit row:', rowIndex);
  };

  const getCurrentSheet = () => {
    return selectedWorksheet?.config?.sheets?.[activeSheet];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading worksheets...</div>
      </div>
    );
  }

  if (!selectedWorksheet) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No worksheets found</p>
        <Button variant="outline" className="mt-4">
          Create First Worksheet
        </Button>
      </div>
    );
  }

  const currentSheet = getCurrentSheet();

  return (
    <div className="flex h-full">
      {/* Main Worksheet Area */}
      <div className="flex-1 space-y-6">
        {/* Worksheet Header & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select 
              value={selectedWorksheet.id}
              onChange={(e) => {
                const worksheet = worksheets.find(w => w.id === parseInt(e.target.value));
                handleWorksheetSelect(worksheet);
              }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {worksheets.map(worksheet => (
                <option key={worksheet.id} value={worksheet.id}>
                  {worksheet.title}
                </option>
              ))}
            </select>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={handleModeToggle}
                className={cn(
                  mode === 'draft' && "bg-blue-500 text-white border-blue-500",
                  mode === 'live' && "bg-green-500 text-white border-green-500"
                )}
              >
                {mode === 'draft' ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {mode === 'draft' ? 'Draft' : 'Live'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'draft' && (
              <>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Promote to Live
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsChatOpen(true)}
            >
              AI Explain
            </Button>
          </div>
        </div>

        {/* Sheet Tabs */}
        {selectedWorksheet.config.sheets && selectedWorksheet.config.sheets.length > 1 && (
          <div className="flex items-center gap-1 border-b border-border">
            {selectedWorksheet.config.sheets.map((sheet, index) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheet(index)}
                className={cn(
                  "px-4 py-2 text-sm border-b-2 transition-colors",
                  activeSheet === index 
                    ? "border-primary text-primary bg-primary/5" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-4 w-4 mr-2 inline" />
                {sheet.name}
              </button>
            ))}
            <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* KPI Summary */}
        {selectedWorksheet.config.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWorksheet.config.kpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                description={`Formula: ${kpi.formula}`}
                value={kpi.value || 0}
                unit={kpi.unit}
                trend={kpi.trend}
                trendDirection={kpi.trendDirection}
                state={kpi.state}
                onClick={() => handleExplainClick(`Explain ${kpi.title} calculation`)}
              />
            ))}
          </div>
        )}

        {/* Data Table */}
        {currentSheet && (
          <DataTable
            data={currentSheet.data || []}
            columns={currentSheet.columns || []}
            editable={mode === 'draft'}
            mode={mode}
            onSave={handleSave}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Assumptions Panel */}
      <div className="ml-4">
        <AssumptionsPanel
          assumptions={assumptions}
          onAssumptionChange={handleAssumptionChange}
          isEditable={mode === 'draft'}
          onExplain={(assumption) => handleExplainClick(`Explain assumption: ${assumption.label}`)}
        />
      </div>

      {/* Chat Panel */}
      <VentureChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ventureId={ventureId}
        ventureName={`Worksheet: ${selectedWorksheet.title}`}
        initialContext={chatContext}
      />
    </div>
  );
};

export default WorksheetRenderer;