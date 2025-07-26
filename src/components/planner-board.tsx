"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Trash2,
  Brush,
  Eraser,
  Pipette,
  Clipboard,
} from "lucide-react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Type definitions
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
};

type SharedResource = {
  id: string;
  name: string;
  url: string;
};

// Sub-component for Draggable Sticky Note to handle ref issues
const DraggableStickyNote = ({
  note,
  updateStickyNoteText,
  updateStickyNotePosition,
  deleteStickyNote,
}: {
  note: StickyNote;
  updateStickyNoteText: (id: string, text: string) => void;
  updateStickyNotePosition: (
    e: DraggableEvent,
    data: DraggableData,
    id: string
  ) => void;
  deleteStickyNote: (id: string) => void;
}) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={note.position}
      onStop={(e, data) => updateStickyNotePosition(e, data, note.id)}
    >
      <div
        ref={nodeRef}
        className={`absolute p-4 rounded-md shadow-lg w-48 h-48 flex flex-col ${note.color} handle cursor-move`}
      >
        <Textarea
          value={note.text}
          onChange={(e) => updateStickyNoteText(note.id, e.target.value)}
          className="bg-transparent border-none flex-grow resize-none text-black placeholder-gray-700"
          placeholder="New Note..."
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 cursor-pointer"
          onClick={() => deleteStickyNote(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Draggable>
  );
};

