import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ToothCondition {
  number: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'extracted' | 'root_canal';
  surfaces?: ('M' | 'O' | 'D' | 'B' | 'L' | 'I')[];
  notes?: string;
}

export function AnatomicalOdontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  
  const [conditions, setConditions] = useState<Record<number, ToothCondition>>({
    8: { number: 8, condition: 'filled', surfaces: ['O'] },
    14: { number: 14, condition: 'cavity', surfaces: ['M', 'O'] },
    19: { number: 19, condition: 'crown' },
    30: { number: 30, condition: 'extracted' },
  });

  const getToothPath = (toothNumber: number) => {
    // Simplified tooth shapes - in real implementation, these would be more detailed SVG paths
    const baseToothPath = "M20,10 C25,5 35,5 40,10 L40,50 C35,60 25,60 20,50 Z";
    return baseToothPath;
  };

  const getToothColor = (toothNumber: number) => {
    const condition = conditions[toothNumber];
    if (!condition) return '#ffffff';
    
    switch (condition.condition) {
      case 'healthy': return '#ffffff';
      case 'cavity': return '#fee2e2';
      case 'filled': return '#dbeafe';
      case 'crown': return '#fef3c7';
      case 'extracted': return '#f3f4f6';
      case 'root_canal': return '#f3e8ff';
      default: return '#ffffff';
    }
  };

  const getToothStroke = (toothNumber: number) => {
    if (selectedTooth === toothNumber) return '#3b82f6';
    if (hoveredTooth === toothNumber) return '#6b7280';
    
    const condition = conditions[toothNumber];
    if (!condition) return '#d1d5db';
    
    switch (condition.condition) {
      case 'cavity': return '#ef4444';
      case 'filled': return '#3b82f6';
      case 'crown': return '#f59e0b';
      case 'extracted': return '#9ca3af';
      case 'root_canal': return '#8b5cf6';
      default: return '#d1d5db';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Anatomical Digital Odontogram</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Main Odontogram SVG */}
            <svg viewBox="0 0 800 600" className="w-full h-96 border rounded-lg bg-gradient-to-b from-blue-50 to-white">
              {/* Upper Jaw Arc */}
              <g transform="translate(400, 150)">
                {/* Right Upper Quadrant */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => {
                  const angle = (index * 22.5) - 90;
                  const radius = 120;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <g key={num} transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                      <rect
                        width="30"
                        height="40"
                        rx="8"
                        ry="15"
                        x="-15"
                        y="-20"
                        fill={getToothColor(num)}
                        stroke={getToothStroke(num)}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredTooth(num)}
                        onMouseLeave={() => setHoveredTooth(null)}
                        onClick={() => setSelectedTooth(num)}
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="text-xs font-bold fill-current pointer-events-none"
                        transform={`rotate(${-(angle + 90)})`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
                
                {/* Left Upper Quadrant */}
                {[9, 10, 11, 12, 13, 14, 15, 16].map((num, index) => {
                  const angle = 90 + (index * 22.5);
                  const radius = 120;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <g key={num} transform={`translate(${x}, ${y}) rotate(${angle + 90})`}>
                      <rect
                        width="30"
                        height="40"
                        rx="8"
                        ry="15"
                        x="-15"
                        y="-20"
                        fill={getToothColor(num)}
                        stroke={getToothStroke(num)}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredTooth(num)}
                        onMouseLeave={() => setHoveredTooth(null)}
                        onClick={() => setSelectedTooth(num)}
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="text-xs font-bold fill-current pointer-events-none"
                        transform={`rotate(${-(angle + 90)})`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Lower Jaw Arc */}
              <g transform="translate(400, 400)">
                {/* Right Lower Quadrant */}
                {[32, 31, 30, 29, 28, 27, 26, 25].map((num, index) => {
                  const angle = (index * 22.5) + 90;
                  const radius = 120;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <g key={num} transform={`translate(${x}, ${y}) rotate(${angle - 90})`}>
                      <rect
                        width="30"
                        height="40"
                        rx="8"
                        ry="15"
                        x="-15"
                        y="-20"
                        fill={getToothColor(num)}
                        stroke={getToothStroke(num)}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredTooth(num)}
                        onMouseLeave={() => setHoveredTooth(null)}
                        onClick={() => setSelectedTooth(num)}
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="text-xs font-bold fill-current pointer-events-none"
                        transform={`rotate(${-(angle - 90)})`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
                
                {/* Left Lower Quadrant */}
                {[24, 23, 22, 21, 20, 19, 18, 17].map((num, index) => {
                  const angle = -90 + (index * 22.5);
                  const radius = 120;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <g key={num} transform={`translate(${x}, ${y}) rotate(${angle - 90})`}>
                      <rect
                        width="30"
                        height="40"
                        rx="8"
                        ry="15"
                        x="-15"
                        y="-20"
                        fill={getToothColor(num)}
                        stroke={getToothStroke(num)}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredTooth(num)}
                        onMouseLeave={() => setHoveredTooth(null)}
                        onClick={() => setSelectedTooth(num)}
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="text-xs font-bold fill-current pointer-events-none"
                        transform={`rotate(${-(angle - 90)})`}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Quadrant Labels */}
              <text x="200" y="30" className="fill-current text-sm font-semibold text-muted-foreground">Quadrant II</text>
              <text x="550" y="30" className="fill-current text-sm font-semibold text-muted-foreground">Quadrant I</text>
              <text x="200" y="580" className="fill-current text-sm font-semibold text-muted-foreground">Quadrant III</text>
              <text x="550" y="580" className="fill-current text-sm font-semibold text-muted-foreground">Quadrant IV</text>
            </svg>

            {/* Tooth Details Panel */}
            {(selectedTooth || hoveredTooth) && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border rounded-lg p-4 shadow-lg min-w-48">
                <h4 className="font-semibold text-sm mb-2">
                  Tooth #{selectedTooth || hoveredTooth}
                </h4>
                {conditions[selectedTooth || hoveredTooth!] ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <Badge className="text-xs">
                        {conditions[selectedTooth || hoveredTooth!].condition}
                      </Badge>
                    </div>
                    {conditions[selectedTooth || hoveredTooth!].surfaces && (
                      <p className="text-xs text-muted-foreground">
                        Surfaces: {conditions[selectedTooth || hoveredTooth!].surfaces!.join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Healthy</p>
                )}
                {selectedTooth && (
                  <div className="flex gap-1 mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      History
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Treatment Legend */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/10">
            <h4 className="font-semibold mb-3">Treatment Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { condition: 'healthy', label: 'Healthy', color: '#ffffff', border: '#d1d5db' },
                { condition: 'cavity', label: 'Cavity', color: '#fee2e2', border: '#ef4444' },
                { condition: 'filled', label: 'Filled', color: '#dbeafe', border: '#3b82f6' },
                { condition: 'crown', label: 'Crown', color: '#fef3c7', border: '#f59e0b' },
                { condition: 'extracted', label: 'Extracted', color: '#f3f4f6', border: '#9ca3af' },
                { condition: 'root_canal', label: 'Root Canal', color: '#f3e8ff', border: '#8b5cf6' }
              ].map(({ condition, label, color, border }) => (
                <div key={condition} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-6 rounded border-2"
                    style={{ backgroundColor: color, borderColor: border }}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}