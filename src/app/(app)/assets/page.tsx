'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, listAll } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export default function AssetsPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);

  const storagePath = 'artful-images/';

  const examplePrompts = [
    "Logo for a 'First Friday' art event",
    "Painting of the Seiberling Mansion",
    "Flyer for a pottery class for kids",
    "Abstract art of the Kokomo Opalescent Glass factory",
    "'Art in the Park' event banner",
    "A watercolor of the Wildcat Creek",
  ];

  // Fetches images from Firebase Storage to display in the gallery.
  const fetchGalleryImages = useCallback(async () => {
    setIsLoadingGallery(true);
    try {
      const imagesListRef = ref(storage, storagePath);
      const result = await listAll(imagesListRef);
      const urlPromises = result.items.map((imageRef) => getDownloadURL(imageRef));
      const urls = await Promise.all(urlPromises);
      setGalleryImages(urls.reverse()); // Show newest first
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);


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
      
      if (imageUrl) {
        const storageRef = ref(storage, `${storagePath}${uuidv4()}.png`);
        await uploadString(storageRef, imageUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        
        setGeneratedImageUrl(downloadUrl);
        setGalleryImages(prev => [downloadUrl, ...prev]);
      } else {
        throw new Error('Image generation did not return a valid image.');
      }

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
        description="Generate unique and custom images for your content. All creations are saved to your gallery."
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
              placeholder="e.g., A watercolor painting of the Seiberling Mansion in autumn."
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
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mt-4">
                {isLoading && (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <span>Generating masterpiece...</span>
                    </div>
                )}
                {!isLoading && generatedImageUrl && (
                    <Image
                        src={generatedImageUrl}
                        alt="Generated art"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                    />
                )}
                 {!isLoading && !generatedImageUrl && (
                    <p className="text-gray-400">Your new image will appear here</p>
                )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
            <CardDescription>Your previously generated images.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGallery ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-2">
                {galleryImages.map((url) => (
                  <div key={url} className="aspect-square relative rounded-lg overflow-hidden border group">
                    <Image
                      src={url}
                      alt="A generated image from the gallery"
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/50 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                        </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>Your generated images will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
