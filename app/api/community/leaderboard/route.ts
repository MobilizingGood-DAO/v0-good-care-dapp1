import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get self-care points from daily_checkins
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("user_id, username, streak, created_at")
      .order("created_at", { ascending: false })

    if (checkinError) {
      console.error("Error fetching checkin data:", checkinError)
      return NextResponse.json({ error: "Failed to fetch checkin data" }, { status: 500 })
    }

    // Get community objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select("user_id, username, points, status")
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objective data:", objectiveError)
      return NextResponse.json({ error: "Failed to fetch objective data" }, { status: 500 })
    }

    // Calculate self-care points per user
    const selfCarePoints = new Map<string, { username: string; points: number; streak: number; checkins: number }>()

    checkinData?.forEach((checkin) => {
      const userId = checkin.user_id || checkin.username
      if (!selfCarePoints.has(userId)) {
        selfCarePoints.set(userId, {
          username: checkin.username,
          points: 0,
          streak: checkin.streak || 0,
          checkins: 0,
        })
      }

      const user = selfCarePoints.get(userId)!
      // Base points: 10 per check-in + 5 for gratitude + streak bonus
      const basePoints = 15 // 10 base + 5 gratitude
      const streakBonus = Math.min(checkin.streak || 0, 10) // Max 10 bonus points
      user.points += basePoints + streakBonus
      user.checkins += 1
      user.streak = Math.max(user.streak, checkin.streak || 0)
    })

    // Calculate community objective points per user
    const objectivePoints = new Map<string, { username: string; points: number; objectives: number }>()

    objectiveData?.forEach((objective) => {
      const userId = objective.user_id || objective.username
      if (!objectivePoints.has(userId)) {
        objectivePoints.set(userId, {
          username: objective.username,
          points: 0,
          objectives: 0,
        })
      }

      const user = objectivePoints.get(userId)!
      user.points += objective.points
      user.objectives += 1
    })

    // Merge and create leaderboard
    const leaderboard = new Map<
      string,
      {
        username: string
        selfCarePoints: number
        objectivePoints: number
        totalPoints: number
        streak: number
        checkins: number
        objectives: number
      }
    >()

    // Add self-care points
    selfCarePoints.forEach((data, userId) => {
      leaderboard.set(userId, {
        username: data.username,
        selfCarePoints: data.points,
        objectivePoints: 0,
        totalPoints: data.points,
        streak: data.streak,
        checkins: data.checkins,
        objectives: 0,
      })
    })

    // Add objective points
    objectivePoints.forEach((data, userId) => {
      if (leaderboard.has(userId)) {
        const user = leaderboard.get(userId)!
        user.objectivePoints = data.points
        user.totalPoints += data.points
        user.objectives = data.objectives
      } else {
        leaderboard.set(userId, {
          username: data.username,
          selfCarePoints: 0,
          objectivePoints: data.points,
          totalPoints: data.points,
          streak: 0,
          checkins: 0,
          objectives: data.objectives,
        })
      }
    })

    // Convert to array and sort by total points
    const sortedLeaderboard = Array.from(leaderboard.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50) // Top 50 users

    // Calculate stats
    const totalUsers = leaderboard.size
    const totalSelfCarePoints = Array.from(leaderboard.values()).reduce((sum, user) => sum + user.selfCarePoints, 0)
    const totalObjectivePoints = Array.from(leaderboard.values()).reduce((sum, user) => sum + user.objectivePoints, 0)
    const totalPoints = totalSelfCarePoints + totalObjectivePoints

    return NextResponse.json({
      leaderboard: sortedLeaderboard,
      stats: {
        totalUsers,
        totalSelfCarePoints,
        totalObjectivePoints,
        totalPoints,
      },
    })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
