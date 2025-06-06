// User profile interface
export interface UserProfile {
  address: string
  name: string
  username: string
  bio: string
  avatar?: string
  email?: string
  createdAt: string
}

// In-memory storage for demo purposes
// In a real app, this would be stored in a database
const userProfiles = new Map<string, UserProfile>()

// Initialize with some demo profiles
const demoProfiles: UserProfile[] = [
  {
    address: "0x1234567890123456789012345678901234567890",
    name: "Alice Green",
    username: "alice_green",
    bio: "Passionate about regenerative finance and community building.",
    createdAt: "2023-01-15",
  },
  {
    address: "0x0987654321098765432109876543210987654321",
    name: "Bob Care",
    username: "bob_care",
    bio: "Environmental activist and blockchain enthusiast.",
    createdAt: "2023-02-20",
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    name: "Carol Earth",
    username: "carol_earth",
    bio: "Building a sustainable future through technology.",
    createdAt: "2023-03-10",
  },
]

// Initialize the demo profiles
demoProfiles.forEach((profile) => {
  userProfiles.set(profile.address.toLowerCase(), profile)
})

// Get user profile by address
export function getUserProfile(address: string): UserProfile | null {
  if (!address) return null

  const profile = userProfiles.get(address.toLowerCase())
  if (profile) {
    return profile
  }

  // Try to load from localStorage if available
  if (typeof window !== "undefined") {
    try {
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}")
      const storedProfile = profiles[address.toLowerCase()]
      if (storedProfile) {
        userProfiles.set(address.toLowerCase(), storedProfile)
        return storedProfile
      }
    } catch (error) {
      console.error("Error loading user profile from localStorage:", error)
    }
  }

  return null
}

// Save user profile
export function saveUserProfile(profile: UserProfile): void {
  userProfiles.set(profile.address.toLowerCase(), profile)

  // In a real app, you would save to a database here
  // For demo purposes, we'll also save to localStorage
  if (typeof window !== "undefined") {
    try {
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}")
      profiles[profile.address.toLowerCase()] = profile
      localStorage.setItem("userProfiles", JSON.stringify(profiles))
    } catch (error) {
      console.error("Error saving user profile to localStorage:", error)
    }
  }
}

// Load profiles from localStorage on initialization
export function loadUserProfiles(): void {
  if (typeof window !== "undefined") {
    try {
      const profiles = JSON.parse(localStorage.getItem("userProfiles") || "{}")
      Object.entries(profiles).forEach(([address, profile]) => {
        userProfiles.set(address, profile as UserProfile)
      })
    } catch (error) {
      console.error("Error loading user profiles:", error)
    }
  }
}

// Get display name for an address (name or shortened address)
export function getDisplayName(address: string): string {
  if (!address) return "Unknown"

  const profile = getUserProfile(address)
  if (profile && profile.name) {
    return profile.name
  }

  // Return shortened address if no profile found
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Search users by name or username
export function searchUsers(query: string): UserProfile[] {
  if (!query || query.length < 2) return []

  const results: UserProfile[] = []
  const lowerQuery = query.toLowerCase()

  userProfiles.forEach((profile) => {
    if (
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.username.toLowerCase().includes(lowerQuery) ||
      profile.address.toLowerCase().includes(lowerQuery)
    ) {
      results.push(profile)
    }
  })

  return results
}

// Initialize with some demo profiles
export function initializeDemoProfiles(): void {
  demoProfiles.forEach(saveUserProfile)
}
