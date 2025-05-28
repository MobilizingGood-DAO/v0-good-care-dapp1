import { ethers } from "ethers"
import { CHAIN_CONFIG, GCT_TOKEN_ADDRESS } from "./blockchain-config"

// Create a provider for the GOOD CARE Network
export function getProvider() {
  return new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrls[0])
}

// ERC20 ABI for token balance checks
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]

// ERC721 ABI for NFT checks (without enumerable)
export const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]

// ERC721 Enumerable ABI (optional extension)
export const ERC721_ENUMERABLE_ABI = [
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
]

// ERC1155 ABI for multi-token standard
export const ERC1155_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function uri(uint256 id) view returns (string)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
]

// Interface for NFT contract info
export interface NFTContract {
  address: string
  type: "ERC721" | "ERC1155"
  name: string
  symbol: string
}

// GCT Token contract address on GOOD CARE Network
export const GCT_TOKEN_CONTRACT = GCT_TOKEN_ADDRESS

// NFT contract addresses on GOOD CARE Network
export const NFT_CONTRACTS = {
  reflections: "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813", // Updated to the provided contract address
  badges: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  soulbound: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
}

// Known NFT contracts on GOOD CARE Network (in production, you'd discover these via events)
export const ALL_NFT_CONTRACTS: NFTContract[] = [
  {
    address: "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813", // Updated to the provided contract address
    type: "ERC721",
    name: "GOOD Reflections",
    symbol: "GREFL",
  },
  {
    address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    type: "ERC721",
    name: "CARE Badges",
    symbol: "CBADGE",
  },
  {
    address: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
    type: "ERC721",
    name: "Soulbound Achievements",
    symbol: "SOUL",
  },
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    type: "ERC1155",
    name: "GOOD Collectibles",
    symbol: "GCOLL",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    type: "ERC1155",
    name: "Community Tokens",
    symbol: "CTOKEN",
  },
]

// Milestone contract address
export const MILESTONE_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual address

// Milestone contract ABI
export const MILESTONE_ABI = [
  "function getMilestonesForUser(address user) view returns (tuple(uint256 id, string title, string description, string category, bool completed, string reward, uint256 completedAt)[])",
  "function getUserProgress(address user) view returns (uint256 total, uint256 completed)",
  "function getCategoryProgress(address user, string category) view returns (uint256 total, uint256 completed)",
]

// Fetch both GCT and native CARE token balances
export async function fetchTokenBalances(address: string): Promise<{
  gct: { balance: string; symbol: string; name: string; decimals: number }
  care: { balance: string; symbol: string; name: string; decimals: number }
}> {
  try {
    const provider = getProvider()

    // Fetch GCT token balance
    const tokenContract = new ethers.Contract(GCT_TOKEN_CONTRACT, ERC20_ABI, provider)
    const [gctBalanceWei, gctDecimals, gctSymbol, gctName] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name(),
    ])

    // Fetch native CARE balance
    const careBalanceWei = await provider.getBalance(address)

    return {
      gct: {
        balance: ethers.formatUnits(gctBalanceWei, gctDecimals),
        symbol: gctSymbol,
        name: gctName,
        decimals: gctDecimals,
      },
      care: {
        balance: ethers.formatEther(careBalanceWei),
        symbol: CHAIN_CONFIG.nativeCurrency.symbol,
        name: CHAIN_CONFIG.nativeCurrency.name,
        decimals: CHAIN_CONFIG.nativeCurrency.decimals,
      },
    }
  } catch (error) {
    console.error("Error fetching token balances:", error)
    return {
      gct: {
        balance: "0",
        symbol: "GCT",
        name: "GCT Token",
        decimals: 18,
      },
      care: {
        balance: "0",
        symbol: "CARE",
        name: "CARE Token",
        decimals: 18,
      },
    }
  }
}

// Legacy function for backward compatibility
export async function fetchTokenBalance(address: string) {
  const balances = await fetchTokenBalances(address)
  return balances.gct
}

// Send GCT tokens
export async function sendGCTTokens(
  to: string,
  amount: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, error: "No wallet found" }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const tokenContract = new ethers.Contract(GCT_TOKEN_CONTRACT, ERC20_ABI, signer)

    // Get token decimals
    const decimals = await tokenContract.decimals()
    const amountWei = ethers.parseUnits(amount, decimals)

    // Send transaction
    const tx = await tokenContract.transfer(to, amountWei)
    await tx.wait()

    return { success: true, txHash: tx.hash }
  } catch (error: any) {
    console.error("Error sending GCT tokens:", error)
    return { success: false, error: error.message || "Failed to send GCT tokens" }
  }
}

