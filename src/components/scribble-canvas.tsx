'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChromePicker } from 'react-color';

interface ScribbleCanvasProps {
  onScribble: (dataUrl: string) => void;
}

/**
 * A reusable canvas component for drawing/scribbling.
 * It provides controls for brush color and size, and is responsive.
 * @param onScribble - A callback function that is called with the canvas data URL whenever the user stops drawing.
 */
const ScribbleCanvas = ({ onScribble }: ScribbleCanvasProps) => {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  // Handle paste event for images
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!canvasRef.current) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const img = new window.Image();
            img.onload = () => {
              setBackgroundImage(img);
              // Draw image to canvas
              const ctx = canvasRef.current?.getContext('2d');
              if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                onScribble(canvasRef.current.toDataURL('image/png'));
              }
            };
            img.src = URL.createObjectURL(file);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onScribble]);

  // Redraw background image if set (e.g., after resize)
  useEffect(() => {
    if (backgroundImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(backgroundImage, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [backgroundImage]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState([5]);
  const [isEraser, setIsEraser] = useState(false);

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

  // Update canvas context settings only when brush properties or eraser change
  useEffect(() => {
    if (context) {
      if (isEraser) {
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = brushColor;
      }
      context.lineWidth = brushSize[0];
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  }, [brushColor, brushSize, context, isEraser]);

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


  // Calligraphy pen state
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [calligraphyAngle, setCalligraphyAngle] = useState(45); // degrees

  // Event handler to start drawing (calligraphy effect)
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (context) {
      const { x, y } = getCoords(event);
      setLastPoint({ x, y });
      setIsDrawing(true);
    }
  };

  // Event handler for drawing (calligraphy effect)
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    if (event.cancelable) event.preventDefault();
    const { x, y } = getCoords(event);
    if (lastPoint) {
      // Calligraphy nib effect: draw a rotated ellipse between lastPoint and (x, y)
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(2, Math.floor(dist / 1.5));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = lastPoint.x + dx * t;
        const py = lastPoint.y + dy * t;
        // Add slight irregularity
        const angle = (calligraphyAngle + (Math.random() - 0.5) * 8) * Math.PI / 180;
        const width = brushSize[0] * (0.9 + Math.random() * 0.2);
        const height = width * 0.35 * (0.9 + Math.random() * 0.2);
        context.save();
        context.translate(px, py);
        context.rotate(angle);
        context.beginPath();
        context.ellipse(0, 0, width, height, 0, 0, 2 * Math.PI);
        context.fillStyle = isEraser ? 'rgba(0,0,0,1)' : brushColor;
        if (isEraser) {
          context.globalCompositeOperation = 'destination-out';
        } else {
          context.globalCompositeOperation = 'source-over';
        }
        context.globalAlpha = 0.85 + Math.random() * 0.15;
        context.fill();
        context.restore();
      }
    }
    setLastPoint({ x, y });
  };

  // Event handler to stop drawing and notify parent component
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
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
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="text-xs text-gray-500">Paste an image from your clipboard (Ctrl+V or Cmd+V) or upload an image to stage it for editing.</div>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="scribble-upload-input"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              // Enforce image constraints (max 1024x1024, file size < 2MB)
              if (file.size > 2 * 1024 * 1024) {
                alert('Image file too large (max 2MB).');
                return;
              }
              const img = new window.Image();
              img.onload = () => {
                if (img.width > 1024 || img.height > 1024) {
                  alert('Image dimensions too large (max 1024x1024).');
                  return;
                }
                setBackgroundImage(img);
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx && canvasRef.current) {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                  onScribble(canvasRef.current.toDataURL('image/png'));
                }
              };
              img.src = URL.createObjectURL(file);
            }
          }}
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById('scribble-upload-input')?.click()}
          className="w-full"
        >
          Upload Image
        </Button>
        {backgroundImage && (
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setBackgroundImage(null)}>Remove</Button>
            <Button variant="outline" onClick={() => {
              // Resize image to fit canvas
              if (canvasRef.current && backgroundImage) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  ctx.drawImage(backgroundImage, 0, 0, canvasRef.current.width, canvasRef.current.height);
                  onScribble(canvasRef.current.toDataURL('image/png'));
                }
              }
            }}>Resize to Canvas</Button>
            <Button variant="outline" onClick={() => {
              // Move image (simple implementation: re-center)
              if (canvasRef.current && backgroundImage) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  const x = (canvasRef.current.width - backgroundImage.width) / 2;
                  const y = (canvasRef.current.height - backgroundImage.height) / 2;
                  ctx.drawImage(backgroundImage, x, y, backgroundImage.width, backgroundImage.height);
                  onScribble(canvasRef.current.toDataURL('image/png'));
                }
              }
            }}>Center Image</Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={isEraser ? "secondary" : "outline"} disabled={isEraser}>
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: brushColor }}></div>
              <span className="ml-2">Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
             <ChromePicker color={brushColor} onChange={(color) => setBrushColor(color.hex)} />
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
        <Button onClick={() => setIsEraser(false)} variant={!isEraser ? "default" : "outline"}>
          Brush
        </Button>
        <Button onClick={() => setIsEraser(true)} variant={isEraser ? "default" : "outline"}>
          Eraser
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs">Angle:</span>
          <input
            type="range"
            min={0}
            max={90}
            value={calligraphyAngle}
            onChange={e => setCalligraphyAngle(Number(e.target.value))}
          />
          <span className="text-xs w-6 text-center">{calligraphyAngle}°</span>
        </div>
        <Button onClick={clearCanvas} variant="destructive">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ScribbleCanvas;
