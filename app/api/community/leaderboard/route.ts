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

    console.log(`📊 Fetched ${profiles?.length || 0} user profiles`)

    // Fetch recent check-ins for activity indicators (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentCheckins, error: checkinsError } = await supabase
      .from("daily_checkins")
      .select("user_id, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())

    if (checkinsError) {
      console.error("❌ Error fetching recent check-ins:", checkinsError)
    }

    // Process users and calculate rankings
    const users = (profiles || []).map((profile, index) => {
      const selfCarePoints = profile.self_care_points || 0
      const communityPoints = profile.community_points || 0
      const totalPoints = selfCarePoints + communityPoints

      // Generate recent activity (last 7 days)
      const userCheckins = recentCheckins?.filter((c) => c.user_id === profile.id) || []
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        return userCheckins.some((c) => c.created_at.startsWith(dateStr))
      }).reverse()

      return {
        id: profile.id,
        username: profile.username || `User ${profile.id.slice(0, 8)}`,
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

    // Count users active today
    const today = new Date().toISOString().split("T")[0]
    const { data: todayCheckins } = await supabase
      .from("daily_checkins")
      .select("user_id")
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)

    const activeToday = new Set(todayCheckins?.map((c) => c.user_id) || []).size

    const stats = {
      totalUsers,
      totalPoints,
      averagePoints,
      activeToday,
    }

    const response = {
      users: users.slice(0, 50), // Limit to top 50 users
      stats,
    }

    console.log(`✅ API: Returning leaderboard with ${response.users.length} users`)
    console.log(`📈 Stats: ${stats.totalUsers} users, ${stats.totalPoints} points, ${stats.activeToday} active today`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ API Error in leaderboard route:", error)

    // Return empty structure instead of error to prevent frontend crashes
    const emptyResponse = {
      users: [],
      stats: {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        activeToday: 0,
      },
    }

    return NextResponse.json(emptyResponse, { status: 200 })
  }
}
