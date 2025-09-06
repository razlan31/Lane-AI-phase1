import { useState } from 'react';
import { Search, FileSpreadsheet, Clock, BarChart3, Layers, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { worksheetTemplates, getTemplateCategories } from './WorksheetTemplates';
import { cn } from '../../lib/utils';

const TemplateChooser = ({ isOpen, onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...getTemplateCategories()];

  const filteredTemplates = worksheetTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Basic':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Financial':
        return BarChart3;
      case 'Marketing':
        return Layers;
      default:
        return BookOpen;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Choose a Template
              </CardTitle>
              <CardDescription>
                Start with a pre-built worksheet template
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map(template => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    console.log('Template selected:', template);
                    
                    // Create worksheet from template
                    const worksheetData = {
                      id: Date.now(),
                      name: template.title,
                      type: template.category.toLowerCase(),
                      description: template.description,
                      template_id: template.id,
                      status: 'draft',
                      created_at: new Date().toISOString()
                    };
                    
                    onSelectTemplate(worksheetData);
                    
                    // Open the new worksheet
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openWorksheet', {
                        detail: { 
                          worksheetId: worksheetData.id, 
                          worksheetData: worksheetData 
                        }
                      }));
                    }, 300);
                    
                    onClose();
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded border",
                          getDifficultyColor(template.difficulty)
                        )}>
                          {template.difficulty}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.estimatedTime}
                      </div>
                      <span className="text-primary font-medium">{template.category}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateChooser;