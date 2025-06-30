import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get all users with their check-in stats
    const { data: users, error: usersError } = await supabase
      .from("user_stats")
      .select("*")
      .order("total_points", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get community objective points for each user
    const { data: objectives, error: objectivesError } = await supabase
      .from("care_objectives")
      .select("username, points, status")
      .in("status", ["completed", "verified"])

    if (objectivesError) {
      console.error("Error fetching objectives:", objectivesError)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    // Calculate community points for each user
    const communityPointsMap = new Map<string, number>()
    objectives?.forEach((obj) => {
      const current = communityPointsMap.get(obj.username) || 0
      communityPointsMap.set(obj.username, current + obj.points)
    })

    // Combine self-care and community points
    const leaderboard =
      users?.map((user, index) => {
        const communityPoints = communityPointsMap.get(user.username) || 0
        const selfCarePoints = user.total_points || 0
        const totalPoints = selfCarePoints + communityPoints
        const level = Math.floor(totalPoints / 100) + 1

        return {
          username: user.username,
          selfCarePoints,
          communityPoints,
          totalPoints,
          streak: user.current_streak || 0,
          checkins: user.total_checkins || 0,
          lastCheckin: user.last_checkin || new Date().toISOString(),
          level,
          rank: index + 1,
        }
      }) || []

    // Re-sort by total points and update ranks
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
    leaderboard.forEach((user, index) => {
      user.rank = index + 1
    })

    // Calculate stats
    const stats = {
      totalUsers: leaderboard.length,
      totalSelfCarePoints: leaderboard.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalCommunityPoints: leaderboard.reduce((sum, user) => sum + user.communityPoints, 0),
      totalPoints: leaderboard.reduce((sum, user) => sum + user.totalPoints, 0),
      averagePointsPerUser:
        leaderboard.length > 0
          ? Math.round(leaderboard.reduce((sum, user) => sum + user.totalPoints, 0) / leaderboard.length)
          : 0,
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
