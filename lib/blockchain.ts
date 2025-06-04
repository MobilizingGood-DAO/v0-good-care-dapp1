// Simplified blockchain utilities for MVP (no actual blockchain calls)
// This will be replaced with real blockchain integration in future versions

export interface TokenBalance {
  balance: string
  symbol: string
  name: string
  decimals: number
}

export interface NFTMetadata {
  id: string
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string
  }[]
}

export interface NFTItem {
  id: string
  tokenId: string
  contractAddress: string
  metadata: NFTMetadata
  type: "reflection" | "badge" | "soulbound"
  date: string
  transferable: boolean
}

// Mock token balances for MVP
export async function fetchTokenBalances(address: string): Promise<{
  gct: TokenBalance
  care: TokenBalance
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    gct: {
      balance: "100.0",
      symbol: "GCT",
      name: "GOOD CARE Token",
      decimals: 18,
    },
    care: {
      balance: "0.05",
      symbol: "CARE",
      name: "CARE Token",
      decimals: 18,
    },
  }
}

// Legacy function for backward compatibility
export async function fetchTokenBalance(address: string) {
  const balances = await fetchTokenBalances(address)
  return balances.gct
}

// Mock NFT fetching for MVP
export async function fetchAllNFTs(address: string): Promise<NFTItem[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock NFTs based on localStorage check-in data
  try {
    const storedData = localStorage.getItem(`checkIn_${address}`)
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      if (parsedData.entries && Array.isArray(parsedData.entries)) {
        return parsedData.entries
          .filter((entry: any) => entry.nftTokenId)
          .map((entry: any, index: number) => ({
            id: `reflection-${index}`,
            tokenId: entry.nftTokenId || `${index}`,
            contractAddress: "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813",
            metadata: {
              id: entry.nftTokenId || `${index}`,
              name: `Daily Reflection - ${entry.date}`,
              description: entry.reflection || "A daily reflection on the GOOD CARE Network",
              image: "/placeholder.svg?height=300&width=300&text=Reflection",
              attributes: [
                {
                  trait_type: "Mood",
                  value: entry.mood?.toString() || "3",
                },
                {
                  trait_type: "Date",
                  value: entry.date,
                },
              ],
            },
            type: "reflection" as const,
            date: entry.date,
            transferable: true,
          }))
      }
    }
  } catch (error) {
    console.error("Error loading NFTs from localStorage:", error)
  }

  return []
}

// Legacy function for backward compatibility
export async function fetchNFTs(address: string): Promise<NFTItem[]> {
  return fetchAllNFTs(address)
}

// Mock token sending for MVP
export async function sendGCTTokens(
  to: string,
  amount: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Simulate transaction delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate mock transaction hash
  const mockTxHash = `0x${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`

  return { success: true, txHash: mockTxHash }
}

export async function sendCARETokens(
  to: string,
  amount: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  // Simulate transaction delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate mock transaction hash
  const mockTxHash = `0x${Array(64)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`

  return { success: true, txHash: mockTxHash }
}

// Mock milestone data
export interface Milestone {
  id: string
  title: string
  description: string
  category: "community" | "contribution" | "learning"
  completed: boolean
  reward: string
  date?: string
}

export interface Progress {
  total: number
  completed: number
  percentage: number
}

export interface CategoryProgress {
  community: Progress
  contribution: Progress
  learning: Progress
}

export async function fetchMilestones(address: string): Promise<{
  milestones: Milestone[]
  progress: Progress
  categoryProgress: CategoryProgress
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock milestone data
  return {
    milestones: [
      {
        id: "1",
        title: "First Check-in",
        description: "Complete your first daily reflection",
        category: "learning",
        completed: true,
        reward: "10 CARE Points",
        date: "2024-01-15",
      },
      {
        id: "2",
        title: "Week Warrior",
        description: "Maintain a 7-day check-in streak",
        category: "contribution",
        completed: false,
        reward: "50 CARE Points + Badge NFT",
      },
      {
        id: "3",
        title: "Community Helper",
        description: "Help 5 community members",
        category: "community",
        completed: false,
        reward: "25 CARE Points",
      },
    ],
    progress: {
      total: 10,
      completed: 4,
      percentage: 40,
    },
    categoryProgress: {
      community: {
        total: 5,
        completed: 1,
        percentage: 20,
      },
      contribution: {
        total: 5,
        completed: 2,
        percentage: 40,
      },
      learning: {
        total: 5,
        completed: 3,
        percentage: 60,
      },
    },
  }
}

// Mock transaction history
export async function fetchTransactionHistory(address: string): Promise<any[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      hash: "0x1234567890abcdef",
      from: address,
      to: "0xabcdef1234567890",
      value: "0.01",
      timestamp: Date.now() - 86400000, // 1 day ago
      type: "send",
    },
    {
      hash: "0xabcdef1234567890",
      from: "0x1234567890abcdef",
      to: address,
      value: "0.05",
      timestamp: Date.now() - 172800000, // 2 days ago
      type: "receive",
    },
  ]
}

// NFT Contract configurations
export const NFT_CONTRACTS = {
  REFLECTION: "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813",
  BADGE: "0xD39Ce2A4F8B8B5E3C8F9A1B2C3D4E5F6A7B8C9D0",
  SOULBOUND: "0xE4AF3B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A",
} as const

// All NFT contracts array for easier iteration
export const ALL_NFT_CONTRACTS = Object.values(NFT_CONTRACTS)

// Mock provider for MVP (will be replaced with real provider)
export function getProvider() {
  return {
    getNetwork: async () => ({
      chainId: 1337, // Mock chain ID for GOOD CARE Subnet
      name: "GOOD CARE Network",
    }),
    getBlockNumber: async () => 12345,
    getBalance: async (address: string) => "1000000000000000000", // 1 ETH in wei
    call: async (transaction: any) => "0x",
    estimateGas: async (transaction: any) => "21000",
  }
}
