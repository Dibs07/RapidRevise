"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const DashboardCards = () => {
  // Sample data for the cards
  const [sessionData, setSessionData] = useState([
    { id: 1, title: 'Project Alpha', createdAt: '2025-03-15', progress: 75 },
    { id: 2, title: 'Task Management', createdAt: '2025-03-20', progress: 45 },
    { id: 3, title: 'Budget Planning', createdAt: '2025-03-25', progress: 30 },
    { id: 4, title: 'Research Analysis', createdAt: '2025-03-10', progress: 90 }
  ]);

  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {
        sessionData.map((card) => (
          <Card
            key={card.id}
            className="shadow-md hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/${card.id}`)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              <p className="text-sm text-gray-500">Created: {formatDate(card.createdAt)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm font-medium">{card.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
};

export default DashboardCards;