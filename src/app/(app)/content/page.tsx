"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateSocialMediaContent, GenerateSocialMediaContentInput } from "@/ai/flows/generate-social-media-content";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  eventTitle: z.string().min(5, "Event title must be at least 5 characters."),
  eventDescription: z.string().min(20, "Description must be at least 20 characters."),
  targetAudience: z.string().min(5, "Target audience is required."),
  platform: z.enum(['Facebook', 'Twitter', 'Instagram', 'LinkedIn']),
  desiredTone: z.string().optional(),
});

export default function ContentPage() {
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventTitle: "",
      eventDescription: "",
      targetAudience: "",
      platform: "Instagram",
      desiredTone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent("");
    try {
      const result = await generateSocialMediaContent(values as GenerateSocialMediaContentInput);
      setGeneratedContent(result.content);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Content",
        description: "There was an issue generating the social media content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Content Alchemist"
        description="Generate press releases, announcements, and social media content."
      />
      <div className="p-6 md:p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Event Details</CardTitle>
                <CardDescription>
                  Provide the details for your event to generate content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="eventTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Art Gala" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the event in detail..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Young Professionals, Families" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="desiredTone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Tone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Professional, Playful, Urgent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isLoading ? "Generating..." : "Generate Content"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated social media post will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <Textarea
                readOnly
                value={generatedContent}
                className="min-h-[300px] bg-muted/50 resize-none"
                placeholder="Content will be displayed here..."
              />
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled={!generatedContent || isLoading}>
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
