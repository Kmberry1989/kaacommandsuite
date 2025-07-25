"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileEdit, List, MessageSquareQuote, CheckSquare, PlusCircle, Search, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const initialTemplates = [
  {
    title: "Event Registration Form",
    description: "A simple, branded web form for RSVPs and workshop registrations.",
    icon: CheckSquare,
    tags: ["Events", "Forms"],
    fields: [
        {label: "Full Name", type: "text"},
        {label: "Email Address", type: "email"},
        {label: "Number of Guests", type: "number"},
    ]
  },
  {
    title: "Artist Directory",
    description: "Create a searchable, interactive directory of local artists, with bios and art styles.",
    icon: List,
    tags: ["Community", "Directory"],
    fields: [
        {label: "Artist Name", type: "text"},
        {label: "Bio", type: "textarea"},
        {label: "Website", type: "url"},
        {label: "Profile Image", type: "file"},
    ]
  },
  // ... other templates
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isUseTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof initialTemplates)[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUseTemplate = (template: (typeof initialTemplates)[0]) => {
    setSelectedTemplate(template);
    setUseTemplateDialogOpen(true);
  };
  
  const filteredTemplates = templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Template Forge"
        description="Customizable templates for forms, directories, and surveys."
      >
        <div className="flex gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search templates..."
                    className="pl-8 sm:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Create New Template
            </Button>
        </div>
      </PageHeader>
      <div className="p-6 md:p-8 pt-0 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
                <template.icon className="h-8 w-8 text-primary mt-1" />
                <div>
                    <CardTitle className="font-headline">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <h4 className="text-sm font-semibold mb-2">Fields:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {template.fields.map(field => <li key={field.label}>{field.label}</li>)}
                </ul>
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Customize '{selectedTemplate?.title}'</DialogTitle>
            <DialogDescription>
              Modify the fields for your template. This is a simplified interface for demonstration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              {selectedTemplate?.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">{field.label}</label>
                      {field.type === 'textarea' ? <Textarea className="col-span-3"/> : <Input type={field.type} className="col-span-3"/>}
                  </div>
              ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button><Save className="mr-2 h-4 w-4"/> Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}