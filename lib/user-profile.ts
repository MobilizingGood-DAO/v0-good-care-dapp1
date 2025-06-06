interface UserProfile {
  address: string
  name: string
  username: string
  bio?: string
  avatar?: string
}

// In-memory storage for user profiles (in production, this would be in a database)
const userProfiles = new Map<string, UserProfile>()

export function addUserProfile(profile: UserProfile) {
  userProfiles.set(profile.address.toLowerCase(), profile)
}

export function getUserProfile(address: string): UserProfile | null {
  return userProfiles.get(address.toLowerCase()) || null
}

export function searchUsers(query: string): UserProfile[] {
  const results: UserProfile[] = []
  const lowerQuery = query.toLowerCase()

  for (const profile of userProfiles.values()) {
    if (
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.username.toLowerCase().includes(lowerQuery) ||
      profile.address.toLowerCase().includes(lowerQuery)
    ) {
      results.push(profile)
    }
  }

  return results
}

export function getDisplayName(address: string): string {
  const profile = getUserProfile(address)
  if (profile) {
    return profile.name || profile.username
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function saveUserProfile(profile: UserProfile) {
  addUserProfile(profile)
}
