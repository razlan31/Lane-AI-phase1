import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Eye, Edit3, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import DataTable from '../primitives/DataTable';
import KpiCard from '../primitives/KpiCard';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import { cn } from '../../lib/utils';

const WorksheetRenderer = ({ ventureId, worksheetId }) => {
  const [mode, setMode] = useState('live'); // 'draft' | 'live'
  const [worksheets, setWorksheets] = useState([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock worksheet data - in real app, this comes from Supabase config
  const mockWorksheets = [
    {
      id: 1,
      title: "Cashflow Projection",
      type: "cashflow",
      venture_id: ventureId,
      mode: "live",
      config: {
        kpis: [
          { title: "Net Cashflow", value: 2300, unit: "currency", trend: 12, trendDirection: "up" },
          { title: "Burn Rate", value: 8500, unit: "currency", trend: -5, trendDirection: "down" }
        ],
        columns: [
          { key: "month", label: "Month", editable: true },
          { key: "revenue", label: "Revenue", editable: true, render: (value) => `$${value?.toLocaleString() || 0}` },
          { key: "expenses", label: "Expenses", editable: true, render: (value) => `$${value?.toLocaleString() || 0}` },
          { key: "net", label: "Net", editable: false, render: (value, row) => `$${((row.revenue || 0) - (row.expenses || 0)).toLocaleString()}` }
        ],
        data: [
          { month: "Jan 2024", revenue: 8500, expenses: 6200 },
          { month: "Feb 2024", revenue: 9200, expenses: 6400 },
          { month: "Mar 2024", revenue: 10100, expenses: 6800 }
        ]
      }
    },
    {
      id: 2,
      title: "ROI Analysis",
      type: "roi",
      venture_id: ventureId,
      mode: "draft",
      config: {
        kpis: [
          { title: "ROI", value: 24.5, unit: "percentage", trend: 3.2, trendDirection: "up" },
          { title: "Payback Period", value: 18, unit: "months", trend: -2, trendDirection: "down" }
        ],
        columns: [
          { key: "investment", label: "Investment", editable: true, render: (value) => `$${value?.toLocaleString() || 0}` },
          { key: "return", label: "Expected Return", editable: true, render: (value) => `$${value?.toLocaleString() || 0}` },
          { key: "period", label: "Time Period", editable: true },
          { key: "roi", label: "ROI %", editable: false, render: (value, row) => `${(((row.return || 0) - (row.investment || 0)) / (row.investment || 1) * 100).toFixed(1)}%` }
        ],
        data: [
          { investment: 50000, return: 75000, period: "24 months" },
          { investment: 25000, return: 35000, period: "18 months" }
        ]
      }
    }
  ];

  useEffect(() => {
    // Simulate loading from Supabase
    const loadWorksheets = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setWorksheets(mockWorksheets);
      setSelectedWorksheet(mockWorksheets[0]);
      setLoading(false);
    };

    loadWorksheets();
  }, [ventureId]);

  const handleModeToggle = () => {
    setMode(mode === 'draft' ? 'live' : 'draft');
  };

  const handleWorksheetSelect = (worksheet) => {
    setSelectedWorksheet(worksheet);
    setMode(worksheet.mode);
  };

  const handleSave = (rowIndex, updatedData) => {
    console.log('Save worksheet data:', { rowIndex, updatedData });
    // In real app: call Supabase to save worksheet data
  };

  const handleEdit = (rowIndex) => {
    console.log('Edit row:', rowIndex);
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
        <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
          <Button variant="outline" className="mt-4">
            Create First Worksheet
          </Button>
        </LockUnlockWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Worksheet Selector */}
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
                mode === 'draft' && "bg-draft text-draft-foreground border-draft",
                mode === 'live' && "bg-live text-live-foreground border-live"
              )}
            >
              {mode === 'draft' ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {mode === 'draft' ? 'Draft' : 'Live'}
            </Button>
          </div>
        </div>

        {mode === 'draft' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Promote to Live
              </Button>
            </LockUnlockWrapper>
          </div>
        )}
      </div>

      {/* KPI Summary */}
      {selectedWorksheet.config.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedWorksheet.config.kpis.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendDirection={kpi.trendDirection}
              state={kpi.state}
            />
          ))}
        </div>
      )}

      {/* Data Table */}
      <LockUnlockWrapper 
        feature={selectedWorksheet.type === 'roi' ? "advanced_worksheets" : "core_worksheets"} 
        requiredTier="pro"
      >
        <DataTable
          data={selectedWorksheet.config.data}
          columns={selectedWorksheet.config.columns}
          editable={mode === 'draft'}
          mode={mode}
          onSave={handleSave}
          onEdit={handleEdit}
        />
      </LockUnlockWrapper>
    </div>
  );
};

export default WorksheetRenderer;