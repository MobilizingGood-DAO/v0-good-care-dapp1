// Simplified reflection minting for MVP (no actual blockchain calls)

export const REFLECTION_NFT_CONTRACT = "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813"

export interface ReflectionMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    mood: number
    journal: string
    streak: number
    date: string
    wallet: string
  }
}

export function createReflectionMetadata(
  mood: number,
  reflection?: string,
  date?: string,
  streak?: number,
  checkInNumber?: number,
): ReflectionMetadata {
  const today = date || new Date().toISOString().split("T")[0]
  const moodLabels = ["", "Very Upset", "Somewhat Upset", "Neutral", "Somewhat Happy", "Very Happy"]

  return {
    name: `Daily Reflection – ${today}`,
    description: `A daily reflection from ${today} capturing mood and thoughts on the GOOD CARE journey. Mood: ${moodLabels[mood]} (${mood}/5). ${reflection ? `Reflection: "${reflection}"` : "No written reflection."}`,
    image: "ipfs://QmXRna91Fhh7MR1AErjRfpXMM9DnxTJ8eqjVtqxyBxVNu3/0.png",
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
        value: today,
      },
      {
        trait_type: "Streak",
        value: streak || 1,
      },
      {
        trait_type: "Has Reflection",
        value: reflection ? "Yes" : "No",
      },
      {
        trait_type: "Reflection Length",
        value: reflection ? reflection.length : 0,
      },
    ],
    properties: {
      mood,
      journal: reflection || "",
      streak: streak || 1,
      date: today,
      wallet: "",
    },
  }
}

export async function estimateGasCostInCARE(): Promise<{
  gasCostInCARE: string
  gasCostInWei: string
}> {
  // Mock gas estimation for MVP
  return {
    gasCostInCARE: "0.003",
    gasCostInWei: "3000000000000000", // 0.003 ETH in wei
  }
}

export async function checkSufficientBalance(address: string): Promise<{
  sufficient: boolean
  balance: string
  required: string
}> {
  // Mock balance check for MVP
  return {
    sufficient: true,
    balance: "0.05",
    required: "0.003",
  }
}
