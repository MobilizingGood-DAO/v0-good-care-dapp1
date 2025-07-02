import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  console.log("🏆 API: Fetching leaderboard data...")

  try {
    // Fetch user profiles with their points
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select(`
        id,
        username,
        avatar_url,
        self_care_points,
        community_points,
        current_streak
      `)
      .order("self_care_points", { ascending: false })

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      throw profilesError
    }

    console.log("✅ Fetched profiles:", profiles?.length || 0)

    // Calculate total points and add rankings
    const users = (profiles || []).map((profile, index) => {
      const selfCarePoints = profile.self_care_points || 0
      const communityPoints = profile.community_points || 0
      const totalPoints = selfCarePoints + communityPoints

      // Generate recent activity (last 7 days) - mock data for now
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        // Simulate activity based on user's streak and points
        const activityChance = Math.min(0.8, (profile.current_streak || 0) / 10)
        return Math.random() < activityChance
      })

      return {
        id: profile.id,
        username: profile.username || `User${profile.id.slice(0, 8)}`,
        avatar_url: profile.avatar_url,
        selfCarePoints,
        communityPoints,
        totalPoints,
        rank: index + 1,
        streak: profile.current_streak || 0,
        recentActivity,
      }
    })

    // Sort by total points (descending) and update ranks
    users.sort((a, b) => b.totalPoints - a.totalPoints)
    users.forEach((user, index) => {
      user.rank = index + 1
    })

    // Calculate community stats
    const totalUsers = users.length
    const totalPoints = users.reduce((sum, user) => sum + user.totalPoints, 0)
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0

    // Count users active today (mock - users with recent activity)
    const activeToday = users.filter((user) => user.recentActivity[user.recentActivity.length - 1]).length

    const stats = {
      totalUsers,
      totalPoints,
      averagePoints,
      activeToday,
    }

    const response = {
      users: users.slice(0, 50), // Limit to top 50
      stats,
    }

    console.log("✅ API: Returning leaderboard data:", {
      userCount: response.users.length,
      stats: response.stats,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ API: Leaderboard error:", error)

    // Return empty data structure instead of error
    return NextResponse.json({
      users: [],
      stats: {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        activeToday: 0,
      },
    })
  }
}
