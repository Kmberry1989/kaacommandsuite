"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { PlusCircle, Trash2, Eraser, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- TYPE DEFINITIONS ---
const stickyNoteColors = [
  "bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200",
];

type StickyNote = {
  id: string;
  text: string;
  color: string;
  position: { x: number, y: number };
};

type ToDoStatus = "Not Started" | "Working" | "Completed";

type ToDoItem = {
  id: string;
  text: string;
  checked: boolean;
  status: ToDoStatus;
  dueDate: string | null;
};

// --- HELPER FUNCTIONS & COMPONENTS ---
const getStatusColor = (status: ToDoStatus) => {
    switch (status) {
        case "Not Started": return "bg-red-200";
        case "Working": return "bg-yellow-200";
        case "Completed": return "bg-green-200";
        default: return "bg-gray-200";
    }
}

const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !isToday(new Date(dueDate));
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

const DraggableStickyNote = ({ note, onStop, onUpdate, onDelete }: { note: StickyNote, onStop: (id: string, pos: {x: number, y: number}) => void, onUpdate: (id: string, text: string) => void, onDelete: (id: string) => void }) => {
    // The fix is here: Create a ref for each draggable note
    const nodeRef = React.useRef(null);
    return (
        // Pass the ref to the Draggable component and the div
        <Draggable nodeRef={nodeRef} defaultPosition={note.position} onStop={(_, data) => onStop(note.id, {x: data.x, y: data.y})}>
            <div ref={nodeRef} className={`absolute p-2 rounded-md shadow-md cursor-grab ${note.color}`} style={{width: '200px'}}>
                <Textarea value={note.text} onChange={(e) => onUpdate(note.id, e.target.value)} className="bg-transparent border-none resize-none"/>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-7 w-7" onClick={() => onDelete(note.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
        </Draggable>
    );
};

// --- MAIN COMPONENT ---
export function PlannerBoard() {
  const [calendarUrl, setCalendarUrl] = useState("https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis");
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>();

  useEffect(() => {
    const unsubNotes = onSnapshot(collection(db, "stickyNotes"), (snapshot) => {
        setStickyNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote)));
    });
    const unsubTodos = onSnapshot(collection(db, "todos"), (snapshot) => {
        const fetchedTodos = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ToDoItem);
        const sortedTodos = fetchedTodos.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        setTodos(sortedTodos);
    });
    return () => { unsubNotes(); unsubTodos(); };
  }, []);

  // Sticky Note Handlers
  const addStickyNote = async (color: string) => {
      await addDoc(collection(db, "stickyNotes"), { text: "New Note", color, position: { x: 50, y: 50 } });
  };
  const updateStickyNotePosition = async (id: string, position: {x: number, y: number}) => {
      await updateDoc(doc(db, "stickyNotes", id), { position });
  };
  const updateStickyNoteText = async (id: string, text: string) => {
      await updateDoc(doc(db, "stickyNotes", id), { text });
  };
  const deleteStickyNote = async (id: string) => {
      await deleteDoc(doc(db, "stickyNotes", id));
  };
  
  // To-Do Handlers
  const addTodo = async () => {
    if (newTodoText.trim() === "") return;
    await addDoc(collection(db, "todos"), { text: newTodoText, checked: false, status: "Not Started", dueDate: newTodoDueDate ? newTodoDueDate.toISOString().split('T')[0] : null });
    setNewTodoText("");
    setNewTodoDueDate(undefined);
  };
  const updateTodo = async (id: string, data: Partial<ToDoItem>) => {
      await updateDoc(doc(db, "todos", id), data);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Workspace</CardTitle>
            <div className="flex items-center gap-2">
                {stickyNoteColors.map(color => ( <div key={color} onClick={() => addStickyNote(color)} className={`w-8 h-8 rounded-md cursor-pointer ${color} shadow-md`}/> ))}
                <Button variant="ghost" size="icon" onClick={() => stickyNotes.forEach(note => deleteStickyNote(note.id))}><Eraser className="h-5 w-5"/></Button>
            </div>
          </CardHeader>
          <CardContent className="relative flex-grow bg-gray-50 rounded-b-lg">
            {stickyNotes.map((note) => (
                <DraggableStickyNote key={note.id} note={note} onStop={updateStickyNotePosition} onUpdate={updateStickyNoteText} onDelete={deleteStickyNote} />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle>Google Calendar</CardTitle></CardHeader>
            <CardContent>
                <Input value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} placeholder="Enter public Google Calendar embed URL"/>
                {calendarUrl && <iframe src={calendarUrl} style={{border: 0}} width="100%" height="300" frameBorder="0" scrolling="no"></iframe>}
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
                            <SelectTrigger className="w-16 h-8 border-none focus:ring-0 p-0">
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
