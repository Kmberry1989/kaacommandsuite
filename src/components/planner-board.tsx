'use client';
import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChromePicker } from 'react-color';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import ScribbleCanvas from './scribble-canvas';
import { Checkbox } from '@/components/ui/checkbox';


// --- Interfaces for our data structures ---
interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

interface SharedLink {
  id: string;
  title: string;
  url: string;
}

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}


// --- Main Planner Component ---
export function PlannerBoard() {
  const [isClient, setIsClient] = useState(false);
  
  // State for all the different items you can create
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // State for the input fields
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newTodoText, setNewTodoText] = useState('');

  // Your KAA Google Calendar URL
  const googleCalendarUrl = "https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis";

  // --- Effects for Loading/Saving data from your browser's local storage ---
  useEffect(() => {
    setIsClient(true);
    const savedNotes = localStorage.getItem('plannerNotes');
    const savedLinks = localStorage.getItem('plannerLinks');
    const savedTodos = localStorage.getItem('plannerTodos');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem('plannerNotes', JSON.stringify(notes));
  }, [notes, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('plannerLinks', JSON.stringify(links));
  }, [links, isClient]);

  useEffect(() => {
    if (isClient) localStorage.setItem('plannerTodos', JSON.stringify(todos));
  }, [todos, isClient]);

  // --- Handler Functions for managing items ---

  // Sticky Notes
  const addNote = () => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`, x: 20, y: 20, width: 200, height: 200, text: 'New Note', color: '#FFF8B8',
    };
    setNotes([...notes, newNote]);
  };
  const updateNote = (id: string, updates: Partial<StickyNote>) => {
    setNotes(notes.map(note => (note.id === id ? { ...note, ...updates } : note)));
  };
  const deleteNote = (id: string) => setNotes(notes.filter(note => note.id !== id));

  // Shared Links
  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    const newLink: SharedLink = { id: `link-${Date.now()}`, title: newLinkTitle, url };
    setLinks([...links, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };
  const deleteLink = (id: string) => setLinks(links.filter(link => link.id !== id));

  // To-Do Items
  const addTodo = () => {
      if (!newTodoText.trim()) return;
      const newTodo: TodoItem = { id: `todo-${Date.now()}`, text: newTodoText, completed: false };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
  };
  const toggleTodo = (id: string) => {
      setTodos(todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo));
  };
  const deleteTodo = (id: string) => setTodos(todos.filter(todo => todo.id !== id));


  if (!isClient) {
    return <p className="text-center p-10">Loading Planner...</p>;
  }

  // --- Render the component ---
  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-[85vh] border rounded-lg">
      
      {/* Left Panel: Calendar */}
      <ResizablePanel defaultSize={30} minSize={20}>
        <Card className="h-full flex flex-col rounded-none border-0 border-r">
          <CardHeader>
            <CardTitle>Shared Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <iframe
              src={googleCalendarUrl}
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

      {/* Middle Panel: Resources & To-Do */}
      <ResizablePanel defaultSize={30} minSize={20}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={25}>
            <Card className="h-full flex flex-col rounded-none border-0 border-b">
              <CardHeader>
                <CardTitle>Shared Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow flex flex-col">
                 <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                  {links.map(link => (
                    <div key={link.id} className="flex items-center justify-between text-sm">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-grow">
                        <LinkIcon className="inline mr-2 h-4 w-4" />{link.title}
                      </a>
                      <Button variant="ghost" size="icon" className="w-6 h-6 flex-shrink-0" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-auto pt-2">
                  <Input placeholder="Title" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
                  <Input placeholder="URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} />
                  <Button onClick={addLink} size="icon"><Plus className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
             <Card className="h-full flex flex-col rounded-none border-0">
                <CardHeader>
                    <CardTitle>To-Do List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow flex flex-col">
                    <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                        {todos.map(todo => (
                            <div key={todo.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Checkbox id={todo.id} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                                    <label htmlFor={todo.id} className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.text}</label>
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6 flex-shrink-0" onClick={() => deleteTodo(todo.id)}>
                                    <Trash2 className="h-4 w-4 text-gray-400" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-auto pt-2">
                        <Input placeholder="New to-do..." value={newTodoText} onChange={e => setNewTodoText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTodo()} />
                        <Button onClick={addTodo}><Plus className="h-4 w-4"/></Button>
                    </div>
                </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      
      <ResizableHandle withHandle />

      {/* Right Panel: Drawing Board & Sticky Notes */}
      <ResizablePanel defaultSize={40} minSize={25}>
        <Card className="h-full flex flex-col rounded-none border-0 border-l">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Whiteboard</CardTitle>
            <Button onClick={addNote}>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </CardHeader>
          <CardContent className="flex-grow relative rounded-b-lg p-0">
             {/* The drawing canvas will be the background */}
             <div className="absolute inset-0">
                <ScribbleCanvas onScribble={() => {}} />
             </div>
             {/* Sticky notes go on top */}
             {notes.map(note => (
              <Rnd
                key={note.id}
                size={{ width: note.width, height: note.height }}
                position={{ x: note.x, y: note.y }}
                onDragStop={(e, d) => updateNote(note.id, { x: d.x, y: d.y })}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateNote(note.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position,
                  });
                }}
                bounds="parent"
                className="shadow-lg z-10"
              >
                <div className="w-full h-full flex flex-col rounded-md overflow-hidden border border-gray-300" style={{ backgroundColor: note.color }}>
                  <Textarea
                    value={note.text}
                    onChange={(e) => updateNote(note.id, { text: e.target.value })}
                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 p-2"
                  />
                  <div className="bg-gray-200/50 p-1 flex justify-end items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: note.color }}></div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ChromePicker color={note.color} onChange={(color) => updateNote(note.id, { color: color.hex })} />
                      </PopoverContent>
                    </Popover>
                     <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => deleteNote(note.id)}>
                        <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </Rnd>
            ))}
          </CardContent>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
