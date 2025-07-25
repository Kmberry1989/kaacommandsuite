"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Draggable from 'react-draggable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlusCircle, Trash2, EraserIcon, CalendarIcon, Brush, Pipette, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- TYPE DEFINITIONS ---
const stickyNoteColors = ["bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200"];
type StickyNote = { id: string; text: string; color: string; position: { x: number; y: number } };
type ToDoStatus = "Not Started" | "Working" | "Completed";
type ToDoItem = { id: string; text: string; checked: boolean; status: ToDoStatus; dueDate: string | null };
type DrawingTool = "brush" | "eraser";

// --- HELPER FUNCTIONS & COMPONENTS ---
const getStatusColor = (status: ToDoStatus) => {
    switch (status) {
        case "Not Started": return "bg-red-200";
        case "Working": return "bg-yellow-200";
        case "Completed": return "bg-green-200";
        default: return "bg-gray-200";
    }
}
const isOverdue = (dueDate: string | null) => dueDate && new Date(dueDate) < new Date() && !isToday(new Date(dueDate));
const isToday = (date: Date) => { const today = new Date(); return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(); }

const DraggableStickyNote = ({ note, onStop, onUpdate, onDelete }: { note: StickyNote, onStop: (id: string, pos: {x: number, y: number}) => void, onUpdate: (id: string, text: string) => void, onDelete: (id: string) => void }) => {
    const nodeRef = React.useRef(null);
    return (
        <Draggable nodeRef={nodeRef} defaultPosition={note.position} onStop={(_, data) => onStop(note.id, {x: data.x, y: data.y})} cancel=".no-drag">
            <div ref={nodeRef} className="absolute p-2 rounded-md shadow-md cursor-grab z-20" style={{backgroundColor: note.color, width: '200px'}}>
                <Textarea value={note.text} onChange={(e) => onUpdate(note.id, e.target.value)} className="bg-transparent border-none resize-none no-drag"/>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-7 w-7 no-drag" onClick={() => onDelete(note.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
        </Draggable>
    );
};

