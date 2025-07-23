"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartLegend,
} from "@/components/ui/chart";
import { Users, Newspaper, Heart, BarChart as BarChartIcon, Lightbulb, FileText, Target, DollarSign, Loader2 } from "lucide-react";
import {
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  BarChart,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { extractInsights, ExtractInsightsOutput } from "@/ai/flows/extract-insights-from-community-data";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";


const membershipData = [
  { month: "Jan", new: 4, renewals: 2 },
  { month: "Feb", new: 3, renewals: 1 },
  { month: "Mar", new: 5, renewals: 3 },
  { month: "Apr", new: 7, renewals: 2 },
  { month: "May", new: 6, renewals: 4 },
  { month: "Jun", new: 8, renewals: 5 },
];

const attendanceData = [
    { event: 'Spring Gala', tickets: 200, attendance: 180 },
    { event: 'Art Fair', tickets: 500, attendance: 450 },
    { event: 'Workshop A', tickets: 50, attendance: 48 },
    { event: 'Exhibition B', tickets: 150, attendance: 120 },
    { event: 'Youth Camp', tickets: 75, attendance: 70 },
];

const socialData = [
    { platform: 'Instagram', engagement: 40 },
    { platform: 'Facebook', engagement: 30 },
    { platform: 'Twitter', engagement: 15 },
    { platform: 'LinkedIn', engagement: 15 },
];
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function DashboardPage() {
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const [report, setReport] = useState<ExtractInsightsOutput | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport(null);
    setReportDialogOpen(true);

    const communityData = `
      **Membership Growth:**
      ${membershipData.map(d => `${d.month}: ${d.new} new members, ${d.renewals} renewals.`).join('\n')}

      **Event Attendance:**
      ${attendanceData.map(d => `${d.event}: ${d.attendance} attended out of ${d.tickets} tickets sold.`).join('\n')}

      **Social Media Engagement:**
      ${socialData.map(d => `${d.platform}: ${d.engagement}% engagement.`).join('\n')}

      **Key Metrics:**
      - Total Members: 1,234 (+20.1% from last month)
      - Upcoming Events: 12 (3 new this week)
      - Social Engagement: +5.2K impressions (+12% this month)
    `;

    try {
      const result = await extractInsights({ communityData });
      setReport(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Report",
        description: "There was an issue creating the report. Please try again.",
      });
      setReportDialogOpen(false);
    } finally {
      setIsGeneratingReport(false);
    }
  };


  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Dashboard"
        description="Your central hub for events, memberships, and social media."
      >
        <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
          {isGeneratingReport ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BarChartIcon className="mr-2 h-4 w-4" />
          )}
          Generate Report
        </Button>
      </PageHeader>
      <div className="p-6 md:p-8 pt-0 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 new events scheduled this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5.2K</div>
            <p className="text-xs text-muted-foreground">+12% this month</p>
          </CardContent>
        </Card>
      </div>
      <div className="p-6 md:p-8 pt-0 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Membership Growth</CardTitle>
            <CardDescription>New sign-ups and renewals over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                    <AreaChart data={membershipData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area type="monotone" dataKey="new" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.4} name="New Members" />
                        <Area type="monotone" dataKey="renewals" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} name="Renewals" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Social Media Engagement</CardTitle>
            <CardDescription>Engagement distribution across platforms.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <RechartsTooltip content={<ChartTooltipContent nameKey="platform" />} />
                      <Pie data={socialData} dataKey="engagement" nameKey="platform" cx="50%" cy="50%" outerRadius={100} label>
                      {socialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="font-headline">Event Attendance</CardTitle>
            <CardDescription>Comparison of tickets sold vs. actual attendance.</CardDescription>
          </CardHeader>
          <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="event" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--accent) / 0.2)'}} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="tickets" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Tickets Sold" />
                        <Bar dataKey="attendance" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Attendance" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Insights Report</DialogTitle>
            <DialogDescription>
              This AI-generated report provides a summary and analysis of your recent activities.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4">
            {isGeneratingReport ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : report ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><FileText className="h-5 w-5 text-primary"/> Summary</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground">{report.summary}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Target className="h-5 w-5 text-primary"/> Impact Metrics</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{report.impactMetrics}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="h-5 w-5 text-primary"/> Key Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{report.keyTestimonials}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><DollarSign className="h-5 w-5 text-primary"/> Funding Justification</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground">{report.fundingJustification}</p></CardContent>
                </Card>
              </div>
            ) : null}
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
