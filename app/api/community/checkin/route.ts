import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, mood, gratitude, isPublic = false } = body

    if (!username || !mood) {
      return NextResponse.json({ error: "Missing required fields: username, mood" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]
    const userId = `user_${username}`

    // Check if user already checked in today
    const { data: existingCheckin } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    if (existingCheckin) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Calculate points
    let points = 10 // Base points for check-in
    if (gratitude && gratitude.trim().length > 0) {
      points += 5 // Bonus for gratitude
    }

    // Get current streak to calculate streak bonus
    const { data: userStats } = await supabase
      .from("user_stats")
      .select("current_streak")
      .eq("username", username)
      .single()

    const currentStreak = (userStats?.current_streak || 0) + 1
    const streakBonus = Math.min(currentStreak, 10) // Max 10 bonus points for streak
    points += streakBonus

    // Insert check-in
    const { data: checkin, error: checkinError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: userId,
        username,
        mood,
        gratitude: gratitude || "",
        points,
        date: today,
      })
      .select()
      .single()

    if (checkinError) {
      console.error("Error creating check-in:", checkinError)
      return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
    }

    // Update user stats
    const { error: statsError } = await supabase.rpc("update_user_stats_on_checkin", {
      p_username: username,
      p_points: points,
    })

    if (statsError) {
      console.error("Error updating user stats:", statsError)
    }

    // If public, add to public gratitude
    if (isPublic && gratitude && gratitude.trim().length > 0) {
      await supabase.from("public_gratitude").insert({
        user_id: userId,
        username,
        gratitude,
        mood,
      })
    }

    return NextResponse.json({
      checkin,
      points,
      streak: currentStreak,
      message: `Check-in successful! Earned ${points} points (${streakBonus} streak bonus)`,
      success: true,
    })
  } catch (error) {
    console.error("Check-in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let query = supabase.from("daily_checkins").select("*").order("created_at", { ascending: false }).limit(limit)

    if (username) {
      query = query.eq("username", username)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({ checkins: data, success: true })
  } catch (error) {
    console.error("Check-ins GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
