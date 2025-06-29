import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get self-care points from daily_checkins
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("user_id, username, mood, gratitude, streak, created_at")

    if (checkinError) {
      console.error("Error fetching checkin data:", checkinError)
      return NextResponse.json({ error: "Failed to fetch checkin data" }, { status: 500 })
    }

    // Get community objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select("user_id, username, points, status, category")
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objective data:", objectiveError)
      return NextResponse.json({ error: "Failed to fetch objective data" }, { status: 500 })
    }

    // Calculate self-care points per user
    const selfCarePoints = new Map<string, { username: string; points: number; streak: number; checkins: number }>()

    checkinData?.forEach((checkin) => {
      const userId = checkin.user_id
      const existing = selfCarePoints.get(userId) || { username: checkin.username, points: 0, streak: 0, checkins: 0 }

      // Base points: 10 for checkin + 5 for gratitude + streak bonus
      let points = 10
      if (checkin.gratitude && checkin.gratitude.trim().length > 0) {
        points += 5
      }

      // Streak bonus (1 point per streak day, max 20)
      const streakBonus = Math.min(checkin.streak || 0, 20)
      points += streakBonus

      existing.points += points
      existing.streak = Math.max(existing.streak, checkin.streak || 0)
      existing.checkins += 1

      selfCarePoints.set(userId, existing)
    })

    // Calculate community objective points per user
    const objectivePoints = new Map<string, { username: string; points: number; objectives: number }>()

    objectiveData?.forEach((objective) => {
      const userId = objective.user_id
      const existing = objectivePoints.get(userId) || { username: objective.username, points: 0, objectives: 0 }

      existing.points += objective.points
      existing.objectives += 1

      objectivePoints.set(userId, existing)
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
        recentDays: boolean[]
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
        recentDays: generateRecentDays(data.streak),
      })
    })

    // Add objective points
    objectivePoints.forEach((data, userId) => {
      const existing = leaderboard.get(userId)
      if (existing) {
        existing.objectivePoints = data.points
        existing.totalPoints += data.points
        existing.objectives = data.objectives
      } else {
        leaderboard.set(userId, {
          username: data.username,
          selfCarePoints: 0,
          objectivePoints: data.points,
          totalPoints: data.points,
          streak: 0,
          checkins: 0,
          objectives: data.objectives,
          recentDays: [],
        })
      }
    })

    // Convert to array and sort by total points
    const sortedLeaderboard = Array.from(leaderboard.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50) // Top 50 users

    // Calculate stats
    const stats = {
      totalUsers: leaderboard.size,
      totalSelfCarePoints: Array.from(selfCarePoints.values()).reduce((sum, user) => sum + user.points, 0),
      totalObjectivePoints: Array.from(objectivePoints.values()).reduce((sum, user) => sum + user.points, 0),
      totalPoints: sortedLeaderboard.reduce((sum, user) => sum + user.totalPoints, 0),
      averageStreak:
        selfCarePoints.size > 0
          ? Array.from(selfCarePoints.values()).reduce((sum, user) => sum + user.streak, 0) / selfCarePoints.size
          : 0,
    }

    return NextResponse.json({
      leaderboard: sortedLeaderboard,
      stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateRecentDays(streak: number): boolean[] {
  const days = new Array(7).fill(false)
  const activeDays = Math.min(streak, 7)
  for (let i = 0; i < activeDays; i++) {
    days[6 - i] = true // Fill from the end (most recent)
  }
  return days
}
