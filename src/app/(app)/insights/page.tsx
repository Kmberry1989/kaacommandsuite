"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractInsightsFromCommunityData } from "@/ai/flows/extract-insights-from-community-data";
import { Loader2 } from "lucide-react";

export default function InsightsPage() {
  const [communityData, setCommunityData] = useState("");
  const [insights, setInsights] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtractInsights = async () => {
    if (!communityData.trim()) return;
    setIsLoading(true);
    setInsights(null);
    try {
      // The AI flow expects an array of strings, so we wrap the single text area value in an array.
      const result = await extractInsightsFromCommunityData([communityData]);
      setInsights(result);
    } catch (error) {
      console.error("Failed to extract insights:", error);
      // You could add user-facing error handling here, e.g., using a toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Insight Extractor"
        description="Paste in community feedback, survey results, or social media comments to extract key themes and insights."
      />
      <div className="p-6 md:p-8 pt-0 grid gap-8">
        <div className="grid gap-4">
          <Textarea
            placeholder="Paste your raw data here. For example: forum posts, customer reviews, survey responses..."
            className="h-48"
            value={communityData}
            onChange={(e) => setCommunityData(e.target.value)}
            disabled={isLoading}
          />
          <Button
            onClick={handleExtractInsights}
            disabled={isLoading || !communityData.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Extract Insights
          </Button>
        </div>

        {insights && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Themes</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.keyThemes.map((theme: string, index: number) => (
                    <li key={index}>{theme}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Actionable Suggestions
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.actionableSuggestions.map(
                    (suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sentiment Score</h3>
                <p>
                  Overall Sentiment:{" "}
                  <span
                    className={
                      insights.sentimentScore > 6
                        ? "text-green-600"
                        : insights.sentimentScore > 4
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {insights.sentimentScore}/10
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
