// CARE Points service for managing user points and streaks
export interface CarePointsData {
  userId: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastCheckIn: string | null
  checkInHistory: CheckInEntry[]
  level: number
  nextLevelPoints: number
}

export interface CheckInEntry {
  date: string
  points: number
  mood: string
  gratitudeNote?: string
  resourcesViewed: string[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  totalPoints: number
  currentStreak: number
  level: number
  rank: number
}

// Calculate points based on streak and engagement
export function calculateCheckInPoints(
  streak: number,
  engagement: {
    hasGratitudeNote: boolean
    resourcesViewed: number
    moodRating: number
  },
): number {
  let basePoints = 10

  // Streak bonuses
  if (streak >= 7) basePoints += 5 // Week streak
  if (streak >= 30) basePoints += 10 // Month streak
  if (streak >= 100) basePoints += 20 // Century streak

  // Engagement bonuses
  if (engagement.hasGratitudeNote) basePoints += 3
  if (engagement.resourcesViewed > 0) basePoints += 2
  if (engagement.moodRating >= 4) basePoints += 2 // Positive mood bonus

  return basePoints
}

// Calculate user level based on total points
export function calculateLevel(totalPoints: number): { level: number; nextLevelPoints: number } {
  // Level progression: 0-99 (Level 1), 100-299 (Level 2), 300-599 (Level 3), etc.
  const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1
  const nextLevelPoints = Math.pow(level, 2) * 100

  return { level, nextLevelPoints }
}

// Get today's date as YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split("T")[0]

// Check if user can check in today
export function canCheckInToday(lastCheckIn: string | null): boolean {
  if (!lastCheckIn) return true
  return lastCheckIn !== getTodayString()
}

// Calculate streak based on check-in history
export function calculateStreak(checkInHistory: CheckInEntry[]): number {
  if (checkInHistory.length === 0) return 0

  const sortedHistory = [...checkInHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let streak = 0
  let currentDate = new Date()

  for (const entry of sortedHistory) {
    const entryDate = new Date(entry.date)
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
      currentDate = entryDate
    } else {
      break
    }
  }

  return streak
}

// In-memory storage for MVP (replace with Supabase later)
const userCarePoints = new Map<string, CarePointsData>()

export async function getUserCarePoints(userId: string): Promise<CarePointsData> {
  const existing = userCarePoints.get(userId)

  if (existing) {
    return existing
  }

  // Initialize new user
  const newData: CarePointsData = {
    userId,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    checkInHistory: [],
    level: 1,
    nextLevelPoints: 100,
  }

  userCarePoints.set(userId, newData)
  return newData
}

export async function recordCheckIn(
  userId: string,
  checkInData: {
    mood: string
    gratitudeNote?: string
    resourcesViewed: string[]
    moodRating: number
  },
): Promise<CarePointsData> {
  const userData = await getUserCarePoints(userId)

  if (!canCheckInToday(userData.lastCheckIn)) {
    throw new Error("Already checked in today")
  }

  const today = getTodayString()
  const isConsecutiveDay = userData.lastCheckIn === new Date(Date.now() - 86400000).toISOString().split("T")[0]

  const newStreak = isConsecutiveDay ? userData.currentStreak + 1 : 1
  const points = calculateCheckInPoints(newStreak, {
    hasGratitudeNote: !!checkInData.gratitudeNote,
    resourcesViewed: checkInData.resourcesViewed.length,
    moodRating: checkInData.moodRating,
  })

  const newEntry: CheckInEntry = {
    date: today,
    points,
    mood: checkInData.mood,
    gratitudeNote: checkInData.gratitudeNote,
    resourcesViewed: checkInData.resourcesViewed,
  }

  const newTotalPoints = userData.totalPoints + points
  const { level, nextLevelPoints } = calculateLevel(newTotalPoints)

  const updatedData: CarePointsData = {
    ...userData,
    totalPoints: newTotalPoints,
    currentStreak: newStreak,
    longestStreak: Math.max(userData.longestStreak, newStreak),
    lastCheckIn: today,
    checkInHistory: [...userData.checkInHistory, newEntry],
    level,
    nextLevelPoints,
  }

  userCarePoints.set(userId, updatedData)
  return updatedData
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const allUsers = Array.from(userCarePoints.values())

  // Sort by total points descending
  const sorted = allUsers.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit)

  return sorted.map((user, index) => ({
    userId: user.userId,
    username: `User ${user.userId.slice(-6)}`, // Placeholder - will be replaced with social username
    totalPoints: user.totalPoints,
    currentStreak: user.currentStreak,
    level: user.level,
    rank: index + 1,
  }))
}
