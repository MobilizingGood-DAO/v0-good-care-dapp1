"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { useMilestones } from "@/hooks/use-milestones"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"

export function MilestonesList() {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { completedMilestones, pendingMilestones, isLoading, error } = useMilestones()

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Connect your wallet to view your milestones</p>
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Switch to the GOOD CARE Network to view your milestones</p>
        <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
          Switch Network
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading your milestones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Completed Milestones</CardTitle>
          <CardDescription>Milestones you have already achieved</CardDescription>
        </CardHeader>
        <CardContent>
          {completedMilestones.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">You haven't completed any milestones yet.</p>
          ) : (
            <div className="space-y-4">
              {completedMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start space-x-4 rounded-lg border p-4">
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
                      <span className="ml-1">{milestone.reward}</span>
                    </div>
                    {milestone.date && <p className="text-xs text-muted-foreground">Completed on {milestone.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
          <CardDescription>Milestones you can work towards</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMilestones.length === 0 ? (
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
                      <span className="ml-1">{milestone.reward}</span>
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
