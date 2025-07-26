"use server";
/**
 * @fileoverview A flow that extracts insights from community data.
 */
import { ai } from "@/ai/genkit";
import { z } from "zod";

const CommunityDataResponseSchema = z.object({
  insights: z.array(
    z.object({
      insight: z.string().describe("A key insight from the community data."),
      recommendation: z
        .string()
        .describe(
          "A recommended action based on the insight that the KAA can take."
        ),
    })
  ),
});

export async function extractInsightsFromCommunityData(
  communityData: string[]
): Promise<z.infer<typeof CommunityDataResponseSchema>> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `
      You are a community manager for the Kokomo Art Association. Your task is to extract key insights and recommend actions based on the following community data.

      Community Data:
      ${communityData.join("\n")}

      Provide your response in a structured JSON format.
    `,
    output: {
      format: "json",
      schema: CommunityDataResponseSchema,
    },
  });

  return llmResponse.output as z.infer<typeof CommunityDataResponseSchema>;
}
