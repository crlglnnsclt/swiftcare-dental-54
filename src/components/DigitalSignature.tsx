import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, PenTool } from 'lucide-react';

interface DigitalSignatureProps {
  onSignatureChange: (signature: string) => void;
  required?: boolean;
  width?: number;
  height?: number;
}

export function DigitalSignature({ 
  onSignatureChange, 
  required = false, 
  width = 400, 
  height = 200 
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set up canvas
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    // Set canvas background to white
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    
    setCtx(context);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    
    setIsEmpty(false);
    
    // Convert canvas to base64 and notify parent
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSignatureChange(signatureData);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setIsEmpty(true);
    onSignatureChange('');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Sign below {required && <span className="text-destructive">*</span>}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={isEmpty}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </Button>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="cursor-crosshair bg-white touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ display: 'block' }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {isEmpty 
              ? 'Please sign in the box above using your mouse or finger' 
              : 'Signature captured - you can continue or clear to start over'
            }
          </p>
        </div>
      </Card>
    </div>
  );
}