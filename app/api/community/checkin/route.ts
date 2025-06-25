import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, mood, moodLabel, gratitudeNote } = await request.json()

    if (!walletAddress || !mood || !moodLabel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user
    const { data: user, error: getUserError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single()

    if (getUserError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if already checked in today
    const { data: existingCheckin } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    if (existingCheckin) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Calculate streak and points
    const streak = await calculateStreak(user.id)
    const newStreak = streak + 1
    const basePoints = 10
    const gratitudeBonus = gratitudeNote ? 5 : 0
    const streakMultiplier = getStreakMultiplier(newStreak)
    const points = Math.floor((basePoints + gratitudeBonus) * streakMultiplier)

    // Insert check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: user.id,
        date: today,
        mood: mood,
        mood_label: moodLabel,
        points: points,
        streak: newStreak,
        gratitude_note: gratitudeNote,
      })
      .select()
      .single()

    if (checkInError) {
      console.error("Error creating check-in:", checkInError)
      return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkIn,
      points,
      streak: newStreak,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateStreak(userId: string): Promise<number> {
  try {
    const { data: recentCheckins, error } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(30)

    if (error || !recentCheckins || recentCheckins.length === 0) {
      return 0
    }

    let streak = 0
    const today = new Date()

    for (let i = 0; i < recentCheckins.length; i++) {
      const checkinDate = new Date(recentCheckins[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i - 1)

      if (checkinDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error("Error calculating streak:", error)
    return 0
  }
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 14) return 2.0
  if (streak >= 7) return 1.5
  if (streak >= 3) return 1.25
  return 1.0
}
