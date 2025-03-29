"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Users, 
  Calendar, 
  MessageSquare, 
  Share2, 
  Bell, 
  BellOff,
  Map,
  FileText,
  Clock
} from "lucide-react";

// This would be replaced with your actual data fetching hook
const useCommunityDetails = (id: string) => {
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/community/${id}`, {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error('Failed to fetch community');
        }
        const data = await response.json();
        setCommunity(data);
      } catch (err: any) {
        setError(err.message );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCommunity();
    }
  }, [id, baseUrl]);

  return { community, isLoading, error };
};

// Mock roadmaps for the community
const MOCK_ROADMAPS = [
  {
    id: '1',
    title: 'Project Development Timeline',
    content: 'This roadmap outlines our key development milestones for the next 6 months.',
    author: 'Admin',
    createdAt: '2023-01-15T12:00:00Z',
    upvotes: 24,
    downvotes: 2,
    comments: 5
  },
  {
    id: '2',
    title: 'Quarterly Feature Release Plan',
    content: 'Check out our planned feature releases for the upcoming quarter.',
    author: 'Moderator',
    createdAt: '2023-01-16T15:30:00Z',
    upvotes: 18,
    downvotes: 0,
    comments: 3
  },
  {
    id: '3',
    title: 'Long-term Strategic Vision',
    content: 'Our 2-year vision for community growth and project development.',
    author: 'CommunityManager',
    createdAt: '2023-01-20T09:45:00Z',
    upvotes: 12,
    downvotes: 1,
    comments: 8
  }
];

function page() {
  const params = useParams();
  const router = useRouter();
  const { community, isLoading, error } = useCommunityDetails(params.id as string);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmaps");

  const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500'
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) {
      return formatDate(dateString);
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-40 w-full mb-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Community</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Return to Communities</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use mock data for demonstration if no actual data is available
  const communityData = community || {
    id: params.id,
    name: 'Example Community',
    description: 'This is an example community description.',
    createdAt: '2023-01-10T08:00:00Z',
    upvotes: 45,
    downvotes: 3,
    user: {
      id: '123',
      name: 'Creator123'
    },
    memberCount: 189
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Communities
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Community Info */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <Avatar className={`h-16 w-16 ${getAvatarColor(communityData.name)}`}>
                    <AvatarFallback className="text-black font-bold text-xl">
                      {communityData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <CardTitle className="text-2xl">{communityData.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Users size={14} />
                      <span>{communityData.memberCount} members</span>
                      <span className="mx-1">•</span>
                      <Calendar size={14} />
                      <span>Created {formatDate(communityData.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant={isSubscribed ? "outline" : "default"}
                  className="ml-auto"
                  onClick={() => setIsSubscribed(!isSubscribed)}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff className="mr-2 h-4 w-4" /> Unsubscribe
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" /> Subscribe
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{communityData.description}</p>
              
              <div className="flex flex-wrap items-center mt-6 gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp size={18} className="text-blue-500" />
                  <span>{communityData.upvotes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown size={18} className="text-red-500" />
                  <span>{communityData.downvotes || 0}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-1 text-gray-500">
                  <span>Created by</span>
                  <span className="font-medium">{communityData.user?.name || "Anonymous"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" /> Contact Admin
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="roadmaps" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roadmaps">
                <Map className="mr-2 h-4 w-4" />Roadmaps
              </TabsTrigger>
              <TabsTrigger value="resources">
                <FileText className="mr-2 h-4 w-4" />Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmaps" className="mt-4">
              {MOCK_ROADMAPS.length > 0 ? (
                <div className="space-y-4">
                  {MOCK_ROADMAPS.map(roadmap => (
                    <Card key={roadmap.id} className="hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg">{roadmap.title}</h3>
                        <p className="text-gray-700 text-sm mt-2">{roadmap.content}</p>
                        <div className="flex items-center justify-between mt-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={14} className="text-blue-500" />
                              <span>{roadmap.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown size={14} className="text-red-500" />
                              <span>{roadmap.downvotes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              <span>{roadmap.comments} comments</span>
                            </div>
                          </div>
                          <div className="text-gray-500">
                            by <span className="font-medium">{roadmap.author}</span> • {formatRelativeTime(roadmap.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No roadmaps in this community yet.</p>
                    <Button className="mt-4">Create First Roadmap</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Resources Coming Soon</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      We're currently working on collecting and organizing valuable resources for this community. 
                      Check back soon for documents, links, and other helpful materials.
                    </p>
                    <Badge variant="outline" className="px-4 py-2">
                      <Clock className="mr-2 h-4 w-4" /> Coming Soon
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">About Community</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Community Rules</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      <span>Be respectful to other members</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      <span>No spam or self-promotion</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      <span>Stay on topic with your posts</span>
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm">Administrators</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">AD</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm">AdminUser</span>
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Admin
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">MO</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-sm">ModeratorUser</span>
                      <Badge variant="default" className="ml-2 text-xs">
                        Moderator
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <Avatar className={`h-8 w-8 ${getAvatarColor(`Related ${i}`)}`}>
                      <AvatarFallback className="text-xs">
                        {`R${i}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium text-sm">Related Community {i}</p>
                      <p className="text-xs text-gray-500">{100 * i} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default page;