import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Activity, Eye, Calendar } from 'lucide-react';

interface ToothSurface {
  surface: 'M' | 'O' | 'D' | 'B' | 'L' | 'I';
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'extracted' | 'root_canal';
  date?: string;
  notes?: string;
}

interface ToothData {
  number: number;
  surfaces: Record<string, ToothSurface>;
  overallCondition: 'healthy' | 'attention' | 'urgent';
  lastTreatment?: string;
  nextAppointment?: string;
}

export function InteractiveOdontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  
  const [teethData, setTeethData] = useState<Record<number, ToothData>>({
    8: {
      number: 8,
      surfaces: {
        'O': { surface: 'O', condition: 'filled', date: '2024-01-15' },
        'M': { surface: 'M', condition: 'healthy' },
        'D': { surface: 'D', condition: 'healthy' },
        'B': { surface: 'B', condition: 'healthy' },
        'L': { surface: 'L', condition: 'healthy' },
      },
      overallCondition: 'healthy',
      lastTreatment: '2024-01-15'
    },
    14: {
      number: 14,
      surfaces: {
        'M': { surface: 'M', condition: 'cavity' },
        'O': { surface: 'O', condition: 'cavity' },
        'D': { surface: 'D', condition: 'healthy' },
        'B': { surface: 'B', condition: 'healthy' },
        'L': { surface: 'L', condition: 'healthy' },
      },
      overallCondition: 'urgent',
      nextAppointment: '2024-02-10'
    }
  });

  const getToothConditionColor = (condition: string) => {
    switch (condition) {
      case 'healthy': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'attention': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'urgent': return 'bg-red-50 border-red-200 hover:bg-red-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getSurfaceColor = (condition: string) => {
    switch (condition) {
      case 'healthy': return '#10b981';
      case 'cavity': return '#ef4444';
      case 'filled': return '#3b82f6';
      case 'crown': return '#f59e0b';
      case 'extracted': return '#6b7280';
      case 'root_canal': return '#8b5cf6';
      default: return '#d1d5db';
    }
  };

  const ToothSVG = ({ toothNumber, size = 60 }: { toothNumber: number; size?: number }) => {
    const tooth = teethData[toothNumber];
    if (!tooth) return null;

    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 60 72" className="cursor-pointer">
        {/* Tooth outline */}
        <path
          d="M30 8 C40 8, 48 16, 48 28 L48 50 C48 60, 40 68, 30 68 C20 68, 12 60, 12 50 L12 28 C12 16, 20 8, 30 8 Z"
          fill="white"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        
        {/* Surface divisions for detailed view */}
        {viewMode === 'detailed' && (
          <>
            {/* Mesial */}
            <path
              d="M12 28 L30 20 L30 40 L12 50 Z"
              fill={getSurfaceColor(tooth.surfaces.M?.condition || 'healthy')}
              fillOpacity="0.7"
              stroke="white"
              strokeWidth="1"
            />
            {/* Occlusal/Incisal */}
            <path
              d="M30 8 C40 8, 48 16, 48 28 L30 20 L12 28 C12 16, 20 8, 30 8 Z"
              fill={getSurfaceColor(tooth.surfaces.O?.condition || 'healthy')}
              fillOpacity="0.7"
              stroke="white"
              strokeWidth="1"
            />
            {/* Distal */}
            <path
              d="M48 28 L30 20 L30 40 L48 50 Z"
              fill={getSurfaceColor(tooth.surfaces.D?.condition || 'healthy')}
              fillOpacity="0.7"
              stroke="white"
              strokeWidth="1"
            />
            {/* Buccal/Labial */}
            <path
              d="M30 40 L48 50 L48 28 L30 20 Z"
              fill={getSurfaceColor(tooth.surfaces.B?.condition || 'healthy')}
              fillOpacity="0.7"
              stroke="white"
              strokeWidth="1"
            />
            {/* Lingual */}
            <path
              d="M12 50 L30 68 C40 68, 48 60, 48 50 L30 40 Z"
              fill={getSurfaceColor(tooth.surfaces.L?.condition || 'healthy')}
              fillOpacity="0.7"
              stroke="white"
              strokeWidth="1"
            />
          </>
        )}
        
        {/* Tooth number */}
        <text
          x="30"
          y="42"
          textAnchor="middle"
          className="text-xs font-bold fill-gray-700"
        >
          {toothNumber}
        </text>
        
        {/* Condition indicator */}
        {tooth.overallCondition !== 'healthy' && (
          <circle
            cx="45"
            cy="15"
            r="5"
            fill={tooth.overallCondition === 'urgent' ? '#ef4444' : '#f59e0b'}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Interactive Digital Odontogram</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Detailed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Odontogram */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Upper Arch */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Upper Arch</h3>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => {
                      const tooth = teethData[num] || { number: num, surfaces: {}, overallCondition: 'healthy' as const };
                      return (
                        <div
                          key={num}
                          className={`p-2 border-2 rounded-lg transition-all duration-200 ${
                            getToothConditionColor(tooth.overallCondition)
                          } ${selectedTooth === num ? 'ring-2 ring-medical-blue' : ''}`}
                          onClick={() => setSelectedTooth(num)}
                        >
                          <ToothSVG toothNumber={num} size={40} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-center gap-3">
                    <span>Right</span>
                    <span>Center</span>
                    <span>Left</span>
                  </div>
                </div>

                {/* Lower Arch */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Lower Arch</h3>
                  <div className="flex justify-center gap-1 mb-2">
                    {[32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17].map((num) => {
                      const tooth = teethData[num] || { number: num, surfaces: {}, overallCondition: 'healthy' as const };
                      return (
                        <div
                          key={num}
                          className={`p-2 border-2 rounded-lg transition-all duration-200 ${
                            getToothConditionColor(tooth.overallCondition)
                          } ${selectedTooth === num ? 'ring-2 ring-medical-blue' : ''}`}
                          onClick={() => setSelectedTooth(num)}
                        >
                          <ToothSVG toothNumber={num} size={40} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-center gap-3">
                    <span>Right</span>
                    <span>Center</span>
                    <span>Left</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Healthy</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">30</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Need Attention</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Urgent</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">1</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Tooth Details */}
              {selectedTooth && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Tooth #{selectedTooth}</span>
                      {teethData[selectedTooth]?.overallCondition !== 'healthy' && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="surfaces" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>
                      <TabsContent value="surfaces" className="space-y-3">
                        {teethData[selectedTooth]?.surfaces && 
                          Object.entries(teethData[selectedTooth].surfaces).map(([surface, data]) => (
                            <div key={surface} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: getSurfaceColor(data.condition) }}
                                />
                                <span className="text-sm font-medium">{surface}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {data.condition}
                              </Badge>
                            </div>
                          ))
                        }
                      </TabsContent>
                      <TabsContent value="history" className="space-y-3">
                        {teethData[selectedTooth]?.lastTreatment && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Last: {teethData[selectedTooth].lastTreatment}</span>
                          </div>
                        )}
                        {teethData[selectedTooth]?.nextAppointment && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Next: {teethData[selectedTooth].nextAppointment}</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">Add Treatment</Button>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { condition: 'healthy', label: 'Healthy', color: '#10b981' },
                    { condition: 'cavity', label: 'Cavity', color: '#ef4444' },
                    { condition: 'filled', label: 'Filled', color: '#3b82f6' },
                    { condition: 'crown', label: 'Crown', color: '#f59e0b' },
                    { condition: 'extracted', label: 'Extracted', color: '#6b7280' },
                    { condition: 'root_canal', label: 'Root Canal', color: '#8b5cf6' }
                  ].map(({ condition, label, color }) => (
                    <div key={condition} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}