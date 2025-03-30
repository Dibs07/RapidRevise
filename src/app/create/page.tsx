"use client"

import type React from "react"

import { use, useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from 'react-dropzone';

export default function CreatePlan() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    board: "",
    class_level: "",
    department: "",
    // topics: "",
    // availableHours: 5,
    // difficulty: "medium",
    // resourcePreference: "balanced",
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const [simplePrompt, setSimplePrompt] = useState("")

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const onDrop = useCallback((acceptedFiles: any) => {
    // For simplicity, we take the first file if multiple are dropped
    setUploadedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("prompt", simplePrompt);

      if (uploadedFile) {
        if (uploadedFile.type !== "application/pdf") {
          alert("Only PDF files are allowed.");
          return;
        }
        formDataToSend.append("file", uploadedFile);
      }

      const response = await fetch(`${baseUrl}/study_plan/pdf`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();
      console.log(data);
      localStorage.setItem("Data", JSON.stringify(data));
      localStorage.setItem("studyPlan", JSON.stringify(data.topics_with_videos));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    //localStorage.setItem("studyPlan", JSON.stringify(studyPlan))
    router.push("/dashboard")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setLoading(true)
      const response = await fetch(`${baseUrl}/examprep/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      console.log(data)
      localStorage.setItem("Data", JSON.stringify(data))
      localStorage.setItem("studyPlan", JSON.stringify(data.topics_with_videos))
      router.push("/dashboard")
      console.log(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
    //e.preventDefault()
    //const studyPlan = generateStudyPlan(formData)
    //localStorage.setItem("studyPlan", JSON.stringify(studyPlan))
    // router.push("/dashboard")
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

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 gap-4 mb-6">
          <TabsTrigger value="simple">Simple Prompt</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        {/* simple */}
        <TabsContent value="simple">
          <Card className="sm:max-w-xl max-w-lg mx-auto">
            <form onSubmit={handlePromptSubmit}>
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
                <div className="space-y-2">
                  <Label className="text-xl">Upload File (optional)</Label>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed p-4 rounded-md text-center cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p>Drop the file here...</p>
                    ) : (
                      <p>Drag and drop a file here, or click to select one</p>
                    )}
                  </div>
                  {uploadedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">File selected: {uploadedFile?.name!}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
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
                  <Label htmlFor="board" className="text-base">Board</Label>
                  <Input
                    id="board"
                    placeholder="e.g., CBSE, ICSE, IB"
                    value={formData.board}
                    onChange={(e) => handleChange("board", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_level" className="text-base">Class Level</Label>
                  <Input
                    id="class_level"
                    placeholder="e.g., 10th, 11th, 12th"
                    value={formData.class_level}
                    onChange={(e) => handleChange("class_level", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-base">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Science, Commerce, Arts"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    required
                  />
                </div>
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

                {/* <div className="space-y-2">
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
                </div> */}
              </CardContent>
              <CardFooter className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-4 ">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
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
