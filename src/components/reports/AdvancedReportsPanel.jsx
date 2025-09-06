import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Share,
  BookOpen,
  FileText,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, ResponsiveGrid } from '../ui/ResponsiveContainer';
import { MetricCard } from '../ui/EnhancedCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AdvancedReportsPanel({ isOpen, onClose, ventures = [], className }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedVentures, setSelectedVentures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'custom', label: 'Custom' },
  ];

  const reportTypes = [
    {
      id: 'financial',
      title: 'Financial Performance',
      description: 'Revenue, cashflow, and profitability analysis',
      icon: DollarSign,
      color: 'text-green-600',
      metrics: ['revenue_growth', 'profit_margin', 'burn_rate', 'runway']
    },
    {
      id: 'operational',
      title: 'Operational Metrics',
      description: 'Efficiency and performance indicators',
      icon: Activity,
      color: 'text-blue-600',
      metrics: ['productivity', 'utilization', 'cycle_time', 'quality_score']
    },
    {
      id: 'growth',
      title: 'Growth Analysis',
      description: 'Customer acquisition and market expansion',
      icon: TrendingUp,
      color: 'text-purple-600',
      metrics: ['cac', 'ltv', 'churn_rate', 'market_share']
    },
    {
      id: 'comparative',
      title: 'Comparative Analysis',
      description: 'Cross-venture and benchmark comparisons',
      icon: BarChart3,
      color: 'text-orange-600',
      metrics: ['venture_comparison', 'industry_benchmark', 'peer_analysis']
    }
  ];

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen, selectedTimeRange, selectedVentures]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call for report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock advanced report data
      setReportData({
        overview: {
          totalRevenue: 2450000,
          revenueGrowth: 23.5,
          totalVentures: ventures.length,
          profitableVentures: Math.floor(ventures.length * 0.7),
          averageRunway: 18.5,
          cashflowPositive: Math.floor(ventures.length * 0.6),
        },
        trends: {
          revenue: [
            { month: 'Jan', value: 185000 },
            { month: 'Feb', value: 198000 },
            { month: 'Mar', value: 215000 },
            { month: 'Apr', value: 232000 },
            { month: 'May', value: 248000 },
            { month: 'Jun', value: 265000 },
          ],
          expenses: [
            { month: 'Jan', value: 125000 },
            { month: 'Feb', value: 132000 },
            { month: 'Mar', value: 128000 },
            { month: 'Apr', value: 145000 },
            { month: 'May', value: 152000 },
            { month: 'Jun', value: 148000 },
          ]
        },
        ventureBreakdown: ventures.map(venture => ({
          ...venture,
          contribution: Math.random() * 40 + 10,
          growth: (Math.random() - 0.5) * 50,
          risk_score: Math.random() * 100
        }))
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    setLoading(true);
    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger actual export
      const exportData = {
        format,
        timeRange: selectedTimeRange,
        ventures: selectedVentures,
        data: reportData,
        timestamp: new Date().toISOString()
      };
      
      console.log('Exporting report:', exportData);
      
      // Create and download file (mock)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lane-ai-report-${format}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-7xl h-[90vh] flex flex-col", className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Advanced Reports & Analytics
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive business intelligence and performance analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateReport()}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => exportReport('pdf')}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 border border-border rounded-md bg-background text-sm"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={selectedVentures.join(',')}
              onChange={(e) => setSelectedVentures(e.target.value ? e.target.value.split(',') : [])}
              className="px-3 py-1 border border-border rounded-md bg-background text-sm"
            >
              <option value="">All Ventures</option>
              {ventures.map(venture => (
                <option key={venture.id} value={venture.id}>
                  {venture.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : reportData ? (
                <>
                  {/* Key Metrics */}
                  <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap="default">
                    <MetricCard
                      title="Total Revenue"
                      value={`$${(reportData.overview.totalRevenue / 1000000).toFixed(1)}M`}
                      trend={`+${reportData.overview.revenueGrowth}%`}
                      trendDirection="up"
                      icon={DollarSign}
                      className="animate-fade-in"
                    />
                    <MetricCard
                      title="Active Ventures"
                      value={reportData.overview.totalVentures}
                      description={`${reportData.overview.profitableVentures} profitable`}
                      icon={Target}
                      className="animate-fade-in"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <MetricCard
                      title="Avg Runway"
                      value={`${reportData.overview.averageRunway}m`}
                      description="Months remaining"
                      icon={Activity}
                      className="animate-fade-in"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <MetricCard
                      title="Cashflow Positive"
                      value={reportData.overview.cashflowPositive}
                      description={`${Math.round((reportData.overview.cashflowPositive / reportData.overview.totalVentures) * 100)}% of portfolio`}
                      icon={TrendingUp}
                      className="animate-fade-in"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </ResponsiveGrid>

                  {/* Report Types */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
                    <ResponsiveGrid cols={{ xs: 1, sm: 2 }} gap="default">
                      {reportTypes.map((report, index) => {
                        const Icon = report.icon;
                        return (
                          <Card 
                            key={report.id} 
                            className="hover-lift cursor-pointer animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => setActiveTab(report.id === 'comparative' ? 'comparison' : 'financial')}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg bg-muted", report.color)}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{report.title}</CardTitle>
                                  <CardDescription className="text-sm">{report.description}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1">
                                {report.metrics.map(metric => (
                                  <Badge key={metric} variant="secondary" className="text-xs">
                                    {metric.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </ResponsiveGrid>
                  </div>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Performance Analysis</CardTitle>
                  <CardDescription>Revenue trends, profitability, and financial health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Financial charts would be rendered here</p>
                      <p className="text-xs text-muted-foreground mt-1">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Operational efficiency and productivity indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Performance dashboards would be rendered here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Venture Comparison</CardTitle>
                  <CardDescription>Side-by-side analysis of venture performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.ventureBreakdown ? (
                    <div className="space-y-4">
                      {reportData.ventureBreakdown.map((venture, index) => (
                        <div 
                          key={venture.id} 
                          className="flex items-center justify-between p-4 border border-border rounded-lg animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div>
                            <h4 className="font-medium">{venture.name}</h4>
                            <p className="text-sm text-muted-foreground">{venture.description}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{venture.contribution.toFixed(1)}%</div>
                              <div className="text-muted-foreground">Contribution</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("font-medium", venture.growth > 0 ? "text-green-600" : "text-red-600")}>
                                {venture.growth > 0 ? '+' : ''}{venture.growth.toFixed(1)}%
                              </div>
                              <div className="text-muted-foreground">Growth</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{venture.risk_score.toFixed(0)}</div>
                              <div className="text-muted-foreground">Risk Score</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Comparison analysis loading...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Export Options */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Export options: PDF, Excel, CSV, PowerPoint
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                  PDF
                </Button>
                <Button size="sm" onClick={() => exportReport('pptx')}>
                  PowerPoint
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AdvancedReportsPanel;