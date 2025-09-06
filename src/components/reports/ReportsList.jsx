import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import DataTable from '../primitives/DataTable';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import { formatNumber } from '../../lib/utils';

const ReportsList = ({ ventureId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock reports data - in real app, this comes from Supabase
  const mockReports = [
    {
      id: 1,
      name: "Weekly Brief",
      type: "weekly",
      venture_id: ventureId,
      created_at: "2024-01-15T10:30:00Z",
      status: "ready",
      file_size: 2.4,
      format: "PDF"
    },
    {
      id: 2,
      name: "Monthly Venture Pack",
      type: "monthly",
      venture_id: ventureId,
      created_at: "2024-01-01T09:00:00Z",
      status: "ready",
      file_size: 5.8,
      format: "PDF"
    },
    {
      id: 3,
      name: "Q1 Financial Summary",
      type: "quarterly",
      venture_id: ventureId,
      created_at: "2024-01-10T14:15:00Z",
      status: "generating",
      file_size: null,
      format: "PDF"
    },
    {
      id: 4,
      name: "Cashflow Analysis",
      type: "custom",
      venture_id: ventureId,
      created_at: "2024-01-08T16:45:00Z",
      status: "ready",
      file_size: 3.2,
      format: "Excel"
    }
  ];

  useEffect(() => {
    // Simulate loading from Supabase
    const loadReports = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      setReports(mockReports);
      setLoading(false);
    };

    loadReports();
  }, [ventureId]);

  const handleExport = async (reportId, reportName) => {
    console.log('Exporting report:', { reportId, reportName });
    // In real app: call Supabase function to generate/download report
    // Example: await supabase.functions.invoke('export-report', { body: { reportId } });
  };

  const handleView = (reportId, reportName) => {
    console.log('Viewing report:', { reportId, reportName });
    // In real app: open report preview or navigate to report detail page
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <div className="w-2 h-2 bg-live rounded-full" />;
      case 'generating':
        return <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />;
      case 'error':
        return <div className="w-2 h-2 bg-alert rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-muted rounded-full" />;
    }
  };

  const columns = [
    {
      key: 'status',
      label: '',
      render: (value) => getStatusIcon(value)
    },
    {
      key: 'name',
      label: 'Report Name',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
            {row.format}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="capitalize text-muted-foreground">{value}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'file_size',
      label: 'Size',
      render: (value) => value ? `${value} MB` : '—'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'ready' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(row.id, row.name)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport(row.id, row.name)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          {row.status === 'generating' && (
            <span className="text-xs text-muted-foreground">Generating...</span>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No reports generated yet</p>
        <Button variant="outline">
          Generate First Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-live rounded-full" />
              Ready
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full" />
              Generating
            </div>
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openAIChat', {
              detail: { 
                message: 'Generate a comprehensive business report for my venture with current KPIs, financial data, and AI insights',
                context: 'report-generation'
              }
            }));
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <DataTable
        data={reports}
        columns={columns}
        editable={false}
      />
    </div>
  );
};

export default ReportsList;