export interface LocalUser {
  id: string
  username: string
  walletAddress: string
  email?: string
  authMethod: "social" | "wallet"
  socialProvider?: string
  avatar: string
  createdAt: string
}

export interface LocalUserStats {
  userId: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin: string | null
}

export interface LocalCheckin {
  id: string
  userId: string
  mood: string
  gratitude?: string
  resourcesViewed: string[]
  points: number
  date: string
}

export class LocalStorageService {
  private static USERS_KEY = "goodcare_users"
  private static USER_STATS_KEY = "goodcare_user_stats"
  private static CHECKINS_KEY = "goodcare_checkins"
  private static CURRENT_USER_KEY = "goodcare_current_user"

  // User management
  static saveUser(user: LocalUser): void {
    try {
      const users = this.getUsers()
      const existingIndex = users.findIndex((u) => u.id === user.id)

      if (existingIndex >= 0) {
        users[existingIndex] = user
      } else {
        users.push(user)
      }

      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    } catch (error) {
      console.error("Failed to save user to localStorage:", error)
    }
  }

  static getUser(id: string): LocalUser | null {
    try {
      const users = this.getUsers()
      return users.find((u) => u.id === id) || null
    } catch (error) {
      console.error("Failed to get user from localStorage:", error)
      return null
    }
  }

  static getUserByUsername(username: string): LocalUser | null {
    try {
      const users = this.getUsers()
      return users.find((u) => u.username === username) || null
    } catch (error) {
      console.error("Failed to get user by username:", error)
      return null
    }
  }

  static getUserByWallet(walletAddress: string): LocalUser | null {
    try {
      const users = this.getUsers()
      return users.find((u) => u.walletAddress === walletAddress) || null
    } catch (error) {
      console.error("Failed to get user by wallet:", error)
      return null
    }
  }

  static getUsers(): LocalUser[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error("Failed to get users from localStorage:", error)
      return []
    }
  }

  // User stats management
  static saveUserStats(stats: LocalUserStats): void {
    try {
      const allStats = this.getAllUserStats()
      const existingIndex = allStats.findIndex((s) => s.userId === stats.userId)

      if (existingIndex >= 0) {
        allStats[existingIndex] = stats
      } else {
        allStats.push(stats)
      }

      localStorage.setItem(this.USER_STATS_KEY, JSON.stringify(allStats))
    } catch (error) {
      console.error("Failed to save user stats:", error)
    }
  }

  static getUserStats(userId: string): LocalUserStats | null {
    try {
      const allStats = this.getAllUserStats()
      return allStats.find((s) => s.userId === userId) || null
    } catch (error) {
      console.error("Failed to get user stats:", error)
      return null
    }
  }

  static getAllUserStats(): LocalUserStats[] {
    try {
      const stats = localStorage.getItem(this.USER_STATS_KEY)
      return stats ? JSON.parse(stats) : []
    } catch (error) {
      console.error("Failed to get all user stats:", error)
      return []
    }
  }

  // Check-in management
  static saveCheckin(checkin: LocalCheckin): void {
    try {
      const checkins = this.getCheckins()
      checkins.push(checkin)
      localStorage.setItem(this.CHECKINS_KEY, JSON.stringify(checkins))
    } catch (error) {
      console.error("Failed to save checkin:", error)
    }
  }

  static getCheckins(userId?: string): LocalCheckin[] {
    try {
      const checkins = localStorage.getItem(this.CHECKINS_KEY)
      const allCheckins = checkins ? JSON.parse(checkins) : []

      if (userId) {
        return allCheckins.filter((c: LocalCheckin) => c.userId === userId)
      }

      return allCheckins
    } catch (error) {
      console.error("Failed to get checkins:", error)
      return []
    }
  }

  // Current user session
  static setCurrentUser(userId: string): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, userId)
    } catch (error) {
      console.error("Failed to set current user:", error)
    }
  }

  static getCurrentUserId(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_USER_KEY)
    } catch (error) {
      console.error("Failed to get current user:", error)
      return null
    }
  }

  static clearCurrentUser(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    } catch (error) {
      console.error("Failed to clear current user:", error)
    }
  }

  // Utility methods
  static generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static generateAvatar(username: string): string {
    const avatars = ["🌟", "🌱", "🦋", "🌸", "🌈", "✨", "🎨", "🎭", "🎪", "🎯", "🌺", "🍀", "🌙", "⭐", "🎈"]
    const index = username.length % avatars.length
    return avatars[index]
  }
}
