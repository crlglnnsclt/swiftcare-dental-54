import React, { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brush, Eraser, Trash2, Download, Palette, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import swiftCareLogo from '@/assets/swift-care-logo-correct.png';

interface ToothCondition {
  toothNumber: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'missing' | 'root_canal' | 'implant';
  notes?: string;
  treatment?: string;
  date?: string;
}

interface DrawableSwiftChartProps {
  patientName?: string;
  teethConditions?: ToothCondition[];
  onSave?: (imageData: string) => void;
  onToothClick?: (toothNumber: number) => void;
}

const TOOTH_CONDITIONS = [
  { value: 'healthy', label: 'Healthy', color: 'bg-green-500', code: '' },
  { value: 'cavity', label: 'Caries', color: 'bg-red-500', code: 'C' },
  { value: 'extraction', label: 'Extraction', color: 'bg-gray-700', code: 'Ex' },
  { value: 'root_fragment', label: 'Root Fragment', color: 'bg-gray-500', code: 'RF' },
  { value: 'missing', label: 'Missing', color: 'bg-gray-400', code: 'M' },
  { value: 'unerupted', label: 'Unerupted Tooth', color: 'bg-blue-400', code: 'Un' },
  { value: 'impacted', label: 'Impacted Tooth', color: 'bg-purple-400', code: 'Im' },
  { value: 'jacket', label: 'Jacket', color: 'bg-yellow-500', code: 'J' },
  { value: 'amalgam', label: 'Amalgam', color: 'bg-gray-600', code: 'Am' },
  { value: 'abutment', label: 'Abutment', color: 'bg-orange-500', code: 'Ab' },
  { value: 'pontic', label: 'Pontic', color: 'bg-pink-500', code: 'P' },
  { value: 'inlay', label: 'Inlay', color: 'bg-indigo-500', code: 'I' },
  { value: 'fixed_bridge', label: 'Fixed Bridge', color: 'bg-teal-500', code: 'Fx' },
  { value: 'sealant', label: 'Sealant', color: 'bg-green-600', code: 'S' },
  { value: 'removable_denture', label: 'Removable Denture', color: 'bg-rose-500', code: 'Rm' }
];

export const DrawableSwiftChart: React.FC<DrawableSwiftChartProps> = ({ 
  patientName, 
  teethConditions = [],
  onSave, 
  onToothClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(2);

  useEffect(() => {
    if (!canvasRef.current || !chartRef.current) return;

    // Set canvas size to match the chart
    const chartRect = chartRef.current.getBoundingClientRect();
    const canvas = new FabricCanvas(canvasRef.current, {
      width: chartRect.width,
      height: chartRect.height,
      isDrawingMode: false,
    });

    canvas.backgroundColor = 'transparent';

    // Set up drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);

    // Resize observer to adjust canvas size
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        const newRect = chartRef.current.getBoundingClientRect();
        canvas.setDimensions({
          width: newRect.width,
          height: newRect.height
        });
      }
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    fabricCanvas.isDrawingMode = isDrawing;
    
    if (isDrawing && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [isDrawing, brushColor, brushSize, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    toast.success('Drawing cleared!');
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const imageData = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2,
    });
    
    if (onSave) {
      onSave(imageData);
    }
    
    // Download the image
    const link = document.createElement('a');
    link.download = `swift-care-chart-${patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = imageData;
    link.click();
    
    toast.success('Chart saved successfully!');
  };

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    toast.info(isDrawing ? 'Drawing mode disabled' : 'Drawing mode enabled');
  };

  const colors = ['#ff0000', '#0000ff', '#008000', '#000000', '#ffa500', '#800080', '#ffc0cb'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="w-5 h-5" />
          Swift Care Chart - {patientName || 'Patient'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drawing Tools */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Button
            variant={isDrawing ? "default" : "outline"}
            size="sm"
            onClick={toggleDrawingMode}
            className="flex items-center gap-2"
          >
            {isDrawing ? <Brush className="w-4 h-4" /> : <Eraser className="w-4 h-4" />}
            {isDrawing ? 'Drawing' : 'Select'}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Color:</span>
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-6 h-6 rounded border-2 ${brushColor === color ? 'border-primary' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Chart with overlay canvas */}
        <div className="relative border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Chart Background */}
          <div ref={chartRef} className="bg-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={swiftCareLogo} 
                  alt="Swift Care Dental Clinic" 
                  className="h-12 w-auto"
                />
                <div>
                  <h2 className="text-xl font-bold text-amber-800">Swift Care</h2>
                  <p className="text-sm text-amber-700">DENTAL CLINIC</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">Sicangco Building, San Rafael, Mac Arthur Hi-way,</p>
                <p>Tarlac City, Tarlac, Philippines 2300</p>
                <p className="text-blue-600">www.facebook.com/swiftcaredentalclinic</p>
              </div>
            </div>

            {/* Chart Info */}
            <div className="flex justify-between mb-4">
              <div>
                <span className="font-semibold">Chart #: ________</span>
              </div>
              <div>
                <span className="font-semibold">Date: ________</span>
              </div>
            </div>

            <h3 className="text-center text-xl font-bold mb-6">PATIENT'S CHART</h3>

            {/* Dental Chart - Exact copy from uploaded template */}
            <div className="space-y-6">
              {/* Upper Teeth Section */}
              <div className="text-center">
                <div className="grid grid-cols-4 text-xs mb-2 gap-4">
                  <span className="font-semibold">Maxillary right</span>
                  <span className="font-semibold">Maxillary left</span>
                  <span className="font-semibold">Primary maxillary right</span>
                  <span className="font-semibold">Primary maxillary left</span>
                </div>
                
                {/* Main upper teeth row */}
                <div className="flex justify-center gap-0 mb-4">
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((toothNumber) => {
                    const condition = teethConditions.find(t => t.toothNumber === toothNumber);
                    const conditionConfig = TOOTH_CONDITIONS.find(c => c.value === condition?.condition);
                    
                    return (
                      <div
                        key={toothNumber}
                        onClick={() => !isDrawing && onToothClick?.(toothNumber)}
                        className={`w-8 h-16 border border-black ${!isDrawing ? 'cursor-pointer hover:bg-blue-100' : ''} flex flex-col items-center justify-start relative bg-orange-100`}
                      >
                        <span className="text-xs font-bold mt-1">{toothNumber}</span>
                        <div className="w-6 h-10 border border-gray-400 bg-white flex items-center justify-center mt-1">
                          {conditionConfig?.code && (
                            <span className="text-xs font-bold">{conditionConfig.code}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Primary teeth section upper right */}
                  <div className="ml-4 flex gap-0">
                    {['E', 'F', 'G', 'H', 'I'].map((letter) => (
                      <div key={letter} className="w-6 h-16 border border-black flex flex-col items-center justify-start bg-orange-100">
                        <span className="text-xs font-bold mt-1">{letter}</span>
                        <div className="w-5 h-8 border border-gray-400 bg-white mt-2"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Primary teeth section upper left */}
                  <div className="ml-2 flex gap-0">
                    {['J', 'K', 'L', 'M', 'N'].map((letter) => (
                      <div key={letter} className="w-6 h-16 border border-black flex flex-col items-center justify-start bg-orange-100">
                        <span className="text-xs font-bold mt-1">{letter}</span>
                        <div className="w-5 h-8 border border-gray-400 bg-white mt-2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Teeth Section */}
              <div className="text-center">
                {/* Main lower teeth row */}
                <div className="flex justify-center gap-0 mb-2">
                  {Array.from({ length: 16 }, (_, i) => i + 17).map((toothNumber) => {
                    const condition = teethConditions.find(t => t.toothNumber === toothNumber);
                    const conditionConfig = TOOTH_CONDITIONS.find(c => c.value === condition?.condition);
                    
                    return (
                      <div
                        key={toothNumber}
                        onClick={() => !isDrawing && onToothClick?.(toothNumber)}
                        className={`w-8 h-16 border border-black ${!isDrawing ? 'cursor-pointer hover:bg-blue-100' : ''} flex flex-col items-center justify-end relative bg-orange-100`}
                      >
                        <div className="w-6 h-10 border border-gray-400 bg-white flex items-center justify-center mb-1">
                          {conditionConfig?.code && (
                            <span className="text-xs font-bold">{conditionConfig.code}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold mb-1">{toothNumber}</span>
                      </div>
                    );
                  })}
                  
                  {/* Primary teeth section lower right */}
                  <div className="ml-4 flex gap-0">
                    {['T', 'S', 'R', 'Q', 'P'].map((letter) => (
                      <div key={letter} className="w-6 h-16 border border-black flex flex-col items-center justify-end bg-orange-100">
                        <div className="w-5 h-8 border border-gray-400 bg-white mb-2"></div>
                        <span className="text-xs font-bold mb-1">{letter}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Primary teeth section lower left */}
                  <div className="ml-2 flex gap-0">
                    {['O', 'N', 'M', 'L', 'K'].map((letter) => (
                      <div key={letter} className="w-6 h-16 border border-black flex flex-col items-center justify-end bg-orange-100">
                        <div className="w-5 h-8 border border-gray-400 bg-white mb-2"></div>
                        <span className="text-xs font-bold mb-1">{letter}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 text-xs gap-4 mt-2">
                  <span className="font-semibold">Mandibular right</span>
                  <span className="font-semibold">Mandibular left</span>
                  <span className="font-semibold">Primary mandibular right</span>
                  <span className="font-semibold">Primary mandibular left</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div><strong>C – Caries</strong></div>
                <div><strong>Ex – Extraction</strong></div>
                <div><strong>RF – Root Fragment</strong></div>
              </div>
              <div className="space-y-1">
                <div><strong>M – Missing</strong></div>
                <div><strong>Un – Unerupted Tooth</strong></div>
                <div><strong>Im – Impacted Tooth</strong></div>
              </div>
              <div className="space-y-1">
                <div><strong>J – Jacket</strong></div>
                <div><strong>Am – Amalgam</strong></div>
                <div><strong>Ab – Abutment</strong></div>
              </div>
              <div className="space-y-1">
                <div><strong>P – Pontic</strong></div>
                <div><strong>I – Inlay</strong></div>
                <div><strong>Fx – Fixed Bridge</strong></div>
              </div>
              <div className="space-y-1">
                <div><strong>S – Sealant</strong></div>
                <div><strong>Rm – Removable Denture</strong></div>
              </div>
            </div>
          </div>

          {/* Drawing Canvas Overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 pointer-events-auto touch-none"
            style={{ 
              touchAction: 'none',
              pointerEvents: isDrawing ? 'auto' : 'none'
            }}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Click "Drawing" to enable drawing mode and draw directly on the chart</p>
          <p>• Click "Select" to interact with teeth and chart elements</p>
          <p>• Use touch, stylus, or mouse to draw annotations and notes</p>
        </div>
      </CardContent>
    </Card>
  );
};