'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChromePicker } from 'react-color';

interface Task {
  id: string;
  content: string;
  color: string;
}

interface Columns {
  [key: string]: {
    name: string;
    items: Task[];
  };
}

const initialColumns: Columns = {
  todo: {
    name: 'To Do',
    items: [],
  },
  inProgress: {
    name: 'In Progress',
    items: [],
  },
  done: {
    name: 'Done',
    items: [],
  },
};

export function PlannerBoard() {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [isClient, setIsClient] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskColor, setNewTaskColor] = useState('#ffffff');
  const [targetColumn, setTargetColumn] = useState('todo');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    }
  };

  const handleAddTask = () => {
    if (!newTaskContent.trim()) return;
    const newTask: Task = {
      id: `task-${new Date().getTime()}`,
      content: newTaskContent,
      color: newTaskColor,
    };
    const column = columns[targetColumn];
    const updatedItems = [...column.items, newTask];
    setColumns({
      ...columns,
      [targetColumn]: {
        ...column,
        items: updatedItems,
      },
    });
    setNewTaskContent('');
    setNewTaskColor('#ffffff');
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    const column = columns[columnId];
    const updatedItems = column.items.filter(task => task.id !== taskId);
    setColumns({
      ...columns,
      [columnId]: {
        ...column,
        items: updatedItems,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isClient ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided: DroppableProvided) => (
                <Card ref={provided.innerRef} {...provided.droppableProps}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{column.name}</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setTargetColumn(columnId)}>
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Task to {column.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input
                            placeholder="Task content"
                            value={newTaskContent}
                            onChange={(e) => setNewTaskContent(e.target.value)}
                          />
                           <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: newTaskColor }}></div>
                                Select Color
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                               <ChromePicker color={newTaskColor} onChange={(color) => setNewTaskColor(color.hex)} />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button onClick={handleAddTask}>Add Task</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 rounded-lg shadow-sm flex justify-between items-center"
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: item.color,
                              borderLeft: `5px solid ${item.color === '#ffffff' ? '#cccccc' : item.color}`,
                            }}
                          >
                            <span>{item.content}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(columnId, item.id)}>
                                <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      ) : (
        <p>Loading planner...</p>
      )}
    </div>
  );
}
