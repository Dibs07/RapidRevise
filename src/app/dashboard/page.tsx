"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Clock, Video, FileText, CheckCircle, AlertCircle } from "lucide-react"

export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, we would fetch this from an API
    const savedPlan = localStorage.getItem("studyPlan")
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan))
    }
    setLoading(false)
  }, [])

  const handleResourceCompletion = (
    sessionIndex: number,
    resourceType: "videos" | "articles",
    resourceIndex: number,
  ) => {
    if (!studyPlan) return

    const updatedPlan = { ...studyPlan }
    const resource = updatedPlan.studySessions[sessionIndex][resourceType][resourceIndex]
    resource.completed = !resource.completed

    // Check if all resources in this session are completed
    const session = updatedPlan.studySessions[sessionIndex]
    const allVideosCompleted = session.resources.videos.every((v: any) => v.completed)
    const allArticlesCompleted = session.resources.articles.every((a: any) => a.completed)

    session.completed = allVideosCompleted && allArticlesCompleted

    // Update overall progress
    const totalResources = updatedPlan.studySessions.reduce((acc: number, session: any) => {
      return acc + session.resources.videos.length + session.resources.articles.length
    }, 0)

    const completedResources = updatedPlan.studySessions.reduce((acc: number, session: any) => {
      const completedVideos = session.resources.videos.filter((v: any) => v.completed).length
      const completedArticles = session.resources.articles.filter((a: any) => a.completed).length
      return acc + completedVideos + completedArticles
    }, 0)

    updatedPlan.progress = Math.round((completedResources / totalResources) * 100)

    setStudyPlan(updatedPlan)
    localStorage.setItem("studyPlan", JSON.stringify(updatedPlan))
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading your study plan...</p>
      </div>
    )
  }

  if (!studyPlan) {
    return (
      <div className="container w-full py-4 px-4 min-h-screen">
        <div className="flex items-center mb-8">
          {/* <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link> */}
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
    )
  }

  return (
    <div className="container w-full py-10 px-20 min-h-screen">
      <div className="flex items-center mb-8">
        {/* <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link> */}
        <h1 className="text-2xl font-bold">Study Dashboard</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{studyPlan.subject} Study Plan</CardTitle>
          <CardDescription>Created on {new Date(studyPlan.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
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

      <div className="space-y-6">
        {studyPlan.studySessions.map((session: any, sessionIndex: number) => (
          <Card key={session.id} className={session.completed ? "border-green-200 bg-green-50" : ""}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{session.topic}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {Math.floor(session.timeAllocated / 60)} hours {session.timeAllocated % 60} minutes
                  </span>
                </div>
              </div>
              <CardDescription>
                {session.completed ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="mr-1 h-4 w-4" /> Completed
                  </span>
                ) : (
                  "Study materials and resources"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="videos">
                <TabsList className="mb-4">
                  <TabsTrigger value="videos" className="flex items-center">
                    <Video className="mr-2 h-4 w-4" />
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Articles
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="space-y-4">
                  {session.resources.videos.map((video: any, videoIndex: number) => (
                    <div key={video.id} className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                      <Checkbox
                        id={video.id}
                        checked={video.completed}
                        onCheckedChange={() => handleResourceCompletion(sessionIndex, "videos", videoIndex)}
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={video.id}
                          className={`font-medium cursor-pointer ${video.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {video.title}
                        </label>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="articles" className="space-y-4">
                  {session.resources.articles.map((article: any, articleIndex: number) => (
                    <div key={article.id} className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                      <Checkbox
                        id={article.id}
                        checked={article.completed}
                        onCheckedChange={() => handleResourceCompletion(sessionIndex, "articles", articleIndex)}
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={article.id}
                          className={`font-medium cursor-pointer ${article.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {article.title}
                        </label>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

