"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Medal, Award } from "lucide-react"

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - in a real app, this would come from your backend
  const leaderboardData = [
    { rank: 1, username: "MindfulMaster", points: 3750, multiplier: 2, avatar: "👑" },
    { rank: 2, username: "CareChampion", points: 3200, multiplier: 1.5, avatar: "🌟" },
    { rank: 3, username: "WellnessWarrior", points: 2800, multiplier: 1.5, avatar: "🌈" },
    { rank: 4, username: "User123", points: 1250, multiplier: 1.25, avatar: "😊" },
    { rank: 5, username: "HealingHero", points: 1100, multiplier: 1, avatar: "🌱" },
    { rank: 6, username: "MindfulMoment", points: 950, multiplier: 1, avatar: "🧘" },
    { rank: 7, username: "GratitudeGuru", points: 820, multiplier: 1, avatar: "🙏" },
    { rank: 8, username: "BalancedBeing", points: 780, multiplier: 1, avatar: "⚖️" },
    { rank: 9, username: "SoulfulSeeker", points: 650, multiplier: 1, avatar: "🔍" },
    { rank: 10, username: "PeacefulPresence", points: 520, multiplier: 1, avatar: "☮️" },
  ]

  const filteredData = searchQuery
    ? leaderboardData.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : leaderboardData

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-gray-500">{rank}</span>
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">CARE Leaderboard</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">This Week</Button>
        <Button variant="outline">All Time</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Users with the most CARE points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-4 py-2 px-4 font-medium text-sm text-gray-500">
              <div className="col-span-1">Rank</div>
              <div className="col-span-7">User</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Multiplier</div>
            </div>

            {filteredData.map((user) => (
              <div
                key={user.rank}
                className={`grid grid-cols-12 gap-4 py-3 px-4 rounded-lg ${
                  user.username === "User123" ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <div className="col-span-1 flex items-center">{getRankIcon(user.rank)}</div>
                <div className="col-span-7 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span>{user.avatar}</span>
                  </div>
                  <span className="font-medium">{user.username}</span>
                  {user.username === "User123" && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <div className="col-span-2 text-right font-bold">{user.points.toLocaleString()}</div>
                <div className="col-span-2 text-right">{user.multiplier}x</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Rank</span>
                <span className="font-bold">#4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CARE Points</span>
                <span className="font-bold">1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Streak</span>
                <span className="font-bold">5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Multiplier</span>
                <span className="font-bold">1.25x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How to Earn More CARE</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-700">1</span>
                </div>
                <span>Check in daily to maintain your streak and increase your multiplier</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-700">2</span>
                </div>
                <span>Add reflections to your check-ins for bonus points</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-700">3</span>
                </div>
                <span>Participate in community events and listening circles</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-700">4</span>
                </div>
                <span>Invite friends to join the GOOD CARE Network</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
