import { useState } from 'react';
import { useBlocks } from '@/hooks/useBlocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Clock, Plus, Filter } from 'lucide-react';
import { BlockDetailModal } from './BlockDetailModal';
import { ExplainButton } from '@/components/ExplainButton';

const STATUS_ICONS = {
  'planned': Circle,
  'in-progress': Clock,
  'complete': CheckCircle2
};

const STATUS_COLORS = {
  'planned': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'complete': 'bg-green-100 text-green-800'
};

export const BlocksGrid = ({ ventureId, onExplain }) => {
  const { blocks, loading, updateBlock } = useBlocks(ventureId);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading blocks...</div>;
  }

  const blocksByCategory = blocks.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {});

  const categories = Object.keys(blocksByCategory);

  const filteredBlocks = blocks.filter(block => {
    if (statusFilter !== 'all' && block.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && block.category !== categoryFilter) return false;
    return true;
  });

  const filteredBlocksByCategory = filteredBlocks.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {});

  const handleStatusChange = async (blockId, newStatus) => {
    await updateBlock(blockId, { status: newStatus });
  };

  const getStatusStats = () => {
    const stats = blocks.reduce((acc, block) => {
      acc[block.status] = (acc[block.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      planned: stats.planned || 0,
      'in-progress': stats['in-progress'] || 0,
      complete: stats.complete || 0,
      total: blocks.length
    };
  };

  const stats = getStatusStats();
  const completionRate = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venture Blocks</h2>
          <p className="text-muted-foreground">
            {completionRate}% complete • {stats.complete}/{stats.total} blocks finished
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Block
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Blocks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats['in-progress']}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.planned}</div>
            <div className="text-sm text-muted-foreground">Planned</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Blocks Grid by Category */}
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          {categories.slice(0, 8).map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filteredBlocksByCategory[category] || []).map(block => {
                const StatusIcon = STATUS_ICONS[block.status];
                
                return (
                  <Card 
                    key={block.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBlock(block)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">{block.name}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2 mt-1">
                            {block.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <StatusIcon className="w-4 h-4 text-muted-foreground" />
                          {onExplain && (
                            <ExplainButton 
                              context={`Explain the ${block.name} block in the ${block.category} category and why it's important for venture success`}
                              onExplain={onExplain}
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${STATUS_COLORS[block.status]}`}
                        >
                          {block.status.replace('-', ' ')}
                        </Badge>
                        {block.tags && block.tags.length > 0 && (
                          <div className="flex gap-1">
                            {block.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {block.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{block.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <BlockDetailModal
          block={selectedBlock}
          isOpen={!!selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};