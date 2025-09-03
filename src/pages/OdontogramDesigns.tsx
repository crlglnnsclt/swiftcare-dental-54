import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TraditionalOdontogram } from '@/components/odontogram/TraditionalOdontogram';
import { AnatomicalOdontogram } from '@/components/odontogram/AnatomicalOdontogram';
import { InteractiveOdontogram } from '@/components/odontogram/InteractiveOdontogram';
import { MinimalistOdontogram } from '@/components/odontogram/MinimalistOdontogram';
import { DetailedClinicalOdontogram } from '@/components/odontogram/DetailedClinicalOdontogram';
import { useOdontogramPreference, OdontogramDesignType } from '@/hooks/useOdontogramPreference';
import { Grid, Activity, Eye, Minimize2, FileText, Check, Search, Filter, Settings, Star } from 'lucide-react';

export default function OdontogramDesigns() {
  const { selectedDesign: currentDesign, updateDesignPreference } = useOdontogramPreference();
  const [previewDesign, setPreviewDesign] = useState<OdontogramDesignType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<'all' | 'simple' | 'medium' | 'complex'>('all');
  const [detailFilter, setDetailFilter] = useState<'all' | 'basic' | 'medium' | 'high'>('all');

  const designs = [
    {
      id: 'traditional' as OdontogramDesignType,
      name: 'Traditional Grid Layout',
      description: 'Classic numbered grid format with clear tooth positioning',
      icon: <Grid className="w-5 h-5" />,
      features: ['Numbered grid layout', 'Clear tooth identification', 'Simple condition indicators', 'Easy to understand'],
      complexity: 'simple' as const,
      detail: 'basic' as const,
      bestFor: 'General practice',
      rating: 4.2,
      component: <TraditionalOdontogram />
    },
    {
      id: 'anatomical' as OdontogramDesignType,
      name: 'Anatomical Layout',
      description: 'Realistic mouth positioning with curved jaw alignment',
      icon: <Activity className="w-5 h-5" />,
      features: ['Anatomical positioning', 'Quadrant-based layout', 'Realistic jaw curves', 'Visual tooth representation'],
      complexity: 'medium' as const,
      detail: 'medium' as const,
      bestFor: 'Patient education',
      rating: 4.5,
      component: <AnatomicalOdontogram />
    },
    {
      id: 'interactive' as OdontogramDesignType,
      name: 'Interactive Modern',
      description: 'Advanced interactive design with detailed surface mapping',
      icon: <Eye className="w-5 h-5" />,
      features: ['Surface-level detail', 'Interactive hover effects', 'Multi-view modes', 'Comprehensive tooth data'],
      complexity: 'complex' as const,
      detail: 'high' as const,
      bestFor: 'Specialist practice',
      rating: 4.8,
      component: <InteractiveOdontogram />
    },
    {
      id: 'minimalist' as OdontogramDesignType,
      name: 'Minimalist Clean',
      description: 'Clean, simple design focusing on essential information',
      icon: <Minimize2 className="w-5 h-5" />,
      features: ['Clean interface', 'Priority indicators', 'Quadrant organization', 'Simplified workflow'],
      complexity: 'simple' as const,
      detail: 'basic' as const,
      bestFor: 'Quick assessments',
      rating: 4.0,
      component: <MinimalistOdontogram />
    },
    {
      id: 'clinical' as OdontogramDesignType,
      name: 'Detailed Clinical',
      description: 'Comprehensive clinical layout with treatment codes and notes',
      icon: <FileText className="w-5 h-5" />,
      features: ['Treatment code integration', 'Clinical notes', 'Detailed surface mapping', 'Professional workflow'],
      complexity: 'complex' as const,
      detail: 'high' as const,
      bestFor: 'Academic/research',
      rating: 4.6,
      component: <DetailedClinicalOdontogram />
    }
  ];

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesComplexity = complexityFilter === 'all' || design.complexity === complexityFilter;
    const matchesDetail = detailFilter === 'all' || design.detail === detailFilter;
    
    return matchesSearch && matchesComplexity && matchesDetail;
  });

  const handleSelectDesign = (designId: OdontogramDesignType) => {
    updateDesignPreference(designId);
    setPreviewDesign(null);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDetailColor = (detail: string) => {
    switch (detail) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Digital Odontogram Designs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from different odontogram designs that best fit your clinical workflow and preferences. 
          Filter and compare designs to find the perfect match for your practice.
        </p>
      </div>

      {/* Current Selection Banner */}
      <Card className="bg-gradient-to-r from-medical-blue/10 to-medical-blue/5 border-medical-blue/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-medical-blue/20 rounded-lg">
                {designs.find(d => d.id === currentDesign)?.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Currently Selected</h3>
                <p className="text-sm text-muted-foreground">
                  {designs.find(d => d.id === currentDesign)?.name} - {designs.find(d => d.id === currentDesign)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{designs.find(d => d.id === currentDesign)?.rating}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Designs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity</label>
              <Select value={complexityFilter} onValueChange={(value: any) => setComplexityFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Complexity</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Detail Level</label>
              <Select value={detailFilter} onValueChange={(value: any) => setDetailFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by detail" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Detail Levels</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Preview */}
      {previewDesign ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {designs.find(d => d.id === previewDesign)?.name}
              </h2>
              <Badge variant="outline">Preview Mode</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewDesign(null)}>
                Back to Gallery
              </Button>
              <Button onClick={() => handleSelectDesign(previewDesign)}>
                <Settings className="w-4 h-4 mr-2" />
                Use This Design
              </Button>
            </div>
          </div>
          
          <div className="animate-fade-in">
            {designs.find(d => d.id === previewDesign)?.component}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDesigns.length} of {designs.length} designs
            </p>
            <div className="text-xs text-muted-foreground">
              Click any design to preview, then select to make it your default
            </div>
          </div>

          {/* Design Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card 
                key={design.id} 
                className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  design.id === currentDesign ? 'ring-2 ring-medical-blue bg-medical-blue/5' : ''
                }`}
                onClick={() => setPreviewDesign(design.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-medical-blue/10 rounded-lg">
                        {design.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{design.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {design.description}
                        </p>
                      </div>
                    </div>
                    {design.id === currentDesign && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Preview Thumbnail */}
                    <div className="h-32 bg-gradient-to-br from-gray-50 to-white rounded-lg border flex items-center justify-center overflow-hidden">
                      <div className="scale-25 origin-center pointer-events-none">
                        {design.component}
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getComplexityColor(design.complexity)} variant="outline">
                          {design.complexity}
                        </Badge>
                        <Badge className={getDetailColor(design.detail)} variant="outline">
                          {design.detail}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{design.rating}</span>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs">Best for: {design.bestFor}</h4>
                      <div className="flex flex-wrap gap-1">
                        {design.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {design.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{design.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDesign(design.id);
                        }}
                      >
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDesign(design.id);
                        }}
                        disabled={design.id === currentDesign}
                      >
                        {design.id === currentDesign ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDesigns.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No designs match your current filters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setComplexityFilter('all');
                    setDetailFilter('all');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {!previewDesign && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Design Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Design</th>
                    <th className="text-center p-3">Complexity</th>
                    <th className="text-center p-3">Detail Level</th>
                    <th className="text-center p-3">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Traditional Grid</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Simple</Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Basic</Badge>
                    </td>
                    <td className="text-center p-3">General practice</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Anatomical Layout</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </td>
                    <td className="text-center p-3">Patient education</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Interactive Modern</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-red-100 text-red-800">Complex</Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>
                    </td>
                    <td className="text-center p-3">Specialist practice</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Minimalist Clean</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Simple</Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>
                    </td>
                    <td className="text-center p-3">Quick assessments</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Detailed Clinical</td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-red-100 text-red-800">Complex</Badge>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="outline" className="bg-red-100 text-red-800">Very High</Badge>
                    </td>
                    <td className="text-center p-3">Academic/research</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}