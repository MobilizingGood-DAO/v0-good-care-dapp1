import { supabase } from "./supabase"
import { DatabaseService } from "./database-service"
import { LocalStorageService, type LocalUser, type LocalUserStats, type LocalCheckin } from "./local-storage-service"

export interface CarePointsData {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  lastCheckIn: string | null
  checkInHistory: CheckInRecord[]
  totalCheckIns: number
}

export interface CheckInRecord {
  id: string
  date: string
  mood: number
  moodLabel: string
  points: number
  streak: number
  gratitudeNote?: string
  resourcesViewed: string[]
  timestamp: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  totalPoints: number
  currentStreak: number
  level: number
  avatar?: string
  rank: number
}

// Calculate level based on total points
export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1
  if (totalPoints < 300) return 2
  if (totalPoints < 600) return 3
  if (totalPoints < 1000) return 4
  if (totalPoints < 1500) return 5
  return Math.floor(totalPoints / 300) + 1
}

// Calculate points for a check-in
export function calculateCheckInPoints(streak: number, mood: number, hasGratitude: boolean): number {
  const basePoints = 10
  const streakBonus = Math.min(streak * 2, 20) // Max 20 bonus points
  const moodBonus = mood >= 4 ? 5 : 0 // Bonus for positive mood
  const gratitudeBonus = hasGratitude ? 3 : 0
  return basePoints + streakBonus + moodBonus + gratitudeBonus
}

