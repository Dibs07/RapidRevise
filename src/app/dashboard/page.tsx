"use client"

import { useEffect, useState } from "react"
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
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, Video, FileText, CheckCircle, AlertCircle, PlusCircle, Edit, Trash2, HelpCircle } from "lucide-react"

// Define types for our data structure
interface StudyItem {
  id: string;
  title: string;
  duration?: string;
  readTime?: string;
  type: string;
  completed?: boolean;
}

interface StudyTabs {
  videos: StudyItem[];
  articles: StudyItem[];
  questions: StudyItem[];
  completed: StudyItem[];
}

interface StudyPlan {
  id?: string;
  subject: string;
  createdAt: string;
  totalTime: number;
  difficulty: string;
  progress: number;
  tabs: StudyTabs;
  studySessions?: any[];
}

interface StudyItemProps {
  item: StudyItem;
  onEdit: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  onMarkComplete?: (id: string) => void;
}

interface TabContentProps {
  items: StudyItem[];
  type: string;
  icon: React.ReactNode;
  onAdd: (tabId: string) => void;
  onEdit: (item: StudyItem) => void;
  onDelete: (itemId: string) => void;
  onMarkComplete?: (itemId: string) => void;
}

interface NewItemForm {
  title: string;
  duration: string;
  type: string;
}

