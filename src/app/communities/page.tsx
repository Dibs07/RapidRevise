"use client";
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  User,
  Link,
} from "lucide-react";
import { useGetAllCommunity } from "@/hooks/community/useGetAllCommunity";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/context";
import { toast } from "sonner";

function Page() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
  });
  const router = useRouter();
  const {
    communities,
    isLoading: isLoadingCommunities,
    error,
    fetchCommunities,
  } = useGetAllCommunity();

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCommunity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVote = async (communityId: string, voteType: boolean) => {
    try {
      const response = await fetch(`${baseUrl}/community/${communityId}/vote`, {
        method: "PUT",
        body: JSON.stringify({ vote: voteType ? 1 : -1 }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        fetchCommunities();
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/community/`, {
        method: "POST",
        body: JSON.stringify(newCommunity),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      fetchCommunities();
      setNewCommunity({ name: "", description: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating community:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const CommunitySkeleton = () => (
    <Card className='hover:shadow-md transition-shadow duration-300'>
      <CardContent className='p-6'>
        <div className='flex items-center'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='ml-4 space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </div>
        </div>
      </CardContent>
      <CardFooter className='px-6 pb-4 pt-0'>
        <Skeleton className='h-4 w-full' />
      </CardFooter>
    </Card>
  );

  return (
    <div className='container mx-auto px-4 py-8 min-h-screen'>
      <div className='flex items-center sm:flex-row flex-col justify-between mb-6'>
        <h1 className='text-3xl font-bold'>Communities</h1>
        {isLoading ? (
          <Button disabled>Loading...</Button>
        ) : (
          <Button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Please login to create a community.");
                return;
              }
              if (user?.role !== "ADMIN") {
                toast.error("Only admins can create communities.");
                const wantToLogin = window.confirm(
                  "Do you want to login as Admin?"
                );
                if (wantToLogin) {
                  window.location.href = "http://localhost:5000/community/google/login";
                  return;
                }
                setIsLoading(false);
                return;
              }
              setIsOpen(true);
            }}
            className='flex items-center gap-2 sm:mt-0 mt-2'
          >
            <PlusCircle size={18} />
            Create Community
          </Button>
        )}
      </div>

      <ScrollArea className='h-full'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {isLoadingCommunities ? (
            <>
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
              <CommunitySkeleton />
            </>
          ) : communities.length > 0 ? (
            communities.map((community) => (
              <Card
                key={community.id}
                className='hover:shadow-md transition-shadow duration-300 flex flex-col'
              >
                <CardContent
                  className='p-6 flex-grow'
                  onClick={() => router.push(`/communities/${community.id}`)}
                >
                  <div className='flex items-center'>
                    <Avatar
                      className={`h-12 w-12 ${getAvatarColor(community.name)}`}
                    >
                      <AvatarFallback className='text-black font-bold'>
                        {community.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='ml-4'>
                      <h2 className='text-xl font-semibold'>
                        {community.name}
                      </h2>
                      <p className='text-gray-500 mt-1 text-sm'>
                        {community.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='px-6 pb-4 pt-0 border-t border-gray-100'>
                  <div className='w-full'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1'>
                          <ThumbsUp
                            size={14}
                            className='text-blue-500'
                            onClick={() => handleVote(community.id, true)}
                          />
                          <span className='text-xs'>
                            {community.upvotes || 0}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <ThumbsDown
                            size={14}
                            className='text-red-500'
                            onClick={() => handleVote(community.id, false)}
                          />
                          <span className='text-xs'>
                            {community.downvotes || 0}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-gray-500'>
                        <User size={12} />
                        <span>{community.user?.name || "Anonymous"}</span>
                      </div>
                    </div>
                    <div className='text-xs text-gray-400 mt-1'>
                      Created:{" "}
                      {community.createdAt
                        ? formatDate(community.createdAt)
                        : "N/A"}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className='text-gray-500'>No communities found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Community Name</Label>
              <Input
                id='name'
                name='name'
                value={newCommunity.name}
                onChange={handleInputChange}
                placeholder='Enter community name'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                value={newCommunity.description}
                onChange={handleInputChange}
                placeholder='Describe what this community is about'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {isLoading ? (
              <Button disabled>Loading...</Button>
            ) : (
              <Button
                onClick={handleCreateCommunity}
                disabled={!newCommunity.name || !newCommunity.description}
              >
                Create
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
