import { supabase } from "./supabase"

export interface UserMoodData {
  recentMood: number | null
  recentCheckIn: string | null
  moodTrend: "improving" | "stable" | "declining" | "unknown"
  averageMood: number | null
}

export class UserMoodService {
  static async getUserMoodData(userId: string): Promise<UserMoodData> {
    try {
      // Get the most recent check-in
      const { data: recentCheckIn } = await supabase
        .from("checkins")
        .select("emoji_rating, timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      // Get last 7 days of check-ins for trend analysis
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentCheckIns } = await supabase
        .from("checkins")
        .select("emoji_rating, timestamp")
        .eq("user_id", userId)
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: false })
        .limit(7)

      // Calculate average mood
      let averageMood = null
      if (recentCheckIns && recentCheckIns.length > 0) {
        const validRatings = recentCheckIns.map((c) => c.emoji_rating).filter((rating) => rating !== null)

        if (validRatings.length > 0) {
          averageMood = Math.round(validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length)
        }
      }

      // Calculate trend
      let moodTrend: "improving" | "stable" | "declining" | "unknown" = "unknown"
      if (recentCheckIns && recentCheckIns.length >= 3) {
        const recent3 = recentCheckIns
          .slice(0, 3)
          .map((c) => c.emoji_rating)
          .filter((r) => r !== null)
        if (recent3.length >= 3) {
          const firstHalf = recent3.slice(0, Math.ceil(recent3.length / 2))
          const secondHalf = recent3.slice(Math.ceil(recent3.length / 2))

          const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length

          if (firstAvg > secondAvg + 0.5) {
            moodTrend = "improving"
          } else if (secondAvg > firstAvg + 0.5) {
            moodTrend = "declining"
          } else {
            moodTrend = "stable"
          }
        }
      }

      return {
        recentMood: recentCheckIn?.emoji_rating || null,
        recentCheckIn: recentCheckIn?.timestamp || null,
        moodTrend,
        averageMood,
      }
    } catch (error) {
      console.error("Error fetching user mood data:", error)
      return {
        recentMood: null,
        recentCheckIn: null,
        moodTrend: "unknown",
        averageMood: null,
      }
    }
  }
}
