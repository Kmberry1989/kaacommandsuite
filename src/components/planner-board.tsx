"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Eraser } from "lucide-react";

const stickyNoteColors = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-blue-200",
  "bg-green-200",
];

type StickyNote = {
  id: number;
  text: string;
  color: string;
  date: Date;
};

type ToDoItem = {
  id: number;
  text: string;
  checked: boolean;
  status: "Not Started" | "In Development" | "Completed";
};

export function PlannerBoard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");

  const addStickyNote = (color: string) => {
    if (date) {
      const newNote: StickyNote = {
        id: Date.now(),
        text: "New Note",
        color,
        date,
      };
      setStickyNotes([...stickyNotes, newNote]);
    }
  };

  const updateStickyNoteText = (id: number, text: string) => {
    setStickyNotes(
      stickyNotes.map((note) => (note.id === id ? { ...note, text } : note))
    );
  };

  const deleteStickyNote = (id: number) => {
    setStickyNotes(stickyNotes.filter((note) => note.id !== id));
  };
  
  const addTodo = () => {
    if (newTodoText.trim() !== "") {
      const newTodo: ToDoItem = {
        id: Date.now(),
        text: newTodoText,
        checked: false,
        status: "Not Started",
      };
      setTodos([...todos, newTodo]);
      setNewTodoText("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      )
    );
  };
  
  const updateTodoStatus = (id: number, status: ToDoItem["status"]) => {
    setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, status } : todo))
    );
  };

  const clearBoard = () => {
    setStickyNotes([]);
    setTodos([]);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            <Button variant="ghost" onClick={clearBoard}>
                <Eraser className="mr-2 h-4 w-4" />
                Clear Board
            </Button>
          </CardHeader>
          <CardContent className="relative">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            {stickyNotes.map((note) => {
                if (date && note.date.toDateString() === date.toDateString()) {
                    return (
                        <div key={note.id} className={`absolute p-2 rounded-md shadow-md ${note.color}`} style={{top: '100px', left: '100px'}}>
                            <Textarea value={note.text} onChange={(e) => updateStickyNoteText(note.id, e.target.value)} className="bg-transparent border-none"/>
                            <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={() => deleteStickyNote(note.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    )
                }
                return null;
            })}
          </CardContent>
        </Card>
        <div className="flex gap-2 mt-4">
            {stickyNoteColors.map(color => (
                <div key={color} onClick={() => addStickyNote(color)} className={`w-12 h-12 rounded-md cursor-pointer ${color} shadow-md`}/>
            ))}
        </div>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>To-Do List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-4">
                        <Checkbox checked={todo.checked} onCheckedChange={() => toggleTodo(todo.id)}/>
                        <Input value={todo.text} className={`flex-grow ${todo.checked ? 'line-through' : ''}`} readOnly/>
                        <Select value={todo.status} onValueChange={(value) => updateTodoStatus(todo.id, value as ToDoItem["status"])}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Development">In Development</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-4">
                <Input value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} placeholder="New to-do..."/>
                <Button onClick={addTodo}><PlusCircle className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}