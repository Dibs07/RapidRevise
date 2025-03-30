"use client"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft, Clock, Video, FileText, CheckCircle, HelpCircle, PlusCircle,
    Edit, Trash2, ExternalLink, AlertCircle, X
} from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useParams, useSearchParams } from "next/navigation";

interface VideoItem {
    channel: string;
    duration: string;
    thumbnail: string;
    title: string;
    url: string;
    video_id: string;
    views: string;
}

interface TopicItem {
    importance: number;
    prep_time_minutes: number;
    topic_name: string;
    videos: VideoItem[];
    completed?: boolean;
    id?: string;
}

interface StudyItem {
    id: string;
    title: string;
    duration?: string;
    readTime?: string;
    type: string;
    completed: boolean;
    video_id?: string;
    thumbnail?: string;
    channel?: string;
    views?: string;
    url?: string;
    content?: string;
    question?: string;
    answer?: string;
}

interface StudyTabs {
    videos: TopicItem[];
    articles: StudyItem[];
    questions: StudyItem[];
    completed: (TopicItem | StudyItem)[];
}

interface StudyPlan {
    subject: string;
    createdAt: string;
    totalTime: number;
    difficulty: string;
    progress: number;
    tabs: StudyTabs;
    topics?: TopicItem[];
}

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Helper function to convert duration string to minutes
const parseDuration = (duration: string) => {
    if (!duration) return 0;

    const match = duration.match(/PT(\d+)M(\d+)S/);
    if (match) {
        return parseInt(match[1]) + Math.round(parseInt(match[2]) / 60);
    }

    // Try to parse from format like "10 minutes"
    const minutesMatch = duration.match(/(\d+)\s*minutes?/);
    if (minutesMatch) {
        return parseInt(minutesMatch[1]);
    }

    return 0;
};

