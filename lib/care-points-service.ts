// CARE Points system for daily reflections
export interface CarePointsData {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  lastCheckIn: string | null
  checkInHistory: CheckInRecord[]
}

export interface CheckInRecord {
  date: string
  mood: number
  points: number
  streak: number
  reflection?: string
  timestamp: number
}

export interface LeaderboardEntry {
  address: string
  username: string
  totalPoints: number
  currentStreak: number
  level: number
  avatar?: string
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
export function calculateCheckInPoints(streak: number, mood: number): number {
  const basePoints = 10
  const streakBonus = Math.min(streak * 2, 20) // Max 20 bonus points
  const moodBonus = mood >= 4 ? 5 : 0 // Bonus for positive mood
  return basePoints + streakBonus + moodBonus
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

// CARE Points service class
export class CarePointsService {
  private storageKey: string

  constructor(address: string) {
    this.storageKey = `carePoints_${address}`
  }

  // Load user's CARE Points data
  loadData(): CarePointsData {
    if (typeof window === "undefined") {
      return this.getDefaultData()
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        return {
          ...this.getDefaultData(),
          ...data,
          level: calculateLevel(data.totalPoints || 0),
        }
      }
    } catch (error) {
      console.error("Error loading CARE Points data:", error)
    }

    return this.getDefaultData()
  }

  // Save user's CARE Points data
  saveData(data: CarePointsData): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving CARE Points data:", error)
    }
  }

  // Record a daily check-in
  recordCheckIn(mood: number, reflection?: string): { success: boolean; points: number; newStreak: number } {
    const data = this.loadData()
    const today = new Date().toISOString().split("T")[0]

    // Check if already checked in today
    if (data.lastCheckIn === today) {
      return { success: false, points: 0, newStreak: data.currentStreak }
    }

    // Calculate new streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split("T")[0]

    let newStreak = 1
    if (data.lastCheckIn === yesterdayString) {
      newStreak = data.currentStreak + 1
    }

    // Calculate points
    const points = calculateCheckInPoints(newStreak, mood)

    // Create check-in record
    const checkInRecord: CheckInRecord = {
      date: today,
      mood,
      points,
      streak: newStreak,
      reflection,
      timestamp: Date.now(),
    }

    // Update data
    const updatedData: CarePointsData = {
      totalPoints: data.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(data.longestStreak, newStreak),
      level: calculateLevel(data.totalPoints + points),
      lastCheckIn: today,
      checkInHistory: [...data.checkInHistory, checkInRecord],
    }

    this.saveData(updatedData)

    return { success: true, points, newStreak }
  }

  // Check if user can check in today
  canCheckInToday(): boolean {
    const data = this.loadData()
    const today = new Date().toISOString().split("T")[0]
    return data.lastCheckIn !== today
  }

  private getDefaultData(): CarePointsData {
    return {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      lastCheckIn: null,
      checkInHistory: [],
    }
  }
}

// Mock leaderboard data (in production, this would come from a database)
export function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      address: "0x1234...5678",
      username: "CareGiver42",
      totalPoints: 1250,
      currentStreak: 15,
      level: 5,
      avatar: "🌱",
    },
    {
      address: "0x2345...6789",
      username: "MindfulSoul",
      totalPoints: 980,
      currentStreak: 8,
      level: 4,
      avatar: "🧘",
    },
    {
      address: "0x3456...7890",
      username: "HealingHeart",
      totalPoints: 750,
      currentStreak: 12,
      level: 3,
      avatar: "💚",
    },
    {
      address: "0x4567...8901",
      username: "WellnessWarrior",
      totalPoints: 650,
      currentStreak: 5,
      level: 3,
      avatar: "⭐",
    },
    {
      address: "0x5678...9012",
      username: "CompassionateOne",
      totalPoints: 420,
      currentStreak: 3,
      level: 2,
      avatar: "🤗",
    },
  ]
}
