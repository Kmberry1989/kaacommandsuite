'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface ScribbleCanvasProps {
  onScribble: (dataUrl: string) => void;
}

/**
 * A reusable canvas component for drawing/scribbling.
 * It provides controls for brush color and size, and is responsive.
 * @param onScribble - A callback function that is called with the canvas data URL whenever the user stops drawing.
 */
const ScribbleCanvas = ({ onScribble }: ScribbleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState([5]);

  // This function now only handles resizing, not styling.
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    // Save current drawing
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);

    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = (rect.width * 0.75) * dpr; // 4:3 aspect ratio
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      // Restore drawing after resize
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
      // Re-apply settings after resize
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize[0];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [brushColor, brushSize]); // Keep dependencies to re-apply style on resize

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      setContext(ctx);
      // Initial resize and style setup
      resizeCanvas();
    }
  }, [resizeCanvas]);

  // Set up resize listener
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  // Update canvas context settings only when brush properties change
  useEffect(() => {
    if (context) {
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize[0];
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  }, [brushColor, brushSize, context]);

  // Gets the mouse/touch coordinates relative to the canvas
  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Event handler to start drawing
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (context) {
      const { x, y } = getCoords(event);
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  // Event handler for drawing
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    if (event.cancelable) event.preventDefault(); // Prevents scrolling on touch devices
    const { x, y } = getCoords(event);
    context.lineTo(x, y);
    context.stroke();
  };

  // Event handler to stop drawing and notify parent component
  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setIsDrawing(false);
      const dataUrl = canvasRef.current?.toDataURL('image/png') ?? '';
      onScribble(dataUrl);
    }
  };

  // Clears the canvas
  const clearCanvas = () => {
    if (context && canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      onScribble('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border-2 border-gray-300 rounded-lg bg-white w-full cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
      <div className="flex flex-wrap items-center justify-center gap-4 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: brushColor }}></div>
              <span className="ml-2">Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex gap-1 p-2">
                {['#000000', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ffffff'].map(color => (
                    <button key={color} onClick={() => setBrushColor(color)} className="w-8 h-8 rounded-full border hover:scale-110 transition-transform" style={{backgroundColor: color}}></button>
                ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2 w-48">
            <span>Size:</span>
            <Slider
                defaultValue={brushSize}
                onValueChange={setBrushSize}
                max={50}
                min={1}
                step={1}
            />
        </div>
        <Button onClick={clearCanvas} variant="destructive">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ScribbleCanvas;
