// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Generates social media content for upcoming events using AI.
 *
 * - generateSocialMediaContent - A function that generates social media content.
 * - GenerateSocialMediaContentInput - The input type for the generateSocialMediaContent function.
 * - GenerateSocialMediaContentOutput - The return type for the generateSocialMediaContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaContentInputSchema = z.object({
  eventTitle: z.string().describe('The title of the event.'),
  eventDescription: z.string().describe('A detailed description of the event.'),
  targetAudience: z.string().describe('The target audience for the event.'),
  platform: z
    .enum(['Facebook', 'Twitter', 'Instagram', 'LinkedIn'])
    .describe('The social media platform for the content.'),
  desiredTone: z
    .string()
    .optional()
    .describe('The desired tone of the social media content (e.g., formal, informal, humorous).'),
});

export type GenerateSocialMediaContentInput = z.infer<typeof GenerateSocialMediaContentInputSchema>;

const GenerateSocialMediaContentOutputSchema = z.object({
  content: z.string().describe('The generated social media content.'),
});

export type GenerateSocialMediaContentOutput = z.infer<typeof GenerateSocialMediaContentOutputSchema>;

export async function generateSocialMediaContent(
  input: GenerateSocialMediaContentInput
): Promise<GenerateSocialMediaContentOutput> {
  return generateSocialMediaContentFlow(input);
}

const generateSocialMediaContentPrompt = ai.definePrompt({
  name: 'generateSocialMediaContentPrompt',
  input: {schema: GenerateSocialMediaContentInputSchema},
  output: {schema: GenerateSocialMediaContentOutputSchema},
  prompt: `You are a social media manager for an art association. Generate engaging social media content for the following event, tailored to the specified platform and target audience.

Event Title: {{{eventTitle}}}
Event Description: {{{eventDescription}}}
Target Audience: {{{targetAudience}}}
Platform: {{{platform}}}

{{#if desiredTone}}
Desired Tone: {{{desiredTone}}}
{{/if}}

Content:`,
});

const generateSocialMediaContentFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaContentFlow',
    inputSchema: GenerateSocialMediaContentInputSchema,
    outputSchema: GenerateSocialMediaContentOutputSchema,
  },
  async input => {
    const {output} = await generateSocialMediaContentPrompt(input);
    return output!;
  }
);
