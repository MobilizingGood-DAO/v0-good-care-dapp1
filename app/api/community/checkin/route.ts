import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mood, gratitude, isPublic = false } = body

    if (!userId || !mood) {
      return NextResponse.json({ error: "User ID and mood are required" }, { status: 400 })
    }

    console.log("✅ Processing check-in:", { userId, mood, gratitude: !!gratitude, isPublic })

    const today = new Date().toISOString().split("T")[0]

    // Check if user already checked in today
    const { data: existingCheckin, error: checkError } = await supabase
      .from("user_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing check-in:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingCheckin) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Get user's streak information
    const { data: recentCheckins, error: streakError } = await supabase
      .from("user_checkins")
      .select("checkin_date")
      .eq("user_id", userId)
      .order("checkin_date", { ascending: false })
      .limit(30)

    if (streakError) {
      console.error("❌ Error fetching streak data:", streakError)
    }

    // Calculate current streak
    let currentStreak = 0
    if (recentCheckins && recentCheckins.length > 0) {
      const dates = recentCheckins
        .map((c) => c.checkin_date)
        .sort()
        .reverse()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      // Check if yesterday was a check-in day
      if (dates[0] === yesterdayStr) {
        currentStreak = 1
        // Count consecutive days
        for (let i = 1; i < dates.length; i++) {
          const expectedDate = new Date(yesterday)
          expectedDate.setDate(expectedDate.getDate() - i)
          const expectedDateStr = expectedDate.toISOString().split("T")[0]

          if (dates[i] === expectedDateStr) {
            currentStreak++
          } else {
            break
          }
        }
      }
    }

    const newStreak = currentStreak + 1

    // Calculate points
    let points = 10 // Base points
    if (gratitude && gratitude.trim()) {
      points += 5 // Gratitude bonus
    }

    // Streak bonus (up to 10 additional points)
    const streakBonus = Math.min(newStreak - 1, 10)
    points += streakBonus

    // Create check-in record
    const { data: checkin, error: insertError } = await supabase
      .from("user_checkins")
      .insert({
        user_id: userId,
        mood,
        gratitude: gratitude || null,
        is_public: isPublic,
        points,
        streak: newStreak,
        checkin_date: today,
      })
      .select()
      .single()

    if (insertError) {
      console.error("❌ Error creating check-in:", insertError)
      return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
    }

    // Update user profile with latest check-in info
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        last_checkin_date: today,
        current_streak: newStreak,
        total_checkins: supabase.rpc("increment_checkins", { user_id: userId }),
      })
      .eq("user_id", userId)

    if (profileError) {
      console.error("❌ Error updating profile:", profileError)
      // Don't fail the request, just log the error
    }

    console.log("🎉 Check-in completed:", {
      userId,
      points,
      streak: newStreak,
      streakBonus,
    })

    return NextResponse.json({
      success: true,
      checkin,
      points,
      streak: newStreak,
      streakBonus,
      message: `Check-in complete! +${points} points (${streakBonus} streak bonus)`,
    })
  } catch (error) {
    console.error("💥 Check-in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Fetch recent public gratitudes for community inspiration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log("🌟 Fetching public gratitudes...")

    const { data: publicGratitudes, error } = await supabase
      .from("user_checkins")
      .select(`
        gratitude,
        mood,
        checkin_date,
        user_profiles!inner(username)
      `)
      .eq("is_public", true)
      .not("gratitude", "is", null)
      .order("checkin_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("❌ Error fetching public gratitudes:", error)
      return NextResponse.json({ error: "Failed to fetch gratitudes" }, { status: 500 })
    }

    console.log("✅ Public gratitudes fetched:", publicGratitudes?.length || 0)

    return NextResponse.json({
      gratitudes: publicGratitudes || [],
    })
  } catch (error) {
    console.error("💥 Public gratitudes GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
