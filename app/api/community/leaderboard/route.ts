import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get self-care points from daily check-ins
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .select(`
        user_id,
        users!inner(username, avatar),
        points,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (checkinError) {
      console.error("Error fetching checkin data:", checkinError)
    }

    // Get community objective points
    const { data: objectiveData, error: objectiveError } = await supabase
      .from("care_objectives")
      .select(`
        user_id,
        username,
        points,
        status
      `)
      .eq("status", "completed")

    if (objectiveError) {
      console.error("Error fetching objective data:", objectiveError)
    }

    // Aggregate points by user
    const userStats = new Map()

    // Process self-care points from check-ins
    if (checkinData) {
      checkinData.forEach((checkin) => {
        const userId = checkin.user_id
        const username = checkin.users?.username || "Anonymous"
        const avatar = checkin.users?.avatar || ""

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId,
            username,
            avatar,
            selfCarePoints: 0,
            objectivePoints: 0,
            totalPoints: 0,
            totalCheckins: 0,
            lastCheckin: null,
            currentStreak: 0,
          })
        }

        const user = userStats.get(userId)
        user.selfCarePoints += checkin.points || 10
        user.totalCheckins += 1

        if (!user.lastCheckin || new Date(checkin.created_at) > new Date(user.lastCheckin)) {
          user.lastCheckin = checkin.created_at
        }
      })
    }

    // Process community objective points
    if (objectiveData) {
      objectiveData.forEach((objective) => {
        const userId = objective.user_id
        const username = objective.username

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId,
            username,
            avatar: "",
            selfCarePoints: 0,
            objectivePoints: 0,
            totalPoints: 0,
            totalCheckins: 0,
            lastCheckin: null,
            currentStreak: 0,
          })
        }

        const user = userStats.get(userId)
        user.objectivePoints += objective.points || 0
      })
    }

    // Calculate total points and streaks
    const leaderboard = Array.from(userStats.values()).map((user) => {
      user.totalPoints = user.selfCarePoints + user.objectivePoints

      // Calculate current streak (simplified)
      user.currentStreak = Math.floor(user.totalCheckins / 7) + 1

      return user
    })

    // Sort by total points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)

    // Add rank
    leaderboard.forEach((user, index) => {
      user.rank = index + 1
    })

    // Calculate stats
    const stats = {
      totalUsers: leaderboard.length,
      totalSelfCarePoints: leaderboard.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalObjectivePoints: leaderboard.reduce((sum, user) => sum + user.objectivePoints, 0),
      totalPoints: leaderboard.reduce((sum, user) => sum + user.totalPoints, 0),
      averagePointsPerUser:
        leaderboard.length > 0
          ? Math.round(leaderboard.reduce((sum, user) => sum + user.totalPoints, 0) / leaderboard.length)
          : 0,
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      stats,
    })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard data",
        leaderboard: [],
        stats: {
          totalUsers: 0,
          totalSelfCarePoints: 0,
          totalObjectivePoints: 0,
          totalPoints: 0,
          averagePointsPerUser: 0,
        },
      },
      { status: 500 },
    )
  }
}