// Send native CARE tokens
export async function sendCARETokens(
  to: string,
  amount: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, error: "No wallet found" }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Convert amount to wei
    const amountWei = ethers.parseEther(amount)

    // Send transaction
    const tx = await signer.sendTransaction({
      to,
      value: amountWei,
    })
    await tx.wait()

    return { success: true, txHash: tx.hash }
  } catch (error: any) {
    console.error("Error sending CARE tokens:", error)
    return { success: false, error: error.message || "Failed to send CARE tokens" }
  }
}

// Interface for NFT metadata
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

// Interface for NFT item
export interface NFTItem {
  id: string
  tokenId: string
  contractAddress: string
  metadata: NFTMetadata
  type: "reflection" | "badge" | "soulbound"
  date: string
  transferable: boolean
}

// Check if contract supports ERC721Enumerable
async function supportsEnumerable(contract: ethers.Contract): Promise<boolean> {
  try {
    // Try to call supportsInterface for ERC721Enumerable (0x780e9d63)
    const supportsInterface = await contract.supportsInterface("0x780e9d63")
    return supportsInterface
  } catch {
    // If supportsInterface doesn't exist, try calling tokenOfOwnerByIndex with dummy data
    try {
      await contract.tokenOfOwnerByIndex.staticCall("0x0000000000000000000000000000000000000000", 0)
      return true
    } catch {
      return false
    }
  }
}

// Fetch NFTs using events (fallback method)
async function fetchNFTsViaEvents(
  contract: ethers.Contract,
  contractInfo: NFTContract,
  address: string,
): Promise<NFTItem[]> {
  try {
    const provider = getProvider()
    const nfts: NFTItem[] = []

    // Get Transfer events where 'to' is the user's address
    const filter = contract.filters.Transfer(null, address, null)

    // Get events from the last 10000 blocks (adjust as needed)
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 10000)

    const events = await contract.queryFilter(filter, fromBlock, currentBlock)

    // Process each transfer event
    for (const event of events) {
      try {
        const tokenId = event.args?.[2] // tokenId is the third argument in Transfer event
        if (!tokenId) continue

        // Check if the user still owns this token
        const currentOwner = await contract.ownerOf(tokenId)
        if (currentOwner.toLowerCase() !== address.toLowerCase()) continue

        // Get token URI
        let tokenURI: string
        try {
          tokenURI = await contract.tokenURI(tokenId)
        } catch {
          tokenURI = ""
        }

        // Fetch metadata from URI (with fallback)
        let metadata: NFTMetadata
        try {
          if (tokenURI && tokenURI.startsWith("http")) {
            const response = await fetch(tokenURI)
            metadata = await response.json()
          } else {
            throw new Error("Invalid URI")
          }
        } catch {
          // Fallback metadata if URI fetch fails
          metadata = {
            id: tokenId.toString(),
            name: `${contractInfo.name} #${tokenId}`,
            description: `NFT from ${contractInfo.name} collection`,
            image: `/placeholder.svg?height=300&width=300&text=${contractInfo.symbol}`,
            attributes: [],
          }
        }

        // Add to NFTs array
        nfts.push({
          id: `${contractInfo.address}-${tokenId}`,
          tokenId: tokenId.toString(),
          contractAddress: contractInfo.address,
          metadata,
          type: "reflection", // All NFTs are considered reflections now
          date: new Date().toISOString().split("T")[0],
          transferable: contractInfo.name !== "Soulbound Achievements",
        })
      } catch (error) {
        console.error(`Error processing NFT event for token:`, error)
      }
    }

    return nfts
  } catch (error) {
    console.error("Error fetching NFTs via events:", error)
    return []
  }
}

