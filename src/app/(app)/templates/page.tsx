"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    PlusCircle, Search, Save, Trash2, Loader2, Download, LucideProps, File, MoreVertical, Edit, Palette, HandPlatter, Building, MessageSquareHeart, GripVertical
} from "lucide-react";
import * as LucideIcons from "lucide-react";
// Removed top-level PDF imports to prevent build errors

const iconMap: { [key: string]: React.ComponentType<LucideProps> } = LucideIcons;

// --- TYPE DEFINITIONS ---
type FieldType = "text" | "textarea" | "email" | "number" | "file" | "checkbox" | "date" | "select" | "richtext";

type TemplateField = {
  id: string; // Unique ID for React keys
  label: string;
  type: FieldType;
  options?: string[]; // For 'select' type
};

type Template = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof LucideIcons;
  tags: string[];
  fields: TemplateField[];
};

// --- SEED DATA ---
const seedTemplates: Omit<Template, 'id'>[] = [
    { title: "Artist of the Month Application", description: "Form for local artists to apply for the 'Artist of the Month' feature.", icon: "Palette", tags: ["Artists", "Application"], fields: [{id: "1", label: "Full Name", type: "text"}, {id: "2", label: "Artist Bio", type: "richtext"}, {id: "3", label: "Portfolio Link", type: "text"}, {id: "4", label: "Submission Image", type: "file"}]},
    { title: "Gallery Space Rental", description: "A request form for artists or groups to rent gallery space for an exhibition.", icon: "Building", tags: ["Gallery", "Rental"], fields: [{id: "1", label: "Contact Name", type: "text"}, {id: "2", label: "Exhibition Title", type: "text"}, {id: "3", label: "Proposed Dates", type: "date"}, {id: "4", label: "Space Requirements", type: "textarea"}]},
    { title: "Event Feedback Survey", description: "Collect feedback from attendees after a workshop, opening, or event.", icon: "MessageSquareHeart", tags: ["Events", "Feedback"], fields: [{id: "1", label: "Event Attended", type: "select", options: ["Workshop A", "Opening Night B", "Lecture C"]}, {id: "2", label: "Overall Rating", type: "select", options: ["Excellent", "Good", "Fair", "Poor"]}, {id: "3", label: "Comments", type: "textarea"}]},
    { title: "Volunteer Signup", description: "A simple form for community members to sign up as volunteers for KAA events.", icon: "HandPlatter", tags: ["Community", "Volunteers"], fields: [{id: "1", label: "Full Name", type: "text"}, {id: "2", label: "Email Address", type: "email"}, {id: "3", label: "Availability", type: "checkbox"}, {id: "4", label: "Areas of Interest", type: "textarea"}]},
];

// --- CHILD COMPONENTS ---

