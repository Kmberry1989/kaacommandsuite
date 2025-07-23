// Define the Genkit flow for generating custom art images.
'use server';
/**
 * @fileOverview A flow for generating custom art images using AI, tailored for event promotion or artist features.
 *
 * - generateCustomArtImages - A function that handles the image generation process.
 * - GenerateCustomArtImagesInput - The input type for the generateCustomArtImages function.
 * - GenerateCustomArtImagesOutput - The return type for the generateCustomArtImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCustomArtImagesInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the image to generate.'),
});
export type GenerateCustomArtImagesInput = z.infer<typeof GenerateCustomArtImagesInputSchema>;

const GenerateCustomArtImagesOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image as a data URI.'),
});
export type GenerateCustomArtImagesOutput = z.infer<typeof GenerateCustomArtImagesOutputSchema>;

export async function generateCustomArtImages(input: GenerateCustomArtImagesInput): Promise<GenerateCustomArtImagesOutput> {
  return generateCustomArtImagesFlow(input);
}

const generateCustomArtImagesFlow = ai.defineFlow(
  {
    name: 'generateCustomArtImagesFlow',
    inputSchema: GenerateCustomArtImagesInputSchema,
    outputSchema: GenerateCustomArtImagesOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate image.');
    }

    return {imageUrl: media.url};
  }
);
