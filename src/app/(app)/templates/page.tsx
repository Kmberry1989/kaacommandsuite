"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
    FileEdit, List, MessageSquareQuote, CheckSquare, PlusCircle, Search, Save, Trash2, Loader2, LucideProps, Icon as LucideIcon
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Helper to get icon component from string name
const iconMap: { [key: string]: React.ComponentType<LucideProps> } = LucideIcons;

type TemplateField = {
  label: string;
  type: "text" | "textarea" | "email" | "number" | "file" | "checkbox" | "date";
};

type Template = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof LucideIcons;
  tags: string[];
  fields: TemplateField[];
};

const TemplateCard = ({ template, onUse, onEdit, onDelete }: { template: Template, onUse: () => void, onEdit: () => void, onDelete: () => void }) => {
    const Icon = iconMap[template.icon] || LucideIcons.File;
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
                <Icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                <div>
                    <CardTitle className="font-headline">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <h4 className="text-sm font-semibold mb-2">Fields:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {template.fields.slice(0, 4).map((field, i) => <li key={i}>{field.label}</li>)}
                    {template.fields.length > 4 && <li className="text-xs">...and {template.fields.length - 4} more.</li>}
                </ul>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div>
                    {template.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs mr-2 py-1 px-2 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                    ))}
                </div>
                <Button variant="outline" onClick={onUse}>Use Template</Button>
            </CardFooter>
        </Card>
    );
};

const CreateTemplateDialog = ({ isOpen, onOpenChange, onSave }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (template: Omit<Template, 'id'>) => Promise<void> }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [icon, setIcon] = useState<keyof typeof LucideIcons>("FileEdit");
    const [fields, setFields] = useState<TemplateField[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const addField = () => {
        setFields([...fields, { label: "", type: "text" }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, newField: TemplateField) => {
        setFields(fields.map((field, i) => (i === index ? newField : field)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const newTemplate = {
            title,
            description,
            icon,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
            fields
        };
        await onSave(newTemplate);
        setIsSaving(false);
        // Reset form
        setTitle("");
        setDescription("");
        setTags("");
        setIcon("FileEdit");
        setFields([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogDescription>
                        Design a new reusable template with custom fields.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right">Tags</Label>
                        <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} className="col-span-3" placeholder="e.g., Events, Forms, Community" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">Icon</Label>
                        <Select value={icon} onValueChange={(val) => setIcon(val as keyof typeof LucideIcons)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(LucideIcons).filter(k => k.match(/^[A-Z]/)).map(iconName => (
                                    <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <hr className="my-4 col-span-4" />
                    <h4 className="font-semibold col-span-4">Fields</h4>
                    {fields.map((field, index) => (
                        <div key={index} className="grid grid-cols-10 items-center gap-2 col-span-4">
                            <Input
                                placeholder="Field Label"
                                value={field.label}
                                onChange={e => updateField(index, { ...field, label: e.target.value })}
                                className="col-span-5"
                            />
                            <Select value={field.type} onValueChange={val => updateField(index, { ...field, type: val as TemplateField['type'] })}>
                                <SelectTrigger className="col-span-4">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="textarea">Text Area</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                    <SelectItem value="file">File Upload</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="col-span-1">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addField} className="col-span-4 mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isSaving || !title || fields.length === 0}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const UseTemplateDialog = ({ isOpen, onOpenChange, template }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, template: Template | null }) => {
    if (!template) return null;
    const Icon = iconMap[template.icon] || LucideIcons.File;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Icon /> Use '{template.title}'</DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    {template.fields.map((field, index) => (
                        <div key={index} className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`field-${index}`}>{field.label}</Label>
                            {field.type === 'textarea' ? <Textarea id={`field-${index}`} placeholder={field.label} />
                            : field.type === 'checkbox' ? <div className="flex items-center gap-2 pt-2"><Checkbox id={`field-${index}`} /> <label htmlFor={`field-${index}`}>Yes/No</label></div>
                            : <Input type={field.type} id={`field-${index}`} placeholder={field.label} />}
                        </div>
                    ))}
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button><Save className="mr-2 h-4 w-4"/> Save Entry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [isUseDialogOpen, setUseDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    async function fetchTemplates() {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "templates"));
            const fetchedTemplates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
            setTemplates(fetchedTemplates);
        } catch (err) {
            console.error("Failed to fetch templates from Firebase:", err);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch templates." });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSaveNewTemplate = async (newTemplateData: Omit<Template, 'id'>) => {
        try {
            await addDoc(collection(db, "templates"), newTemplateData);
            toast({ title: "Template Created", description: `'${newTemplateData.title}' has been saved.` });
            fetchTemplates(); // Refresh the list
        } catch (error) {
            console.error("Error creating template:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save the template." });
        }
    };

    const handleUseTemplate = (template: Template) => {
        setSelectedTemplate(template);
        setUseDialogOpen(true);
    };

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Template
                    </Button>
                </div>
            </PageHeader>
            <div className="p-6 md:p-8 pt-0">
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader><LucideIcons.Skeleton className="h-8 w-3/4" /></CardHeader>
                                <CardContent><LucideIcons.Skeleton className="h-16 w-full" /></CardContent>
                                <CardFooter><LucideIcons.Skeleton className="h-8 w-1/2" /></CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onUse={() => handleUseTemplate(template)}
                                onEdit={() => { /* Implement edit logic */ }}
                                onDelete={() => { /* Implement delete logic */ }}
                            />
                        ))}
                    </div>
                )}
                 { !isLoading && filteredTemplates.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No templates found.</p>
                        <Button variant="link" onClick={() => setCreateDialogOpen(true)}>Create one now</Button>
                    </div>
                 )}
            </div>

            <CreateTemplateDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSave={handleSaveNewTemplate}
            />
            <UseTemplateDialog
                isOpen={isUseDialogOpen}
                onOpenChange={setUseDialogOpen}
                template={selectedTemplate}
            />
        </div>
    );
}