const TemplateCard = ({ template, onUse, onEdit, onDelete }: { template: Template, onUse: () => void, onEdit: () => void, onDelete: () => void }) => {
    const Icon = iconMap[template.icon] || File;
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
                <Icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                <div className="flex-grow">
                    <CardTitle className="font-headline">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow">
                <h4 className="text-sm font-semibold mb-2">Fields:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {template.fields.slice(0, 4).map((field) => <li key={field.id}>{field.label}</li>)}
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

const TemplateEditorDialog = ({ isOpen, onOpenChange, onSave, initialData }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (data: Omit<Template, 'id'>) => void, initialData?: Template | null }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState<keyof typeof LucideIcons>("File");
    const [tags, setTags] = useState("");
    const [fields, setFields] = useState<TemplateField[]>([]);

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setIcon(initialData.icon);
            setTags(initialData.tags.join(", "));
            setFields(initialData.fields);
        } else if (!isOpen) { // Reset on close
            setTitle(""); setDescription(""); setIcon("File"); setTags(""); setFields([]);
        }
    }, [isOpen, initialData]);

    const handleAddField = () => {
        setFields([...fields, { id: `field_${Date.now()}`, label: "New Field", type: "text" }]);
    };

    const handleFieldChange = (index: number, updatedField: Partial<TemplateField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updatedField };
        if(updatedField.type !== 'select') delete newFields[index].options; // Clean up options if not select
        setFields(newFields);
    };
    
    const handleRemoveField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!title || fields.length === 0) return;
        onSave({ title, description, icon, tags: tags.split(",").map(t => t.trim()), fields });
        onOpenChange(false);
    }
    
    const iconList = ["File", "Palette", "Building", "MessageSquareHeart", "HandPlatter", "FileText", "CheckSquare"] as const;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Template" : "Create New Template"}</DialogTitle>
                    <DialogDescription>Define the structure of your new template.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Basic Info */}
                    <Input placeholder="Template Title" value={title} onChange={e => setTitle(e.target.value)} />
                    <Textarea placeholder="Template Description" value={description} onChange={e => setDescription(e.target.value)} />
                    <div className="flex gap-4">
                        <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className="flex-grow"/>
                        <Select value={icon} onValueChange={(val) => setIcon(val as keyof typeof LucideIcons)}>
                            <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
                            <SelectContent>{iconList.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    {/* Field Editor */}
                    <h3 className="font-semibold mt-4 border-b pb-2">Fields</h3>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                                <GripVertical className="h-5 w-5 mt-2 text-muted-foreground"/>
                                <div className="flex-grow space-y-2">
                                    <div className="flex gap-2">
                                        <Input placeholder="Field Label" value={field.label} onChange={e => handleFieldChange(index, {label: e.target.value})} className="flex-grow"/>
                                        <Select value={field.type} onValueChange={val => handleFieldChange(index, {type: val as FieldType})}>
                                            <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Text Area</SelectItem>
                                                <SelectItem value="richtext">Rich Text</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                                <SelectItem value="select">Select</SelectItem>
                                                <SelectItem value="file">File Upload</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveField(index)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                    {field.type === 'select' && <Input placeholder="Options (comma-separated)" value={field.options?.join(", ") || ""} onChange={e => handleFieldChange(index, {options: e.target.value.split(",").map(s => s.trim())})} />}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" onClick={handleAddField} className="mt-2"><PlusCircle className="mr-2 h-4 w-4"/>Add Field</Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Save Template</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const UseTemplateDialog = ({ isOpen, onOpenChange, template }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, template: Template | null }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (template) {
            const initialData: Record<string, any> = {};
            template.fields.forEach(field => { initialData[field.label] = field.type === 'checkbox' ? false : ''; });
            setFormData(initialData);
        }
    }, [template]);
    
    if (!template) return null;

    const handleExportPdf = async () => {
        // Dynamically import PDF libraries on demand (client-side only)
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(template.title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(template.description, 14, 30);
        
        const tableData = template.fields.map(field => [field.label, formData[field.label]?.toString() || 'N/A']);

        autoTable(doc, {
            startY: 40,
            head: [['Field', 'Value']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] }
        });

        doc.save(`${template.title.replace(/\s+/g, '_')}_export.pdf`);
    };
    
    const handleInputChange = (label: string, value: any) => setFormData(prev => ({...prev, [label]: value}));
    const Icon = iconMap[template.icon] || File;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Icon /> Use '{template.title}'</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    {template.fields.map((field) => (
                        <div key={field.id} className="grid w-full items-center gap-1.5">
                            <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                            { field.type === 'textarea' ? <Textarea id={`field-${field.id}`} value={formData[field.label] || ''} onChange={e => handleInputChange(field.label, e.target.value)} />
                            : field.type === 'checkbox' ? <div className="flex items-center gap-2 pt-2"><Checkbox id={`field-${field.id}`} checked={!!formData[field.label]} onCheckedChange={checked => handleInputChange(field.label, checked)} /></div>
                            : field.type === 'select' ? <Select onValueChange={val => handleInputChange(field.label, val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>
                            : <Input type={field.type} id={`field-${field.id}`} value={formData[field.label] || ''} onChange={e => handleInputChange(field.label, e.target.value)} />
                            }
                        </div>
                    ))}
                </div>
                 <DialogFooter className="justify-between sm:justify-between flex-col sm:flex-row gap-2">
                    <div>
                        <Button onClick={handleExportPdf} variant="outline"><Download className="mr-2 h-4 w-4"/> Export PDF</Button>
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button><Save className="mr-2 h-4 w-4"/> Save Entry</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- MAIN PAGE COMPONENT ---
export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editorOpen, setEditorOpen] = useState(false);
    const [useDialogOpen, setUseDialogOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "templates"), (snapshot) => {
            const fetchedTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
            setTemplates(fetchedTemplates);
            setIsLoading(false);
        }, (err) => {
            console.error("Failed to fetch templates:", err);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch templates." });
            setIsLoading(false);
        });
        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    const handleSaveTemplate = async (data: Omit<Template, 'id'>) => {
        try {
            if (selectedTemplate) { // Edit mode
                await updateDoc(doc(db, "templates", selectedTemplate.id), data);
                toast({ title: "Template Updated!", description: `'${data.title}' has been saved.`});
            } else { // Create mode
                await addDoc(collection(db, "templates"), data);
                toast({ title: "Template Created!", description: `'${data.title}' has been saved.`});
            }
        } catch (error) {
            console.error("Error saving template:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the template." });
        } finally {
            setSelectedTemplate(null);
        }
    };
    
    const handleDelete = async () => {
        if (!templateToDelete) return;
        try {
            await deleteDoc(doc(db, "templates", templateToDelete.id));
            toast({ title: "Template Deleted", description: `'${templateToDelete.title}' has been removed.` });
        } catch (error) {
            console.error("Error deleting template:", error);
            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the template." });
        } finally {
            setTemplateToDelete(null);
            setDeleteAlertOpen(false);
        }
    };
    
    const handleSeedDatabase = async () => {
        for (const template of seedTemplates) {
            await addDoc(collection(db, "templates"), template);
        }
        toast({ title: "Database Seeded!", description: "Added 4 example templates."});
    };

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <PageHeader title="Template Forge" description="Build, manage, and use powerful, reusable templates.">
                <div className="flex gap-2">
                    <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Search templates..." className="pl-8 sm:w-[300px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                    <Button onClick={() => { setSelectedTemplate(null); setEditorOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
                </div>
            </PageHeader>
            <div className="p-6 md:p-8 pt-0">
                {isLoading ? <div className="text-center p-8">Loading templates...</div>
                : templates.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                        <p className="mb-2">Your Template Forge is empty.</p>
                        <Button onClick={handleSeedDatabase}>Click here to add 4 example templates</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template}
                                onUse={() => { setSelectedTemplate(template); setUseDialogOpen(true); }}
                                onEdit={() => { setSelectedTemplate(template); setEditorOpen(true); }}
                                onDelete={() => { setTemplateToDelete(template); setDeleteAlertOpen(true); }}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <TemplateEditorDialog isOpen={editorOpen} onOpenChange={setEditorOpen} onSave={handleSaveTemplate} initialData={selectedTemplate} />
            <UseTemplateDialog isOpen={useDialogOpen} onOpenChange={setUseDialogOpen} template={selectedTemplate} />
            
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the '{templateToDelete?.title}' template. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
