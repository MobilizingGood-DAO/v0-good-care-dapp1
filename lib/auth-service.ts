// Authentication service for managing user sessions and wallet persistence
export interface AuthUser {
  id: string
  email?: string
  socialProvider?: string
  socialId?: string
  walletAddress: string
  createdAt: string
  lastLogin: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// In-memory storage for demo (replace with proper database in production)
const users = new Map<string, AuthUser>()
const sessions = new Map<string, AuthSession>()

// Generate a unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate session tokens
function generateTokens(): { accessToken: string; refreshToken: string } {
  const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  return { accessToken, refreshToken }
}

// Create or get existing user by email
export async function createOrGetUserByEmail(email: string, walletAddress: string): Promise<AuthUser> {
  // Check if user already exists
  const existingUser = Array.from(users.values()).find((user) => user.email === email)

  if (existingUser) {
    // Update last login
    existingUser.lastLogin = new Date().toISOString()
    users.set(existingUser.id, existingUser)
    return existingUser
  }

  // Create new user
  const newUser: AuthUser = {
    id: generateUserId(),
    email,
    walletAddress,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }

  users.set(newUser.id, newUser)
  return newUser
}

// Create or get existing user by social provider
export async function createOrGetUserBySocial(
  provider: string,
  socialId: string,
  email: string | undefined,
  walletAddress: string,
): Promise<AuthUser> {
  // Check if user already exists by social ID
  const existingUser = Array.from(users.values()).find(
    (user) => user.socialProvider === provider && user.socialId === socialId,
  )

  if (existingUser) {
    // Update last login
    existingUser.lastLogin = new Date().toISOString()
    users.set(existingUser.id, existingUser)
    return existingUser
  }

  // Create new user
  const newUser: AuthUser = {
    id: generateUserId(),
    email,
    socialProvider: provider,
    socialId,
    walletAddress,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }

  users.set(newUser.id, newUser)
  return newUser
}

// Create session for user
export async function createSession(user: AuthUser): Promise<AuthSession> {
  const { accessToken, refreshToken } = generateTokens()

  const session: AuthSession = {
    user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  sessions.set(accessToken, session)
  return session
}

// Get session by access token
export async function getSession(accessToken: string): Promise<AuthSession | null> {
  const session = sessions.get(accessToken)

  if (!session) return null

  // Check if session is expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(accessToken)
    return null
  }

  return session
}

// Logout user (invalidate session)
export async function logout(accessToken: string): Promise<boolean> {
  return sessions.delete(accessToken)
}

// Get user by ID
export async function getUserById(userId: string): Promise<AuthUser | null> {
  return users.get(userId) || null
}
