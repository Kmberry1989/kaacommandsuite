"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Eraser, Calendar as CalendarIcon } from "lucide-react";
import Draggable from 'react-draggable';
import { cn } from "@/lib/utils";

const stickyNoteColors = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-blue-200",
  "bg-green-200",
];

type StickyNote = {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
};

type ToDoStatus = "Not Started" | "Working" | "Completed";

type ToDoItem = {
  id: string;
  text: string;
  checked: boolean;
  status: ToDoStatus;
  dueDate: string | null; // Stored as YYYY-MM-DD
};

const statusColors: Record<ToDoStatus, string> = {
  "Not Started": "bg-red-500",
  "Working": "bg-yellow-500",
  "Completed": "bg-green-500",
};

export function PlannerBoard() {
  const [calendarUrl, setCalendarUrl] = useState("https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis");
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");

  // --- Firestore Listeners ---
  useEffect(() => {
    const notesUnsub = onSnapshot(collection(db, "planner-notes"), (snapshot) => {
        setStickyNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote)));
    });
    const todosUnsub = onSnapshot(collection(db, "planner-todos"), (snapshot) => {
        setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ToDoItem)));
    });
    return () => { notesUnsub(); todosUnsub(); };
  }, []);

  // --- Sticky Note Functions ---
  const addStickyNote = async (color: string) => await addDoc(collection(db, "planner-notes"), { text: "New Note", color, x: 50, y: 50 });
  const updateStickyNoteText = async (id: string, text: string) => await updateDoc(doc(db, "planner-notes", id), { text });
  const handleNoteDrag = async (id: string, data: { x: number, y: number }) => await updateDoc(doc(db, "planner-notes", id), { x: data.x, y: data.y });
  const deleteStickyNote = async (id: string) => await deleteDoc(doc(db, "planner-notes", id));
  
  // --- To-Do Functions ---
  const addTodo = async () => {
    if (newTodoText.trim() !== "") {
      await addDoc(collection(db, "planner-todos"), {
        text: newTodoText,
        checked: false,
        status: "Not Started",
        dueDate: newTodoDueDate || null,
      });
      setNewTodoText("");
      setNewTodoDueDate("");
    }
  };

  const toggleTodo = async (id: string, checked: boolean) => await updateDoc(doc(db, "planner-todos", id), { checked });
  const updateTodoStatus = async (id: string, status: ToDoStatus) => await updateDoc(doc(db, "planner-todos", id), { status });
  const clearBoard = async () => {
    await Promise.all([
        ...stickyNotes.map(note => deleteDoc(doc(db, "planner-notes", note.id))),
        ...todos.map(todo => deleteDoc(doc(db, "planner-todos", todo.id)))
    ]);
  };

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dateA === dateB) {
            return a.checked === b.checked ? 0 : a.checked ? 1 : -1;
        }
        return dateA - dateB;
    });
  }, [todos]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
         <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Google Calendar</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Label htmlFor="calendar-url">Embed URL</Label>
                <Input id="calendar-url" value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} />
            </div>
            {calendarUrl ? (
                <iframe src={calendarUrl} style={{border: 0}} width="100%" height="600" frameBorder="0" scrolling="no" className="mt-4 rounded-md"></iframe>
            ) : (
                <div className="mt-4 text-center text-muted-foreground p-8 border-2 border-dashed rounded-md">
                    <p>Paste your public Google Calendar embed URL to see your calendar here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>To-Do List</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
                {sortedTodos.map((todo) => {
                    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.checked;
                    return (
                        <div key={todo.id} className="flex items-center gap-2 p-2 rounded-md bg-background hover:bg-muted/50">
                            <Checkbox checked={todo.checked} onCheckedChange={(checked) => toggleTodo(todo.id, !!checked)}/>
                            <div className="flex-grow">
                                <p className={cn("font-medium", todo.checked && 'line-through text-muted-foreground')}>{todo.text}</p>
                                {todo.dueDate && (
                                    <p className={cn("text-xs", isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
                                        Due: {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                            <Select value={todo.status} onValueChange={(value) => updateTodoStatus(todo.id, value as ToDoStatus)}>
                                <SelectTrigger className="w-[130px] flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("h-2 w-2 rounded-full", statusColors[todo.status])}></span>
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="Working">Working</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-2 mt-4">
                <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..."/>
                <Input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} className="w-[150px]"/>
                <Button onClick={addTodo} size="icon"><PlusCircle className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Sticky Notes</CardTitle>
                 <Button variant="ghost" size="icon" onClick={clearBoard}><Eraser className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="relative h-96 border-2 border-dashed rounded-md" id="notes-area">
                 {stickyNotes.map((note) => (
                    <Draggable key={note.id} bounds="parent" position={{x: note.x, y: note.y}} onStop={(_, data) => handleNoteDrag(note.id, data)}>
                        <div className={`p-4 rounded-md shadow-lg cursor-grab active:cursor-grabbing ${note.color}`}>
                            <Textarea value={note.text} onChange={(e) => updateStickyNoteText(note.id, e.target.value)} className="bg-transparent border-none focus-visible:ring-0 resize-none" />
                            <button onClick={() => deleteStickyNote(note.id)} className="absolute top-1 right-1 opacity-50 hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                        </div>
                    </Draggable>
                ))}
            </CardContent>
             <div className="flex justify-center gap-2 mt-4 p-4">
                {stickyNoteColors.map(color => (
                    <div key={color} onClick={() => addStickyNote(color)} className={`w-10 h-10 rounded-md cursor-pointer ${color} shadow-md hover:scale-110 transition-transform`}/>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}
