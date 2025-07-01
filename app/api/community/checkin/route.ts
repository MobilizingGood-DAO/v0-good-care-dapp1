import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, mood, gratitude, isPublic = false } = body

    if (!userId || !username || mood === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user's last check-in to calculate streak
    const { data: lastCheckin } = await supabase
      .from("community_checkins")
      .select("created_at, current_streak")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Calculate streak
    let currentStreak = 1
    if (lastCheckin) {
      const lastCheckinDate = new Date(lastCheckin.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Check if last check-in was yesterday
      const lastCheckinDateOnly = lastCheckinDate.toDateString()
      const yesterdayDateOnly = yesterday.toDateString()

      if (lastCheckinDateOnly === yesterdayDateOnly) {
        currentStreak = (lastCheckin.current_streak || 0) + 1
      } else if (lastCheckinDate.toDateString() === today.toDateString()) {
        // Already checked in today, don't allow duplicate
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
      }
      // If gap > 1 day, streak resets to 1
    }

    // Calculate points
    let pointsEarned = 10 // Base points
    if (gratitude && gratitude.trim().length > 0) {
      pointsEarned += 5 // Gratitude bonus
    }

    // Streak bonus (up to 10 extra points)
    const streakBonus = Math.min(currentStreak - 1, 10)
    pointsEarned += streakBonus

    // Insert check-in
    const { data: checkin, error: checkinError } = await supabase
      .from("community_checkins")
      .insert({
        user_id: userId,
        username,
        mood: Number.parseInt(mood),
        gratitude: gratitude || null,
        is_public: isPublic,
        current_streak: currentStreak,
        points_earned: pointsEarned,
      })
      .select()
      .single()

    if (checkinError) {
      console.error("Error creating check-in:", checkinError)
      throw checkinError
    }

    // Update user's total points and streak
    const { error: updateError } = await supabase.from("community_users").upsert({
      id: userId,
      username,
      current_streak: currentStreak,
      total_points: supabase.rpc("increment_user_points", { user_id: userId, points: pointsEarned }),
      last_checkin: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Error updating user stats:", updateError)
      // Don't throw here, check-in was successful
    }

    return NextResponse.json({
      success: true,
      message: `Check-in successful! Earned ${pointsEarned} points. Current streak: ${currentStreak} days.`,
      checkin,
      pointsEarned,
      currentStreak,
    })
  } catch (error) {
    console.error("Error processing check-in:", error)
    return NextResponse.json(
      {
        error: "Failed to process check-in",
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const username = searchParams.get("username")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let query = supabase.from("community_checkins").select("*").order("created_at", { ascending: false }).limit(limit)

    if (userId) {
      query = query.eq("user_id", userId)
    } else if (username) {
      query = query.eq("username", username)
    }

    const { data: checkins, error } = await query

    if (error) {
      console.error("Error fetching check-ins:", error)
      throw error
    }

    return NextResponse.json({
      checkins: checkins || [],
      success: true,
    })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch check-ins",
        checkins: [],
        success: false,
      },
      { status: 500 },
    )
  }
}
