import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, mood, gratitude, isPublic = true } = body

    console.log("📝 API: Processing check-in for user:", userId)

    if (!userId || mood === undefined) {
      return NextResponse.json({ error: "Missing required fields: userId and mood" }, { status: 400 })
    }

    // Calculate points based on check-in
    const basePoints = 10 // Base points for daily check-in
    const gratitudeBonus = gratitude ? 5 : 0 // Bonus for gratitude
    const totalPoints = basePoints + gratitudeBonus

    // Insert check-in record
    const { data: checkin, error: checkinError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: userId,
        mood_rating: mood,
        gratitude_note: gratitude,
        points_earned: totalPoints,
        is_public: isPublic,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (checkinError) {
      console.error("❌ Error inserting check-in:", checkinError)
      throw checkinError
    }

    // Update user profile with new points and streak
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("self_care_points, current_streak, total_checkins, last_checkin_date")
      .eq("user_id", userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ Error fetching profile:", profileError)
      throw profileError
    }

    // Calculate new streak
    const today = new Date().toDateString()
    const lastCheckin = profile?.last_checkin_date ? new Date(profile.last_checkin_date).toDateString() : null
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    let newStreak = 1
    if (lastCheckin === yesterday) {
      newStreak = (profile?.current_streak || 0) + 1
    } else if (lastCheckin === today) {
      newStreak = profile?.current_streak || 1 // Same day check-in
    }

    // Streak bonus (up to 10 points for streaks >= 7 days)
    const streakBonus = Math.min(Math.floor(newStreak / 7) * 5, 10)
    const finalPoints = totalPoints + streakBonus

    // Update or insert user profile
    const { error: updateError } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      username: username || `User${userId.slice(-4)}`,
      self_care_points: (profile?.self_care_points || 0) + finalPoints,
      current_streak: newStreak,
      total_checkins: (profile?.total_checkins || 0) + 1,
      last_checkin_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      console.error("❌ Error updating profile:", updateError)
      throw updateError
    }

    console.log("✅ API: Check-in processed successfully:", {
      userId,
      points: finalPoints,
      streak: newStreak,
    })

    return NextResponse.json({
      success: true,
      message: `Check-in successful! Earned ${finalPoints} points (${newStreak} day streak)`,
      data: {
        checkinId: checkin.id,
        pointsEarned: finalPoints,
        currentStreak: newStreak,
        totalCheckins: (profile?.total_checkins || 0) + 1,
      },
    })
  } catch (error) {
    console.error("❌ API: Error in check-in route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process check-in",
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

    let query = supabase.from("daily_checkins").select("*").order("created_at", { ascending: false }).limit(limit)

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
