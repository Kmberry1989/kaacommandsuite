"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlusCircle,
  Trash2,
  Brush,
  Eraser,
  Pipette,
  File as FileIcon,
  Bell,
  X,
} from "lucide-react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { useToast } from "@/hooks/use-toast";

// Types
type StickyNote = {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
};

type ToDoItem = {
  id: string;
  text: string;
  checked: boolean;
  status: "Not Started" | "Working" | "Completed";
  dueDate: string;
  createdAt: any;
  reminder: string; // 'none', '5m', '1h', '1d'
  notificationSent: boolean;
};

type DrawingState = {
  lines: { points: { x: number; y: number }[]; color: string; size: number }[];
};

type EmbeddedFile = {
  id: string;
  url: string;
  title: string;
};

const stickyNoteColors = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-blue-200",
  "bg-green-200",
];

const colorPalette = [
    "#000000", // Black
    "#FF0000", // Red
    "#0000FF", // Blue
    "#008080", // Teal
    "#B7410E", // Rust
    "#4B0082", // Indigo
    "#FFFFFF", // White
];


// Draggable Note Component
const DraggableStickyNote = ({
  note,
  onStop,
  updateNoteText,
  deleteNote,
}: {
  note: StickyNote;
  onStop: (e: DraggableEvent, data: DraggableData, id: string) => void;
  updateNoteText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
}) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={note.position}
      onStop={(e, data) => onStop(e, data, note.id)}
    >
      <div
        ref={nodeRef}
        className={`absolute p-2 rounded-md shadow-md ${note.color} handle cursor-move`}
        style={{ width: "200px", height: "200px" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 cursor-pointer"
          onClick={() => deleteNote(note.id)}
        >
          <X className="h-4 w-4" />
        </Button>
        <Textarea
          value={note.text}
          onChange={(e) => updateNoteText(note.id, e.target.value)}
          className="bg-transparent border-none h-full resize-none mt-4"
        />
      </div>
    </Draggable>
  );
};

