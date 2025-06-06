export interface CareSuggestion {
  id: string
  text: string
  icon: string
  category: "wellness" | "mindfulness" | "connection" | "gratitude" | "energy"
}

export const careSuggestions = {
  // For mood ratings 1-2 (Struggling, Difficult)
  feelingDown: [
    {
      id: "down-1",
      text: "Take 5 deep breaths. Exhale slowly and feel your body relax.",
      icon: "💛",
      category: "wellness" as const,
    },
    {
      id: "down-2",
      text: "Write down one small thing that went well today, no matter how tiny.",
      icon: "💛",
      category: "gratitude" as const,
    },
    {
      id: "down-3",
      text: "Reach out to a friend, family member, or someone you trust.",
      icon: "💛",
      category: "connection" as const,
    },
    {
      id: "down-4",
      text: "Drink a glass of water mindfully and take a gentle walk.",
      icon: "💛",
      category: "wellness" as const,
    },
    {
      id: "down-5",
      text: "Be extra gentle with yourself today. You are doing your best.",
      icon: "💛",
      category: "mindfulness" as const,
    },
    {
      id: "down-6",
      text: "Listen to a song that brings you comfort or peace.",
      icon: "💛",
      category: "wellness" as const,
    },
  ],

  // For mood rating 3 (Okay/Neutral)
  feelingNeutral: [
    {
      id: "neutral-1",
      text: "Take a short walk to shift your energy and perspective.",
      icon: "💚",
      category: "energy" as const,
    },
    {
      id: "neutral-2",
      text: "Celebrate one small accomplishment from today.",
      icon: "💚",
      category: "gratitude" as const,
    },
    {
      id: "neutral-3",
      text: "Drink water mindfully and notice how it feels.",
      icon: "💚",
      category: "mindfulness" as const,
    },
    {
      id: "neutral-4",
      text: "Do one thing that brings you a small spark of joy.",
      icon: "💚",
      category: "wellness" as const,
    },
    {
      id: "neutral-5",
      text: "Connect with nature, even if just looking out a window.",
      icon: "💚",
      category: "wellness" as const,
    },
  ],

  // For mood ratings 4-5 (Good, Great)
  feelingGood: [
    {
      id: "good-1",
      text: "Celebrate your progress and positive energy. Keep it up!",
      icon: "💙",
      category: "gratitude" as const,
    },
    {
      id: "good-2",
      text: "Take a moment to appreciate yourself and your journey.",
      icon: "💙",
      category: "mindfulness" as const,
    },
    {
      id: "good-3",
      text: "Share your positive energy with someone who might need it.",
      icon: "💙",
      category: "connection" as const,
    },
    {
      id: "good-4",
      text: "Reflect on what's helping you thrive and write it down.",
      icon: "💙",
      category: "gratitude" as const,
    },
    {
      id: "good-5",
      text: "Channel this great energy into something creative or meaningful.",
      icon: "💙",
      category: "energy" as const,
    },
    {
      id: "good-6",
      text: "Pay it forward with a kind gesture, big or small.",
      icon: "💙",
      category: "connection" as const,
    },
  ],
}

export function getSuggestionsForMood(moodRating: number | null): CareSuggestion[] {
  if (moodRating === null) {
    // Default suggestions when no mood data available
    return [...careSuggestions.feelingNeutral.slice(0, 2), ...careSuggestions.feelingGood.slice(0, 2)]
  }

  if (moodRating <= 2) {
    return careSuggestions.feelingDown
  } else if (moodRating === 3) {
    return careSuggestions.feelingNeutral
  } else {
    return careSuggestions.feelingGood
  }
}

export function getMoodLabel(moodRating: number | null): string {
  if (moodRating === null) return "Getting Started"
  if (moodRating <= 2) return "Taking Care"
  if (moodRating === 3) return "Finding Balance"
  return "Thriving"
}

export function getMoodColor(moodRating: number | null): string {
  if (moodRating === null) return "text-gray-600"
  if (moodRating <= 2) return "text-yellow-600"
  if (moodRating === 3) return "text-green-600"
  return "text-blue-600"
}
