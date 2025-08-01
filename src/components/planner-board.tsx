'use client';
import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChromePicker } from 'react-color';
import { Plus, Brush } from 'lucide-react';
import ScribbleCanvas from './scribble-canvas'; // Re-using the scribble canvas for the drawing board

interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export function PlannerBoard() {
  const [isClient, setIsClient] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addNote = () => {
    const newNote: StickyNote = {
      id: `note-${new Date().getTime()}`,
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      text: 'New Note',
      color: '#ffef96', // A classic sticky note yellow
    };
    setNotes([...notes, newNote]);
  };

  const updateNoteText = (id: string, newText: string) => {
    setNotes(notes.map(note => (note.id === id ? { ...note, text: newText } : note)));
  };

  const updateNoteColor = (id: string, newColor: string) => {
    setNotes(notes.map(note => (note.id === id ? { ...note, color: newColor } : note)));
  };

  if (!isClient) {
    return <p>Loading planner...</p>;
  }

  return (
    <div className="relative w-full h-[80vh] border rounded-lg overflow-hidden flex">
      {/* Main Planner Area */}
      <div className="flex-grow h-full relative bg-gray-50">
        {notes.map(note => (
          <Rnd
            key={note.id}
            size={{ width: note.width, height: note.height }}
            position={{ x: note.x, y: note.y }}
            onDragStop={(e, d) => {
              setNotes(notes.map(n => (n.id === note.id ? { ...n, x: d.x, y: d.y } : n)));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setNotes(notes.map(n => (
                n.id === note.id
                  ? { ...n, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...position }
                  : n
              )));
            }}
            className="shadow-lg"
          >
            <div className="w-full h-full flex flex-col rounded-md overflow-hidden" style={{ backgroundColor: note.color }}>
              <div className="p-2 flex-grow">
                <Textarea
                  value={note.text}
                  onChange={(e) => updateNoteText(note.id, e.target.value)}
                  className="w-full h-full bg-transparent border-none resize-none focus:ring-0"
                />
              </div>
               <div className="bg-gray-200 p-1 flex justify-end">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: note.color }}></div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <ChromePicker color={note.color} onChange={(color) => updateNoteColor(note.id, color.hex)} />
                    </PopoverContent>
                  </Popover>
              </div>
            </div>
          </Rnd>
        ))}
         {showDrawingBoard && (
            <div className="absolute inset-0 bg-white z-10">
                <ScribbleCanvas onScribble={() => {}} />
            </div>
        )}
      </div>

      {/* Sidebar Controls */}
      <div className="w-64 border-l p-4 space-y-4 flex-shrink-0 bg-white">
        <h3 className="font-semibold text-lg">Planner Tools</h3>
        <Button onClick={addNote} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Sticky Note
        </Button>
         <Button onClick={() => setShowDrawingBoard(!showDrawingBoard)} className="w-full" variant="outline">
          <Brush className="mr-2 h-4 w-4" /> {showDrawingBoard ? 'Hide' : 'Show'} Drawing Board
        </Button>
        <div className="pt-4">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
            />
        </div>
      </div>
    </div>
  );
}

