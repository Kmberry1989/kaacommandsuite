/**
 * @fileoverview This file exports all of the AI flows that are used in the
 * application.
 */
import { generateSocialMediaContent } from "./flows/generate-social-media-content";
import { generateCustomArtImages } from "./flows/generate-custom-art-images";
import { extractInsightsFromCommunityData } from "./flows/extract-insights-from-community-data";
import { critiquePost } from "./flows/critique-post";

export const flows = {
  generateSocialMediaContent,
  generateCustomArtImages,
  extractInsightsFromCommunityData,
  critiquePost, // Added the new flow
};
