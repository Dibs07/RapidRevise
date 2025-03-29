import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

function page() {

  const communities = [
    {
      id: 1,
      name: "Photography Enthusiasts",
      description: "A community for sharing photography tips, tricks, and amazing shots."
    },
    {
      id: 2,
      name: "Web Developers",
      description: "Connect with fellow web developers, share knowledge, and solve coding challenges together."
    },
    {
      id: 3,
      name: "Book Club",
      description: "Discuss your favorite books, share recommendations, and join monthly reading challenges."
    },
    {
      id: 4,
      name: "Fitness Motivation",
      description: "Stay motivated on your fitness journey with like-minded individuals."
    },
    {
      id: 5,
      name: "Culinary Arts",
      description: "Exchange recipes, cooking techniques, and food photography with fellow food lovers."
    }
  ];

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
      'bg-red-500', 'bg-teal-500'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Communities</h1>
      </div>
      
      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className={`h-12 w-12 ${getAvatarColor(community.name)}`}>
                    <AvatarFallback className="text-black font-bold">
                      {community.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{community.name}</h2>
                    <p className="text-gray-500 mt-1 text-sm">{community.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default page;