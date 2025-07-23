"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, List, MessageSquareQuote, CheckSquare, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const templates = [
  {
    title: "Event Registration Form",
    description: "A simple, branded web form for RSVPs and workshop registrations.",
    icon: CheckSquare,
    tags: ["Events", "Forms"],
  },
  {
    title: "Artist Directory",
    description: "Create a searchable, interactive directory of local artists, with bios and art styles.",
    icon: List,
    tags: ["Community", "Directory"],
  },
  {
    title: "Member Feedback Survey",
    description: "Deploy a quick survey to gather input from members, visitors, or participants.",
    icon: MessageSquareQuote,
    tags: ["Feedback", "Survey"],
  },
  {
    title: "Exhibition Proposal",
    description: "A standardized form for artists to submit proposals for upcoming exhibitions.",
    icon: FileEdit,
    tags: ["Artists", "Submissions"],
  },
];

export default function TemplatesPage() {
  const [isUseTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{title: string} | null>(null);

  const handleUseTemplate = (template: {title: string}) => {
    setSelectedTemplate(template);
    setUseTemplateDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Template Forge"
        description="Customizable templates for forms, directories, and surveys."
      >
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Create New Template
        </Button>
      </PageHeader>
      <div className="p-6 md:p-8 pt-0 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
                <template.icon className="h-8 w-8 text-primary mt-1" />
                <div>
                    <CardTitle className="font-headline">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* Could add a small visual preview here */}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div>
                {template.tags.map(tag => (
                    <span key={tag} className="text-xs mr-2 py-1 px-2 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                ))}
                </div>
                <Button variant="outline" onClick={() => handleUseTemplate(template)}>Use Template</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isUseTemplateDialogOpen} onOpenChange={setUseTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use '{selectedTemplate?.title}'</DialogTitle>
            <DialogDescription>
              This would typically lead to a new page to configure and deploy this template. For now, this confirms the template selection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">OK</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
