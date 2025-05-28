"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWallet } from "@/providers/wallet-provider"
import { useState, useEffect } from "react"
import { Award, Calendar, CheckCircle, Clock, Gift, Star, Trophy, Users } from 'lucide-react'

interface BadgeInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  unlocked: boolean
}

export function BadgeCollection() {
  const { address, isConnected } = useWallet()
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])

  useEffect(() => {
    if (isConnected && address) {
      // Load check-in data to get badges
      const storedData = localStorage.getItem(`checkIn_${address}`)
      if (storedData) {
        const checkInData = JSON.parse(storedData)
        setUnlockedBadges(checkInData.rewards.badges || [])
      }
    }
  }, [isConnected, address])

  // Define all possible badges
  const allBadges: BadgeInfo[] = [
    {
      id: "first-checkin",
      name: "First Steps",
      description: "Completed your first daily check-in",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "bg-green-100 text-green-800 border-green-300",
      unlocked: true, // Everyone with at least one check-in has this
    },
    {
      id: "week-streak",
      name: "Weekly Warrior",
      description: "Maintained a 7-day check-in streak",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      unlocked: unlockedBadges.includes("week-streak"),
    },
    {
      id: "month-streak",
      name: "Monthly Master",
      description: "Maintained a 30-day check-in streak",
      icon: <Star className="h-6 w-6" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      unlocked: unlockedBadges.includes("month-streak"),
    },
    {
      id: "fifty-checkins",
      name: "Half Century",
      description: "Completed 50 daily check-ins",
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      unlocked: unlockedBadges.includes("fifty-checkins"),
    },
    {
      id: "century-checkins",
      name: "Centurion",
      description: "Completed 100 daily check-ins",
      icon: <Award className="h-6 w-6" />,
      color: "bg-red-100 text-red-800 border-red-300",
      unlocked: unlockedBadges.includes("century-checkins"),
    },
    {
      id: "early-adopter",
      name: "Early Adopter",
      description: "Joined during the platform's early days",
      icon: <Clock className="h-6 w-6" />,
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      unlocked: true, // For demo purposes, everyone is an early adopter
    },
    {
      id: "community-member",
      name: "Community Member",
      description: "Actively participated in the GOOD community",
      icon: <Users className="h-6 w-6" />,
      color: "bg-pink-100 text-pink-800 border-pink-300",
      unlocked: false, // Placeholder for future community features
    },
    {
      id: "generous-donor",
      name: "Generous Soul",
      description: "Sent GCT tokens to other community members",
      icon: <Gift className="h-6 w-6" />,
      color: "bg-orange-100 text-orange-800 border-orange-300",
      unlocked: false, // Placeholder for future sending features
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Badge Collection
        </CardTitle>
        <CardDescription>Earn badges by checking in daily and participating in the GOOD ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <TooltipProvider>
            {allBadges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-lg border-2
                      ${badge.unlocked ? badge.color : "bg-gray-100 text-gray-400 border-gray-200"}
                      ${!badge.unlocked && "opacity-50"}
                      transition-all hover:scale-105
                    `}
                  >
                    <div className="mb-2">{badge.icon}</div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{badge.name}</div>
                      {!badge.unlocked && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  {!badge.unlocked && <p className="text-xs mt-1 italic">Keep participating to unlock!</p>}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
