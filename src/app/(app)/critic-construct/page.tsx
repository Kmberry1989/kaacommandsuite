"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Copy, Save, Upload, Link as LinkIcon, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { critiquePost } from "@/ai/flows/critique-post";

type CritiqueResult = {
    score: number;
    critique: string;
    reconstructedPost: string;
};

export default function CriticConstructPage() {
    const [postText, setPostText] = useState("");
    const [postLink, setPostLink] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CritiqueResult | null>(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!postText && !postLink && !mediaFile) {
            toast({ variant: "destructive", title: "Input Required", description: "Please provide some content to analyze." });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const analysis = await critiquePost({
                postText,
                postLink,
                mediaDescription: mediaFile ? `A file named "${mediaFile.name}" of type ${mediaFile.type}` : undefined,
            });
            setResult(analysis);
        } catch (error) {
            console.error("Analysis failed:", error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "The AI could not complete the analysis. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string, title: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to Clipboard", description: `${title} has been copied.` });
    };

    const handleSave = async () => {
        if (!result) return;
        try {
            await addDoc(collection(db, "critiques"), {
                originalPost: postText,
                ...result,
                savedAt: new Date().toISOString(),
            });
            toast({ title: "Analysis Saved", description: "The critique has been saved to your records."});
        } catch (error) {
            console.error("Failed to save analysis:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the analysis." });
        }
    };

    return (
        <div>
            <PageHeader
                title="Critic Construct"
                description="Get AI-powered feedback on your social media posts based on the KAA strategy."
            />
            <div className="p-6 md:p-8 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INPUT COLUMN */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submit Your Draft</CardTitle>
                        <CardDescription>Enter text, upload an image, or provide a link to get feedback.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Paste your post text here..."
                            className="min-h-[200px]"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                            <Input placeholder="Or paste a link to a post" value={postLink} onChange={e => setPostLink(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground"/>
                            <Input type="file" onChange={e => setMediaFile(e.target.files?.[0] || null)} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isLoading ? "Analyzing..." : "Analyze Post"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* OUTPUT COLUMN */}
                <div className="space-y-6">
                    {isLoading && (
                        <>
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </>
                    )}
                    {result ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analysis & Score</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-start gap-6">
                                    <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
                                        <span className="text-4xl font-bold text-primary">{result.score}</span>
                                        <span className="text-sm text-primary">/ 10</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex-1">{result.critique}</p>
                                </CardContent>
                                <CardFooter className="gap-2">
                                     <Button variant="outline" onClick={() => handleCopy(result.critique, "Critique")}>
                                        <Copy className="mr-2 h-4 w-4"/> Copy Critique
                                    </Button>
                                    <Button onClick={handleSave}>
                                        <Save className="mr-2 h-4 w-4"/> Save Analysis
                                    </Button>
                                </CardFooter>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Reconstructed Post</CardTitle>
                                    <CardDescription>Here's an improved version optimized for engagement.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea readOnly value={result.reconstructedPost} className="min-h-[200px] bg-muted/50"/>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button onClick={() => handleCopy(result.reconstructedPost, "Reconstructed Post")}>
                                        <Copy className="mr-2 h-4 w-4"/> Copy to Clipboard
                                    </Button>
                                </CardFooter>
                            </Card>
                        </>
                    ) : (
                        !isLoading && (
                            <Card className="flex flex-col items-center justify-center min-h-[400px] text-center bg-muted/30 border-dashed">
                                <Sparkles className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">Your analysis will appear here</h3>
                                <p className="text-sm text-muted-foreground">Submit a post to get started.</p>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
