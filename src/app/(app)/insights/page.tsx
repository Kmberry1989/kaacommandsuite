"use client";

import { useState } from "react";
import { extractInsights, ExtractInsightsOutput } from "@/ai/flows/extract-insights-from-community-data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, FileText, Target, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsPage() {
  const [communityData, setCommunityData] = useState("");
  const [insights, setInsights] = useState<ExtractInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleExtractInsights() {
    if (communityData.trim().length < 50) {
      toast({
        variant: "destructive",
        title: "Input Too Short",
        description: "Please provide more detailed community data for analysis.",
      });
      return;
    }
    setIsLoading(true);
    setInsights(null);
    try {
      const result = await extractInsights({ communityData });
      setInsights(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Extracting Insights",
        description: "There was an issue analyzing the data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Insight Extractor"
        description="Analyze community data to generate reports and funding justifications."
      />
      <div className="p-6 md:p-8 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Community Data Input</CardTitle>
            <CardDescription>
              Paste your community impact data, testimonials, and reach statistics below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={communityData}
              onChange={(e) => setCommunityData(e.target.value)}
              placeholder="e.g., 'In Q2, we reached over 5,000 community members through our programs. A testimonial from Jane Doe stated...'"
              className="min-h-[400px] resize-y"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleExtractInsights} disabled={isLoading}>
              <Lightbulb className="mr-2 h-4 w-4" />
              {isLoading ? "Analyzing..." : "Extract Insights"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
             Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
             ))
          ) : insights ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><FileText className="h-5 w-5 text-primary"/> Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{insights.summary}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Target className="h-5 w-5 text-primary"/> Impact Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{insights.impactMetrics}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="h-5 w-5 text-primary"/> Key Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{insights.keyTestimonials}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><DollarSign className="h-5 w-5 text-primary"/> Funding Justification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{insights.fundingJustification}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                    <Lightbulb className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium">Your insights will appear here</h3>
                    <p>Enter data on the left and click "Extract Insights".</p>
                </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
