import { useState, useMemo } from 'react';
import { Search, Filter, Tag, Grid3x3, List, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlocks } from '@/hooks/useBlocks';
import { BlockDetailModal } from './BlockDetailModal';

const categoryConfig = {
  business_model: { label: 'Business Model', color: 'blue', icon: '🚀' },
  financial: { label: 'Financial', color: 'green', icon: '💰' },
  operations: { label: 'Operations', color: 'orange', icon: '⚙️' },
  marketing: { label: 'Marketing', color: 'purple', icon: '📈' },
  technology: { label: 'Technology', color: 'indigo', icon: '💻' },
  team: { label: 'Team', color: 'pink', icon: '👥' },
  legal: { label: 'Legal', color: 'slate', icon: '⚖️' },
  customer: { label: 'Customer', color: 'teal', icon: '💝' },
  risk: { label: 'Risk', color: 'red', icon: '🛡️' }
};

export const BlocksBrowser = ({ onBlockSelect, selectedBlocks = [], mode = 'browse' }) => {
  const { blocks, loading } = useBlocks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBlock, setSelectedBlock] = useState(null);

  const filteredBlocks = useMemo(() => {
    return blocks.filter(block => {
      const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          block.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          block.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [blocks, searchQuery, selectedCategory]);

  const blocksByCategory = useMemo(() => {
    return filteredBlocks.reduce((acc, block) => {
      if (!acc[block.category]) {
        acc[block.category] = [];
      }
      acc[block.category].push(block);
      return acc;
    }, {});
  }, [filteredBlocks]);

  const categories = Object.keys(categoryConfig);
  const totalBlocks = blocks.length;

  const handleBlockClick = (block) => {
    if (mode === 'select') {
      onBlockSelect?.(block);
    } else {
      setSelectedBlock(block);
    }
  };

  const isBlockSelected = (blockId) => {
    return selectedBlocks.some(b => b.id === blockId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blocks...</p>
        </div>
      </div>
    );
  }

  const renderBlock = (block) => (
    <Card 
      key={block.id}
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isBlockSelected(block.id) ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={() => handleBlockClick(block)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryConfig[block.category]?.icon}</span>
          <h3 className="font-medium text-sm line-clamp-2">{block.name}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {block.description}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary" 
          className={`text-xs bg-${categoryConfig[block.category]?.color}-100 text-${categoryConfig[block.category]?.color}-700`}
        >
          {categoryConfig[block.category]?.label}
        </Badge>
        <Badge variant={block.status === 'completed' ? 'default' : 'outline'} className="text-xs">
          {block.status}
        </Badge>
      </div>
      
      {block.tags && block.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {block.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
          {block.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{block.tags.length - 3}</span>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blocks Browser</h2>
          <p className="text-muted-foreground">
            Explore {totalBlocks} business building blocks across {categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {categoryConfig[category]?.icon} {categoryConfig[category]?.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="all" className="whitespace-nowrap">
            All ({totalBlocks})
          </TabsTrigger>
          {categories.map(category => {
            const count = blocks.filter(b => b.category === category).length;
            return (
              <TabsTrigger key={category} value={category} className="whitespace-nowrap">
                {categoryConfig[category]?.icon} {categoryConfig[category]?.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredBlocks.map(renderBlock)}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {blocksByCategory[category]?.map(renderBlock) || (
                <p className="text-muted-foreground text-center py-8">No blocks found in this category.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredBlocks.length} blocks matching "{searchQuery}"
        </div>
      )}

      {/* Block Detail Modal */}
      <BlockDetailModal
        block={selectedBlock}
        isOpen={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onStatusChange={() => {
          // Refresh blocks would be handled by the hook
        }}
      />
    </div>
  );
};