// --- MAIN COMPONENT ---
export function PlannerBoard() {
    // State for data
    const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
    const [todos, setTodos] = useState<ToDoItem[]>([]);
    const [calendarUrl, setCalendarUrl] = useState("https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis");
    
    // State for UI and drawing
    const [newTodoText, setNewTodoText] = useState("");
    const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>();
    const [drawingTool, setDrawingTool] = useState<DrawingTool>("brush");
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Refs for drawing canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // Debounce function for saving drawing
    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const saveDrawingToDb = useCallback(
        debounce(async (dataUrl: string) => {
            const workspaceDocRef = doc(db, "workspaces", "main");
            await setDoc(workspaceDocRef, { drawingData: dataUrl }, { merge: true });
        }, 1000), // Save 1 second after user stops drawing
        []
    );

    // Effect for fetching ALL data from Firestore
    useEffect(() => {
        // Fetch Notes
        const unsubNotes = onSnapshot(collection(db, "stickyNotes"), (snapshot) => setStickyNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote))));
        
        // Fetch To-Dos
        const unsubTodos = onSnapshot(collection(db, "todos"), (snapshot) => {
            const fetchedTodos = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ToDoItem);
            setTodos(fetchedTodos.sort((a, b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : !a.dueDate ? 1 : -1));
        });

        // Fetch and load drawing
        const loadDrawing = async () => {
            const workspaceDocRef = doc(db, "workspaces", "main");
            const docSnap = await getDoc(workspaceDocRef);
            if (docSnap.exists() && docSnap.data().drawingData) {
                const img = new Image();
                img.src = docSnap.data().drawingData;
                img.onload = () => {
                    contextRef.current?.drawImage(img, 0, 0);
                };
            }
        };
        
        // We need to wait for the canvas context to be ready
        if (contextRef.current) {
            loadDrawing();
        }

        return () => { unsubNotes(); unsubTodos(); };
    }, [contextRef.current]); // Rerun when canvas context is available

    // Effect for setting up canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        // Set canvas size to match parent container
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        canvas.style.width = `${parent.offsetWidth}px`;
        canvas.style.height = `${parent.offsetHeight}px`;

        const context = canvas.getContext("2d");
        if (!context) return;
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;
    }, []);
    
    // --- Drawing Handlers ---
    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        if (!contextRef.current) return;
        contextRef.current.strokeStyle = brushColor;
        contextRef.current.lineWidth = brushSize;
        contextRef.current.globalCompositeOperation = drawingTool === 'brush' ? 'source-over' : 'destination-out';
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!contextRef.current || !canvasRef.current) return;
        contextRef.current.closePath();
        setIsDrawing(false);

        // Save the drawing state
        const dataUrl = canvasRef.current.toDataURL();
        saveDrawingToDb(dataUrl);
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !contextRef.current) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if(canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            saveDrawingToDb(""); // Clear the saved drawing in DB
        }
    }

    const activateEyedropper = async () => {
        if ('EyeDropper' in window) {
            try {
                // @ts-ignore
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                setBrushColor(result.sRGBHex);
            } catch (e) {
                console.error("Eyedropper was cancelled or failed.", e);
            }
        } else {
            alert("Your browser does not support the Eyedropper API.");
        }
    };

    // --- Data Handlers ---
    const addStickyNote = async (color: string) => { await addDoc(collection(db, "stickyNotes"), { text: "New Note", color: color.replace("bg-", "").replace("-200", ""), position: { x: 50, y: 50 } }); };
    const updateStickyNotePosition = async (id: string, position: {x: number, y: number}) => { await updateDoc(doc(db, "stickyNotes", id), { position }); };
    const updateStickyNoteText = async (id: string, text: string) => { await updateDoc(doc(db, "stickyNotes", id), { text }); };
    const deleteStickyNote = async (id: string) => { await deleteDoc(doc(db, "stickyNotes", id)); };
    const addTodo = async () => { if (newTodoText.trim() !== "") { await addDoc(collection(db, "todos"), { text: newTodoText, checked: false, status: "Not Started", dueDate: newTodoDueDate ? newTodoDueDate.toISOString().split('T')[0] : null }); setNewTodoText(""); setNewTodoDueDate(undefined); } };
    const updateTodo = async (id: string, data: Partial<ToDoItem>) => { await updateDoc(doc(db, "todos", id), data); };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
                <Card className="h-[85vh] flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Workspace</CardTitle>
                            {/* Drawing Tools */}
                            <div className="flex items-center gap-4 p-2 border rounded-lg bg-background">
                                <ToggleGroup type="single" value={drawingTool} onValueChange={(value: DrawingTool) => value && setDrawingTool(value)}>
                                    <ToggleGroupItem value="brush" aria-label="Brush"><Brush className="h-5 w-5"/></ToggleGroupItem>
                                    <ToggleGroupItem value="eraser" aria-label="Eraser"><EraserIcon className="h-5 w-5"/></ToggleGroupItem>
                                </ToggleGroup>
                                <div className="h-8 border-l"></div>
                                <div className="flex items-center gap-2">
                                    <Input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-10 h-10 p-1"/>
                                    <Button variant="ghost" size="icon" onClick={activateEyedropper}><Pipette className="h-5 w-5"/></Button>
                                </div>
                                <div className="flex items-center gap-2 w-32">
                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: brushColor, transform: `scale(${brushSize/10})`}}></div>
                                    <Slider value={[brushSize]} onValueChange={([val]) => setBrushSize(val)} min={1} max={50} step={1}/>
                                </div>
                                <div className="h-8 border-l"></div>
                                <Button variant="ghost" size="icon" onClick={clearCanvas}><Trash className="h-5 w-5"/></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative flex-grow bg-gray-50 rounded-b-lg overflow-hidden">
                        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseLeave={finishDrawing} onMouseMove={draw} className="absolute top-0 left-0 z-10"/>
                        {stickyNotes.map((note) => ( <DraggableStickyNote key={note.id} note={{...note, color: `bg-${note.color}-200`}} onStop={updateStickyNotePosition} onUpdate={updateStickyNoteText} onDelete={deleteStickyNote} /> ))}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Google Calendar</CardTitle></CardHeader>
                    <CardContent>
                        <Input value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} placeholder="Enter public Google Calendar embed URL"/>
                        {calendarUrl && <iframe src={calendarUrl} style={{border: 0}} width="100%" height="300" frameBorder="0" scrolling="no" className="mt-2 rounded-md"></iframe>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>To-Do List</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {todos.map((todo) => (
                                <div key={todo.id} className="flex items-center gap-2">
                                    <Checkbox checked={todo.checked} onCheckedChange={(checked) => updateTodo(todo.id, { checked: !!checked })}/>
                                    <span className={`flex-grow ${todo.checked ? 'line-through text-muted-foreground' : ''}`}>{todo.text}</span>
                                    {todo.dueDate && <span className={`text-xs ${isOverdue(todo.dueDate) ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>{format(new Date(todo.dueDate), "MMM d")}</span>}
                                    <Select value={todo.status} onValueChange={(status) => updateTodo(todo.id, { status: status as ToDoStatus })}>
                                        <SelectTrigger className="w-16 h-8 border-none focus:ring-0 p-0 justify-center">
                                            <SelectValue asChild><div className={`w-4 h-4 rounded-full ${getStatusColor(todo.status)}`}/></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="Working">Working</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..."/>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" size="icon"><CalendarIcon className="h-4 w-4"/></Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newTodoDueDate} onSelect={setNewTodoDueDate} initialFocus /></PopoverContent>
                            </Popover>
                            <Button onClick={addTodo} size="icon"><PlusCircle className="h-4 w-4"/></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
