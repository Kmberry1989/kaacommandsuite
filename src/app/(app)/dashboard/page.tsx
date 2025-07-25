"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Eraser } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  format,
} from "date-fns";

interface Note {
  id: number;
  date: Date;
  color: string;
  text: string;
}

interface Task {
  id: number;
  text: string;
  status: number;
}

const statuses = ["Not Started", "In Development", "Completed"];
const colorClasses: Record<string, string> = {
  yellow: "bg-yellow-200",
  pink: "bg-pink-200",
  blue: "bg-blue-200",
  green: "bg-green-200",
  orange: "bg-orange-200",
};

export default function DashboardPage() {
  const [month, setMonth] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState<Date | undefined>(new Date());
  const [noteColor, setNoteColor] = useState("yellow");
  const [taskText, setTaskText] = useState("");

  const days: Date[] = [];
  for (
    let day = startOfWeek(startOfMonth(month));
    day <= endOfWeek(endOfMonth(month));
    day = addDays(day, 1)
  ) {
    days.push(day);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const addNote = () => {
    if (!noteDate || !noteText.trim()) return;
    setNotes([
      ...notes,
      { id: Date.now(), date: noteDate, color: noteColor, text: noteText },
    ]);
    setNoteText("");
  };

  const removeNote = (id: number) =>
    setNotes(notes.filter((n) => n.id !== id));

  const addTask = () => {
    if (!taskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: taskText, status: 0 }]);
    setTaskText("");
  };

  const updateTaskStatus = (id: number, status: number) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));

  const eraseAll = () => {
    setNotes([]);
    setTasks([]);
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Sticky Board"
        description="Organize notes and tasks on a calendar."
      >
        <Button variant="outline" size="icon" onClick={eraseAll}>
          <Eraser className="h-4 w-4" />
        </Button>
      </PageHeader>
      <div className="p-6 md:p-8 pt-0 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {Object.keys(colorClasses).map((c) => (
                <button
                  key={c}
                  className={`h-6 w-6 rounded border ${colorClasses[c]}`}
                  onClick={() => setNoteColor(c)}
                />
              ))}
              <Input
                type="date"
                value={noteDate ? format(noteDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setNoteDate(new Date(e.target.value))}
                className="h-8 text-sm px-1 w-32"
              />
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Note text"
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" onClick={addNote}>
                Add Note
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {weeks.map((week, i) => (
                <div key={i} className="contents">
                  {week.map((day, j) => (
                    <div key={j} className="relative h-32 border rounded p-1">
                      <div className="absolute top-1 right-1 text-[10px] text-muted-foreground">
                        {format(day, "d")}
                      </div>
                      {notes
                        .filter((n) => isSameDay(n.date, day))
                        .map((n) => (
                          <div
                            key={n.id}
                            className={`mt-4 rounded p-1 text-xs break-words ${colorClasses[n.color]}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="flex-1">{n.text}</span>
                              <button onClick={() => removeNote(n.id)}>
                                <Eraser className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>To-Do List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="New task"
                  className="h-8 text-sm flex-1"
                />
                <Button size="sm" onClick={addTask}>
                  Add
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b pb-1"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.status === 2}
                        onCheckedChange={(checked) =>
                          updateTaskStatus(task.id, checked ? 2 : task.status)
                        }
                      />
                      <span className={task.status === 2 ? "line-through" : ""}>
                        {task.text}
                      </span>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(task.id, Number(e.target.value))
                      }
                      className="text-xs border rounded"
                    >
                      {statuses.map((s, idx) => (
                        <option key={idx} value={idx}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
