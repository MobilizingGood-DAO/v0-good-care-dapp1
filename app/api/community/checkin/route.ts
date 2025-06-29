import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, mood, moodLabel, gratitudeNote } = await request.json()

    if (!walletAddress || mood === undefined || !moodLabel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single()

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          wallet_address: walletAddress,
          username: `User_${walletAddress.slice(-6)}`,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      user = newUser

      // Initialize user stats
      await supabase.from("user_stats").insert({
        user_id: user.id,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        level: 1,
        total_checkins: 0,
      })
    } else if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Check if user already checked in today
    const today = new Date().toISOString().split("T")[0]
    const { data: existingCheckin, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    if (checkinError && checkinError.code !== "PGRST116") {
      console.error("Error checking existing checkin:", checkinError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCheckin) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Get user's current stats
    let { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (statsError && statsError.code === "PGRST116") {
      // Create initial stats if they don't exist
      const { data: newStats, error: createStatsError } = await supabase
        .from("user_stats")
        .insert({
          user_id: user.id,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          level: 1,
          total_checkins: 0,
        })
        .select()
        .single()

      if (createStatsError) {
        console.error("Error creating user stats:", createStatsError)
        return NextResponse.json({ error: "Failed to create user stats" }, { status: 500 })
      }

      userStats = newStats
    } else if (statsError) {
      console.error("Error fetching user stats:", statsError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Calculate streak
    let newStreak = 1
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (userStats.last_checkin === yesterdayStr) {
      newStreak = userStats.current_streak + 1
    } else if (userStats.last_checkin === today) {
      newStreak = userStats.current_streak
    }

    // Calculate points
    const basePoints = 10
    const gratitudeBonus = gratitudeNote ? 5 : 0
    let streakMultiplier = 1

    if (newStreak >= 14) {
      streakMultiplier = 2.0
    } else if (newStreak >= 7) {
      streakMultiplier = 1.5
    } else if (newStreak >= 3) {
      streakMultiplier = 1.25
    }

    const finalPoints = Math.floor((basePoints + gratitudeBonus) * streakMultiplier)

    // Record the check-in
    const { data: checkin, error: insertError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: user.id,
        date: today,
        mood: mood,
        mood_label: moodLabel,
        points: finalPoints,
        streak: newStreak,
        gratitude_note: gratitudeNote,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting checkin:", insertError)
      return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 })
    }

    // Update user stats
    const newTotalPoints = userStats.total_points + finalPoints
    const newLevel = Math.max(1, Math.floor(newTotalPoints / 100) + 1)

    const { error: updateStatsError } = await supabase
      .from("user_stats")
      .update({
        total_points: newTotalPoints,
        current_streak: newStreak,
        longest_streak: Math.max(userStats.longest_streak, newStreak),
        level: newLevel,
        total_checkins: userStats.total_checkins + 1,
        last_checkin: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (updateStatsError) {
      console.error("Error updating user stats:", updateStatsError)
      return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      points: finalPoints,
      streak: newStreak,
      checkin: checkin,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
