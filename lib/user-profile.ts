// User profile management for wallet addresses
interface UserProfile {
  address: string
  name: string
  username: string
  avatar?: string
  bio?: string
}

// Demo user profiles
const DEMO_PROFILES: UserProfile[] = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E8E8",
    name: "Alice Green",
    username: "alice_green",
    bio: "Wellness advocate and community builder",
  },
  {
    address: "0x8ba1f109551bD432803012645Hac136c9c1659e",
    name: "Bob Care",
    username: "bob_care",
    bio: "Regenerative finance enthusiast",
  },
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "Charlie Wellness",
    username: "charlie_wellness",
    bio: "Mental health supporter",
  },
]

let userProfiles: UserProfile[] = []

export function loadUserProfiles(): UserProfile[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("userProfiles")
    if (stored) {
      userProfiles = JSON.parse(stored)
    }
  }
  return userProfiles
}

export function saveUserProfiles(profiles: UserProfile[]) {
  userProfiles = profiles
  if (typeof window !== "undefined") {
    localStorage.setItem("userProfiles", JSON.stringify(profiles))
  }
}

export function initializeDemoProfiles() {
  const existing = loadUserProfiles()
  if (existing.length === 0) {
    saveUserProfiles(DEMO_PROFILES)
  }
}

export function addUserProfile(profile: UserProfile) {
  const profiles = loadUserProfiles()
  const existingIndex = profiles.findIndex((p) => p.address.toLowerCase() === profile.address.toLowerCase())

  if (existingIndex >= 0) {
    profiles[existingIndex] = profile
  } else {
    profiles.push(profile)
  }

  saveUserProfiles(profiles)
}

export function getUserProfile(address: string): UserProfile | null {
  const profiles = loadUserProfiles()
  return profiles.find((p) => p.address.toLowerCase() === address.toLowerCase()) || null
}

export function searchUsers(query: string): UserProfile[] {
  const profiles = loadUserProfiles()
  const lowerQuery = query.toLowerCase()

  return profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.username.toLowerCase().includes(lowerQuery) ||
      profile.address.toLowerCase().includes(lowerQuery),
  )
}

export function getDisplayName(address: string): string {
  const profile = getUserProfile(address)
  if (profile) {
    return profile.name
  }

  if (address.startsWith("0x") && address.length === 42) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return address
}

export { saveUserProfiles as saveUserProfile }
