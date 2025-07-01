import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get self-care points from user_stats
    const { data: userStatsData, error: statsError } = await supabase
      .from("users")
      .select(`
        id,
        username,
        wallet_address,
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
    }

    // Get community CARE objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select("user_id, username, points, title, category")
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objective data:", objectiveError)
    }

    // Aggregate objective points by user_id
    const objectivePointsByUser = new Map<string, { points: number; objectives: any[] }>()
    if (objectiveData) {
      objectiveData.forEach((obj: any) => {
        const current = objectivePointsByUser.get(obj.user_id) || { points: 0, objectives: [] }
        current.points += obj.points || 0
        current.objectives.push({
          title: obj.title,
          points: obj.points,
          category: obj.category,
        })
        objectivePointsByUser.set(obj.user_id, current)
      })
    }

    // Combine the data
    const combinedData = (userStatsData || []).map((user: any) => {
      const selfCarePoints = user.user_stats?.total_points || 0
      const objectiveData = objectivePointsByUser.get(user.id) || { points: 0, objectives: [] }
      const careObjectivePoints = objectiveData.points
      const totalPoints = selfCarePoints + careObjectivePoints

      return {
        userId: user.id,
        username: user.username || `User_${user.wallet_address?.slice(-6) || user.id.slice(-6)}`,
        walletAddress: user.wallet_address,
        selfCarePoints,
        careObjectivePoints,
        totalPoints,
        currentStreak: user.user_stats?.current_streak || 0,
        longestStreak: user.user_stats?.longest_streak || 0,
        level: user.user_stats?.level || 1,
        totalCheckins: user.user_stats?.total_checkins || 0,
        lastCheckin: user.user_stats?.last_checkin,
        objectives: objectiveData.objectives,
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

    // Calculate stats
    const stats = {
      totalUsers: sortedData.length,
      totalSelfCarePoints: sortedData.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalObjectivePoints: sortedData.reduce((sum, user) => sum + user.careObjectivePoints, 0),
      totalPoints: sortedData.reduce((sum, user) => sum + user.totalPoints, 0),
    }

    return NextResponse.json({
      success: true,
      leaderboard: sortedData,
      stats,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
