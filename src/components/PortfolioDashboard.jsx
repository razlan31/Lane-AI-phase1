import React, { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3, 
  PieChart, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Users,
  Lightbulb
} from 'lucide-react';

export const PortfolioDashboard = () => {
  const { portfolioMetrics, ventures, loading, compareVentures, findSynergies } = usePortfolio();
  const [selectedVentures, setSelectedVentures] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [synergies, setSynergies] = useState([]);

  const handleVentureSelect = (ventureId) => {
    const newSelection = selectedVentures.includes(ventureId)
      ? selectedVentures.filter(id => id !== ventureId)
      : [...selectedVentures, ventureId];
    
    setSelectedVentures(newSelection);
    
    if (newSelection.length >= 2) {
      setComparisonData(compareVentures(newSelection));
      setSynergies(findSynergies(newSelection));
    } else {
      setComparisonData([]);
      setSynergies([]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading portfolio...</div>;
  }

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'revenue': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'runway': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'roi': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'risk': return <Target className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">Aggregate view of all your ventures</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {portfolioMetrics?.venture_count || 0} Ventures
        </Badge>
      </div>

      {/* Portfolio Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Total Revenue</h3>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">
                ${(portfolioMetrics?.total_revenue || 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Monthly recurring</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Avg Runway</h3>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">
                {(portfolioMetrics?.total_runway || 0).toFixed(1)}mo
              </div>
              <div className="text-xs text-muted-foreground mt-1">Across all ventures</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Portfolio ROI</h3>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">
                {(portfolioMetrics?.portfolio_roi || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Weighted average</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Risk Score</h3>
                <Target className="w-4 h-4 text-red-600" />
              </div>
              <div className={`text-2xl font-bold ${getRiskColor(portfolioMetrics?.risk_score || 0)}`}>
                {(portfolioMetrics?.risk_score || 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Lower is better</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Compare Ventures</TabsTrigger>
          <TabsTrigger value="synergies">Find Synergies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Individual Venture Cards */}
          <section>
            <h3 className="text-lg font-medium mb-4">Venture Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ventures.map((venture) => (
                <Card key={venture.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{venture.name}</CardTitle>
                      <Badge variant={venture.stage === 'active' ? 'default' : 'secondary'}>
                        {venture.stage || 'Draft'}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {venture.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-medium">${(venture.revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Runway:</span>
                        <span className="font-medium">{venture.runway || 0}mo</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <span className="font-medium">{venture.type || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Diversification Analysis */}
          <section>
            <h3 className="text-lg font-medium mb-4">Portfolio Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Diversification Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {(portfolioMetrics?.diversification_score || 0).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Higher scores indicate better diversification across venture types and stages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Resource Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Ventures:</span>
                      <span className="font-medium">{portfolioMetrics?.venture_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Burn Rate:</span>
                      <span className="font-medium">${(portfolioMetrics?.total_burn_rate || 0).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacity Utilization:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Venture Selection */}
          <section>
            <h3 className="text-lg font-medium mb-4">Select Ventures to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ventures.map((venture) => (
                <Card 
                  key={venture.id} 
                  className={`cursor-pointer transition-all ${
                    selectedVentures.includes(venture.id) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleVentureSelect(venture.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{venture.name}</h4>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedVentures.includes(venture.id) 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-300'
                      }`} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{venture.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Comparison Table */}
          {comparisonData.length >= 2 && (
            <section>
              <h3 className="text-lg font-medium mb-4">Side-by-Side Comparison</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Metric</th>
                          {comparisonData.map((venture) => (
                            <th key={venture.id} className="text-left p-4 font-medium">
                              {venture.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['revenue', 'burn_rate', 'runway', 'roi'].map((metric) => (
                          <tr key={metric} className="border-b">
                            <td className="p-4 font-medium capitalize">
                              <div className="flex items-center gap-2">
                                {getMetricIcon(metric)}
                                {metric.replace('_', ' ')}
                              </div>
                            </td>
                            {comparisonData.map((venture) => (
                              <td key={venture.id} className="p-4">
                                {metric === 'revenue' || metric === 'burn_rate' 
                                  ? `$${(venture.metrics[metric] || 0).toLocaleString()}`
                                  : metric === 'runway'
                                  ? `${venture.metrics[metric] || 0}mo`
                                  : `${(venture.metrics[metric] || 0).toFixed(1)}%`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </TabsContent>

        <TabsContent value="synergies" className="space-y-6">
          {synergies.length > 0 ? (
            <section>
              <h3 className="text-lg font-medium mb-4">Identified Synergies</h3>
              <div className="space-y-4">
                {synergies.map((synergy, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        {synergy.type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{synergy.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          Potential Value: {synergy.potential_value}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Explore Synergy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Synergies Detected</h3>
              <p className="text-muted-foreground">
                Select multiple ventures to identify potential synergies and shared resources.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};