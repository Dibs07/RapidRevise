import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

function page() {
  return (
    <div className="container mx-auto p-6 max-w-6xl min-h-screen">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User profile" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-2xl font-bold">Alex Johnson</h1>
                <p className="text-gray-500">Software Developer</p>
                <p className="text-gray-600 text-sm">alex.johnson@example.com</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Web Development</Badge>
                    <Badge variant="secondary">Data Science</Badge>
                    <Badge variant="secondary">Machine Learning</Badge>
                    <Badge variant="secondary">UX/UI Design</Badge>
                    <Badge variant="secondary">Cloud Computing</Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Dark Mode</Badge>
                    <Badge variant="outline">Video Tutorials</Badge>
                    <Badge variant="outline">Weekly Digest</Badge>
                    <Badge variant="outline">Technical Documentation</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Watches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src="/api/placeholder/80/48" 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                    width={80}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Advanced React Hooks Tutorial</h4>
                  <p className="text-xs text-gray-500">Watched 2 hours ago • 35 minutes</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <Image
                    src="/api/placeholder/80/48" 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                    width={80}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Building Responsive Layouts with CSS Grid</h4>
                  <p className="text-xs text-gray-500">Watched yesterday • 28 minutes</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src="/api/placeholder/80/48" 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                    width={80}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Introduction to GraphQL API Design</h4>
                  <p className="text-xs text-gray-500">Watched 3 days ago • 42 minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Study Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Full-Stack Web Development</span>
                  <span className="text-sm text-gray-500">78%</span>
                </div>
                <Progress value={78} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Data Structures & Algorithms</span>
                  <span className="text-sm text-gray-500">62%</span>
                </div>
                <Progress value={62} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cloud Architecture</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <Progress value={45} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mobile App Development</span>
                  <span className="text-sm text-gray-500">23%</span>
                </div>
                <Progress value={23} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;