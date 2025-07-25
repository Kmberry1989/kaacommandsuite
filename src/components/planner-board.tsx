"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"; // New Import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Trash2,
  Paintbrush,
  Eraser,
  Pipette,
} from "lucide-react";
import Draggable from "react-draggable";
import { Slider } from "@/components/ui/slider";

// --- Types ---
type StickyNote = {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
};
type ToDoStatus = "Not Started" | "Working" | "Completed";
type ToDoItem = {
  id: string;
  text: string;
  checked: boolean;
  status: ToDoStatus;
  dueDate: string;
};
type Point = { x: number; y: number };
type Line = { points: Point[]; color: string; brushSize: number };
type Tool = "brush" | "eraser";

const statusColors: { [key in ToDoStatus]: string } = {
  "Not Started": "bg-red-200",
  Working: "bg-yellow-200",
  Completed: "bg-green-200",
};

// --- Draggable Note Component ---
const DraggableStickyNote = ({ note, onStop, onUpdate, onDelete }: {
  note: StickyNote;
  onStop: (id: string, pos: { x: number; y: number }) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={note.position}
      onStop={(_, data) => onStop(note.id, { x: data.x, y: data.y })}
    >
      <div ref={nodeRef} className={`absolute p-2 rounded-md shadow-md ${note.color} handle cursor-move`}>
        <Textarea
          value={note.text}
          onChange={(e) => onUpdate(note.id, e.target.value)}
          className="bg-transparent border-none w-48 h-32"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 cursor-pointer"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Draggable>
  );
};


export function PlannerBoard() {
  // --- State Declarations ---
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [lines, setLines] = useState<Line[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Data Fetching and Saving ---
  useEffect(() => {
    const todosQuery = query(collection(db, "todos"), orderBy("dueDate"));
    const notesQuery = query(collection(db, "stickynotes"));

    const unsubTodos = onSnapshot(todosQuery, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ToDoItem)));
    });
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote)));
    });
    
    const fetchDrawing = async () => {
        const docRef = doc(db, "drawings", "workspace");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setLines(docSnap.data().lines || []);
        }
    };
    fetchDrawing();

    return () => {
      unsubTodos();
      unsubNotes();
    };
  }, []);

  const saveDrawing = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await setDoc(doc(db, "drawings", "workspace"), { lines });
    }, 1000);
  }, [lines]);

  // --- Drawing Logic ---
  const getCoords = (e: React.MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const coords = getCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    const newLine = { points: [coords], color: tool === 'brush' ? brushColor : '#FFFFFF', brushSize };
    setLines(prev => [...prev, newLine]);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const coords = getCoords(e);
    if (!coords) return;
    setLines(prev => {
      const newLines = [...prev];
      newLines[newLines.length - 1].points.push(coords);
      return newLines;
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveDrawing();
    }
  };

  const clearDrawing = async () => {
    setLines([]);
    await setDoc(doc(db, "drawings", "workspace"), { lines: [] });
  };
  
  const pickColorWithEyedropper = async () => {
    if ('EyeDropper' in window) {
      const eyeDropper = new (window as any).EyeDropper();
      try {
        const result = await eyeDropper.open();
        setBrushColor(result.sRGBHex);
      } catch (e) { /* User cancelled */ }
    } else {
      alert("Your browser doesn't support the EyeDropper API.");
    }
  };

  // --- Canvas Rendering ---
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(({ points, color, brushSize }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      }
    });
  }, [lines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        redrawCanvas();
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [redrawCanvas]);


  // --- To-Do and Notes Logic ---
  const addTodo = async () => {
    if (newTodoText.trim() !== "" && newTodoDueDate) {
      await addDoc(collection(db, "todos"), {
        text: newTodoText, checked: false, status: "Not Started", dueDate: newTodoDueDate,
      });
      setNewTodoText("");
      setNewTodoDueDate("");
    }
  };
  const updateTodoStatus = (id: string, status: ToDoStatus) => updateDoc(doc(db, "todos", id), { status });
  const toggleTodo = (id: string, checked: boolean) => updateDoc(doc(db, "todos", id), { checked: !checked });
  const addStickyNote = () => addDoc(collection(db, "stickynotes"), { text: "New Note", color: "bg-yellow-200", position: { x: 50, y: 50 } });
  const updateStickyNoteText = (id: string, text: string) => updateDoc(doc(db, "stickynotes", id), { text });
  const updateStickyNotePosition = (id: string, position: { x: number; y: number }) => updateDoc(doc(db, "stickynotes", id), { position });
  const deleteStickyNote = (id: string) => deleteDoc(doc(db, "stickynotes", id));
  
  const sortedTodos = [...todos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[80vh] rounded-lg border">
      <ResizablePanel defaultSize={65}>
        <div className="relative w-full h-full p-4">
          {/* Toolbar */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2 p-2 border rounded-md bg-white/80 backdrop-blur-sm">
            <Button variant={tool === 'brush' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('brush')}><Paintbrush className="h-4 w-4" /></Button>
            <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser className="h-4 w-4" /></Button>
            <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-8 h-8"/>
            <Button variant="ghost" size="icon" onClick={pickColorWithEyedropper}><Pipette className="h-4 w-4"/></Button>
            <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={1} max={50} step={1} className="w-24"/>
            <Button variant="ghost" size="icon" onClick={clearDrawing}><Trash2 className="h-4 w-4" /></Button>
          </div>
          {/* Workspace */}
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}/>
          {notes.map((note) => <DraggableStickyNote key={note.id} note={note} onStop={updateStickyNotePosition} onUpdate={updateStickyNoteText} onDelete={deleteStickyNote} />)}
          <Button onClick={addStickyNote} className="absolute bottom-4 right-4 z-10"><PlusCircle className="mr-2 h-4 w-4" /> Add Note</Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={35}>
        <div className="h-full overflow-y-auto p-4 space-y-6">
          <Card>
            <CardHeader><CardTitle>Google Calendar</CardTitle></CardHeader>
            <CardContent>
              <iframe src="https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis" style={{ border: 0 }} width="100%" height="400" scrolling="no"></iframe>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>To-Do List</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-4">
                    <Checkbox checked={todo.checked} onCheckedChange={() => toggleTodo(todo.id, todo.checked)} />
                    <div className="flex-grow">
                      <p className={`${todo.checked ? "line-through" : ""}`}>{todo.text}</p>
                      <p className={`text-xs ${new Date(todo.dueDate) < new Date() && todo.status !== 'Completed' ? 'text-red-500' : 'text-muted-foreground'}`}>{new Date(todo.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Select value={todo.status} onValueChange={(value) => updateTodoStatus(todo.id, value as ToDoStatus)}>
                      <SelectTrigger className={`w-[150px] ${statusColors[todo.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..." />
                <Input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} />
                <Button onClick={addTodo} size="icon"><PlusCircle className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
