import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="container w-full py-10 px-4">
      <div className="flex items-center mb-8">
        {/* <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link> */}
        <h1 className="text-2xl font-bold">How It Works</h1>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold mb-4">The Rapid Revise Process</h2>
          <p className="text-muted-foreground mb-6">
            Our tool is designed to help you make the most of your limited study time before exams. Here's how the
            process works:
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <span className="font-bold">1</span>
                </div>
                <CardTitle>Input Your Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tell us about your subject, topics to cover, available study time, and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <span className="font-bold">2</span>
                </div>
                <CardTitle>Generate Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our algorithm creates a personalized study schedule optimized for your available time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <span className="font-bold">3</span>
                </div>
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access recommended video lectures and articles for each topic in your plan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <span className="font-bold">4</span>
                </div>
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mark completed items and visualize your progress as you work through your plan.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Our Study Plan Algorithm</h2>
          <p className="text-muted-foreground mb-6">
            The Last-Minute Study Planner uses a sophisticated algorithm to create effective study plans:
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div>
                    <strong>Time Allocation</strong>
                    <p className="text-sm text-muted-foreground">
                      We distribute your available study time across topics, giving more time to complex subjects.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div>
                    <strong>Resource Selection</strong>
                    <p className="text-sm text-muted-foreground">
                      Based on your preferences, we recommend the most efficient mix of videos and articles.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div>
                    <strong>Difficulty Adjustment</strong>
                    <p className="text-sm text-muted-foreground">
                      We adjust resource complexity based on your selected difficulty level.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div>
                    <strong>Progress Optimization</strong>
                    <p className="text-sm text-muted-foreground">
                      The plan is structured to maximize knowledge retention in a short time frame.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-xl font-semibold mb-4">Ready to Create Your Study Plan?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Don't waste precious study time trying to figure out what to study. Let our tool create an optimized plan
            for you in seconds.
          </p>

          <Link href="/create">
            <Button size="lg">
              Create Study Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}

