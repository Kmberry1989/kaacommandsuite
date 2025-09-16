"use client";

import { useMemo, useState } from "react";
import { generateCustomArtImages } from "@/ai/flows/generate-custom-art-images";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Download, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANVAS_PRESETS, getCanvasPreset } from "@/lib/canvas-presets";
import { resizeDataUrl } from "@/lib/image-utils";

export default function VisualizerPage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedSizeId, setSelectedSizeId] = useState<string>(CANVAS_PRESETS[0].id);
  const selectedPreset = useMemo(() => getCanvasPreset(selectedSizeId), [selectedSizeId]);

  async function handleGenerateImage() {
    if (prompt.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Prompt Too Short",
        description: "Please provide a more detailed description for the image.",
      });
      return;
    }
    setIsLoading(true);
    setImageUrl(null);
    try {
      const orientationHint = `The artwork should be composed for a ${selectedPreset.label.toLowerCase()} canvas (${selectedPreset.ratioLabel}, ${selectedPreset.width}x${selectedPreset.height} pixels).`;
      const finalPrompt = `${prompt.trim()} ${orientationHint}`.trim();
      const result = await generateCustomArtImages({ prompt: finalPrompt });
      let finalImageUrl = result.imageUrl;
      try {
        finalImageUrl = await resizeDataUrl(
          result.imageUrl,
          selectedPreset.width,
          selectedPreset.height,
        );
      } catch (resizeError) {
        console.error('Error resizing generated image:', resizeError);
      }
      setImageUrl(finalImageUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Image",
        description: "There was an issue creating the image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const creativeSuggestions = [
    "A vibrant watercolor of the Kokomo courthouse at sunset.",
    "An abstract oil painting representing the spirit of the local art community.",
    "A digital illustration of a futuristic art gallery opening.",
    "A whimsical chalk drawing of local landmarks."
  ]

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `artful-image-${selectedPreset.width}x${selectedPreset.height}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Artful Images"
        description="Create unique, AI-generated visuals for event promotion or artist features."
      />
      <div className="p-6 md:p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Image Prompt</CardTitle>
            <CardDescription>
              Describe the image you want to create in detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A stylized, colorful poster for a jazz music festival in an art gallery, art deco style.'"
              className="min-h-[200px] resize-y"
            />
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Canvas size</h4>
              <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                <SelectTrigger>
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
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Creative Suggestions</h4>
              <div className="space-y-2">
                {creativeSuggestions.map((suggestion, i) => (
                  <Button key={i} variant="outline" size="sm" className="w-full text-left justify-start" onClick={() => setPrompt(suggestion)}>
                    <Sparkles className="mr-2 h-3 w-3" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateImage} disabled={isLoading}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Image"}
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Generated Image</CardTitle>
            <CardDescription>
              Sized for a {selectedPreset.label.toLowerCase()} canvas ({selectedPreset.ratioLabel}).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div
              className="w-full max-w-lg rounded-lg border border-dashed flex items-center justify-center bg-muted/50"
              style={{ aspectRatio: `${selectedPreset.width} / ${selectedPreset.height}` }}
            >
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={prompt || 'Generated art'}
                  width={selectedPreset.width}
                  height={selectedPreset.height}
                  className="rounded-md object-cover"
                />
              ) : (
                 <div className="text-center text-muted-foreground p-4">
                    <Sparkles className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium">Your creation awaits</h3>
                    <p>Enter a prompt on the left and let the AI work its magic.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              disabled={!imageUrl || isLoading}
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