// Get level progress (0-100%)
export function getLevelProgress(totalPoints: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevel(totalPoints)
  const currentLevelThreshold = getLevelThreshold(currentLevel)
  const nextLevelThreshold = getLevelThreshold(currentLevel + 1)

  const progress = ((totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100

  return {
    current: currentLevel,
    next: currentLevel + 1,
    progress: Math.min(Math.max(progress, 0), 100),
  }
}

function getLevelThreshold(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 300
  if (level === 4) return 600
  if (level === 5) return 1000
  if (level === 6) return 1500
  return 1500 + (level - 6) * 300
}

// CARE Points service class with Supabase and localStorage fallback
export class SupabaseCareService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Initialize user in database if not exists
  async initializeUser(walletAddress: string, email?: string): Promise<void> {
    try {
      // Try database first
      const dbResult = await DatabaseService.safeQuery(
        async () => {
          const { data: existingUser, error } = await supabase.from("users").select("id").eq("id", this.userId).single()

          return { data: existingUser, error }
        },
        () => LocalStorageService.getUser(this.userId),
      )

      if (dbResult.success && dbResult.data) {
        // User exists in database
        return
      }

      if (dbResult.isOffline) {
        // Working offline - check localStorage
        const localUser = LocalStorageService.getUser(this.userId)
        if (!localUser) {
          // Create user in localStorage
          const newUser: LocalUser = {
            id: this.userId,
            username: `User_${walletAddress.slice(-6)}`,
            walletAddress,
            email,
            authMethod: "wallet",
            avatar: LocalStorageService.generateAvatar(`User_${walletAddress.slice(-6)}`),
            createdAt: new Date().toISOString(),
          }
          LocalStorageService.saveUser(newUser)

          // Create user stats
          const newStats: LocalUserStats = {
            userId: this.userId,
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            level: 1,
            totalCheckins: 0,
            lastCheckin: null,
          }
          LocalStorageService.saveUserStats(newStats)
        }
        return
      }

      // Try to create user in database
      await DatabaseService.safeInsert(async () => {
        const { error: userError } = await supabase.from("users").insert({
          id: this.userId,
          wallet_address: walletAddress,
          email,
          username: `User_${walletAddress.slice(-6)}`,
          avatar: LocalStorageService.generateAvatar(`User_${walletAddress.slice(-6)}`),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (userError) throw userError

        const { error: statsError } = await supabase.from("user_stats").insert({
          user_id: this.userId,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          level: 1,
          total_checkins: 0,
          last_checkin: null,
          updated_at: new Date().toISOString(),
        })

        if (statsError) throw statsError

        return { data: true, error: null }
      })
    } catch (error) {
      console.error("Error initializing user:", error)
      // Fallback to localStorage
      const newUser: LocalUser = {
        id: this.userId,
        username: `User_${walletAddress.slice(-6)}`,
        walletAddress,
        email,
        authMethod: "wallet",
        avatar: LocalStorageService.generateAvatar(`User_${walletAddress.slice(-6)}`),
        createdAt: new Date().toISOString(),
      }
      LocalStorageService.saveUser(newUser)

      const newStats: LocalUserStats = {
        userId: this.userId,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        totalCheckins: 0,
        lastCheckin: null,
      }
      LocalStorageService.saveUserStats(newStats)
    }
  }

  // Load user's CARE Points data
  async loadData(): Promise<CarePointsData> {
    try {
      // Try to get user stats from database
      const statsResult = await DatabaseService.safeQuery(
        async () => {
          const { data: stats, error } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", this.userId)
            .single()

          return { data: stats, error }
        },
        () => LocalStorageService.getUserStats(this.userId),
      )

      // Try to get check-ins from database
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const checkInsResult = await DatabaseService.safeQuery(
        async () => {
          const { data: checkIns, error } = await supabase
            .from("checkins")
            .select("*")
            .eq("user_id", this.userId)
            .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
            .order("date", { ascending: false })

          return { data: checkIns, error }
        },
        () => {
          const localCheckins = LocalStorageService.getCheckins(this.userId)
          return localCheckins.filter((c) => new Date(c.date) >= thirtyDaysAgo)
        },
      )

      // Use database data if available, otherwise use localStorage
      const stats = statsResult.data || {
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        level: 1,
        total_checkins: 0,
        last_checkin: null,
      }

      const checkIns = checkInsResult.data || []

      const checkInHistory: CheckInRecord[] = checkIns.map((checkIn: any) => ({
        id: checkIn.id,
        date: checkIn.date,
        mood: Number.parseInt(checkIn.mood),
        moodLabel: checkIn.mood_label || checkIn.mood,
        points: checkIn.points,
        streak: checkIn.streak,
        gratitudeNote: checkIn.gratitude_note || checkIn.gratitude,
        resourcesViewed: checkIn.resources_viewed || [],
        timestamp: checkIn.created_at || checkIn.date,
      }))

      return {
        totalPoints: stats.total_points || 0,
        currentStreak: stats.current_streak || 0,
        longestStreak: stats.longest_streak || 0,
        level: stats.level || 1,
        lastCheckIn: stats.last_checkin,
        checkInHistory,
        totalCheckIns: stats.total_checkins || 0,
      }
    } catch (error) {
      console.error("Error loading CARE Points data:", error)

      // Fallback to localStorage
      const localStats = LocalStorageService.getUserStats(this.userId)
      const localCheckins = LocalStorageService.getCheckins(this.userId)

      if (localStats) {
        const checkInHistory: CheckInRecord[] = localCheckins.map((checkIn) => ({
          id: checkIn.id,
          date: checkIn.date,
          mood: Number.parseInt(checkIn.mood),
          moodLabel: checkIn.mood,
          points: checkIn.points,
          streak: 1,
          gratitudeNote: checkIn.gratitude,
          resourcesViewed: checkIn.resourcesViewed,
          timestamp: checkIn.date,
        }))

        return {
          totalPoints: localStats.totalPoints,
          currentStreak: localStats.currentStreak,
          longestStreak: localStats.longestStreak,
          level: localStats.level,
          lastCheckIn: localStats.lastCheckin,
          checkInHistory,
          totalCheckIns: localStats.totalCheckins,
        }
      }

      // Return default data
      return {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        lastCheckIn: null,
        checkInHistory: [],
        totalCheckIns: 0,
      }
    }
  }

  // Record a daily check-in
  async recordCheckIn(
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
    resourcesViewed: string[] = [],
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if already checked in today (try database first, then localStorage)
      const existingCheckInResult = await DatabaseService.safeQuery(
        async () => {
          const { data, error } = await supabase
            .from("checkins")
            .select("id")
            .eq("user_id", this.userId)
            .eq("date", today)
            .single()

          return { data, error }
        },
        () => {
          const localCheckins = LocalStorageService.getCheckins(this.userId)
          return localCheckins.find((c) => c.date === today) || null
        },
      )

      if (existingCheckInResult.data) {
        return { success: false, points: 0, newStreak: 0, error: "Already checked in today" }
      }

      // Get current stats
      const currentData = await this.loadData()

      // Calculate new streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split("T")[0]

      let newStreak = 1
      if (currentData.lastCheckIn === yesterdayString) {
        newStreak = currentData.currentStreak + 1
      }

      // Calculate points
      const points = calculateCheckInPoints(newStreak, mood, !!gratitudeNote)

      // Try to save to database
      const dbResult = await DatabaseService.safeInsert(async () => {
        // Insert check-in record
        const { error: checkInError } = await supabase.from("checkins").insert({
          user_id: this.userId,
          date: today,
          mood,
          mood_label: moodLabel,
          points,
          streak: newStreak,
          gratitude_note: gratitudeNote,
          resources_viewed: resourcesViewed,
          created_at: new Date().toISOString(),
        })

        if (checkInError) throw checkInError

        // Update user stats
        const newTotalPoints = currentData.totalPoints + points
        const newLevel = calculateLevel(newTotalPoints)

        const { error: statsError } = await supabase
          .from("user_stats")
          .update({
            total_points: newTotalPoints,
            current_streak: newStreak,
            longest_streak: Math.max(currentData.longestStreak, newStreak),
            level: newLevel,
            total_checkins: currentData.totalCheckIns + 1,
            last_checkin: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", this.userId)

        if (statsError) throw statsError

        return { data: true, error: null }
      })

      // Always save to localStorage as backup
      const localCheckin: LocalCheckin = {
        id: LocalStorageService.generateId(),
        userId: this.userId,
        mood: moodLabel,
        gratitude: gratitudeNote,
        resourcesViewed,
        points,
        date: today,
      }
      LocalStorageService.saveCheckin(localCheckin)

      // Update local stats
      const newTotalPoints = currentData.totalPoints + points
      const updatedStats: LocalUserStats = {
        userId: this.userId,
        totalPoints: newTotalPoints,
        currentStreak: newStreak,
        longestStreak: Math.max(currentData.longestStreak, newStreak),
        level: calculateLevel(newTotalPoints),
        totalCheckins: currentData.totalCheckIns + 1,
        lastCheckin: today,
      }
      LocalStorageService.saveUserStats(updatedStats)

      return { success: true, points, newStreak }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return { success: false, points: 0, newStreak: 0, error: "Failed to record check-in" }
    }
  }

  // Check if user can check in today
  async canCheckInToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Try database first
      const dbResult = await DatabaseService.safeQuery(
        async () => {
          const { data, error } = await supabase
            .from("checkins")
            .select("id")
            .eq("user_id", this.userId)
            .eq("date", today)
            .single()

          return { data, error }
        },
        () => {
          const localCheckins = LocalStorageService.getCheckins(this.userId)
          return localCheckins.find((c) => c.date === today) || null
        },
      )

      return !dbResult.data
    } catch (error) {
      // If error, assume user can check in
      return true
    }
  }

  // Update user profile
  async updateProfile(updates: { username?: string; bio?: string; avatar?: string }): Promise<boolean> {
    try {
      const dbResult = await DatabaseService.safeInsert(async () => {
        const { error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", this.userId)

        return { data: !error, error }
      })

      // Always update localStorage
      const localUser = LocalStorageService.getUser(this.userId)
      if (localUser) {
        const updatedUser = { ...localUser, ...updates }
        LocalStorageService.saveUser(updatedUser)
      }

      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Get user profile
  async getProfile(): Promise<{ username?: string; bio?: string; avatar?: string } | null> {
    try {
      const dbResult = await DatabaseService.safeQuery(
        async () => {
          const { data, error } = await supabase
            .from("users")
            .select("username, bio, avatar")
            .eq("id", this.userId)
            .single()

          return { data, error }
        },
        () => {
          const localUser = LocalStorageService.getUser(this.userId)
          return localUser
            ? {
                username: localUser.username,
                bio: undefined,
                avatar: localUser.avatar,
              }
            : null
        },
      )

      return dbResult.data
    } catch (error) {
      console.error("Error getting profile:", error)
      return null
    }
  }
}

// Get community leaderboard
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const dbResult = await DatabaseService.safeQuery(
      async () => {
        const { data, error } = await supabase
          .from("user_stats")
          .select(`
            user_id,
            total_points,
            current_streak,
            level,
            users!inner(username, avatar)
          `)
          .order("total_points", { ascending: false })
          .limit(limit)

        return { data, error }
      },
      () => {
        // Fallback to localStorage leaderboard
        const allStats = LocalStorageService.getAllUserStats()
        const allUsers = LocalStorageService.getUsers()

        return allStats
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, limit)
          .map((stats) => {
            const user = allUsers.find((u) => u.id === stats.userId)
            return {
              user_id: stats.userId,
              total_points: stats.totalPoints,
              current_streak: stats.currentStreak,
              level: stats.level,
              users: {
                username: user?.username || `User_${stats.userId.slice(-6)}`,
                avatar: user?.avatar || "🌟",
              },
            }
          })
      },
    )

    const data = dbResult.data || []

    return data.map((entry: any, index: number) => ({
      userId: entry.user_id,
      username: entry.users?.username || `User_${entry.user_id.slice(-6)}`,
      totalPoints: entry.total_points,
      currentStreak: entry.current_streak,
      level: entry.level,
      avatar: entry.users?.avatar,
      rank: index + 1,
    }))
  } catch (error) {
    console.error("Error getting leaderboard:", error)
    return []
  }
}