// Fetch all NFTs from all contracts
export async function fetchAllNFTs(address: string): Promise<NFTItem[]> {
  try {
    const provider = getProvider()
    const nfts: NFTItem[] = []

    for (const contractInfo of ALL_NFT_CONTRACTS) {
      try {
        if (contractInfo.type === "ERC721") {
          // Handle ERC721 contracts
          const nftContract = new ethers.Contract(contractInfo.address, ERC721_ABI, provider)

          // First, check if the user has any NFTs in this contract
          let balance: bigint
          try {
            balance = await nftContract.balanceOf(address)
          } catch (error) {
            console.warn(`Could not get balance for contract ${contractInfo.address}:`, error)
            continue
          }

          if (Number(balance) === 0) {
            console.log(`No NFTs found in contract ${contractInfo.address}`)
            continue
          }

          // Check if contract supports enumerable
          const isEnumerable = await supportsEnumerable(nftContract)

          if (isEnumerable) {
            // Use enumerable method
            try {
              const enumerableContract = new ethers.Contract(
                contractInfo.address,
                [...ERC721_ABI, ...ERC721_ENUMERABLE_ABI],
                provider,
              )

              // Fetch each NFT using enumerable
              for (let i = 0; i < Number(balance); i++) {
                try {
                  const tokenId = await enumerableContract.tokenOfOwnerByIndex(address, i)

                  // Get token URI
                  const tokenURI = await nftContract.tokenURI(tokenId)

                  // Fetch metadata from URI (with fallback)
                  let metadata: NFTMetadata
                  try {
                    if (tokenURI && tokenURI.startsWith("http")) {
                      const response = await fetch(tokenURI)
                      metadata = await response.json()
                    } else {
                      throw new Error("Invalid URI")
                    }
                  } catch {
                    // Fallback metadata if URI fetch fails
                    metadata = {
                      id: tokenId.toString(),
                      name: `${contractInfo.name} #${tokenId}`,
                      description: `NFT from ${contractInfo.name} collection`,
                      image: `/placeholder.svg?height=300&width=300&text=${contractInfo.symbol}`,
                      attributes: [],
                    }
                  }

                  // Add to NFTs array
                  nfts.push({
                    id: `${contractInfo.address}-${tokenId}`,
                    tokenId: tokenId.toString(),
                    contractAddress: contractInfo.address,
                    metadata,
                    type: "reflection", // All NFTs are considered reflections now
                    date: new Date().toISOString().split("T")[0],
                    transferable: contractInfo.name !== "Soulbound Achievements",
                  })
                } catch (error) {
                  console.error(`Error fetching ERC721 NFT ${i} from contract ${contractInfo.address}:`, error)
                }
              }
            } catch (error) {
              console.warn(`Enumerable method failed for ${contractInfo.address}, trying events:`, error)
              // Fallback to events method
              const eventNFTs = await fetchNFTsViaEvents(nftContract, contractInfo, address)
              nfts.push(...eventNFTs)
            }
          } else {
            // Use events method for non-enumerable contracts
            console.log(`Contract ${contractInfo.address} is not enumerable, using events method`)
            const eventNFTs = await fetchNFTsViaEvents(nftContract, contractInfo, address)
            nfts.push(...eventNFTs)
          }
        } else if (contractInfo.type === "ERC1155") {
          // Handle ERC1155 contracts
          const nftContract = new ethers.Contract(contractInfo.address, ERC1155_ABI, provider)

          // For ERC1155, we need to check specific token IDs
          // In production, you'd track these via events or an indexer
          const tokenIdsToCheck = [1, 2, 3, 4, 5] // Common token IDs

          for (const tokenId of tokenIdsToCheck) {
            try {
              const balance = await nftContract.balanceOf(address, tokenId)

              if (Number(balance) > 0) {
                // Get token URI
                let tokenURI: string
                try {
                  tokenURI = await nftContract.uri(tokenId)
                } catch {
                  tokenURI = ""
                }

                // Fetch metadata from URI (with fallback)
                let metadata: NFTMetadata
                try {
                  if (tokenURI && tokenURI.startsWith("http")) {
                    const response = await fetch(tokenURI)
                    metadata = await response.json()
                  } else {
                    throw new Error("Invalid URI")
                  }
                } catch {
                  // Fallback metadata if URI fetch fails
                  metadata = {
                    id: tokenId.toString(),
                    name: `${contractInfo.name} #${tokenId}`,
                    description: `ERC1155 token from ${contractInfo.name} collection`,
                    image: `/placeholder.svg?height=300&width=300&text=${contractInfo.symbol}`,
                    attributes: [
                      {
                        trait_type: "Balance",
                        value: balance.toString(),
                      },
                    ],
                  }
                }

                // Add to NFTs array (create multiple entries if balance > 1)
                for (let i = 0; i < Number(balance); i++) {
                  nfts.push({
                    id: `${contractInfo.address}-${tokenId}-${i}`,
                    tokenId: tokenId.toString(),
                    contractAddress: contractInfo.address,
                    metadata: {
                      ...metadata,
                      name: `${metadata.name} ${Number(balance) > 1 ? `(${i + 1}/${balance})` : ""}`,
                    },
                    type: "reflection", // All NFTs are considered reflections now
                    date: new Date().toISOString().split("T")[0],
                    transferable: true, // ERC1155 tokens are typically transferable
                  })
                }
              }
            } catch (error) {
              console.error(`Error fetching ERC1155 token ${tokenId} from contract ${contractInfo.address}:`, error)
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching NFTs from contract ${contractInfo.address}:`, error)
      }
    }

    return nfts
  } catch (error) {
    console.error("Error fetching all NFTs:", error)
    return []
  }
}

// Update the original fetchNFTs function to use the new comprehensive function
export async function fetchNFTs(address: string): Promise<NFTItem[]> {
  return fetchAllNFTs(address)
}

// Interface for milestone
export interface Milestone {
  id: string
  title: string
  description: string
  category: "community" | "contribution" | "learning"
  completed: boolean
  reward: string
  date?: string
}

// Interface for progress
export interface Progress {
  total: number
  completed: number
  percentage: number
}

// Interface for category progress
export interface CategoryProgress {
  community: Progress
  contribution: Progress
  learning: Progress
}

// Fetch milestones for an address
export async function fetchMilestones(address: string): Promise<{
  milestones: Milestone[]
  progress: Progress
  categoryProgress: CategoryProgress
}> {
  try {
    const provider = getProvider()
    const milestoneContract = new ethers.Contract(MILESTONE_CONTRACT_ADDRESS, MILESTONE_ABI, provider)

    // Get milestones
    const milestonesData = await milestoneContract.getMilestonesForUser(address)

    // Map contract data to our interface
    const milestones: Milestone[] = milestonesData.map((milestone: any) => ({
      id: milestone.id.toString(),
      title: milestone.title,
      description: milestone.description,
      category: milestone.category as "community" | "contribution" | "learning",
      completed: milestone.completed,
      reward: milestone.reward,
      date:
        milestone.completedAt > 0
          ? new Date(Number(milestone.completedAt) * 1000).toISOString().split("T")[0]
          : undefined,
    }))

    // Get overall progress
    const overallProgress = await milestoneContract.getUserProgress(address)

    // Get category progress
    const communityProgress = await milestoneContract.getCategoryProgress(address, "community")
    const contributionProgress = await milestoneContract.getCategoryProgress(address, "contribution")
    const learningProgress = await milestoneContract.getCategoryProgress(address, "learning")

    return {
      milestones,
      progress: {
        total: Number(overallProgress.total),
        completed: Number(overallProgress.completed),
        percentage:
          overallProgress.total > 0
            ? Math.round((Number(overallProgress.completed) / Number(overallProgress.total)) * 100)
            : 0,
      },
      categoryProgress: {
        community: {
          total: Number(communityProgress.total),
          completed: Number(communityProgress.completed),
          percentage:
            communityProgress.total > 0
              ? Math.round((Number(communityProgress.completed) / Number(communityProgress.total)) * 100)
              : 0,
        },
        contribution: {
          total: Number(contributionProgress.total),
          completed: Number(contributionProgress.completed),
          percentage:
            contributionProgress.total > 0
              ? Math.round((Number(contributionProgress.completed) / Number(contributionProgress.total)) * 100)
              : 0,
        },
        learning: {
          total: Number(learningProgress.total),
          completed: Number(learningProgress.completed),
          percentage:
            learningProgress.total > 0
              ? Math.round((Number(learningProgress.completed) / Number(learningProgress.total)) * 100)
              : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching milestones:", error)

    // Return mock data in case of error
    return {
      milestones: [],
      progress: {
        total: 10,
        completed: 4,
        percentage: 40,
      },
      categoryProgress: {
        community: {
          total: 5,
          completed: 3,
          percentage: 60,
        },
        contribution: {
          total: 5,
          completed: 1,
          percentage: 20,
        },
        learning: {
          total: 5,
          completed: 2,
          percentage: 40,
        },
      },
    }
  }
}

// Fetch transaction history for an address
export async function fetchTransactionHistory(address: string): Promise<any[]> {
  try {
    const provider = getProvider()

    // Get the last 10 blocks
    const currentBlock = await provider.getBlockNumber()
    const lastTenBlocks = Array.from({ length: 10 }, (_, i) => currentBlock - i)

    // Get transactions from these blocks
    const transactions = []

    for (const blockNumber of lastTenBlocks) {
      const block = await provider.getBlock(blockNumber, true)

      if (block && block.transactions) {
        // Filter transactions involving the address
        const relevantTransactions = block.transactions.filter(
          (tx) => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
        )

        transactions.push(...relevantTransactions)
      }
    }

    return transactions
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return []
  }
}