const page = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = params.sessionId as string;
    const isNewSession = searchParams.get("new") === "true";
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("videos");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<TopicItem | StudyItem | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        type: "videos",
        url: "",
        channel: "",
        duration: "",
        content: "",
        question: "",
        answer: "",
        topic_name: "",
        importance: 5,
        prep_time_minutes: 30
    });

    useEffect(() => {
        const loadStudyPlan = async () => {
            setLoading(true);
            try {
                if (isNewSession) {
                    // If new=true, load from localStorage as in the original code
                    const storedData = localStorage.getItem("Data");
                    if (storedData) {
                        try {
                            const parsedData = JSON.parse(storedData);
                            if (parsedData && parsedData.study_plan) {
                                // ... existing localStorage logic ...
                                const studyPlanData = parsedData.study_plan;
                                const topics = parsedData.topics_with_videos || [];

                                // Process topics to ensure they have IDs
                                const processedTopics = topics.map((topic: any) => ({
                                    ...topic,
                                    id: generateId(),
                                    completed: false
                                }));

                                // Extract metadata
                                const metadata = parsedData.metadata || {
                                    subject: "Cloud Computing",
                                    department: "CSE",
                                    class_level: "4th Year"
                                };

                                // Calculate total study time from prep_time_minutes
                                const totalTime = processedTopics.reduce((total: number, topic: TopicItem) =>
                                    total + (topic.prep_time_minutes || 0), 0);

                                // Create study plan structure
                                const defaultPlan: StudyPlan = {
                                    subject: metadata.subject || "Cloud Computing",
                                    createdAt: new Date().toISOString(),
                                    totalTime: totalTime || 480,
                                    difficulty: "medium",
                                    progress: 0,
                                    tabs: {
                                        videos: processedTopics,
                                        articles: [],
                                        questions: [],
                                        completed: []
                                    }
                                };

                                setStudyPlan(defaultPlan);
                                // Save to API as well
                                await saveStudyPlanToAPI(sessionId, defaultPlan);
                                setLoading(false);
                                return;
                            }
                        } catch (e) {
                            console.error("Error parsing stored data:", e);
                        }
                    }
                } else {
                    // Fetch from API using sessionId
                    const response = await fetch(`/api/study-sessions/${sessionId}`);

                    if (response.ok) {
                        const data = await response.json();
                        setStudyPlan(data.studyPlan);
                        setLoading(false);
                        return;
                    } else if (response.status === 404) {
                        // If session not found, check localStorage
                        const savedPlan = localStorage.getItem("studyPlan");
                        if (savedPlan) {
                            const parsedPlan = JSON.parse(savedPlan);
                            setStudyPlan(parsedPlan);
                            // Save to API
                            await saveStudyPlanToAPI(sessionId, parsedPlan);
                            setLoading(false);
                            return;
                        }
                    } else {
                        throw new Error(`Failed to fetch study plan: ${response.statusText}`);
                    }
                }

                // If we get here, create a default plan
                const defaultPlan: StudyPlan = {
                    subject: "Cloud Computing",
                    createdAt: new Date().toISOString(),
                    totalTime: 480,
                    difficulty: "medium",
                    progress: 0,
                    tabs: {
                        videos: [],
                        articles: [],
                        questions: [],
                        completed: []
                    }
                };

                setStudyPlan(defaultPlan);
                // Save to API
                await saveStudyPlanToAPI(sessionId, defaultPlan);

            } catch (error) {
                console.error("Error loading study plan:", error);
                // Create default plan on error
                const defaultPlan: StudyPlan = {
                    subject: "Cloud Computing",
                    createdAt: new Date().toISOString(),
                    totalTime: 480,
                    difficulty: "medium",
                    progress: 0,
                    tabs: {
                        videos: [],
                        articles: [],
                        questions: [],
                        completed: []
                    }
                };

                setStudyPlan(defaultPlan);
                try {
                    await saveStudyPlanToAPI(sessionId, defaultPlan);
                } catch (saveError) {
                    console.error("Failed to save default plan:", saveError);
                }
            }
            setLoading(false);
        };

        loadStudyPlan();
    }, [sessionId, isNewSession]);

    const saveStudyPlanToAPI = async (id: string, plan: StudyPlan) => {
        try {
            const response = await fetch(`/api/study-sessions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studyPlan: plan }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save study plan: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error saving study plan:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (studyPlan) {
            localStorage.setItem("studyPlan", JSON.stringify(studyPlan));

            // Calculate progress by counting completed items across all tabs
            const allTopics = [...studyPlan.tabs.videos];
            const allItems = [
                ...allTopics,
                ...studyPlan.tabs.articles,
                ...studyPlan.tabs.questions
            ];

            const totalItems = allItems.length;
            const completedItems = allItems.filter(item => item.completed).length;
            const newProgress = totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0;

            if (newProgress !== studyPlan.progress) {
                setStudyPlan(prev => prev ? {
                    ...prev,
                    progress: newProgress
                } : null);
            }
        }
    }, [studyPlan, sessionId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleTypeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            type: value
        }));
    };

    const resetForm = () => {
        setFormData({
            id: "",
            title: "",
            type: "videos",
            url: "",
            channel: "",
            duration: "",
            content: "",
            question: "",
            answer: "",
            topic_name: "",
            importance: 5,
            prep_time_minutes: 30
        });
    };

    const openEditDialog = (item: TopicItem | StudyItem) => {
        setCurrentItem(item);

        if ('topic_name' in item) {
            // It's a topic item
            setFormData({
                id: item.id || "",
                title: item.topic_name || "",
                type: "videos",
                url: item.videos && item.videos.length > 0 ? item.videos[0].url : "",
                channel: item.videos && item.videos.length > 0 ? item.videos[0].channel : "",
                duration: item.videos && item.videos.length > 0 ? item.videos[0].duration : "",
                content: "",
                question: "",
                answer: "",
                topic_name: item.topic_name || "",
                importance: item.importance || 5,
                prep_time_minutes: item.prep_time_minutes || 30
            });
        } else {
            // It's a study item
            setFormData({
                id: item.id,
                title: item.title,
                type: item.type,
                url: item.url || "",
                channel: item.channel || "",
                duration: item.duration || "",
                content: item.content || "",
                question: item.question || "",
                answer: item.answer || "",
                topic_name: "",
                importance: 5,
                prep_time_minutes: 30
            });
        }

        setIsEditDialogOpen(true);
    };

    const handleAddItem = async () => {
        if (!studyPlan) return;

        const newId = generateId();

        if (formData.type === "videos") {
            // Add a new topic
            const newTopic: TopicItem = {
                id: newId,
                topic_name: formData.topic_name || formData.title,
                importance: formData.importance,
                prep_time_minutes: formData.prep_time_minutes,
                completed: false,
                videos: [{
                    channel: formData.channel,
                    duration: formData.duration,
                    thumbnail: `https://i.ytimg.com/vi/placeholder/hqdefault.jpg`,
                    title: formData.title,
                    url: formData.url,
                    video_id: "placeholder",
                    views: "0"
                }]
            };

            setStudyPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        videos: [...prev.tabs.videos, newTopic]
                    },
                    totalTime: prev.totalTime + formData.prep_time_minutes
                };
            });
        } else if (formData.type === "articles") {
            // Add a new article
            const newArticle: StudyItem = {
                id: newId,
                title: formData.title,
                type: "articles",
                completed: false,
                content: formData.content,
                readTime: `${Math.ceil(formData.content.length / 1000)} minutes`
            };

            setStudyPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        articles: [...prev.tabs.articles, newArticle]
                    }
                };
            });
        } else if (formData.type === "questions") {
            // Add a new question
            const newQuestion: StudyItem = {
                id: newId,
                title: formData.title,
                type: "questions",
                completed: false,
                question: formData.question,
                answer: formData.answer
            };

            setStudyPlan(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        questions: [...prev.tabs.questions, newQuestion]
                    }
                };
            });
        }

        resetForm();
        setIsAddDialogOpen(false);
        toast.success("Item added successfully");
        try {
            await saveStudyPlanToAPI(sessionId, studyPlan);
        } catch (error) {
            toast.error("Failed to save changes to server");
        }
    };

    const handleEditItem = () => {
        if (!studyPlan || !currentItem) return;

        if ('topic_name' in currentItem) {
            // Update a topic
            const updatedTopic: TopicItem = {
                ...currentItem,
                topic_name: formData.topic_name || formData.title,
                importance: formData.importance,
                prep_time_minutes: formData.prep_time_minutes,
                videos: currentItem.videos.map((video, idx) =>
                    idx === 0 ? {
                        ...video,
                        title: formData.title,
                        channel: formData.channel,
                        duration: formData.duration,
                        url: formData.url
                    } : video
                )
            };

            setStudyPlan(prev => {
                if (!prev) return prev;
                const updatedVideos = prev.tabs.videos.map(topic =>
                    topic.id === currentItem.id ? updatedTopic : topic
                );

                // Also update in completed tab if present
                const updatedCompleted = prev.tabs.completed.map(item =>
                    item.id === currentItem.id ? updatedTopic : item
                );

                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        videos: updatedVideos,
                        completed: updatedCompleted
                    }
                };
            });
        } else {
            // Update a study item
            const updatedItem: StudyItem = {
                ...currentItem,
                title: formData.title,
                content: formData.content,
                question: formData.question,
                answer: formData.answer,
                url: formData.url,
                channel: formData.channel,
                duration: formData.duration,
                readTime: formData.type === 'articles' ?
                    `${Math.ceil(formData.content.length / 1000)} minutes` :
                    currentItem.readTime
            };

            setStudyPlan(prev => {
                if (!prev) return prev;

                let updatedArticles = [...prev.tabs.articles];
                let updatedQuestions = [...prev.tabs.questions];

                if (currentItem.type === 'articles') {
                    updatedArticles = prev.tabs.articles.map(item =>
                        item.id === currentItem.id ? updatedItem : item
                    );
                } else if (currentItem.type === 'questions') {
                    updatedQuestions = prev.tabs.questions.map(item =>
                        item.id === currentItem.id ? updatedItem : item
                    );
                }

                // Also update in completed tab if present
                const updatedCompleted = prev.tabs.completed.map(item =>
                    item.id === currentItem.id ? updatedItem : item
                );

                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        articles: updatedArticles,
                        questions: updatedQuestions,
                        completed: updatedCompleted
                    }
                };
            });
        }

        resetForm();
        setIsEditDialogOpen(false);
        setCurrentItem(null);
        toast.success("Item updated successfully");
    };

    const handleDeleteItem = () => {
        if (!studyPlan || !currentItem) return;

        setStudyPlan(prev => {
            if (!prev) return prev;

            let updatedVideos = [...prev.tabs.videos];
            let updatedArticles = [...prev.tabs.articles];
            let updatedQuestions = [...prev.tabs.questions];
            let updatedCompleted = [...prev.tabs.completed];

            if ('topic_name' in currentItem) {
                updatedVideos = prev.tabs.videos.filter(topic => topic.id !== currentItem.id);
            } else if (currentItem.type === 'articles') {
                updatedArticles = prev.tabs.articles.filter(item => item.id !== currentItem.id);
            } else if (currentItem.type === 'questions') {
                updatedQuestions = prev.tabs.questions.filter(item => item.id !== currentItem.id);
            }

            // Also remove from completed tab
            updatedCompleted = prev.tabs.completed.filter(item => item.id !== currentItem.id);

            return {
                ...prev,
                tabs: {
                    videos: updatedVideos,
                    articles: updatedArticles,
                    questions: updatedQuestions,
                    completed: updatedCompleted
                }
            };
        });

        setIsConfirmDeleteOpen(false);
        setCurrentItem(null);
        toast.success("Item deleted successfully");
    };

    const handleToggleComplete = (item: TopicItem | StudyItem) => {
        if (!studyPlan) return;

        const newCompletedState = !item.completed;

        // Handle topic items
        if ('topic_name' in item) {
            setStudyPlan(prev => {
                if (!prev) return prev;

                // Update in videos tab
                const updatedVideos = prev.tabs.videos.map(topic =>
                    topic.id === item.id ? { ...topic, completed: newCompletedState } : topic
                );

                // Update completed tab
                let updatedCompleted = [...prev.tabs.completed];

                if (newCompletedState) {
                    // Add to completed if not already there
                    if (!updatedCompleted.some(i => i.id === item.id)) {
                        updatedCompleted.push({ ...item, completed: true });
                    }
                } else {
                    // Remove from completed
                    updatedCompleted = updatedCompleted.filter(i => i.id !== item.id);
                }

                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        videos: updatedVideos,
                        completed: updatedCompleted
                    }
                };
            });
        } else {
            // Handle study items
            setStudyPlan(prev => {
                if (!prev) return prev;

                let updatedArticles = [...prev.tabs.articles];
                let updatedQuestions = [...prev.tabs.questions];

                if (item.type === 'articles') {
                    updatedArticles = prev.tabs.articles.map(i =>
                        i.id === item.id ? { ...i, completed: newCompletedState } : i
                    );
                } else if (item.type === 'questions') {
                    updatedQuestions = prev.tabs.questions.map(i =>
                        i.id === item.id ? { ...i, completed: newCompletedState } : i
                    );
                }

                // Update completed tab
                let updatedCompleted = [...prev.tabs.completed];

                if (newCompletedState) {
                    // Add to completed if not already there
                    if (!updatedCompleted.some(i => i.id === item.id)) {
                        updatedCompleted.push({ ...item, completed: true });
                    }
                } else {
                    // Remove from completed
                    updatedCompleted = updatedCompleted.filter(i => i.id !== item.id);
                }

                return {
                    ...prev,
                    tabs: {
                        ...prev.tabs,
                        articles: updatedArticles,
                        questions: updatedQuestions,
                        completed: updatedCompleted
                    }
                };
            });
        }

        toast.success(`Item marked as ${newCompletedState ? 'completed' : 'incomplete'}`);
    };

    const openDeleteConfirm = (item: TopicItem | StudyItem) => {
        setCurrentItem(item);
        setIsConfirmDeleteOpen(true);
    };

    const formatDuration = (duration: string) => {
        // Handle PT format (e.g., PT7M5S)
        // const ptMatch = duration.match(/PT(\d+)M(\d+)S/);
        // if (ptMatch) {
        //   return `${ptMatch[1]}:${ptMatch[2].padStart(2, '0')}`;
        // }

        return duration;
    };

    const renderVideoItem = (item: TopicItem) => {
        return (
            <div key={item.id} className="bg-white border rounded-md p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                    {/* Topic header */}
                    <div>
                        <h4 className="font-medium text-sm">{item.topic_name}</h4>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Importance: {item.importance}/10</span>
                            {item.prep_time_minutes && (
                                <span className="ml-2">{item.prep_time_minutes} minutes</span>
                            )}
                        </div>
                    </div>

                    {/* Display all videos in the topic */}
                    <div className="grid grid-cols-1 gap-3">
                        {item.videos && item.videos.map((video, index) => (
                            <div key={`${video.video_id || index}`} className="flex items-start space-x-3 border-t pt-3">
                                <div className="flex-shrink-0">
                                    <img src={video.thumbnail || "https://i.ytimg.com/vi/placeholder/hqdefault.jpg"}
                                        alt={video.title}
                                        className="w-24 h-16 rounded object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h5 className="font-medium text-xs">{video.title}</h5>
                                            <div className="text-xs text-muted-foreground mt-1">{video.channel}</div>
                                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                                <span>{formatDuration(video.duration)}</span>
                                                {video.views && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        <span>{video.views} views</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs flex items-center text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Watch Video
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-1 pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleToggleComplete(item)}
                        >
                            {item.completed ? (
                                <X className="h-3 w-3" />
                            ) : (
                                <CheckCircle className="h-3 w-3" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEditDialog(item)}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openDeleteConfirm(item)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderArticleItem = (item: StudyItem) => {
        return (
            <div key={item.id} className="bg-white border rounded-md p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                    <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        {item.readTime && (
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{item.readTime}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-sm border-t pt-2">
                        {item.content && (
                            <div className="max-h-24 overflow-hidden relative">
                                <p>{item.content}</p>
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                            Read Full Article
                        </Button>
                    </div>

                    <div className="flex justify-end space-x-1 pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleToggleComplete(item)}
                        >
                            {item.completed ? (
                                <X className="h-3 w-3" />
                            ) : (
                                <CheckCircle className="h-3 w-3" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEditDialog(item)}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openDeleteConfirm(item)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuestionItem = (item: StudyItem) => {
        const [showAnswer, setShowAnswer] = useState(false);
        return (
            <div key={item.id} className="bg-white border rounded-md p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                    <div className="flex-grow">
                        <div className="flex items-start justify-between">
                            <div className="w-full">
                                <MarkdownPreview
                                    source={item.question}
                                />
                                {showAnswer && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded">
                                        <MarkdownPreview
                                            source={item.answer}
                                        />
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-6 text-xs"
                                    onClick={() => setShowAnswer(!showAnswer)}
                                >
                                    {showAnswer ? "Hide Answer" : "Show Answer"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-2 pt-2 border-t">
                    <div className="flex space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleToggleComplete(item)}
                        >
                            {item.completed ? (
                                <X className="h-3 w-3" />
                            ) : (
                                <CheckCircle className="h-3 w-3" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openEditDialog(item)}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openDeleteConfirm(item)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        );
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
                        <div className="text-muted-foreground mb-4">
                            <AlertCircle className="mx-auto h-12 w-12" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Study Plan Found</h2>
                        <p className="text-muted-foreground mb-6">You haven't created a study plan yet.</p>
                        <Button>Create Study Plan</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container w-full py-10 px-4 md:px-20 min-h-screen">
            <div className="flex items-center mb-8">
                <Button variant="outline" size="icon" className="mr-4">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
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
                            <div>
                                <h3 className="text-lg font-medium">Your Progress</h3>
                                <p className="text-muted-foreground text-sm">
                                    {studyPlan.progress}% Complete • Estimated {studyPlan.totalTime} minutes total
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span>Difficulty: {studyPlan.difficulty}</span>
                                </div>
                            </div>
                        </div>
                        <Progress value={studyPlan.progress} className="mt-2" />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="videos" className="space-y-4" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList>
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
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                resetForm();
                                setFormData(prev => ({ ...prev, type: activeTab }));
                            }}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Study Item</DialogTitle>
                                <DialogDescription>
                                    Add a new item to your study plan.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="videos" id="videos" />
                                        <Label htmlFor="videos">Video</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="articles" id="articles" />
                                        <Label htmlFor="articles">Article</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="questions" id="questions" />
                                        <Label htmlFor="questions">Question</Label>
                                    </div>
                                </RadioGroup>

                                {formData.type === "videos" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="topic_name">Topic Name</Label>
                                            <Input
                                                id="topic_name"
                                                name="topic_name"
                                                value={formData.topic_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="importance">Importance (1-10)</Label>
                                                <Input
                                                    id="importance"
                                                    name="importance"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={formData.importance}
                                                    onChange={handleNumberInputChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="prep_time_minutes">Prep Time (minutes)</Label>
                                                <Input
                                                    id="prep_time_minutes"
                                                    name="prep_time_minutes"
                                                    type="number"
                                                    min="1"
                                                    value={formData.prep_time_minutes}
                                                    onChange={handleNumberInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Video Title</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="url">Video URL</Label>
                                            <Input
                                                id="url"
                                                name="url"
                                                value={formData.url}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="channel">Channel</Label>
                                            <Input
                                                id="channel"
                                                name="channel"
                                                value={formData.channel}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (e.g., "15 minutes")</Label>
                                            <Input
                                                id="duration"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.type === "articles" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Article Title</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Content</Label>
                                            <Textarea
                                                id="content"
                                                name="content"
                                                rows={6}
                                                value={formData.content}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.type === "questions" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="question">Question</Label>
                                            <Textarea
                                                id="question"
                                                name="question"
                                                rows={3}
                                                value={formData.question}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="answer">Answer</Label>
                                            <Textarea
                                                id="answer"
                                                name="answer"
                                                rows={3}
                                                value={formData.answer}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddItem}>Add Item</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <TabsContent value="videos" className="space-y-4">
                    {studyPlan.tabs.videos.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No videos in your study plan yet.</p>
                            <Button variant="outline" className="mt-4" onClick={() => {
                                resetForm();
                                setFormData(prev => ({ ...prev, type: "videos" }));
                                setIsAddDialogOpen(true);
                            }}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add a Video Topic
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {studyPlan.tabs.videos.map(topic => renderVideoItem(topic))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="articles" className="space-y-4">
                    {studyPlan.tabs.articles.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No articles in your study plan yet.</p>
                            <Button variant="outline" className="mt-4" onClick={() => {
                                resetForm();
                                setFormData(prev => ({ ...prev, type: "articles" }));
                                setIsAddDialogOpen(true);
                            }}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add an Article
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {studyPlan.tabs.articles.map(article => renderArticleItem(article))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                    {studyPlan.tabs.questions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No questions in your study plan yet.</p>
                            <Button variant="outline" className="mt-4" onClick={() => {
                                resetForm();
                                setFormData(prev => ({ ...prev, type: "questions" }));
                                setIsAddDialogOpen(true);
                            }}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add a Question
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {studyPlan.tabs.questions.map(question => renderQuestionItem(question))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {studyPlan.tabs.completed.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">You haven't completed any items yet.</p>
                            <Button variant="outline" className="mt-4" onClick={() => setActiveTab("videos")}>
                                Go to Study Items
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {studyPlan.tabs.completed.map(item => {
                                if ('topic_name' in item) {
                                    return renderVideoItem(item as TopicItem);
                                } else if ((item as StudyItem).type === 'articles') {
                                    return renderArticleItem(item as StudyItem);
                                } else {
                                    return renderQuestionItem(item as StudyItem);
                                }
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Study Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {formData.type === "videos" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_topic_name">Topic Name</Label>
                                    <Input
                                        id="edit_topic_name"
                                        name="topic_name"
                                        value={formData.topic_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_importance">Importance (1-10)</Label>
                                        <Input
                                            id="edit_importance"
                                            name="importance"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.importance}
                                            onChange={handleNumberInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_prep_time_minutes">Prep Time (minutes)</Label>
                                        <Input
                                            id="edit_prep_time_minutes"
                                            name="prep_time_minutes"
                                            type="number"
                                            min="1"
                                            value={formData.prep_time_minutes}
                                            onChange={handleNumberInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_title">Video Title</Label>
                                    <Input
                                        id="edit_title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_url">Video URL</Label>
                                    <Input
                                        id="edit_url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_channel">Channel</Label>
                                    <Input
                                        id="edit_channel"
                                        name="channel"
                                        value={formData.channel}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_duration">Duration</Label>
                                    <Input
                                        id="edit_duration"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === "articles" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_title">Article Title</Label>
                                    <Input
                                        id="edit_title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_content">Content</Label>
                                    <Textarea
                                        id="edit_content"
                                        name="content"
                                        rows={6}
                                        value={formData.content}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === "questions" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_title">Title</Label>
                                    <Input
                                        id="edit_title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_question">Question</Label>
                                    <Textarea
                                        id="edit_question"
                                        name="question"
                                        rows={3}
                                        value={formData.question}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_answer">Answer</Label>
                                    <Textarea
                                        id="edit_answer"
                                        name="answer"
                                        rows={3}
                                        value={formData.answer}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditItem}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteItem}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default page;