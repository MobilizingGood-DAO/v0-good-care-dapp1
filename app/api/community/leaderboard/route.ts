import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

interface UserPoints {
  userId: string
  username: string
  walletAddress: string
  avatar?: string
  selfCarePoints: number
  careObjectivePoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get self-care points from daily check-ins via user_stats
    const { data: userStatsData, error: statsError } = await supabase
      .from("users")
      .select(`
        id,
        username,
        wallet_address,
        avatar,
        user_stats (
          total_points,
          current_streak,
          longest_streak,
          level,
          total_checkins,
          last_checkin
        )
      `)
      .not("user_stats", "is", null)

    if (statsError) {
      console.error("Error fetching user stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
    }

    // Get CARE objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select(`
        user_id,
        username,
        points
      `)
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objective points:", objectiveError)
      // Don't fail if objectives table doesn't exist yet
    }

    // Aggregate objective points by user
    const objectivePointsByUser = new Map<string, number>()
    if (objectiveData) {
      objectiveData.forEach((obj: any) => {
        const currentPoints = objectivePointsByUser.get(obj.user_id) || 0
        objectivePointsByUser.set(obj.user_id, currentPoints + obj.points)
      })
    }

    // Combine the data
    const combinedData: UserPoints[] = (userStatsData || []).map((user: any) => {
      const selfCarePoints = user.user_stats?.total_points || 0
      const careObjectivePoints = objectivePointsByUser.get(user.id) || 0
      const totalPoints = selfCarePoints + careObjectivePoints

      return {
        userId: user.id,
        username: user.username || `User_${user.wallet_address.slice(-6)}`,
        walletAddress: user.wallet_address,
        avatar: user.avatar,
        selfCarePoints,
        careObjectivePoints,
        totalPoints,
        currentStreak: user.user_stats?.current_streak || 0,
        longestStreak: user.user_stats?.longest_streak || 0,
        level: user.user_stats?.level || 1,
        totalCheckins: user.user_stats?.total_checkins || 0,
        lastCheckin: user.user_stats?.last_checkin,
      }
    })

    // Sort by total points and add ranks
    const sortedData = combinedData
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))

    return NextResponse.json({
      success: true,
      leaderboard: sortedData,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
