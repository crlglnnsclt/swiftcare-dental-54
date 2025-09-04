import React, { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brush, Eraser, Trash2, Download, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface DrawingCanvasProps {
  patientName?: string;
  onSave?: (imageData: string) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ patientName, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(true);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    // Set up drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);
    toast.success('Drawing canvas ready!');

    return () => {
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
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast.success('Canvas cleared!');
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const imageData = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1,
    });
    
    if (onSave) {
      onSave(imageData);
    }
    
    // Download the image
    const link = document.createElement('a');
    link.download = `dental-chart-${patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = imageData;
    link.click();
    
    toast.success('Chart saved successfully!');
  };

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = !isDrawing;
    }
  };

  const colors = ['#000000', '#ff0000', '#0000ff', '#008000', '#ffa500', '#800080', '#ffc0cb'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="w-5 h-5" />
          Drawing Canvas - {patientName || 'Patient Chart'}
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
            {isDrawing ? 'Draw' : 'Select'}
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
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white">
          <canvas 
            ref={canvasRef} 
            className="max-w-full touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Use your mouse, finger, or stylus to draw directly on the chart</p>
          <p>• Switch between drawing and selection modes using the tools above</p>
          <p>• Save your work when finished</p>
        </div>
      </CardContent>
    </Card>
  );
};