const StudyItemComponent = ({ item, onEdit, onDelete, onMarkComplete }: StudyItemProps) => {
  const getIcon = () => {
    switch (item.type) {
      case 'videos':
        return <Video className="h-4 w-4 mr-2 flex-shrink-0" />;
      case 'articles':
        return <FileText className="h-4 w-4 mr-2 flex-shrink-0" />;
      case 'questions':
        return <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 mr-2 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-white border rounded-md p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
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
          {onMarkComplete && item.type !== 'completed' && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMarkComplete(item.id)}>
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(item)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TabContent = ({ items, type, icon, onAdd, onEdit, onDelete, onMarkComplete }: TabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon}
          <h3 className="font-semibold ml-2">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">{items.length}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => onAdd(type)} className="h-8">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-2 min-h-[200px]">
        {items.length > 0 ? (
          items.map(item => (
            <StudyItemComponent 
              key={item.id} 
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkComplete={onMarkComplete}
            />
          ))
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <p>No items yet. Click "Add" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("videos");
  const [itemBeingEdited, setItemBeingEdited] = useState<StudyItem | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({
    title: '',
    duration: '10 minutes',
    type: 'videos'
  });
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    
    const savedPlan = localStorage.getItem("studyPlan");
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan) as StudyPlan;
        
        
        if (!plan.tabs) {
          plan.tabs = {
            videos: [],
            articles: [],
            questions: [], // New tab
            completed: []
          };
          
          
          Object.keys(plan.tabs).forEach(tabKey => {
            plan.tabs[tabKey as keyof StudyTabs] = plan.tabs[tabKey as keyof StudyTabs].map(item => ({
              ...item,
              type: tabKey
            }));
          });
          
            
        } else if (!plan.tabs) {
          
          plan.tabs = {
            videos: [],
            articles: [],
            questions: [],
            completed: []
          };
        }
        
        
        Object.keys(plan.tabs).forEach(tabKey => {
          plan.tabs[tabKey as keyof StudyTabs] = plan.tabs[tabKey as keyof StudyTabs].map(item => ({
            ...item,
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: item.type || tabKey
          }));
        });
        
        setStudyPlan(plan);
      } catch (error) {
        console.error("Error parsing study plan:", error);
      }
    } else {
      
      const defaultPlan: StudyPlan = {
        subject: "Test Subject",
        createdAt: new Date().toISOString(),
        totalTime: 120,
        difficulty: "medium",
        progress: 0,
        tabs: {
          videos: [
            { id: 'video-1', title: 'Introduction Video', duration: '10 minutes', type: 'videos' },
            { id: 'video-2', title: 'Key Concepts', duration: '15 minutes', type: 'videos' }
          ],
          articles: [
            { id: 'article-1', title: 'Getting Started', readTime: '5 minutes', type: 'articles' },
            { id: 'article-2', title: 'Best Practices', readTime: '8 minutes', type: 'articles' }
          ],
          questions: [
            { id: 'question-1', title: 'Practice Quiz', duration: '15 minutes', type: 'questions' }
          ],
          completed: [
            { id: 'completed-1', title: 'Basic Tutorial', readTime: '7 minutes', type: 'completed' }
          ]
        }
      };
      

    }
    setLoading(false);
  }, []);

  const calculateProgress = (plan: StudyPlan): number => {
    if (!plan || !plan.tabs) return 0;
    
    const totalItems = plan.tabs.videos.length + plan.tabs.articles.length + plan.tabs.questions.length + plan.tabs.completed.length;
    const completedItems = plan.tabs.completed.length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const handleAddItem = (tabId: string) => {
    setNewItem({
      title: '',
      duration: tabId === 'videos' ? '10 minutes' : tabId === 'questions' ? '15 minutes' : '5 minutes',
      type: tabId
    });
    setItemBeingEdited(null);
    setEditDialogOpen(true);
  };

  const handleEditItem = (item: StudyItem) => {
    setItemBeingEdited(item);
    setNewItem({
      title: item.title,
      duration: item.duration || item.readTime || '10 minutes',
      type: item.type
    });
    setEditDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!studyPlan || !studyPlan.tabs) return;
    
    const updatedPlan = { ...studyPlan };
    
 
    let tabContainingItem: string | null = null;
    for (const tabKey of Object.keys(updatedPlan.tabs)) {
      const itemIndex = updatedPlan.tabs[tabKey as keyof StudyTabs].findIndex(
        item => item.id === itemId
      );
      if (itemIndex >= 0) {
        tabContainingItem = tabKey;
        break;
      }
    }
    
    if (!tabContainingItem) return;
    
   
    updatedPlan.tabs[tabContainingItem as keyof StudyTabs] = updatedPlan.tabs[tabContainingItem as keyof StudyTabs].filter(
      item => item.id !== itemId
    );
    
    
    updatedPlan.progress = calculateProgress(updatedPlan);
    
    setStudyPlan(updatedPlan);
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));
  };

  const handleMarkComplete = (itemId: string) => {
    if (!studyPlan || !studyPlan.tabs) return;
    
    const updatedPlan = { ...studyPlan };
    
    
    let tabContainingItem: string | null = null;
    let itemToMove: StudyItem | null = null;
    
    for (const tabKey of Object.keys(updatedPlan.tabs)) {
      if (tabKey === 'completed') continue; 
      
      const itemIndex = updatedPlan.tabs[tabKey as keyof StudyTabs].findIndex(
        item => item.id === itemId
      );
      
      if (itemIndex >= 0) {
        tabContainingItem = tabKey;
        itemToMove = { ...updatedPlan.tabs[tabKey as keyof StudyTabs][itemIndex] };
        
       
        updatedPlan.tabs[tabKey as keyof StudyTabs] = updatedPlan.tabs[tabKey as keyof StudyTabs].filter(
          item => item.id !== itemId
        );
        break;
      }
    }
    
    if (!tabContainingItem || !itemToMove) return;
    
  
    itemToMove.type = 'completed';
    updatedPlan.tabs.completed.push(itemToMove);
    
   
    updatedPlan.progress = calculateProgress(updatedPlan);
    
    setStudyPlan(updatedPlan);
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan));
  };

  const handleSaveItem = () => {
    if (!studyPlan || !studyPlan.tabs || !newItem.title || !newItem.type) return;
    
    const updatedPlan = { ...studyPlan };
    
    if (itemBeingEdited) {
      
      const originalType = itemBeingEdited.type;

      const itemIndex = updatedPlan.tabs[originalType as keyof StudyTabs].findIndex(
        item => item.id === itemBeingEdited.id
      );
      
      if (itemIndex < 0) return;

      if (originalType !== newItem.type) {
        const [removedItem] = updatedPlan.tabs[originalType as keyof StudyTabs].splice(itemIndex, 1);

        const updatedItem = {
          ...removedItem,
          title: newItem.title,
          type: newItem.type
        };

        if (newItem.type === 'videos') {
          updatedItem.duration = newItem.duration;
          delete updatedItem.readTime;
        } else if (newItem.type === 'articles') {
          updatedItem.readTime = newItem.duration;
          delete updatedItem.duration;
        } else if (newItem.type === 'questions') {
          updatedItem.duration = newItem.duration;
          delete updatedItem.readTime;
        } else {
          if (removedItem.duration) {
            updatedItem.duration = newItem.duration;
          } else if (removedItem.readTime) {
            updatedItem.readTime = newItem.duration;
          }
        }
        

        updatedPlan.tabs[newItem.type as keyof StudyTabs].push(updatedItem);
      } else {

        const updatedItem = {
          ...updatedPlan.tabs[originalType as keyof StudyTabs][itemIndex],
          title: newItem.title
        };

        if (originalType === 'videos') {
          updatedItem.duration = newItem.duration;
        } else if (originalType === 'articles') {
          updatedItem.readTime = newItem.duration;
        } else if (originalType === 'questions') {
          updatedItem.duration = newItem.duration;
        } else {
          if (updatedItem.duration) {
            updatedItem.duration = newItem.duration;
          } else if (updatedItem.readTime) {
            updatedItem.readTime = newItem.duration;
          }
        }
        
        updatedPlan.tabs[originalType as keyof StudyTabs][itemIndex] = updatedItem;
      }
    } else {
      const newItemObject: StudyItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: newItem.title,
        type: newItem.type
      };
      
      if (newItem.type === 'videos') {
        newItemObject.duration = newItem.duration;
      } else if (newItem.type === 'articles') {
        newItemObject.readTime = newItem.duration;
      } else if (newItem.type === 'questions') {
        newItemObject.duration = newItem.duration;
      } else {
        newItemObject.readTime = newItem.duration;
      }
      
      updatedPlan.tabs[newItem.type as keyof StudyTabs].push(newItemObject);
    }

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

      {/* Tabbed Interface */}
      <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="videos" className="flex items-center">
            <Video className="h-4 w-4 mr-2" />
            <span>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span>Articles</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>Questions</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Completed</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos">
          <TabContent
            items={studyPlan.tabs.videos}
            type="videos"
            icon={<Video className="h-5 w-5 text-blue-500" />}
            onAdd={handleAddItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onMarkComplete={handleMarkComplete}
          />
        </TabsContent>
        
        <TabsContent value="articles">
          <TabContent
            items={studyPlan.tabs.articles}
            type="articles"
            icon={<FileText className="h-5 w-5 text-purple-500" />}
            onAdd={handleAddItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onMarkComplete={handleMarkComplete}
          />
        </TabsContent>
        
        <TabsContent value="questions">
          <TabContent
            items={studyPlan.tabs.questions}
            type="questions"
            icon={<HelpCircle className="h-5 w-5 text-amber-500" />}
            onAdd={handleAddItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onMarkComplete={handleMarkComplete}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <TabContent
            items={studyPlan.tabs.completed}
            type="completed"
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            onAdd={handleAddItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </TabsContent>
      </Tabs>

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
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="videos">Videos</option>
                <option value="articles">Articles</option>
                <option value="questions">Questions</option>
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