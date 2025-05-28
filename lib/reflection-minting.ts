// NFT Drop contract address on GOOD CARE Network
export const REFLECTION_NFT_CONTRACT = "0x5fb4048031364A47c320236312fF66CB42ae822F"

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
    description: `A daily reflection from ${date} capturing mood and thoughts on the GOOD CARE journey. Mood: ${moodLabels[mood]} (${mood}/5). ${reflectionText ? `Reflection: "${reflectionText}"` : "No written reflection."}`,
    image: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(moodEmojis[mood])}`,
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

// Estimate gas cost in CARE tokens (simplified version without ethers)
export async function estimateGasCostInCARE(): Promise<{ gasCostInCARE: string; gasCostInWei: string }> {
  try {
    // Return a fixed estimate for now to avoid ethers import issues
    return {
      gasCostInCARE: "0.003",
      gasCostInWei: "3000000000000000", // 0.003 ETH in wei
    }
  } catch (error) {
    console.error("Error estimating gas cost:", error)
    // Return default estimate
    return {
      gasCostInCARE: "0.003",
      gasCostInWei: "3000000000000000", // 0.003 ETH in wei
    }
  }
}

// Check if user has sufficient balance for minting (simplified version)
export async function checkSufficientBalance(
  address: string,
): Promise<{ sufficient: boolean; balance: string; required: string }> {
  try {
    // For now, return a simplified check to avoid ethers import issues
    // In production, this would use a proper RPC call
    return {
      sufficient: false, // This will trigger the faucet flow
      balance: "0",
      required: "0.003",
    }
  } catch (error) {
    console.error("Error checking balance:", error)
    return {
      sufficient: false,
      balance: "0",
      required: "0.003",
    }
  }
}

// Legacy function for backward compatibility - simplified version
export async function mintReflectionNFT(
  mood: number,
  reflectionText: string | undefined,
  date: string,
  streak: number,
  checkInNumber: number,
): Promise<MintingResult> {
  try {
    // Create metadata
    const metadata = createReflectionMetadata(mood, reflectionText, date, streak, checkInNumber)

    // For backward compatibility, simulate a successful minting
    // The real minting is now handled by Thirdweb in the component
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a random token ID and transaction hash
    const tokenId = Math.floor(Math.random() * 10000) + 1
    const txHash = `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`

    return {
      success: true,
      tokenId: tokenId.toString(),
      txHash,
    }
  } catch (error: any) {
    console.error("Error minting reflection NFT:", error)
    return {
      success: false,
      error: error.message || "Failed to mint reflection NFT",
    }
  }
}

// Get user's reflection NFTs - now returns empty array since Thirdweb handles this
export async function getUserReflectionNFTs(address: string): Promise<any[]> {
  try {
    // This function is now deprecated in favor of Thirdweb's useOwnedNFTs hook
    // Return empty array for backward compatibility
    return []
  } catch (error) {
    console.error("Error fetching reflection NFTs:", error)
    return []
  }
}
