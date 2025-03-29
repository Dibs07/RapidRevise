"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { ArrowLeft, Clock, Video, FileText, CheckCircle, AlertCircle, PlusCircle, Edit, Trash2 } from "lucide-react"

// Define types for our data structure
interface StudyItem {
  id: string;
  title: string;
  duration?: string;
  readTime?: string;
  sourceColumn?: string;
  sessionId?: string;
  completed?: boolean;
}

interface KanbanColumns {
  videos: StudyItem[];
  articles: StudyItem[];
  completed: StudyItem[];
}

interface StudyPlan {
  id?: string;
  subject: string;
  createdAt: string;
  totalTime: number;
  difficulty: string;
  progress: number;
  kanban: KanbanColumns;
  studySessions?: any[];
}

interface ColumnProps {
  id: string;
  title: string;
  items: StudyItem[];
  icon: React.ReactNode;
  onAddItem: (columnId: string) => void;
  onEditItem: (item: StudyItem) => void;
  onDeleteItem: (itemId: string) => void;
  onDragStart: (itemId: string, event: React.MouseEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

interface ItemProps {
  id: string;
  item: StudyItem;
  column: string;
  onEdit: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (itemId: string, event: React.MouseEvent) => void;
  isDragging: boolean;
}

interface NewItemForm {
  title: string;
  duration: string;
  target: string;
}

// Item component that can be dragged
const DraggableItem = ({ id, item, column, onEdit, onDelete, onDragStart, isDragging }: ItemProps) => {
  const getIcon = () => {
    switch (column) {
      case 'videos':
        return <Video className="h-4 w-4 mr-2 flex-shrink-0" />;
      case 'articles':
        return <FileText className="h-4 w-4 mr-2 flex-shrink-0" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 mr-2 flex-shrink-0" />;
    }
  };

  return (
    <div
      id={id}
      draggable="true"
      onMouseDown={(e) => onDragStart(id, e)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`bg-white border rounded-md p-3 mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          {getIcon()}
          <div>
            <h4 className="font-medium text-sm">{item.title}</h4>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{item.duration || item.readTime}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete(id); }}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Column component for categorizing items
const Column = ({ id, title, items, icon, onAddItem, onEditItem, onDeleteItem, onDragStart, onDragOver, onDrop }: ColumnProps) => {
  return (
    <div 
      className="bg-muted/50 rounded-lg p-4 w-full"
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e);
      }}
      data-column-id={id}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon}
          <h3 className="font-semibold">{title}</h3>
          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">{items.length}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onAddItem(id)} className="h-8">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2 min-h-[200px]" id={id}>
        {items.map(item => (
          <DraggableItem 
            key={item.id} 
            id={item.id} 
            item={item} 
            column={id}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onDragStart={onDragStart}
            isDragging={false}
          />
        ))}
      </div>
    </div>
  );
};

// Main component
export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [draggedItem, setDraggedItem] = useState<{ id: string, element: HTMLElement | null }>({ id: '', element: null });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPosition, setDragPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [itemBeingEdited, setItemBeingEdited] = useState<StudyItem | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({
    title: '',
    duration: '10 minutes',
    target: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const ghostElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // In a real app, we would fetch this from an API
    const savedPlan = localStorage.getItem("studyPlan");
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan) as StudyPlan;
        
        // Convert the study sessions to kanban format if needed
        if (!plan.kanban) {
          const videos: StudyItem[] = [];
          const articles: StudyItem[] = [];
          const completed: StudyItem[] = [];
          
          plan.studySessions?.forEach(session => {
            session.resources.videos.forEach((video: StudyItem) => {
              if (video.completed) {
                completed.push({
                  ...video,
                  sourceColumn: 'videos',
                  sessionId: session.id
                });
              } else {
                videos.push({
                  ...video,
                  sessionId: session.id
                });
              }
            });
            
            session.resources.articles.forEach((article: StudyItem) => {
              if (article.completed) {
                completed.push({
                  ...article,
                  sourceColumn: 'articles',
                  sessionId: session.id
                });
              } else {
                articles.push({
                  ...article,
                  sessionId: session.id
                });
              }
            });
          });
          
          plan.kanban = {
            videos,
            articles,
            completed
          };
        }
        
        // Ensure each item has a proper ID
        ['videos', 'articles', 'completed'].forEach((column) => {
          plan.kanban[column as keyof KanbanColumns] = plan.kanban[column as keyof KanbanColumns].map(item => ({
            ...item,
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          }));
        });
        
        setStudyPlan(plan);
      } catch (error) {
        console.error("Error parsing study plan:", error);
      }
    } else {
      // Create a default empty plan for testing
      const defaultPlan: StudyPlan = {
        subject: "Test Subject",
        createdAt: new Date().toISOString(),
        totalTime: 120,
        difficulty: "medium",
        progress: 0,
        kanban: {
          videos: [
            { id: 'video-1', title: 'Introduction Video', duration: '10 minutes' },
            { id: 'video-2', title: 'Key Concepts', duration: '15 minutes' }
          ],
          articles: [
            { id: 'article-1', title: 'Getting Started', readTime: '5 minutes' },
            { id: 'article-2', title: 'Best Practices', readTime: '8 minutes' }
          ],
          completed: [
            { id: 'completed-1', title: 'Basic Tutorial', readTime: '7 minutes', sourceColumn: 'articles' }
          ]
        }
      };
      
      // Uncomment to set a default plan for testing
      // setStudyPlan(defaultPlan);
    }
    setLoading(false);
  }, []);

  // Create ghost element for drag representation
  useEffect(() => {
    const ghostDiv = document.createElement('div');
    ghostDiv.style.position = 'fixed';
    ghostDiv.style.pointerEvents = 'none';
    ghostDiv.style.zIndex = '1000';
    ghostDiv.style.opacity = '0.8';
    ghostDiv.style.display = 'none';
    ghostDiv.className = 'bg-white border rounded-md p-3 shadow-md w-64';
    document.body.appendChild(ghostDiv);
    ghostElementRef.current = ghostDiv;

    return () => {
      if (ghostElementRef.current) {
        document.body.removeChild(ghostElementRef.current);
      }
    };
  }, []);

  // Handle mouse move for drag effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !ghostElementRef.current) return;
      
      // Update ghost element position
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      
      setDragPosition({ x, y });
      
      ghostElementRef.current.style.left = `${x}px`;
      ghostElementRef.current.style.top = `${y}px`;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      // End drag operation
      setIsDragging(false);
      
      if (ghostElementRef.current) {
        ghostElementRef.current.style.display = 'none';
      }
      
      // Get element under the cursor position
      const elementsUnderCursor = document.elementsFromPoint(dragPosition.x, dragPosition.y);
      
      // Find the column element
      const columnElement = elementsUnderCursor.find(el => 
        el.hasAttribute('data-column-id')
      );
      
      if (columnElement) {
        const columnId = columnElement.getAttribute('data-column-id');
        if (columnId) {
          // Check if draggedItem exists in any of the columns
          const container = findContainer(draggedItem.id);
          
          if (container && container !== columnId) {
            moveItem(draggedItem.id, container, columnId);
          }
        }
      }
      
      setDraggedItem({ id: '', element: null });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, dragPosition]);

  const calculateProgress = (plan: StudyPlan): number => {
    if (!plan || !plan.kanban) return 0;
    
    const totalItems = plan.kanban.videos.length + plan.kanban.articles.length + plan.kanban.completed.length;
    const completedItems = plan.kanban.completed.length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const handleDragStart = (itemId: string, event: React.MouseEvent) => {
    if (!studyPlan || !studyPlan.kanban) return;
    
    // Get source element and its rect
    const element = document.getElementById(itemId);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    
    // Calculate offset
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPosition({ x: event.clientX - offsetX, y: event.clientY - offsetY });
    setDraggedItem({ id: itemId, element });
    setIsDragging(true);
    
    // Clone the element to use as ghost element
    if (ghostElementRef.current) {
      const container = findContainer(itemId);
      if (!container) return;
      
      const item = studyPlan.kanban[container as keyof KanbanColumns].find(
        item => item.id === itemId
      );
      
      if (!item) return;
      
      // Set content for ghost element
      ghostElementRef.current.innerHTML = `
        <div class="flex items-start">
          <div class="h-4 w-4 mr-2 flex-shrink-0">
            ${container === 'videos' ? 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' : 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>'
            }
          </div>
          <div>
            <h4 class="font-medium text-sm">${item.title}</h4>
            <div class="flex items-center mt-1 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${item.duration || item.readTime}</span>
            </div>
          </div>
        </div>
      `;
      
      ghostElementRef.current.style.left = `${dragPosition.x}px`;
      ghostElementRef.current.style.top = `${dragPosition.y}px`;
      ghostElementRef.current.style.display = 'block';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    const itemId = event.dataTransfer.getData('text/plain');
    const columnId = (event.currentTarget as HTMLElement).getAttribute('data-column-id');
    
    if (!itemId || !columnId) return;
    
    const container = findContainer(itemId);
    if (container && container !== columnId) {
     // moveItem(itemId, container, columnId);
    }
  };

  const findContainer = (id: string): string | null => {
    if (!studyPlan || !studyPlan.kanban) return null;
    
    if (studyPlan.kanban.videos.find(item => item.id === id)) return 'videos';
    if (studyPlan.kanban.articles.find(item => item.id === id)) return 'articles';
    if (studyPlan.kanban.completed.find(item => item.id === id)) return 'completed';
    
    return null;
  };

  const moveItem = (id: string, sourceColumn: string, destinationColumn: string) => {
    if (!studyPlan || !studyPlan.kanban) return;
    
    // Skip if source and destination are the same
    if (sourceColumn === destinationColumn) return;
    
    const updatedPlan = { ...studyPlan };
    const sourceItems = [...updatedPlan.kanban[sourceColumn as keyof KanbanColumns]];
    const destinationItems = [...updatedPlan.kanban[destinationColumn as keyof KanbanColumns]];
    
    const itemIndex = sourceItems.findIndex(item => item.id === id);
    if (itemIndex < 0) return;
    
    // Get the item and remove it from the source array
    const [item] = sourceItems.splice(itemIndex, 1);
    
    // Add sourceColumn information if moving to completed
    if (destinationColumn === 'completed' && sourceColumn !== 'completed') {
      item.sourceColumn = sourceColumn;
    }
    
    // Add the item to the destination array
    destinationItems.push(item);
    
    // Update the plan
    updatedPlan.kanban[sourceColumn as keyof KanbanColumns] = sourceItems;
    updatedPlan.kanban[destinationColumn as keyof KanbanColumns] = destinationItems;
    
    // Calculate new progress
    updatedPlan.progress = calculateProgress(updatedPlan);
    
    setStudyPlan(updatedPlan);
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));
  };

  const handleAddItem = (columnId: string) => {
    setNewItem({
      title: '',
      duration: columnId === 'videos' ? '10 minutes' : '5 minutes',
      target: columnId
    });
    setItemBeingEdited(null);
    setEditDialogOpen(true);
  };

  const handleEditItem = (item: StudyItem) => {
    setItemBeingEdited(item);
    setNewItem({
      title: item.title,
      duration: item.duration || item.readTime || '10 minutes',
      target: findContainer(item.id) || ''
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!studyPlan || !studyPlan.kanban) return;
    
    const container = findContainer(itemId);
    if (!container) return;
    
    const updatedPlan = { ...studyPlan };
    updatedPlan.kanban[container as keyof KanbanColumns] = updatedPlan.kanban[container as keyof KanbanColumns].filter(
      item => item.id !== itemId
    );
    
    // Calculate new progress
    updatedPlan.progress = calculateProgress(updatedPlan);
    
    setStudyPlan(updatedPlan);
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));
  };

  const handleSaveItem = () => {
    if (!studyPlan || !studyPlan.kanban || !newItem.title || !newItem.target) return;
    
    const updatedPlan = { ...studyPlan };
    
    if (itemBeingEdited) {
      // Editing existing item
      const container = findContainer(itemBeingEdited.id);
      if (!container) return;
      
      const itemIndex = updatedPlan.kanban[container as keyof KanbanColumns].findIndex(
        item => item.id === itemBeingEdited.id
      );
      if (itemIndex < 0) return;
      
      // Update the item
      const updatedItem = {
        ...updatedPlan.kanban[container as keyof KanbanColumns][itemIndex],
        title: newItem.title
      };
      
      // Update duration or readTime based on the type
      if (container === 'videos' || itemBeingEdited.sourceColumn === 'videos') {
        updatedItem.duration = newItem.duration;
        delete updatedItem.readTime;  // Remove readTime if converting from article to video
      } else {
        updatedItem.readTime = newItem.duration;
        delete updatedItem.duration;  // Remove duration if converting from video to article
      }
      
      updatedPlan.kanban[container as keyof KanbanColumns][itemIndex] = updatedItem;
      
      // Move the item if the target changed
      if (container !== newItem.target) {
        moveItem(itemBeingEdited.id, container, newItem.target);
      }
    } else {
      // Creating new item
      const newItemObject: StudyItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: newItem.title,
      };
      
      // Add the appropriate time property based on the column
      if (newItem.target === 'videos') {
        newItemObject.duration = newItem.duration;
      } else if (newItem.target === 'articles') {
        newItemObject.readTime = newItem.duration;
      } else if (newItem.target === 'completed') {
        // For completed items, we need to guess the source type
        newItemObject.sourceColumn = 'articles'; // Default to articles
        newItemObject.readTime = newItem.duration;
      }
      
      updatedPlan.kanban[newItem.target as keyof KanbanColumns].push(newItemObject);
    }
    
    // Calculate new progress
    updatedPlan.progress = calculateProgress(updatedPlan);
    
    setStudyPlan(updatedPlan);
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));
    setEditDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading your study plan...</p>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="container w-full py-4 px-4 min-h-screen">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold">Study Dashboard</h1>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Study Plan Found</h2>
            <p className="text-muted-foreground mb-6">You haven't created a study plan yet.</p>
            <Link href="/create">
              <Button>Create Study Plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container w-full py-10 px-4 md:px-20 min-h-screen">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Study Dashboard</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{studyPlan.subject} Study Plan</CardTitle>
          <CardDescription>Created on {new Date(studyPlan.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Total time: {Math.floor(studyPlan.totalTime / 60)} hours {studyPlan.totalTime % 60} minutes
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Difficulty: {studyPlan.difficulty.charAt(0).toUpperCase() + studyPlan.difficulty.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{studyPlan.progress}%</span>
              </div>
              <Progress value={studyPlan.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Column
          id="videos"
          title="Videos"
          items={studyPlan.kanban?.videos || []}
          icon={<Video className="h-5 w-5 mr-2 text-blue-500" />}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        
        <Column
          id="articles"
          title="Articles"
          items={studyPlan.kanban?.articles || []}
          icon={<FileText className="h-5 w-5 mr-2 text-purple-500" />}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        
        <Column
          id="completed"
          title="Completed"
          items={studyPlan.kanban?.completed || []}
          icon={<CheckCircle className="h-5 w-5 mr-2 text-green-500" />}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemBeingEdited ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
            <DialogDescription>
              {itemBeingEdited 
                ? 'Update details for this study item.'
                : 'Enter details for the new study item.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="Enter item title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration / Read Time
              </label>
              <Input
                id="duration"
                value={newItem.duration}
                onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                placeholder="e.g. 10 minutes"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                value={newItem.target}
                onChange={(e) => setNewItem({...newItem, target: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="videos">Videos</option>
                <option value="articles">Articles</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={!newItem.title}>
              {itemBeingEdited ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}