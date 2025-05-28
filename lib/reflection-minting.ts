// CARE Daily Reflections NFT contract address - UPDATED
export const REFLECTION_NFT_CONTRACT = "0x141b77a109011475A4c347fD19Dd4ead79AE912F"

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

// Estimate gas cost in CARE tokens (simplified version)
export async function estimateGasCostInCARE(): Promise<{ gasCostInCARE: string; gasCostInWei: string }> {
  try {
    // Since minting is now handled by the backend, gas cost is effectively free for users
    return {
      gasCostInCARE: "0.000",
      gasCostInWei: "0",
    }
  } catch (error) {
    console.error("Error estimating gas cost:", error)
    return {
      gasCostInCARE: "0.000",
      gasCostInWei: "0",
    }
  }
}

// Check if user has sufficient balance for minting (now free since backend handles it)
export async function checkSufficientBalance(
  address: string,
): Promise<{ sufficient: boolean; balance: string; required: string }> {
  try {
    // Since backend handles minting, users don't need CARE tokens
    return {
      sufficient: true,
      balance: "N/A",
      required: "0.000",
    }
  } catch (error) {
    console.error("Error checking balance:", error)
    return {
      sufficient: true,
      balance: "N/A",
      required: "0.000",
    }
  }
}

// New function to mint reflection via API
export async function mintReflectionViaAPI(
  mood: number,
  journal: string | undefined,
  streak: number,
  address: string,
): Promise<MintingResult> {
  try {
    const response = await fetch("/api/mint-reflection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mood,
        journal: journal || "",
        streak,
        address,
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      return {
        success: true,
        tokenId: result.tokenId,
        txHash: result.transactionHash,
      }
    } else {
      return {
        success: false,
        error: result.error || "Mint failed. Please try again later.",
      }
    }
  } catch (error) {
    console.error("API mint error:", error)
    return {
      success: false,
      error: "Network error. Please try again later.",
    }
  }
}

// Legacy function for backward compatibility
export async function mintReflectionNFT(
  mood: number,
  reflectionText: string | undefined,
  date: string,
  streak: number,
  checkInNumber: number,
): Promise<MintingResult> {
  // This function is deprecated - use mintReflectionViaAPI instead
  return {
    success: false,
    error: "This function is deprecated. Use the new API-based minting.",
  }
}

// Get user's reflection NFTs - now returns empty array since Thirdweb handles this
export async function getUserReflectionNFTs(address: string): Promise<any[]> {
  try {
    // This function is now deprecated in favor of Thirdweb's useOwnedNFTs hook
    return []
  } catch (error) {
    console.error("Error fetching reflection NFTs:", error)
    return []
  }
}
