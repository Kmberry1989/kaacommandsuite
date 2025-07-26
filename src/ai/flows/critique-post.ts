"use server";
/**
 * @fileOverview A flow for critiquing a social media post based on a provided strategy guide.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";

// The strategy guide content is embedded directly into the prompt.
// In a production app, this might be loaded from a file or database.
const KAA_STRATEGY_GUIDE = `
    - Pre-Post Checklist:
        - Visual Appeal: High-resolution, well-lit image/video.
        - Brand Consistency: Uses KAA color palette (indigo, rust, teal, cream).
        - Hook: First sentence grabs attention within 3 seconds.
        - Story Pillar: Aligns with Made in Kokomo, Art & Well-Being, Community Over Commerce, or Behind the Brush.
        - Call-to-Action: Clear next step (visit, register, share, comment).
        - Voice & Tone: Inclusive, optimistic, conversational - "professional yet personal".
        - Hashtags: 5-8 relevant hashtags included.
        - Tags: Relevant artists, partners, or community members tagged.
        - Location: Kokomo, Indiana geotag added.
        - Timing: Posted during peak engagement hours (7-9 AM or 5-7 PM local time).
    - Hashtag Strategy:
        - Primary: #KokomoArt, #ArtistAlleyIN, #KAAInsideLook, #KokomoArtCenter, #ArtworksGallery
        - Community: #KokomoIndiana, #HowardCountyArt, #IndianaArtist, #FirstFridayKokomo
        - Engagement: #ArtClass, #LocalArtist, #ArtLovers, #CreativeProcess, #ArtCommunity
`;

const critiquePostSchema = z.object({
  postText: z.string().optional().describe("The text content of the social media post."),
  mediaDescription: z.string().optional().describe("A description of any media included, e.g., 'An image of a painting.'"),
  postLink: z.string().optional().describe("A link to an existing post for review."),
});

const critiqueResponseSchema = z.object({
  score: z.number().min(1).max(10).describe("A score from 1 to 10 for the post's effectiveness."),
  critique: z.string().describe("Constructive criticism based on the KAA strategy guide, explaining the score."),
  reconstructedPost: z.string().describe("An improved version of the post, rewritten for maximum exposure."),
});

export async function critiquePost(
  input: z.infer<typeof critiquePostSchema>
): Promise<z.infer<typeof critiqueResponseSchema>> {
  const prompt = `
    You are the Creative Director for the Kokomo Art Association (KAA). Your task is to analyze a draft social media post based on the official KAA Strategy Playbook.

    **KAA Strategy Playbook Summary:**
    ${KAA_STRATEGY_GUIDE}

    **User's Draft Post:**
    - Text: "${input.postText || 'No text provided.'}"
    - Media: "${input.mediaDescription || 'No media provided.'}"
    - Link: "${input.postLink || 'No link provided.'}"

    **Your Tasks:**
    1.  **Score the Post:** Give the draft a score from 1 (needs major work) to 10 (perfect) based on how well it follows the KAA Strategy Playbook.
    2.  **Provide Constructive Criticism:** Write a detailed critique explaining your score. Reference specific points from the playbook (e.g., "The call-to-action is unclear," "Hashtag usage could be improved by adding...").
    3.  **Reconstruct the Post:** Rewrite the post to be as effective as possible for maximum web exposure, perfectly aligning with the KAA strategy. Ensure it includes an engaging hook, a clear call-to-action, and optimal hashtags.

    Provide your response in a structured JSON format.
  `;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
    output: {
      format: 'json',
      schema: critiqueResponseSchema,
    },
  });

  return llmResponse.output as z.infer<typeof critiqueResponseSchema>;
}
