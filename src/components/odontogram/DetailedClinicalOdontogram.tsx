import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface TreatmentCode {
  code: string;
  description: string;
  surface?: string;
  date: string;
  dentist: string;
  status: 'completed' | 'planned' | 'in_progress';
}

interface DetailedTooth {
  number: number;
  type: 'incisor' | 'canine' | 'premolar' | 'molar';
  surfaces: {
    M: { condition: string; treatment?: TreatmentCode };
    O: { condition: string; treatment?: TreatmentCode };
    D: { condition: string; treatment?: TreatmentCode };
    B: { condition: string; treatment?: TreatmentCode };
    L: { condition: string; treatment?: TreatmentCode };
  };
  mobility?: number;
  periodontal?: {
    probing: Record<string, number>;
    bleeding: boolean;
    plaque: boolean;
  };
  treatments: TreatmentCode[];
  notes: string[];
}

export function DetailedClinicalOdontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'treatments' | 'periodontal' | 'planning'>('treatments');
  
  const [teethData, setTeethData] = useState<Record<number, DetailedTooth>>({
    8: {
      number: 8,
      type: 'incisor',
      surfaces: {
        M: { condition: 'healthy' },
        O: { condition: 'filled', treatment: { code: 'D2161', description: 'Resin-based composite - one surface', date: '2024-01-15', dentist: 'Dr. Smith', status: 'completed' } },
        D: { condition: 'healthy' },
        B: { condition: 'healthy' },
        L: { condition: 'healthy' }
      },
      treatments: [
        { code: 'D2161', description: 'Resin-based composite - one surface', surface: 'O', date: '2024-01-15', dentist: 'Dr. Smith', status: 'completed' }
      ],
      notes: ['Patient reports sensitivity to cold']
    },
    14: {
      number: 14,
      type: 'premolar',
      surfaces: {
        M: { condition: 'cavity' },
        O: { condition: 'cavity' },
        D: { condition: 'healthy' },
        B: { condition: 'healthy' },
        L: { condition: 'healthy' }
      },
      treatments: [
        { code: 'D2150', description: 'Resin-based composite - two surfaces', surface: 'MO', date: '2024-02-10', dentist: 'Dr. Johnson', status: 'planned' }
      ],
      notes: ['Large cavity requiring restoration', 'Patient scheduled for treatment'],
      mobility: 0,
      periodontal: {
        probing: { MB: 3, DB: 2, ML: 3, DL: 2 },
        bleeding: false,
        plaque: true
      }
    }
  });

  const treatmentCodes = [
    { code: 'D0150', description: 'Comprehensive oral evaluation' },
    { code: 'D1110', description: 'Prophylaxis - adult' },
    { code: 'D2161', description: 'Resin composite - one surface' },
    { code: 'D2150', description: 'Resin composite - two surfaces' },
    { code: 'D2140', description: 'Resin composite - three surfaces' },
    { code: 'D2740', description: 'Crown - porcelain/ceramic' },
    { code: 'D3310', description: 'Endodontic treatment' },
    { code: 'D7140', description: 'Extraction, erupted tooth' }
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'healthy': return '#10b981';
      case 'cavity': return '#ef4444';
      case 'filled': return '#3b82f6';
      case 'crown': return '#f59e0b';
      case 'extracted': return '#6b7280';
      case 'root_canal': return '#8b5cf6';
      case 'watchful': return '#f97316';
      default: return '#d1d5db';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'planned': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const DetailedToothSVG = ({ toothNumber }: { toothNumber: number }) => {
    const tooth = teethData[toothNumber];
    if (!tooth) return null;

    return (
      <div className="relative">
        <svg width="80" height="100" viewBox="0 0 80 100" className="cursor-pointer">
          {/* Tooth outline */}
          <path
            d="M40 10 C50 10, 60 18, 60 32 L60 65 C60 75, 50 85, 40 85 C30 85, 20 75, 20 65 L20 32 C20 18, 30 10, 40 10 Z"
            fill="white"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* Surface divisions with conditions */}
          {/* Mesial */}
          <path
            d="M20 32 L40 25 L40 50 L20 65 Z"
            fill={getConditionColor(tooth.surfaces.M.condition)}
            fillOpacity="0.8"
            stroke="white"
            strokeWidth="1"
          />
          {/* Occlusal */}
          <path
            d="M40 10 C50 10, 60 18, 60 32 L40 25 L20 32 C20 18, 30 10, 40 10 Z"
            fill={getConditionColor(tooth.surfaces.O.condition)}
            fillOpacity="0.8"
            stroke="white"
            strokeWidth="1"
          />
          {/* Distal */}
          <path
            d="M60 32 L40 25 L40 50 L60 65 Z"
            fill={getConditionColor(tooth.surfaces.D.condition)}
            fillOpacity="0.8"
            stroke="white"
            strokeWidth="1"
          />
          {/* Buccal */}
          <path
            d="M40 50 L60 65 L60 32 L40 25 Z"
            fill={getConditionColor(tooth.surfaces.B.condition)}
            fillOpacity="0.8"
            stroke="white"
            strokeWidth="1"
          />
          {/* Lingual */}
          <path
            d="M20 65 L40 85 C50 85, 60 75, 60 65 L40 50 Z"
            fill={getConditionColor(tooth.surfaces.L.condition)}
            fillOpacity="0.8"
            stroke="white"
            strokeWidth="1"
          />
          
          {/* Surface labels */}
          <text x="25" y="48" className="text-xs font-bold fill-white">M</text>
          <text x="40" y="20" className="text-xs font-bold fill-white" textAnchor="middle">O</text>
          <text x="55" y="48" className="text-xs font-bold fill-white">D</text>
          <text x="40" y="42" className="text-xs font-bold fill-white" textAnchor="middle">B</text>
          <text x="40" y="70" className="text-xs font-bold fill-white" textAnchor="middle">L</text>
          
          {/* Tooth number */}
          <text
            x="40"
            y="95"
            textAnchor="middle"
            className="text-sm font-bold fill-gray-700"
          >
            {toothNumber}
          </text>
        </svg>
        
        {/* Treatment indicators */}
        {tooth.treatments.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {tooth.treatments.length}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Detailed Clinical Odontogram</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'treatments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('treatments')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Treatments
            </Button>
            <Button
              variant={viewMode === 'periodontal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('periodontal')}
            >
              Periodontal
            </Button>
            <Button
              variant={viewMode === 'planning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('planning')}
            >
              Treatment Planning
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Odontogram */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upper Arch */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Maxilla (Upper Jaw)</h3>
                <div className="grid grid-cols-8 gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
                    <div
                      key={num}
                      className={`p-2 border-2 rounded-lg transition-all duration-200 hover:shadow-lg ${
                        selectedTooth === num ? 'ring-2 ring-medical-blue bg-medical-blue/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTooth(num)}
                    >
                      <DetailedToothSVG toothNumber={num} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower Arch */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Mandible (Lower Jaw)</h3>
                <div className="grid grid-cols-8 gap-2 justify-center">
                  {[32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17].map((num) => (
                    <div
                      key={num}
                      className={`p-2 border-2 rounded-lg transition-all duration-200 hover:shadow-lg ${
                        selectedTooth === num ? 'ring-2 ring-medical-blue bg-medical-blue/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTooth(num)}
                    >
                      <DetailedToothSVG toothNumber={num} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Panel */}
            <div className="space-y-4">
              {selectedTooth ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tooth #{selectedTooth}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="surfaces" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
                        <TabsTrigger value="treatments">Treatments</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="surfaces" className="space-y-3">
                        {teethData[selectedTooth]?.surfaces &&
                          Object.entries(teethData[selectedTooth].surfaces).map(([surface, data]) => (
                            <div key={surface} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: getConditionColor(data.condition) }}
                                  />
                                  <span className="font-medium">Surface {surface}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {data.condition}
                                </Badge>
                              </div>
                              {data.treatment && (
                                <div className="text-xs text-muted-foreground">
                                  Treatment: {data.treatment.code} - {data.treatment.description}
                                </div>
                              )}
                            </div>
                          ))
                        }
                      </TabsContent>
                      
                      <TabsContent value="treatments" className="space-y-3">
                        {teethData[selectedTooth]?.treatments.map((treatment, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(treatment.status)}
                                  <span className="font-medium text-sm">{treatment.code}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  {treatment.description}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  {treatment.date} • {treatment.dentist}
                                </div>
                              </div>
                              <Badge
                                variant={treatment.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {treatment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button size="sm" className="w-full">Add Treatment</Button>
                      </TabsContent>
                      
                      <TabsContent value="notes" className="space-y-3">
                        {teethData[selectedTooth]?.notes.map((note, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                            {note}
                          </div>
                        ))}
                        <Button size="sm" className="w-full">Add Note</Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Select a tooth to view detailed information
                  </CardContent>
                </Card>
              )}

              {/* Treatment Codes Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Common Treatment Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {treatmentCodes.slice(0, 5).map((code) => (
                    <div key={code.code} className="text-xs">
                      <span className="font-mono font-medium">{code.code}:</span>
                      <span className="ml-2 text-muted-foreground">{code.description}</span>
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