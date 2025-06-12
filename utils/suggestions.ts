export const careSuggestions = {
  feelingDown: [
    "💛 Take 5 deep breaths. Exhale slowly.",
    "💛 Write down one thing that went well today.",
    "💛 Reach out to a friend or loved one.",
    "💛 Drink a glass of water and take a short walk.",
  ],
  feelingGood: [
    "💙 Celebrate your progress. Keep it up!",
    "💙 Take a moment to appreciate yourself.",
    "💙 Share your positive energy with someone.",
    "💙 Reflect on what's helping you thrive.",
  ],
}

export type MoodType = "feelingDown" | "feelingGood"

export interface CheckIn {
  timestamp: number
  mood: string
  reflection?: string
}

export const getMoodType = (mood: string): MoodType => {
  const downMoods = ["😢", "😕"]
  return downMoods.includes(mood) ? "feelingDown" : "feelingGood"
}

export const getStreakMultiplier = (streakDays: number): number => {
  if (streakDays >= 14) return 2
  if (streakDays >= 7) return 1.5
  if (streakDays >= 3) return 1.25
  return 1
}

export const calculatePoints = (hasReflection: boolean, streakDays: number): number => {
  const basePoints = 10
  const reflectionBonus = hasReflection ? 5 : 0
  const multiplier = getStreakMultiplier(streakDays)

  return Math.floor((basePoints + reflectionBonus) * multiplier)
}

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diffInSeconds = Math.floor((now - timestamp) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export const canCheckInAgain = (lastCheckIn: number): boolean => {
  const hoursSinceLastCheckIn = (Date.now() - lastCheckIn) / (1000 * 60 * 60)
  return hoursSinceLastCheckIn >= 8
}
