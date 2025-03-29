"use client"

import type React from "react"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreatePlan() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: "",
    topics: "",
    availableHours: 5,
    difficulty: "medium",
    resourcePreference: "balanced",
  })
  const [simplePrompt, setSimplePrompt] = useState("")

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const studyPlan = generateSimpleStudyPlan(simplePrompt)
    localStorage.setItem("studyPlan", JSON.stringify(studyPlan))
    router.push("/dashboard")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const studyPlan = generateStudyPlan(formData)
    localStorage.setItem("studyPlan", JSON.stringify(studyPlan))
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto w-full py-4 px-4 sm:py-10 sm:px-24 min-h-screen">
      <div className="flex items-center mb-8">
        {/* <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link> */}
        <h1 className="text-2xl sm:text-3xl font-bold">Create Study Plan</h1>
      </div>

      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
          <TabsTrigger value="simple">Simple Prompt</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        {/* simple */}  
        <TabsContent value="simple">
          <Card className="sm:max-w-xl max-w-lg mx-auto">
            <form onSubmit={handleSimpleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Quick Study Plan</CardTitle>
                <CardDescription className="text-sm py-1">
                  Just tell us what you want to study and we'll create a plan for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-xl">What do you want to study?</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., I need to learn Python programming in 2 days for an exam"
                    value={simplePrompt}
                    onChange={(e) => setSimplePrompt(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-4 ">
              <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Generate Study Plan
                </Button>
                <Button variant="outline" type="button" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        {/* //manual */}
        <TabsContent value="manual">
          <Card className="sm:max-w-xl max-w-lg mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Study Plan Details</CardTitle>
                <CardDescription className="text-sm py-1">
                  Fill in the details below to generate your personalized last-minute study plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Computer Science, Biology"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics" className="text-base">Topics to Cover</Label>
                  <Textarea
                    id="topics"
                    placeholder="Enter topics separated by commas (e.g., Linear Algebra, Calculus, Statistics)"
                    value={formData.topics}
                    onChange={(e) => handleChange("topics", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="availableHours" className="text-base">Available Study Time (hours)</Label>
                    <span className="text-sm font-medium">{formData.availableHours} hours</span>
                  </div>
                  <Slider
                    id="availableHours"
                    min={1}
                    max={24}
                    step={1}
                    value={[formData.availableHours]}
                    onValueChange={(value) => handleChange("availableHours", value[0])}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                  <div className="space-y-2 ">
                    <Label htmlFor="difficulty" className="text-base">Difficulty Level</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleChange("difficulty", value)} >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="medium">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resourcePreference" className="text-base" >Resource Preference</Label>
                    <Select
                      value={formData.resourcePreference}
                      onValueChange={(value) => handleChange("resourcePreference", value)}
                    >
                      <SelectTrigger id="resourcePreference">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="videos">Mostly Videos</SelectItem>
                        <SelectItem value="articles">Mostly Articles</SelectItem>
                        <SelectItem value="balanced">Balanced Mix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-4 ">
              <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Generate Study Plan
                </Button>
                <Button variant="outline" type="button" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generateSimpleStudyPlan(prompt: string) {
  // This is a basic implementation - you would want to enhance this
  // to actually process the prompt and generate a meaningful plan
  return {
    id: Date.now().toString(),
    subject: "Custom Study Plan",
    totalTime: 120, // 2 hours default
    difficulty: "medium",
    createdAt: new Date().toISOString(),
    studySessions: [
      {
        id: "topic-1",
        topic: "Main Topic",
        timeAllocated: 120,
        resources: {
          videos: [
            {
              id: "v-1-1",
              title: "Introduction Video",
              duration: "15 min",
              url: "#",
              completed: false,
            }
          ],
          articles: [
            {
              id: "a-1-1",
              title: "Study Guide",
              readTime: "10 min",
              url: "#",
              completed: false,
            }
          ]
        },
        completed: false,
      }
    ],
    progress: 0,
  }
}

function generateStudyPlan(formData: any) {
  const { subject, topics, availableHours, difficulty, resourcePreference } = formData
  const topicsList = topics.split(",").map((topic: string) => topic.trim())
  const hoursPerTopic = availableHours / topicsList.length
  const studySessions = topicsList.map((topic: string, index: number) => {
    let videoCount = 1
    let articleCount = 1

    if (resourcePreference === "videos") {
      videoCount = 2
      articleCount = 1
    } else if (resourcePreference === "articles") {
      videoCount = 1
      articleCount = 2
    } else {
      // balanced
      videoCount = 1
      articleCount = 1
    }

    const resources = {
      videos: Array(videoCount)
        .fill(0)
        .map((_, i) => ({
          id: `v-${index}-${i}`,
          title: `${topic} - Video Lecture ${i + 1}`,
          duration: "15 min",
          url: "#",
          completed: false,
        })),
      articles: Array(articleCount)
        .fill(0)
        .map((_, i) => ({
          id: `a-${index}-${i}`,
          title: `${topic} - Study Article ${i + 1}`,
          readTime: "10 min",
          url: "#",
          completed: false,
        })),
    }

    return {
      id: `topic-${index}`,
      topic,
      timeAllocated: Math.round(hoursPerTopic * 60),
      resources,
      completed: false,
    }
  })

  return {
    id: Date.now().toString(),
    subject,
    totalTime: availableHours * 60,
    difficulty,
    createdAt: new Date().toISOString(),
    studySessions,
    progress: 0,
  }
}
