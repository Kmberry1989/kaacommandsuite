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

export function PlannerBoard() {
  const [isClient, setIsClient] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Your Google Calendar embed URL
  const googleCalendarUrl = "https://calendar.google.com/calendar/embed?src=media%40kaaonline.org&ctz=America%2FIndiana%2FIndianapolis";

  useEffect(() => {
    setIsClient(true);
    // Load saved data from localStorage if it exists
    const savedNotes = localStorage.getItem('plannerNotes');
    const savedLinks = localStorage.getItem('plannerLinks');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  // Save notes and links to localStorage whenever they change
  useEffect(() => {
    if(isClient) {
        localStorage.setItem('plannerNotes', JSON.stringify(notes));
    }
  }, [notes, isClient]);

  useEffect(() => {
    if(isClient) {
        localStorage.setItem('plannerLinks', JSON.stringify(links));
    }
  }, [links, isClient]);


  const addNote = () => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      x: 20,
      y: 20,
      width: 250,
      height: 250,
      text: 'New Note',
      color: '#ffef96',
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<StickyNote>) => {
    setNotes(notes.map(note => (note.id === id ? { ...note, ...updates } : note)));
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const newLink: SharedLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl,
    };
    setLinks([...links, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  if (!isClient) {
    return <p className="text-center p-10">Loading Planner...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh]">
      {/* Left Column: Whiteboard and Sticky Notes */}
      <div className="lg:col-span-2 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Collaborative Whiteboard</CardTitle>
            <Button onClick={addNote}>
              <Plus className="mr-2 h-4 w-4" /> Add Sticky Note
            </Button>
          </CardHeader>
          <CardContent className="flex-grow relative bg-gray-100 rounded-b-lg">
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
                className="shadow-lg"
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
      </div>

      {/* Right Column: Calendar and Shared Resources */}
      <div className="lg:col-span-1 h-full flex flex-col gap-6">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>Shared Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-0 rounded-b-lg overflow-hidden">
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
        <Card>
          <CardHeader>
            <CardTitle>Shared Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {links.map(link => (
                <div key={link.id} className="flex items-center justify-between text-sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    <LinkIcon className="inline mr-2 h-4 w-4" />{link.title}
                  </a>
                   <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Title" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} />
              <Input placeholder="URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} />
              <Button onClick={addLink} size="icon"><Plus className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
