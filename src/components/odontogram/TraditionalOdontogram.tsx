import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ToothData {
  number: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'extracted' | 'root_canal';
  surfaces?: string[];
  notes?: string;
}

export function TraditionalOdontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  
  // Traditional numbering system (1-32 for adults)
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

  const [teethData, setTeethData] = useState<Record<number, ToothData>>({
    1: { number: 1, condition: 'healthy' },
    2: { number: 2, condition: 'filled', surfaces: ['O'] },
    3: { number: 3, condition: 'cavity', surfaces: ['M', 'O'] },
    // Add more sample data...
  });

  const getToothColor = (condition: string) => {
    switch (condition) {
      case 'healthy': return 'bg-white border-gray-300';
      case 'cavity': return 'bg-red-100 border-red-400';
      case 'filled': return 'bg-blue-100 border-blue-400';
      case 'crown': return 'bg-yellow-100 border-yellow-400';
      case 'extracted': return 'bg-gray-200 border-gray-400';
      case 'root_canal': return 'bg-purple-100 border-purple-400';
      default: return 'bg-white border-gray-300';
    }
  };

  const getConditionBadge = (condition: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      cavity: 'bg-red-100 text-red-800',
      filled: 'bg-blue-100 text-blue-800',
      crown: 'bg-yellow-100 text-yellow-800',
      extracted: 'bg-gray-100 text-gray-800',
      root_canal: 'bg-purple-100 text-purple-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Traditional Digital Odontogram</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upper Jaw */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Upper Jaw (Maxilla)</h3>
            <div className="grid grid-cols-16 gap-1 mb-2">
              {upperTeeth.map((toothNum) => {
                const tooth = teethData[toothNum] || { number: toothNum, condition: 'healthy' };
                return (
                  <div
                    key={toothNum}
                    className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                      getToothColor(tooth.condition)
                    } ${selectedTooth === toothNum ? 'ring-2 ring-medical-blue' : ''}`}
                    onClick={() => setSelectedTooth(toothNum)}
                  >
                    <span className="text-xs font-bold">{toothNum}</span>
                    {tooth.surfaces && (
                      <div className="text-xs opacity-70">
                        {tooth.surfaces.join('')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Tooth type labels */}
            <div className="grid grid-cols-16 gap-1 text-xs text-center text-muted-foreground">
              {['M3', 'M2', 'M1', 'PM2', 'PM1', 'C', 'LI', 'CI', 'CI', 'LI', 'C', 'PM1', 'PM2', 'M1', 'M2', 'M3'].map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>
          </div>

          {/* Lower Jaw */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Lower Jaw (Mandible)</h3>
            <div className="grid grid-cols-16 gap-1 mb-2">
              {lowerTeeth.reverse().map((toothNum) => {
                const tooth = teethData[toothNum] || { number: toothNum, condition: 'healthy' };
                return (
                  <div
                    key={toothNum}
                    className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                      getToothColor(tooth.condition)
                    } ${selectedTooth === toothNum ? 'ring-2 ring-medical-blue' : ''}`}
                    onClick={() => setSelectedTooth(toothNum)}
                  >
                    <span className="text-xs font-bold">{toothNum}</span>
                    {tooth.surfaces && (
                      <div className="text-xs opacity-70">
                        {tooth.surfaces.join('')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Tooth type labels */}
            <div className="grid grid-cols-16 gap-1 text-xs text-center text-muted-foreground">
              {['M3', 'M2', 'M1', 'PM2', 'PM1', 'C', 'LI', 'CI', 'CI', 'LI', 'C', 'PM1', 'PM2', 'M1', 'M2', 'M3'].map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 border rounded-lg bg-muted/20">
            <h4 className="font-semibold mb-3">Legend</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { condition: 'healthy', label: 'Healthy' },
                { condition: 'cavity', label: 'Cavity' },
                { condition: 'filled', label: 'Filled' },
                { condition: 'crown', label: 'Crown' },
                { condition: 'extracted', label: 'Extracted' },
                { condition: 'root_canal', label: 'Root Canal' }
              ].map(({ condition, label }) => (
                <Badge key={condition} className={getConditionBadge(condition)}>
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected Tooth Details */}
          {selectedTooth && (
            <div className="mt-6 p-4 border rounded-lg bg-primary/5">
              <h4 className="font-semibold mb-2">Tooth #{selectedTooth} Details</h4>
              <div className="space-y-2">
                <p><strong>Condition:</strong> {teethData[selectedTooth]?.condition || 'healthy'}</p>
                {teethData[selectedTooth]?.surfaces && (
                  <p><strong>Affected Surfaces:</strong> {teethData[selectedTooth].surfaces.join(', ')}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Add Treatment</Button>
                  <Button size="sm" variant="outline">View History</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}