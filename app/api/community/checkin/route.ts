import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, mood, moodLabel, gratitudeNote } = await request.json()

    if (!walletAddress || !mood || !moodLabel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if user already checked in today
    const { data: existingCheckin, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("id")
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

    // Get current stats to calculate streak
    const { data: currentStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching stats:", statsError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Calculate streak
    let newStreak = 1
    if (currentStats?.last_checkin) {
      const lastCheckin = new Date(currentStats.last_checkin)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastCheckin.toDateString() === yesterday.toDateString()) {
        newStreak = (currentStats.current_streak || 0) + 1
      }
    }

    // Calculate points
    const basePoints = 10
    const gratitudeBonus = gratitudeNote ? 5 : 0
    let streakMultiplier = 1

    if (newStreak >= 14) streakMultiplier = 2.0
    else if (newStreak >= 7) streakMultiplier = 1.5
    else if (newStreak >= 3) streakMultiplier = 1.25

    const finalPoints = Math.floor((basePoints + gratitudeBonus) * streakMultiplier)

    // Insert check-in
    const { data: checkin, error: insertError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: user.id,
        date: today,
        mood,
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
    const newTotalPoints = (currentStats?.total_points || 0) + finalPoints
    const newTotalCheckins = (currentStats?.total_checkins || 0) + 1
    const newLevel = Math.floor(newTotalPoints / 100) + 1
    const newLongestStreak = Math.max(currentStats?.longest_streak || 0, newStreak)

    const { error: updateStatsError } = await supabase.from("user_stats").upsert({
      user_id: user.id,
      total_points: newTotalPoints,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      level: newLevel,
      total_checkins: newTotalCheckins,
      last_checkin: today,
      updated_at: new Date().toISOString(),
    })

    if (updateStatsError) {
      console.error("Error updating stats:", updateStatsError)
    }

    return NextResponse.json({
      success: true,
      points: finalPoints,
      streak: newStreak,
      checkin,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
