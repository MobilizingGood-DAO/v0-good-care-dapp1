import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get self-care points from daily check-ins
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("username, mood, gratitude, streak, created_at")

    if (checkinError) {
      console.error("Error fetching check-ins:", checkinError)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    // Get community objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select("username, points, status")
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objectives:", objectiveError)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    // Calculate self-care points per user
    const selfCarePoints: Record<string, number> = {}
    const userStats: Record<string, { streak: number; checkins: number; lastCheckin: string }> = {}

    checkinData?.forEach((checkin) => {
      const username = checkin.username
      if (!selfCarePoints[username]) {
        selfCarePoints[username] = 0
        userStats[username] = { streak: 0, checkins: 0, lastCheckin: "" }
      }

      // Base points: 10 for check-in + 5 for gratitude
      let points = 10
      if (checkin.gratitude && checkin.gratitude.trim().length > 0) {
        points += 5
      }

      // Streak bonus (up to 10 extra points)
      const streakBonus = Math.min(checkin.streak || 0, 10)
      points += streakBonus

      selfCarePoints[username] += points
      userStats[username].checkins += 1
      userStats[username].streak = Math.max(userStats[username].streak, checkin.streak || 0)
      userStats[username].lastCheckin = checkin.created_at
    })

    // Calculate community objective points per user
    const objectivePoints: Record<string, number> = {}
    objectiveData?.forEach((objective) => {
      const username = objective.username
      if (!objectivePoints[username]) {
        objectivePoints[username] = 0
      }
      objectivePoints[username] += objective.points
    })

    // Merge and create leaderboard
    const allUsers = new Set([...Object.keys(selfCarePoints), ...Object.keys(objectivePoints)])
    const leaderboard = Array.from(allUsers).map((username) => {
      const selfCare = selfCarePoints[username] || 0
      const community = objectivePoints[username] || 0
      const total = selfCare + community
      const stats = userStats[username] || { streak: 0, checkins: 0, lastCheckin: "" }

      return {
        username,
        selfCarePoints: selfCare,
        communityPoints: community,
        totalPoints: total,
        streak: stats.streak,
        checkins: stats.checkins,
        lastCheckin: stats.lastCheckin,
        level: Math.floor(total / 100) + 1,
        rank: 0, // Will be set after sorting
      }
    })

    // Sort by total points and assign ranks
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
    leaderboard.forEach((user, index) => {
      user.rank = index + 1
    })

    // Calculate community stats
    const totalUsers = leaderboard.length
    const totalSelfCarePoints = leaderboard.reduce((sum, user) => sum + user.selfCarePoints, 0)
    const totalCommunityPoints = leaderboard.reduce((sum, user) => sum + user.communityPoints, 0)
    const totalPoints = totalSelfCarePoints + totalCommunityPoints

    const stats = {
      totalUsers,
      totalSelfCarePoints,
      totalCommunityPoints,
      totalPoints,
      averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0,
    }

    return NextResponse.json({
      leaderboard,
      stats,
      success: true,
    })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
