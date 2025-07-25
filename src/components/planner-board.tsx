"use client"

import React, { useState, useEffect, useRef } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from "firebase/firestore"
import Draggable from "react-draggable"
import { useMobile } from "@/hooks/use-mobile"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  PlusCircle,
  Trash2,
  Brush,
  Eraser,
  Pipette,
} from "lucide-react"
import { Slider } from "./ui/slider"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

const stickyNoteColors = [
  { name: "Yellow", class: "bg-yellow-200" },
  { name: "Pink", class: "bg-pink-200" },
  { name: "Blue", class: "bg-blue-200" },
  { name: "Green", class: "bg-green-200" },
  { name: "Purple", class: "bg-purple-200" },
]

type StickyNote = {
  id: string
  text: string
  color: string
  position: { x: number; y: number }
}

type ToDoItem = {
  id: string
  text: string
  checked: boolean
  status: "Not Started" | "Working" | "Completed"
  dueDate: string | null
}

export function PlannerBoard() {
  const isMobile = useMobile()
  // Planner State
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [todos, setTodos] = useState<ToDoItem[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [newTodoDueDate, setNewTodoDueDate] = useState("")
  const [calendarUrl] = useState(
    "https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis"
  )
  const workspaceRef = useRef<HTMLDivElement>(null)
  
  // Drawing State
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)

  // Fetch and listen for real-time updates for notes and todos
  useEffect(() => {
    const notesUnsub = onSnapshot(collection(db, "planner-notes"), (snapshot) => {
        const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StickyNote));
        setStickyNotes(notesData);
    });

    const todosUnsub = onSnapshot(collection(db, "planner-todos"), (snapshot) => {
        const todosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ToDoItem));
        setTodos(todosData);
    });
    
    const loadDrawing = async () => {
        const drawingDoc = await getDoc(doc(db, "planner-drawing", "main"));
        if (drawingDoc.exists() && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                if(ctx) ctx.drawImage(img, 0, 0);
            };
            img.src = drawingDoc.data().dataUrl;
        }
    };
    loadDrawing();

    return () => {
        notesUnsub();
        todosUnsub();
    };
  }, [])

  // Setup canvas dimensions and drawing events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !workspaceRef.current) return

    const resizeCanvas = () => {
        if(workspaceRef.current) {
            canvas.width = workspaceRef.current.clientWidth
            canvas.height = workspaceRef.current.clientHeight
             // Redraw saved content after resize
            const loadDrawing = async () => {
                const drawingDoc = await getDoc(doc(db, "planner-drawing", "main"));
                if (drawingDoc.exists()) {
                    const ctx = canvas.getContext("2d");
                    const img = new Image();
                    img.onload = () => {
                        if(ctx) ctx.drawImage(img, 0, 0);
                    };
                    img.src = drawingDoc.data().dataUrl;
                }
            };
            loadDrawing();
        }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const getCoords = (event: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (event instanceof MouseEvent) {
            return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
        } else {
            return { offsetX: event.touches[0].clientX - rect.left, offsetY: event.touches[0].clientY - rect.top };
        }
    };


    const startDrawing = (event: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = getCoords(event);
      setIsDrawing(true)
      ctx.beginPath()
      ctx.moveTo(offsetX, offsetY)
    }

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      const { offsetX, offsetY } = getCoords(event);
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      if (tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
      } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = brushColor;
      }
      ctx.lineTo(offsetX, offsetY)
      ctx.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false);
        saveDrawing();
    };

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseleave", stopDrawing)
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseleave", stopDrawing)
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    }
  }, [isDrawing, brushColor, brushSize, tool])

  const saveDrawing = async () => {
    if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        await setDoc(doc(db, "planner-drawing", "main"), { dataUrl });
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if(canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        saveDrawing();
    }
  };

  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const { sRGBHex } = await eyeDropper.open();
        setBrushColor(sRGBHex);
      } catch (e) {
        console.info("Eyedropper closed.");
      }
    } else {
      alert("Your browser does not support the Eyedropper API.");
    }
  };

  const addStickyNote = async (color: string) => {
    const newNote: Omit<StickyNote, "id"> = { text: "New Note", color: color, position: { x: 50, y: 50 } };
    await addDoc(collection(db, 'planner-notes'), newNote);
  }

  const handleNoteDragStop = async (e: any, data: any, noteId: string) => {
    const newPosition = { x: data.x, y: data.y };
    await setDoc(doc(db, "planner-notes", noteId), { position: newPosition }, { merge: true });
  }

  const updateStickyNoteText = async (id: string, text: string) => {
    await setDoc(doc(db, "planner-notes", id), { text }, { merge: true });
  }

  const deleteStickyNote = async (id: string) => {
    await deleteDoc(doc(db, "planner-notes", id));
  }
  
  const addTodo = async () => {
    if (newTodoText.trim() === "") return
    const newTodo: Omit<ToDoItem, "id"> = { text: newTodoText, checked: false, status: "Not Started", dueDate: newTodoDueDate || null };
    await addDoc(collection(db, 'planner-todos'), newTodo);
    setNewTodoText("")
    setNewTodoDueDate("")
  }

  const toggleTodo = async (id: string, checked: boolean) => {
    await setDoc(doc(db, "planner-todos", id), { checked }, { merge: true });
  }

  const updateTodoStatus = async (id: string, status: ToDoItem["status"]) => {
    await setDoc(doc(db, "planner-todos", id), { status }, { merge: true });
  }

  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, "planner-todos", id));
  }

  const sortedTodos = [...todos].sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
  
  const nodeRef = useRef(null)

  return (
    <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full max-h-[calc(100vh-10rem)] w-full rounded-lg border" autoSaveId="planner-layout">
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full flex-col p-2 md:p-4 gap-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>
                Your KAA Google Calendar, embedded for easy viewing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-w-1 aspect-h-1 md:aspect-none">
                <iframe
                  src={calendarUrl}
                  className="w-full h-[600px]"
                  style={{ border: 0 }}
                  frameBorder="0"
                  scrolling="no"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-1 md:gap-2 border-b bg-background p-2">
                <Button variant={tool === 'brush' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('brush')}><Brush className="h-4 w-4"/></Button>
                <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser className="h-4 w-4"/></Button>
                <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded-md border p-1"/>
                <Button variant="ghost" size="icon" onClick={handleEyedropper}><Pipette className="h-4 w-4"/></Button>
                <Slider value={[brushSize]} onValueChange={(val) => setBrushSize(val[0])} max={50} step={1} className="w-20 md:w-32"/>
                <Button variant="ghost" size="icon" onClick={clearDrawing} className="ml-auto"><Trash2 className="h-4 w-4"/></Button>
            </div>
          <div ref={workspaceRef} className="relative flex-grow bg-white overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0" />
            {stickyNotes.map((note) => (
               <Draggable
                key={note.id}
                handle=".handle"
                position={note.position}
                onStop={(e, data) => {
                  handleNoteDragStop(e, data, note.id);
                }}
                bounds="parent"
                nodeRef={nodeRef}
              >
                <div
                  ref={nodeRef}
                  className={`absolute w-48 rounded-md p-2 shadow-lg ${note.color}`}
                >
                  <div className="handle h-6 w-full cursor-move" />
                  <Textarea
                    defaultValue={note.text}
                    onBlur={(e) => updateStickyNoteText(note.id, e.target.value)}
                    className="h-24 w-full resize-none border-none bg-transparent focus-visible:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={() => deleteStickyNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Draggable>
            ))}
          </div>
          <div className="flex shrink-0 flex-col md:flex-row gap-4 border-t bg-background p-4">
            <Card className="w-full md:w-1/2">
                <CardHeader>
                    <CardTitle>Sticky Notes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {stickyNoteColors.map((color) => (
                        <Button key={color.name} className={color.class} onClick={() => addStickyNote(color.class)}>
                        Add {color.name}
                        </Button>
                    ))}
                </CardContent>
            </Card>
            <Card className="flex-grow">
              <CardHeader>
                <CardTitle>To-Do List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                    {sortedTodos.map((todo) => {
                        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date();
                        const statusColor = { "Not Started": "bg-red-200", "Working": "bg-yellow-200", "Completed": "bg-green-200" }[todo.status];
                        return (
                            <div key={todo.id} className="flex items-center gap-2 text-sm">
                                <Checkbox checked={todo.checked} onCheckedChange={(checked) => toggleTodo(todo.id, !!checked)}/>
                                <span className={`flex-grow ${todo.checked ? 'line-through' : ''}`}>{todo.text}</span>
                                {todo.dueDate && (<span className={`text-xs ${isOverdue ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{new Date(todo.dueDate).toLocaleDateString()}</span>)}
                                <Select value={todo.status} onValueChange={(value) => updateTodoStatus(todo.id, value as ToDoItem["status"])}>
                                    <SelectTrigger className={`w-28 h-8 text-xs ${statusColor}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Not Started">Not Started</SelectItem>
                                        <SelectItem value="Working">Working</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..."/>
                  <Input type="date" value={newTodoDueDate} onChange={(e) => setNewTodoDueDate(e.target.value)} className="w-full sm:w-auto"/>
                  <Button onClick={addTodo}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
