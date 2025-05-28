import { ethers } from "ethers"
import { REFLECTIONS_CONTRACT_ADDRESS } from "./blockchain-config"

// Reflection NFT contract ABI
export const REFLECTION_NFT_ABI = [
  "function mintReflection(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event ReflectionMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
]

// ERC20 ABI for CARE token payments
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]

// Interface for reflection metadata
export interface ReflectionMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
  mood: number
  reflection_text?: string
  date: string
  streak: number
  check_in_number: number
}

// Interface for minting result
export interface MintingResult {
  success: boolean
  tokenId?: string
  txHash?: string
  error?: string
}

// Create metadata for reflection NFT
export function createReflectionMetadata(
  mood: number,
  reflectionText: string | undefined,
  date: string,
  streak: number,
  checkInNumber: number,
): ReflectionMetadata {
  const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😄"]
  const moodLabels = ["", "Very Upset", "Somewhat Upset", "Neutral", "Somewhat Happy", "Very Happy"]

  return {
    name: `Daily Reflection #${checkInNumber}`,
    description: `A daily reflection from ${date} capturing mood and thoughts on the GOOD CARE journey.`,
    image: `/placeholder.svg?height=400&width=400&text=${moodEmojis[mood]}`,
    attributes: [
      {
        trait_type: "Mood",
        value: moodLabels[mood],
      },
      {
        trait_type: "Mood Score",
        value: mood,
      },
      {
        trait_type: "Date",
        value: date,
      },
      {
        trait_type: "Streak",
        value: streak,
      },
      {
        trait_type: "Check-in Number",
        value: checkInNumber,
      },
      {
        trait_type: "Has Reflection",
        value: reflectionText ? "Yes" : "No",
      },
      {
        trait_type: "Reflection Length",
        value: reflectionText ? reflectionText.length : 0,
      },
    ],
    mood,
    reflection_text: reflectionText,
    date,
    streak,
    check_in_number: checkInNumber,
  }
}

// Upload metadata to IPFS (mock implementation)
async function uploadMetadataToIPFS(metadata: ReflectionMetadata): Promise<string> {
  // In a real implementation, this would upload to IPFS
  // For now, we'll create a data URI with the metadata
  const metadataString = JSON.stringify(metadata, null, 2)
  const dataUri = `data:application/json;base64,${btoa(metadataString)}`
  return dataUri
}

// Estimate gas cost in CARE tokens
export async function estimateGasCostInCARE(): Promise<{ gasCostInCARE: string; gasCostInWei: string }> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Create contract instance
    const reflectionContract = new ethers.Contract(REFLECTIONS_CONTRACT_ADDRESS, REFLECTION_NFT_ABI, signer)

    // Estimate gas for minting
    const gasEstimate = await reflectionContract.mintReflection.estimateGas(
      await signer.getAddress(),
      "ipfs://dummy-uri", // Dummy URI for estimation
    )

    // Get current gas price
    const gasPrice = await provider.getFeeData()
    const gasCostInWei = gasEstimate * (gasPrice.gasPrice || BigInt(0))

    // Convert to CARE (same as ETH conversion)
    const gasCostInCARE = ethers.formatEther(gasCostInWei)

    return {
      gasCostInCARE,
      gasCostInWei: gasCostInWei.toString(),
    }
  } catch (error) {
    console.error("Error estimating gas cost:", error)
    // Return default estimate
    return {
      gasCostInCARE: "0.001",
      gasCostInWei: "1000000000000000", // 0.001 ETH in wei
    }
  }
}

// Mint reflection NFT
export async function mintReflectionNFT(
  mood: number,
  reflectionText: string | undefined,
  date: string,
  streak: number,
  checkInNumber: number,
): Promise<MintingResult> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, error: "No wallet found" }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()

    // Create metadata
    const metadata = createReflectionMetadata(mood, reflectionText, date, streak, checkInNumber)

    // Upload metadata to IPFS
    const tokenURI = await uploadMetadataToIPFS(metadata)

    // Create contract instance
    const reflectionContract = new ethers.Contract(REFLECTIONS_CONTRACT_ADDRESS, REFLECTION_NFT_ABI, signer)

    // Estimate gas cost
    const { gasCostInCARE } = await estimateGasCostInCARE()

    // Check CARE balance
    const careBalance = await provider.getBalance(userAddress)
    const gasCostInWei = ethers.parseEther(gasCostInCARE)

    if (careBalance < gasCostInWei) {
      return {
        success: false,
        error: `Insufficient CARE balance. Need ${gasCostInCARE} CARE for gas fees.`,
      }
    }

    // Mint the NFT
    const tx = await reflectionContract.mintReflection(userAddress, tokenURI)

    // Wait for transaction confirmation
    const receipt = await tx.wait()

    // Extract token ID from events
    let tokenId = "0"
    if (receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = reflectionContract.interface.parseLog(log)
          if (parsedLog && parsedLog.name === "Transfer" && parsedLog.args[2]) {
            tokenId = parsedLog.args[2].toString()
            break
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }

    return {
      success: true,
      tokenId,
      txHash: tx.hash,
    }
  } catch (error: any) {
    console.error("Error minting reflection NFT:", error)
    return {
      success: false,
      error: error.message || "Failed to mint reflection NFT",
    }
  }
}

// Get user's reflection NFTs
export async function getUserReflectionNFTs(address: string): Promise<any[]> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC)
    const reflectionContract = new ethers.Contract(REFLECTIONS_CONTRACT_ADDRESS, REFLECTION_NFT_ABI, provider)

    // Get balance
    const balance = await reflectionContract.balanceOf(address)
    const nfts = []

    // For now, we'll use a simple approach to get NFTs
    // In production, you'd use events or an indexer
    const totalSupply = await reflectionContract.totalSupply()

    for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
      try {
        const owner = await reflectionContract.ownerOf(tokenId)
        if (owner.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await reflectionContract.tokenURI(tokenId)
          nfts.push({
            tokenId: tokenId.toString(),
            tokenURI,
            owner,
          })
        }
      } catch (error) {
        // Token might not exist or be burned
        continue
      }
    }

    return nfts
  } catch (error) {
    console.error("Error fetching reflection NFTs:", error)
    return []
  }
}