export function PlannerBoard() {
  const isMobile = useMobile();
  const { toast } = useToast();

  // State Management
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  // Collections Refs
  const notesCollectionRef = collection(db, "stickyNotes");
  const todosCollectionRef = collection(db, "todos");
  const resourcesCollectionRef = collection(db, "sharedResources");
  const drawingDocRef = doc(db, "drawings", "workspaceDrawing");

  // --- Data Fetching and Saving ---
  useEffect(() => {
    // Fetch Sticky Notes
    const unsubscribeNotes = onSnapshot(
      query(notesCollectionRef),
      (snapshot) => {
        const notesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as StickyNote)
        );
        setStickyNotes(notesData);
      }
    );

    // Fetch To-Dos
    const unsubscribeTodos = onSnapshot(
      query(todosCollectionRef),
      (snapshot) => {
        const todosData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ToDoItem)
        );
        setTodos(todosData);
      }
    );

    // Fetch Shared Resources
    const unsubscribeResources = onSnapshot(
      query(resourcesCollectionRef),
      (snapshot) => {
        const resourcesData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as SharedResource)
        );
        setSharedResources(resourcesData);
      }
    );

    // Load drawing from Firestore
    const loadDrawing = async () => {
      const docSnap = await getDoc(drawingDocRef);
      if (docSnap.exists()) {
        const drawingDataUrl = docSnap.data().dataUrl;
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          const image = new Image();
          image.onload = () => {
            context?.drawImage(image, 0, 0);
          };
          image.src = drawingDataUrl;
        }
      }
    };
    loadDrawing();

    return () => {
      unsubscribeNotes();
      unsubscribeTodos();
      unsubscribeResources();
    };
  }, []);

  // --- Planner Functionality ---

  // Sticky Notes
  const addStickyNote = async (color: string) => {
    await addDoc(notesCollectionRef, {
      text: "",
      color,
      position: { x: 50, y: 50 },
    });
  };

  const updateStickyNoteText = async (id: string, text: string) => {
    await setDoc(doc(db, "stickyNotes", id), { text }, { merge: true });
  };

  const updateStickyNotePosition = async (
    e: DraggableEvent,
    data: DraggableData,
    id: string
  ) => {
    await setDoc(
      doc(db, "stickyNotes", id),
      { position: { x: data.x, y: data.y } },
      { merge: true }
    );
  };

  const deleteStickyNote = async (id: string) => {
    await deleteDoc(doc(db, "stickyNotes", id));
  };

  // To-Do List
  const addTodo = async () => {
    if (newTodoText.trim() !== "") {
      await addDoc(todosCollectionRef, {
        text: newTodoText,
        checked: false,
        status: "Not Started",
        dueDate: newTodoDueDate,
      });
      setNewTodoText("");
      setNewTodoDueDate("");
    }
  };

  const toggleTodo = async (id: string, checked: boolean) => {
    await setDoc(doc(db, "todos", id), { checked }, { merge: true });
  };

  const updateTodoStatus = async (id: string, status: ToDoItem["status"]) => {
    await setDoc(doc(db, "todos", id), { status }, { merge: true });
  };

  // Shared Resources
  const addResource = async () => {
    if (newResourceName.trim() && newResourceUrl.trim()) {
      await addDoc(resourcesCollectionRef, {
        name: newResourceName,
        url: newResourceUrl,
      });
      setNewResourceName("");
      setNewResourceUrl("");
    }
  };

  // --- Drawing Functionality ---
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    const context = canvasRef.current!.getContext("2d")!;
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    const context = canvasRef.current!.getContext("2d")!;
    context.strokeStyle = tool === "brush" ? brushColor : "#FFFFFF"; // Eraser is just white
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Save the drawing to Firestore
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setDoc(drawingDocRef, { dataUrl });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
      setDoc(drawingDocRef, { dataUrl: "" }); // Clear in DB
    }
  };

  // Eyedropper function
  const pickColor = async () => {
    if ("EyeDropper" in window) {
      const eyeDropper = new (window as any).EyeDropper();
      try {
        const result = await eyeDropper.open();
        setBrushColor(result.sRGBHex);
      } catch (e) {
        console.log("Color picker was cancelled.");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "The eyedropper tool is not available in your browser.",
      });
    }
  };

  // In-app Notifications
  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date();
      todos.forEach((todo) => {
        if (todo.dueDate && !todo.checked) {
          const dueDate = new Date(todo.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (dayDiff === 1) {
            toast({
              title: "To-Do Reminder",
              description: `"${todo.text}" is due tomorrow.`,
            });
          }
        }
      });
    };

    const intervalId = setInterval(checkDueDates, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(intervalId);
  }, [todos, toast]);

  // Sorted and color-coded To-Dos
  const sortedTodos = [...todos].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getStatusColor = (status: ToDoItem["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-red-500";
      case "Working":
        return "bg-yellow-500";
      case "Completed":
        return "bg-green-500";
    }
  };

  // Color palette
  const colorPalette = [
    "#000000",
    "#FF0000",
    "#0000FF",
    "#008000",
    "#4682B4",
    "#D2691E",
    "#00CED1",
    "#F5F5DC",
  ];

  if (isMobile) {
    // Mobile layout
    return (
      <div className="flex flex-col h-full w-full p-4 gap-4">
        {/* Mobile: All panels are stacked vertically and scroll */}
        <Card>
          <CardHeader>
            <CardTitle>To-Do List</CardTitle>
          </CardHeader>
          {/* To-Do List content here */}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          {/* Workspace content here */}
        </Card>
        {/* Other components... */}
      </div>
    );
  }

  // Desktop layout
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={40}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60}>
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis"
                  style={{ borderWidth: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                ></iframe>
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40}>
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle>Shared Resources</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-4">
                {sharedResources.length > 0 ? (
                  <Tabs defaultValue={sharedResources[0].id}>
                    <TabsList>
                      {sharedResources.map((res) => (
                        <TabsTrigger key={res.id} value={res.id}>
                          {res.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {sharedResources.map((res) => (
                      <TabsContent key={res.id} value={res.id} className="h-full">
                         <iframe src={res.url} width="100%" height="95%"></iframe>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : <p className="text-muted-foreground">No resources added yet.</p>}
                 <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Input
                    placeholder="Resource Name"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                  />
                  <Input
                    placeholder="Embed URL"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                  />
                  <Button onClick={addResource}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            <div className="h-full w-full relative">
              <div className="absolute top-2 left-2 flex flex-col gap-2 z-10 bg-card p-2 rounded-md border shadow-lg">
                <Button
                  variant={tool === "brush" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTool("brush")}
                >
                  <Brush className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "eraser" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setTool("eraser")}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer"
                />
                <Button size="icon" variant="ghost" onClick={pickColor}>
                  <Pipette className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-1">
                  {colorPalette.map((color) => (
                    <div
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className="w-6 h-6 rounded-full cursor-pointer border-2"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          brushColor === color ? "blue" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <Slider
                  defaultValue={[4]}
                  min={3}
                  max={5}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0])}
                />
                <Button size="icon" variant="destructive" onClick={clearCanvas}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <canvas
                ref={canvasRef}
                width={window.innerWidth * 0.6} // Adjust based on default panel size
                height={window.innerHeight * 0.7} // Adjust based on default panel size
                className="absolute top-0 left-0 w-full h-full bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />

              {stickyNotes.map((note) => (
                <DraggableStickyNote
                  key={note.id}
                  note={note}
                  updateStickyNoteText={updateStickyNoteText}
                  updateStickyNotePosition={updateStickyNotePosition}
                  deleteStickyNote={deleteStickyNote}
                />
              ))}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <Card className="h-full w-full overflow-auto">
              <CardHeader>
                <CardTitle>To-Do List</CardTitle>
                <CardDescription>
                  Tasks are sorted by the nearest due date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedTodos.map((todo) => {
                    const isOverdue =
                      todo.dueDate && new Date(todo.dueDate) < new Date();
                    return (
                      <div
                        key={todo.id}
                        className="flex items-center gap-4 p-2 rounded-md bg-muted/50"
                      >
                        <Checkbox
                          checked={todo.checked}
                          onCheckedChange={(checked) =>
                            toggleTodo(todo.id, !!checked)
                          }
                        />
                        <span
                          className={`flex-grow ${
                            todo.checked ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {todo.text}
                        </span>
                        <span
                          className={`text-sm ${
                            isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          {todo.dueDate}
                        </span>
                        <Select
                          value={todo.status}
                          onValueChange={(value: ToDoItem["status"]) =>
                            updateTodoStatus(todo.id, value)
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(
                                  todo.status
                                )}`}
                              ></div>
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">
                              Not Started
                            </SelectItem>
                            <SelectItem value="Working">Working</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Input
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="New to-do..."
                  />
                  <Input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                  />
                  <Button onClick={addTodo} size="icon">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
