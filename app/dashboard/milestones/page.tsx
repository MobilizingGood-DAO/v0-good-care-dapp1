"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MilestonesList } from "@/components/milestones-list"
import { useMilestones } from "@/hooks/use-milestones"
import { Loader2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { Button } from "@/components/ui/button"

export default function MilestonesPage() {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { progress, categoryProgress, isLoading, error } = useMilestones()

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
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="mb-4">Connect your wallet to view your progress</p>
              <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
                Connect Wallet
              </Button>
            </div>
          ) : !isCorrectChain ? (
            <div className="text-center py-4">
              <p className="mb-4">Switch to the GOOD CARE Network to view your progress</p>
              <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
                Switch Network
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading your progress...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Overall Progress</div>
                  <div className="text-sm font-medium">{progress.percentage}%</div>
                </div>
                <Progress value={progress.percentage} className="h-2 bg-gray-200" />
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

      <MilestonesList />
    </div>
  )
}