export function PlannerBoard() {
  // State variables
  const isMobile = useMobile();
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [newTodoReminder, setNewTodoReminder] = useState("none");
  const [embeddedFiles, setEmbeddedFiles] = useState<EmbeddedFile[]>([]);
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileTitle, setNewFileTitle] = useState("");
  const { toast } = useToast();

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [lines, setLines] = useState<DrawingState["lines"]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calendar URL
  const [calendarUrl, setCalendarUrl] = useState(
    "https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis"
  );

  // Firestore listeners
  useEffect(() => {
    const q = query(collection(db, "stickyNotes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes: StickyNote[] = [];
      snapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as StickyNote);
      });
      setStickyNotes(notes);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("dueDate"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoItems: ToDoItem[] = [];
      snapshot.forEach((doc) => {
        todoItems.push({ id: doc.id, ...doc.data() } as ToDoItem);
      });
      setTodos(todoItems);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "embeddedFiles"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const files: EmbeddedFile[] = [];
      snapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() } as EmbeddedFile);
      });
      setEmbeddedFiles(files);
    });
    return () => unsubscribe();
  }, []);
  
  // Notification checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      todos.forEach(async (todo) => {
        if (todo.reminder === 'none' || todo.notificationSent || todo.checked) {
          return;
        }

        const dueDate = new Date(todo.dueDate).getTime();
        let reminderTime = 0;
        if (todo.reminder === '5m') reminderTime = 5 * 60 * 1000;
        if (todo.reminder === '1h') reminderTime = 60 * 60 * 1000;
        if (todo.reminder === '1d') reminderTime = 24 * 60 * 60 * 1000;
        
        const notificationTime = dueDate - reminderTime;

        if (now >= notificationTime && now < dueDate) {
          toast({
            title: "To-Do Reminder",
            description: `Your task "${todo.text}" is due soon.`,
          });
          const todoRef = doc(db, "todos", todo.id);
          await updateDoc(todoRef, { notificationSent: true });
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [todos, toast]);

  // Drawing logic
  const getCanvasContext = () => canvasRef.current?.getContext("2d");

  const drawLine = useCallback((line: DrawingState["lines"][0]) => {
    const context = getCanvasContext();
    if (!context) return;
    context.strokeStyle = line.color;
    context.lineWidth = line.size;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(line.points[0].x, line.points[0].y);
    for (let i = 1; i < line.points.length; i++) {
      context.lineTo(line.points[i].x, line.points[i].y);
    }
    context.stroke();
  }, []);

  const redrawCanvas = useCallback((savedLines: DrawingState["lines"]) => {
    const canvas = canvasRef.current;
    const context = getCanvasContext();
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    savedLines.forEach(drawLine);
  }, [drawLine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    
    const fetchDrawing = async () => {
        const drawingDoc = await getDoc(doc(db, "drawings", "workspace"));
        if (drawingDoc.exists()) {
            const drawingData = drawingDoc.data() as DrawingState;
            setLines(drawingData.lines);
            redrawCanvas(drawingData.lines);
        }
    };
    fetchDrawing();

  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setLines([
      ...lines,
      {
        points: [{ x: offsetX, y: offsetY }],
        color: tool === "eraser" ? "#FFFFFF" : brushColor,
        size: brushSize,
      },
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const newLines = [...lines];
    const currentLine = newLines[newLines.length - 1];
    currentLine.points.push({ x: offsetX, y: offsetY });
    setLines(newLines);
    redrawCanvas(newLines);
  };

  const saveDrawing = async () => {
    await setDoc(doc(db, "drawings", "workspace"), { lines });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(saveDrawing, 1000);
  };
  
  const clearDrawing = async () => {
    setLines([]);
    const canvas = canvasRef.current;
    if (canvas) {
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
    }
    await setDoc(doc(db, "drawings", "workspace"), { lines: [] });
  };


  // Sticky Note functions
  const addStickyNote = async (color: string) => {
    await addDoc(collection(db, "stickyNotes"), {
      text: "New Note",
      color,
      position: { x: 50, y: 50 },
    });
  };

  const updateNotePosition = async (id: string, x: number, y: number) => {
    const noteRef = doc(db, "stickyNotes", id);
    await updateDoc(noteRef, { position: { x, y } });
  };

  const updateNoteText = async (id: string, text: string) => {
    const noteRef = doc(db, "stickyNotes", id);
    await updateDoc(noteRef, { text });
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, "stickyNotes", id));
  };
  
  // To-Do functions
  const addTodo = async () => {
    if (newTodoText.trim() !== "" && newTodoDueDate) {
      await addDoc(collection(db, "todos"), {
        text: newTodoText,
        checked: false,
        status: "Not Started",
        dueDate: newTodoDueDate,
        createdAt: serverTimestamp(),
        reminder: newTodoReminder,
        notificationSent: false,
      });
      setNewTodoText("");
      setNewTodoDueDate("");
      setNewTodoReminder("none");
    } else {
        toast({ variant: "destructive", title: "Missing Info", description: "Please enter a task and a due date."})
    }
  };

  const toggleTodo = async (id: string, checked: boolean) => {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { checked });
  };

  const updateTodoStatus = async (id: string, status: ToDoItem["status"]) => {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { status });
  };

  // File Embed functions
  const addFile = async () => {
      if (newFileUrl.trim() && newFileTitle.trim()) {
        await addDoc(collection(db, "embeddedFiles"), {
            url: newFileUrl,
            title: newFileTitle,
        });
        setNewFileUrl("");
        setNewFileTitle("");
      }
  }

  const deleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "embeddedFiles", id));
  }
  
  // Main Render
  return (
    <div className="h-full w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
            <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={60}>
                        <div className="flex flex-col h-full items-center p-4 gap-4">
                            <Input
                            placeholder="Enter public Google Calendar URL"
                            value={calendarUrl}
                            onChange={(e) => setCalendarUrl(e.target.value)}
                            />
                            <iframe
                            src={calendarUrl}
                            style={{ borderWidth: 0 }}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="auto"
                            ></iframe>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40}>
                         <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Shared Resources</CardTitle>
                                <CardDescription>Embed public files from Google Drive, etc.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-80px)]">
                                <div className="flex-grow overflow-y-auto">
                                    {embeddedFiles.length > 0 ? (
                                        <Tabs defaultValue={embeddedFiles[0].id} className="h-full flex flex-col">
                                            <TabsList>
                                                {embeddedFiles.map(file => (
                                                    <TabsTrigger key={file.id} value={file.id} className="relative group">
                                                        {file.title}
                                                        <button onClick={(e) => deleteFile(file.id, e)} className="absolute top-0 right-0 p-0.5 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                            {embeddedFiles.map(file => (
                                                <TabsContent key={file.id} value={file.id} className="flex-grow">
                                                    <iframe src={file.url} width="100%" height="100%" frameBorder="0" scrolling="auto"></iframe>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">No files embedded yet.</div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Input value={newFileTitle} onChange={(e) => setNewFileTitle(e.target.value)} placeholder="File Title"/>
                                    <Input value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} placeholder="Paste embed URL..."/>
                                    <Button onClick={addFile}><FileIcon className="h-4 w-4"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
                 <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={75}>
                        <div className="flex h-full p-4 gap-2">
                             <div className="flex flex-col items-center gap-2 p-2 rounded-md bg-gray-100 border">
                                <Button variant={tool === 'brush' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('brush')}><Brush className="h-4 w-4"/></Button>
                                <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser className="h-4 w-4"/></Button>
                                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="h-9 w-9"/>
                                <div className="flex flex-col items-center gap-1">
                                    {colorPalette.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBrushColor(color)}
                                            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${brushColor.toLowerCase() === color.toLowerCase() ? 'border-blue-500' : 'border-gray-300'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-20 [writing-mode:vertical-lr]"/>
                                <Button variant="destructive" size="icon" onClick={clearDrawing}><Trash2 className="h-4 w-4"/></Button>
                            </div>

                            <div className="flex-grow h-full relative">
                                 <div className="h-full w-full relative bg-white rounded-md shadow-inner overflow-hidden">
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        className="absolute top-0 left-0"
                                    />
                                    {stickyNotes.map((note) => (
                                        <DraggableStickyNote
                                        key={note.id}
                                        note={note}
                                        onStop={(e, data, id) => updateNotePosition(id, data.x, data.y)}
                                        updateNoteText={updateNoteText}
                                        deleteNote={deleteNote}
                                        />
                                    ))}
                                </div>
                                <div className="absolute bottom-2 left-2 flex gap-2">
                                    {stickyNoteColors.map((color) => (
                                        <div
                                            key={color}
                                            onClick={() => addStickyNote(color)}
                                            className={`w-12 h-12 rounded-md cursor-pointer ${color} shadow-md`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                     <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25}>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>To-Do List</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-80px)]">
                                <div className="space-y-4 flex-grow overflow-y-auto">
                                {todos.map((todo) => {
                                    const isOverdue = new Date(todo.dueDate) < new Date() && !todo.checked;
                                    return (
                                        <div key={todo.id} className="flex items-center gap-4">
                                            <Checkbox checked={todo.checked} onCheckedChange={(checked) => toggleTodo(todo.id, !!checked)}/>
                                            <span className={`flex-grow ${todo.checked ? 'line-through text-muted-foreground' : ''}`}>{todo.text}</span>
                                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>{todo.dueDate}</span>
                                            <Select value={todo.status} onValueChange={(value) => updateTodoStatus(todo.id, value as ToDoItem["status"])}>
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Not Started" className="text-red-600">Not Started</SelectItem>
                                                    <SelectItem value="Working" className="text-yellow-600">Working</SelectItem>
                                                    <SelectItem value="Completed" className="text-green-600">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                })}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..."/>
                                    <Input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} />
                                    <Select value={newTodoReminder} onValueChange={setNewTodoReminder}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Reminder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Reminder</SelectItem>
                                            <SelectItem value="5m">5 mins before</SelectItem>
                                            <SelectItem value="1h">1 hour before</SelectItem>
                                            <SelectItem value="1d">1 day before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={addTodo}><PlusCircle className="h-4 w-4"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </ResizablePanel>
                 </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
}
