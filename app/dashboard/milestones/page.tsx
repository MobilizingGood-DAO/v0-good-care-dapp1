"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Milestone {
  id: string
  title: string
  description: string
  category: "community" | "contribution" | "learning"
  completed: boolean
  reward: string
  date?: string
}

interface ProgressData {
  total: number
  completed: number
  percentage: number
}

interface CategoryProgress {
  community: ProgressData
  contribution: ProgressData
  learning: ProgressData
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [progress, setProgress] = useState<ProgressData>({ total: 10, completed: 0, percentage: 0 })
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress>({
    community: { total: 5, completed: 0, percentage: 0 },
    contribution: { total: 5, completed: 0, percentage: 0 },
    learning: { total: 5, completed: 0, percentage: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("goodcare_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load milestone data
    loadMilestones()
  }, [])

  const loadMilestones = async () => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock milestone data
    const mockMilestones: Milestone[] = [
      {
        id: "1",
        title: "First Check-in",
        description: "Complete your first daily reflection",
        category: "learning",
        completed: true,
        reward: "10 CARE Points",
        date: "2024-01-15",
      },
      {
        id: "2",
        title: "Week Warrior",
        description: "Maintain a 7-day check-in streak",
        category: "contribution",
        completed: false,
        reward: "50 CARE Points + Badge NFT",
      },
      {
        id: "3",
        title: "Community Helper",
        description: "Help 5 community members",
        category: "community",
        completed: false,
        reward: "25 CARE Points",
      },
      {
        id: "4",
        title: "Reflection Master",
        description: "Complete 30 daily reflections",
        category: "learning",
        completed: false,
        reward: "100 CARE Points + Special NFT",
      },
      {
        id: "5",
        title: "Token Sender",
        description: "Send tokens to 10 different addresses",
        category: "contribution",
        completed: true,
        reward: "20 CARE Points",
        date: "2024-01-20",
      },
      {
        id: "6",
        title: "Community Builder",
        description: "Invite 5 friends to join GOOD CARE",
        category: "community",
        completed: false,
        reward: "75 CARE Points + Referral Badge",
      },
    ]

    setMilestones(mockMilestones)

    // Calculate progress
    const completed = mockMilestones.filter((m) => m.completed).length
    const total = mockMilestones.length
    const percentage = Math.round((completed / total) * 100)

    setProgress({ total, completed, percentage })

    // Calculate category progress
    const categories = ["community", "contribution", "learning"] as const
    const newCategoryProgress = {} as CategoryProgress

    categories.forEach((category) => {
      const categoryMilestones = mockMilestones.filter((m) => m.category === category)
      const categoryCompleted = categoryMilestones.filter((m) => m.completed).length
      const categoryTotal = categoryMilestones.length
      const categoryPercentage = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0

      newCategoryProgress[category] = {
        total: categoryTotal,
        completed: categoryCompleted,
        percentage: categoryPercentage,
      }
    })

    setCategoryProgress(newCategoryProgress)
    setIsLoading(false)
  }

  const completedMilestones = milestones.filter((m) => m.completed)
  const pendingMilestones = milestones.filter((m) => !m.completed)

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Milestones</h2>
          <p className="text-muted-foreground">Track your journey through Soulbound milestones and community action</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="mb-4">Please log in to view your milestones</p>
              <Button onClick={() => (window.location.href = "/login")} className="bg-green-600 hover:bg-green-700">
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Milestones</h2>
        <p className="text-muted-foreground">Track your journey through Soulbound milestones and community action</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journey Progress</CardTitle>
          <CardDescription>Your progress through the GOOD Passport journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading your progress...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Overall Progress</div>
                  <div className="text-sm font-medium">{progress.percentage}%</div>
                </div>
                <Progress value={progress.percentage} className="h-2 bg-gray-200" />
                <div className="text-xs text-muted-foreground">
                  {progress.completed} of {progress.total} milestones completed
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Community</div>
                  <Progress value={categoryProgress.community.percentage} className="h-2 bg-gray-200" />
                  <div className="text-xs text-muted-foreground">
                    {categoryProgress.community.completed}/{categoryProgress.community.total} milestones
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Contributions</div>
                  <Progress value={categoryProgress.contribution.percentage} className="h-2 bg-gray-200" />
                  <div className="text-xs text-muted-foreground">
                    {categoryProgress.contribution.completed}/{categoryProgress.contribution.total} milestones
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Learning</div>
                  <Progress value={categoryProgress.learning.percentage} className="h-2 bg-gray-200" />
                  <div className="text-xs text-muted-foreground">
                    {categoryProgress.learning.completed}/{categoryProgress.learning.total} milestones
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Completed Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Milestones</CardTitle>
          <CardDescription>Milestones you have already achieved</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading milestones...</p>
            </div>
          ) : completedMilestones.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">You haven't completed any milestones yet.</p>
          ) : (
            <div className="space-y-4">
              {completedMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start space-x-4 rounded-lg border p-4 bg-green-50">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge className="ml-2" variant="outline">
                        {milestone.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Reward:</span>
                      <span className="ml-1 text-green-600">{milestone.reward}</span>
                    </div>
                    {milestone.date && <p className="text-xs text-muted-foreground">Completed on {milestone.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
          <CardDescription>Milestones you can work towards</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading milestones...</p>
            </div>
          ) : pendingMilestones.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">You've completed all available milestones!</p>
          ) : (
            <div className="space-y-4">
              {pendingMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start space-x-4 rounded-lg border p-4">
                  <Circle className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge className="ml-2" variant="outline">
                        {milestone.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Reward:</span>
                      <span className="ml-1 text-blue-600">{milestone.reward}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
