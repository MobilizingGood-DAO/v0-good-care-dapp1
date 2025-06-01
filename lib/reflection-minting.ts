// CARE Daily Reflections NFT contract address
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
    image: "ipfs://QmXRna91Fhh7MR1AErjRfpXMM9DnxTJ8eqjVtqxyBxVNu3/0.png", // Official CARE reflection badge
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

// Mint reflection via API - main function for frontend integration
export async function mintReflectionViaAPI(
  mood: number,
  journal: string | undefined,
  streak: number,
  address: string,
): Promise<MintingResult> {
  try {
    console.log("Calling mint-reflection API with:", { mood, journal, streak, address })

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

    console.log("API response status:", response.status)
    const result = await response.json()
    console.log("API response body:", result)

    if (response.ok && result.success) {
      return {
        success: true,
        tokenId: result.tokenId,
        txHash: result.transactionHash,
      }
    } else {
      return {
        success: false,
        error: result.error || "Unable to mint your reflection right now. Please try again in a moment.",
      }
    }
  } catch (error) {
    console.error("API mint error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
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
  // Redirect to new API-based minting
  return mintReflectionViaAPI(mood, reflectionText, streak, "")
}
