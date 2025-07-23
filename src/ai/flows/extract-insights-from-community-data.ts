'use server';
/**
 * @fileOverview A flow to extract insights from community impact data for generating reports.
 *
 * - extractInsights - A function that handles the extraction of insights from community data.
 * - ExtractInsightsInput - The input type for the extractInsights function.
 * - ExtractInsightsOutput - The return type for the extractInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInsightsInputSchema = z.object({
  communityData: z
    .string()
    .describe(
      'A detailed summary of community data, including reach, impact, and testimonials.'
    ),
});
export type ExtractInsightsInput = z.infer<typeof ExtractInsightsInputSchema>;

const ExtractInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key insights from the community data.'),
  impactMetrics: z
    .string()
    .describe('Quantifiable metrics demonstrating the impact of the organization on the community.'),
  keyTestimonials: z
    .string()
    .describe('Highlighted testimonials that showcase the organization’s value.'),
  fundingJustification: z
    .string()
    .describe(
      'A strong justification for funding based on the extracted insights and impact metrics.'
    ),
});
export type ExtractInsightsOutput = z.infer<typeof ExtractInsightsOutputSchema>;

export async function extractInsights(input: ExtractInsightsInput): Promise<ExtractInsightsOutput> {
  return extractInsightsFlow(input);
}

const extractInsightsPrompt = ai.definePrompt({
  name: 'extractInsightsPrompt',
  input: {schema: ExtractInsightsInputSchema},
  output: {schema: ExtractInsightsOutputSchema},
  prompt: `You are an expert in analyzing community impact data for arts organizations.

  Your goal is to extract key insights that demonstrate the organization's value and impact for stakeholders and grant applications.

  Analyze the provided community data and generate a concise summary, identify quantifiable impact metrics, highlight key testimonials, and provide a strong justification for funding.

  Community Data: {{{communityData}}}

  Focus on presenting the information in a clear, compelling, and data-driven manner.
  `,
});

const extractInsightsFlow = ai.defineFlow(
  {
    name: 'extractInsightsFlow',
    inputSchema: ExtractInsightsInputSchema,
    outputSchema: ExtractInsightsOutputSchema,
  },
  async input => {
    const {output} = await extractInsightsPrompt(input);
    return output!;
  }
);
