'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function AssetsPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "Logo for a 'First Friday' art event",
    "Painting of the Seiberling Mansion",
    "Flyer for a pottery class for kids",
    "Abstract art of the Kokomo Opalescent Glass factory",
    "'Art in the Park' event banner",
    "A watercolor of the Wildcat Creek",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl('');
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generateImage', prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image.');
      }

      const { imageUrl } = await response.json();
      setGeneratedImageUrl(imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Artful Images"
        description="Generate unique and custom images for your content."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Generator</CardTitle>
            <CardDescription>
              Describe the image you want to create, or select one of the examples below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., A futuristic cityscape at sunset, with flying cars and neon lights, in a photorealistic style."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p) => (
                <Button key={p} variant="outline" size="sm" onClick={() => setPrompt(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>Your newly created image will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p>Generating...</p>
              </div>
            ) : generatedImageUrl ? (
              <Image
                src={generatedImageUrl}
                alt="Generated art"
                width={512}
                height={512}
                className="rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Image
                  src="https://placehold.co/512x512/f0f0f0/a0a0a0?text=Your+Image"
                  alt="Placeholder"
                  width={512}
                  height={512}
                  className="rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
