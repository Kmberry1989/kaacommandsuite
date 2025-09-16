'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChromePicker } from 'react-color';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { CANVAS_PRESETS, CanvasPreset, getCanvasPreset } from '@/lib/canvas-presets';
import { cropDataUrl, loadImage, type CropArea } from '@/lib/image-utils';

interface ScribbleCanvasProps {
  onScribble: (dataUrl: string) => void;
  onConfigChange?: (preset: CanvasPreset) => void;
}

const ScribbleCanvas = ({ onScribble, onConfigChange }: ScribbleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState([5]);
  const [isEraser, setIsEraser] = useState(false);
  const [calligraphyAngle, setCalligraphyAngle] = useState(45);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(CANVAS_PRESETS[0].id);
  const selectedPreset = useMemo(
    () => getCanvasPreset(selectedPresetId),
    [selectedPresetId],
  );

  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  useEffect(() => {
    onConfigChange?.(selectedPreset);
  }, [onConfigChange, selectedPreset]);

  const applyContextSettings = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      }
      ctx.lineWidth = brushSize[0];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
    [brushColor, brushSize, isEraser],
  );

  const exportCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = selectedPreset.width;
    outputCanvas.height = selectedPreset.height;
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) return '';
    outputContext.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);
    return outputCanvas.toDataURL('image/png');
  }, [selectedPreset]);

  const notifyScribble = useCallback(() => {
    const dataUrl = exportCanvasData();
    if (dataUrl) {
      onScribble(dataUrl);
    }
  }, [exportCanvasData, onScribble]);

  const drawDataUrlToCanvas = useCallback(
    async (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width: displayWidth, height: displayHeight } = canvas.getBoundingClientRect();

      try {
        const image = await loadImage(dataUrl);
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.drawImage(image, 0, 0, displayWidth, displayHeight);
        ctx.restore();
        setBackgroundImage(image);
        applyContextSettings(ctx);
        notifyScribble();
      } catch (error) {
        console.error('Unable to draw image on canvas', error);
      }
    },
    [applyContextSettings, notifyScribble],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.width / selectedPreset.aspectRatio;
    const dpr = window.devicePixelRatio || 1;

    const snapshot =
      canvas.width > 0 && canvas.height > 0 ? canvas.toDataURL('image/png') : null;

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = Math.max(1, Math.round(displayWidth * dpr));
    canvas.height = Math.max(1, Math.round(displayHeight * dpr));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.restore();
    applyContextSettings(ctx);
    setContext(ctx);

    const restore = async () => {
      if (snapshot) {
        try {
          const image = await loadImage(snapshot);
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          ctx.drawImage(image, 0, 0, displayWidth, displayHeight);
          ctx.restore();
          applyContextSettings(ctx);
          notifyScribble();
          return;
        } catch (error) {
          console.error('Unable to restore canvas content', error);
        }
      }

      if (backgroundImage) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(backgroundImage, 0, 0, displayWidth, displayHeight);
        ctx.restore();
        applyContextSettings(ctx);
        notifyScribble();
      }
    };

    void restore();
  }, [applyContextSettings, backgroundImage, notifyScribble, selectedPreset]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  useEffect(() => {
    const handleWindowResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [resizeCanvas]);

  useEffect(() => {
    if (context) {
      applyContextSettings(context);
    }
  }, [applyContextSettings, context]);

  const readFileAsDataUrl = useCallback(
    (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Unable to read image file'));
          }
        };
        reader.onerror = () => reject(reader.error ?? new Error('Unable to read image file'));
        reader.readAsDataURL(file);
      }),
    [],
  );

  const openCropper = useCallback((dataUrl: string, trackOriginal = false) => {
    if (trackOriginal) {
      setOriginalImageSrc(dataUrl);
    }
    setCropImageSrc(dataUrl);
    setCropPosition({ x: 0, y: 0 });
    setCropZoom(1);
    setCroppedAreaPixels(null);
    setIsCropperOpen(true);
  }, []);

  const handleImageFile = useCallback(
    async (file: File) => {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        openCropper(dataUrl, true);
      } catch (error) {
        console.error('Unable to load image', error);
      }
    },
    [openCropper, readFileAsDataUrl],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageFile]);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels({
      width: croppedPixels.width,
      height: croppedPixels.height,
      x: croppedPixels.x,
      y: croppedPixels.y,
    });
  }, []);

  const applyCrop = useCallback(async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    try {
      const croppedDataUrl = await cropDataUrl(
        cropImageSrc,
        croppedAreaPixels,
        selectedPreset.width,
        selectedPreset.height,
      );
      await drawDataUrlToCanvas(croppedDataUrl);
      setIsCropperOpen(false);
      setCropImageSrc(null);
    } catch (error) {
      console.error('Unable to crop image', error);
    }
  }, [cropImageSrc, croppedAreaPixels, drawDataUrlToCanvas, selectedPreset]);

  const reCropBackground = useCallback(() => {
    if (originalImageSrc) {
      openCropper(originalImageSrc, false);
    }
  }, [openCropper, originalImageSrc]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
    applyContextSettings(ctx);
    setBackgroundImage(null);
    setOriginalImageSrc(null);
    setLastPoint(null);
    setIsDrawing(false);
    onScribble('');
  }, [applyContextSettings, onScribble]);

  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

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

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    const { x, y } = getCoords(event);
    setLastPoint({ x, y });
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    const { x, y } = getCoords(event);
    if (lastPoint) {
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(2, Math.floor(dist / 1.5));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = lastPoint.x + dx * t;
        const py = lastPoint.y + dy * t;
        const angle =
          (calligraphyAngle + (Math.random() - 0.5) * 8) * (Math.PI / 180);
        const width = brushSize[0] * (0.9 + Math.random() * 0.2);
        const height = width * 0.35 * (0.9 + Math.random() * 0.2);
        context.save();
        context.translate(px, py);
        context.rotate(angle);
        context.beginPath();
        context.ellipse(0, 0, width, height, 0, 0, 2 * Math.PI);
        context.fillStyle = isEraser ? 'rgba(0,0,0,1)' : brushColor;
        context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
        context.globalAlpha = 0.85 + Math.random() * 0.15;
        context.fill();
        context.restore();
      }
    }
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    notifyScribble();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-full space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Canvas size
          </Label>
          <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a canvas" />
            </SelectTrigger>
            <SelectContent>
              {CANVAS_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label} • {preset.ratioLabel} ({preset.width}×{preset.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {selectedPreset.description} — exports at {selectedPreset.width}×{selectedPreset.height}px.
          </p>
        </div>
        <div className="w-full">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="border-2 border-gray-300 rounded-lg bg-white w-full cursor-crosshair"
            style={{
              touchAction: 'none',
              aspectRatio: `${selectedPreset.width} / ${selectedPreset.height}`,
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="text-xs text-gray-500 text-center">
            Paste an image from your clipboard (Ctrl+V or Cmd+V) or upload an image to crop and resize it for your selected canvas.
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleImageFile(file);
                event.target.value = '';
              }
            }}
          />
          <div className="flex flex-col w-full gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              Upload Image
            </Button>
            {originalImageSrc && (
              <Button
                variant="outline"
                onClick={reCropBackground}
                className="w-full"
              >
                Crop / Resize Image
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={isEraser ? 'secondary' : 'outline'} disabled={isEraser}>
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: brushColor }}
                ></div>
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
              value={brushSize}
              onValueChange={setBrushSize}
              max={50}
              min={1}
              step={1}
            />
          </div>
          <Button onClick={() => setIsEraser(false)} variant={!isEraser ? 'default' : 'outline'}>
            Brush
          </Button>
          <Button onClick={() => setIsEraser(true)} variant={isEraser ? 'default' : 'outline'}>
            Eraser
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs">Angle:</span>
            <input
              type="range"
              min={0}
              max={90}
              value={calligraphyAngle}
              onChange={(e) => setCalligraphyAngle(Number(e.target.value))}
            />
            <span className="text-xs w-6 text-center">{calligraphyAngle}°</span>
          </div>
          <Button onClick={clearCanvas} variant="destructive">
            Clear
          </Button>
        </div>
      </div>
      <Dialog
        open={isCropperOpen}
        onOpenChange={(open) => {
          setIsCropperOpen(open);
          if (!open) {
            setCropImageSrc(null);
            setCroppedAreaPixels(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop & Resize Image</DialogTitle>
            <DialogDescription>
              Adjust the crop to match the {selectedPreset.label.toLowerCase()} canvas ({selectedPreset.ratioLabel}, {selectedPreset.width}×{selectedPreset.height}px).
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[60vh] w-full bg-muted rounded-md overflow-hidden">
            {cropImageSrc && (
              <Cropper
                image={cropImageSrc}
                crop={cropPosition}
                zoom={cropZoom}
                aspect={selectedPreset.aspectRatio}
                onCropChange={setCropPosition}
                onZoomChange={setCropZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </div>
          <div className="pt-4 space-y-2">
            <Label className="text-sm font-medium">Zoom</Label>
            <Slider
              value={[cropZoom]}
              min={1}
              max={4}
              step={0.05}
              onValueChange={(value) => setCropZoom(value[0])}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyCrop} disabled={!croppedAreaPixels}>
              Apply Crop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScribbleCanvas;
