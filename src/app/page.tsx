// pages/index.jsx
import Link from "next/link"
import { BookOpen, BarChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Optimize Your Study Time
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create efficient study plans when you're short on time. Get personalized recommendations for videos,
                  articles, and track your progress all in one place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link href="/how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <BookOpen className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Personalized Study Plans</CardTitle>
                  <CardDescription>
                    Input your subjects, topics, and available time to get a customized study schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our algorithm optimizes your limited study time by prioritizing topics and allocating appropriate
                    time slots.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Resource Integration</CardTitle>
                  <CardDescription>
                    Access curated video lectures and articles directly within your study plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>We integrate with educational platforms to provide you with the best resources for each topic.</p>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CheckCircle className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>Mark completed tasks and visualize your study progress.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Stay motivated by tracking your progress and seeing how much you've accomplished.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}