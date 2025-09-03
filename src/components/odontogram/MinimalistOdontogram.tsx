import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ToothCondition {
  number: number;
  status: 'healthy' | 'cavity' | 'filled' | 'crown' | 'extracted' | 'root_canal';
  priority: 'low' | 'medium' | 'high';
}

export function MinimalistOdontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<number | null>(null);
  
  const [conditions, setConditions] = useState<Record<number, ToothCondition>>({
    8: { number: 8, status: 'filled', priority: 'low' },
    14: { number: 14, status: 'cavity', priority: 'high' },
    19: { number: 19, status: 'crown', priority: 'low' },
    30: { number: 30, status: 'extracted', priority: 'medium' },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-white';
      case 'cavity': return 'bg-red-500';
      case 'filled': return 'bg-blue-500';
      case 'crown': return 'bg-yellow-500';
      case 'extracted': return 'bg-gray-400';
      case 'root_canal': return 'bg-purple-500';
      default: return 'bg-white';
    }
  };

  const getPriorityRing = (priority: string) => {
    switch (priority) {
      case 'high': return 'ring-2 ring-red-400';
      case 'medium': return 'ring-2 ring-yellow-400';
      case 'low': return 'ring-1 ring-green-400';
      default: return '';
    }
  };

  const quadrants = [
    { id: 1, name: 'Q1', teeth: [1, 2, 3, 4, 5, 6, 7, 8], position: 'top-right' },
    { id: 2, name: 'Q2', teeth: [9, 10, 11, 12, 13, 14, 15, 16], position: 'top-left' },
    { id: 3, name: 'Q3', teeth: [17, 18, 19, 20, 21, 22, 23, 24], position: 'bottom-left' },
    { id: 4, name: 'Q4', teeth: [25, 26, 27, 28, 29, 30, 31, 32], position: 'bottom-right' }
  ];

  const ToothCircle = ({ toothNumber }: { toothNumber: number }) => {
    const condition = conditions[toothNumber];
    const isSelected = selectedTooth === toothNumber;
    
    return (
      <div
        className={`
          w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center
          cursor-pointer transition-all duration-200 hover:scale-110
          ${condition ? getStatusColor(condition.status) : 'bg-white'}
          ${condition ? getPriorityRing(condition.priority) : ''}
          ${isSelected ? 'ring-4 ring-medical-blue ring-offset-2' : ''}
        `}
        onClick={() => setSelectedTooth(toothNumber)}
      >
        <span className={`text-xs font-bold ${
          condition?.status === 'extracted' ? 'text-white' : 
          condition?.status === 'cavity' || condition?.status === 'filled' || condition?.status === 'root_canal' 
            ? 'text-white' : 'text-gray-700'
        }`}>
          {toothNumber}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Minimalist Digital Odontogram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Main Odontogram Grid */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border">
              {/* Center Cross Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-px bg-gray-200"></div>
              </div>

              {/* Quadrant 2 - Top Left */}
              <div 
                className={`absolute top-4 left-4 space-y-2 cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedQuadrant === 2 ? 'bg-medical-blue/10' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedQuadrant(selectedQuadrant === 2 ? null : 2)}
              >
                <div className="text-xs text-muted-foreground mb-2 text-center">Q2</div>
                <div className="grid grid-cols-4 gap-2">
                  {[16, 15, 14, 13].map(num => <ToothCircle key={num} toothNumber={num} />)}
                  {[12, 11, 10, 9].map(num => <ToothCircle key={num} toothNumber={num} />)}
                </div>
              </div>

              {/* Quadrant 1 - Top Right */}
              <div 
                className={`absolute top-4 right-4 space-y-2 cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedQuadrant === 1 ? 'bg-medical-blue/10' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedQuadrant(selectedQuadrant === 1 ? null : 1)}
              >
                <div className="text-xs text-muted-foreground mb-2 text-center">Q1</div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(num => <ToothCircle key={num} toothNumber={num} />)}
                  {[5, 6, 7, 8].map(num => <ToothCircle key={num} toothNumber={num} />)}
                </div>
              </div>

              {/* Quadrant 3 - Bottom Left */}
              <div 
                className={`absolute bottom-4 left-4 space-y-2 cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedQuadrant === 3 ? 'bg-medical-blue/10' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedQuadrant(selectedQuadrant === 3 ? null : 3)}
              >
                <div className="text-xs text-muted-foreground mb-2 text-center">Q3</div>
                <div className="grid grid-cols-4 gap-2">
                  {[24, 23, 22, 21].map(num => <ToothCircle key={num} toothNumber={num} />)}
                  {[20, 19, 18, 17].map(num => <ToothCircle key={num} toothNumber={num} />)}
                </div>
              </div>

              {/* Quadrant 4 - Bottom Right */}
              <div 
                className={`absolute bottom-4 right-4 space-y-2 cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedQuadrant === 4 ? 'bg-medical-blue/10' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedQuadrant(selectedQuadrant === 4 ? null : 4)}
              >
                <div className="text-xs text-muted-foreground mb-2 text-center">Q4</div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 26, 27, 28].map(num => <ToothCircle key={num} toothNumber={num} />)}
                  {[29, 30, 31, 32].map(num => <ToothCircle key={num} toothNumber={num} />)}
                </div>
              </div>

              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white px-3 py-1 rounded-full border text-xs text-muted-foreground">
                  Adult Dentition
                </div>
              </div>
            </div>

            {/* Selected Tooth Info */}
            {selectedTooth && (
              <Card className="border-medical-blue/20 bg-medical-blue/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Tooth #{selectedTooth}</h3>
                      {conditions[selectedTooth] ? (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(conditions[selectedTooth].status)}`} />
                            <span className="text-sm capitalize">{conditions[selectedTooth].status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Priority: <span className="capitalize">{conditions[selectedTooth].priority}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">Healthy tooth</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Record Treatment</Button>
                      <Button size="sm">Schedule</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Simple Legend */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { status: 'healthy', label: 'Healthy', color: 'bg-white border-gray-300' },
                { status: 'cavity', label: 'Cavity', color: 'bg-red-500' },
                { status: 'filled', label: 'Filled', color: 'bg-blue-500' },
                { status: 'crown', label: 'Crown', color: 'bg-yellow-500' },
                { status: 'extracted', label: 'Extracted', color: 'bg-gray-400' },
                { status: 'root_canal', label: 'Root Canal', color: 'bg-purple-500' }
              ].map(({ status, label, color }) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Priority Indicators */}
            <div className="text-center">
              <h4 className="font-medium mb-3">Priority Indicators</h4>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border-2 ring-2 ring-red-400" />
                  <span className="text-sm">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border-2 ring-2 ring-yellow-400" />
                  <span className="text-sm">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-white border-2 ring-1 ring-green-400" />
                  <span className="text-sm">Low Priority</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}