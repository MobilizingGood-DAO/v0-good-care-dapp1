export const careSuggestions = {
  feelingDown: [
    "💛 Take 5 deep breaths. Exhale slowly.",
    "💛 Write down one thing that went well today.",
    "💛 Reach out to a friend or loved one.",
    "💛 Drink a glass of water and take a short walk.",
    "💛 Be gentle with yourself today. You're doing your best.",
    "💛 Listen to a song that brings you comfort.",
    "💛 Practice self-compassion - treat yourself like a good friend.",
    "💛 Take a warm shower or bath to reset your energy.",
  ],
  feelingGood: [
    "💙 Celebrate your progress. Keep it up!",
    "💙 Take a moment to appreciate yourself.",
    "💙 Share your positive energy with someone.",
    "💙 Reflect on what's helping you thrive.",
    "💙 Channel this energy into something meaningful.",
    "💙 Pay it forward with a kind gesture.",
    "💙 Set a positive intention for tomorrow.",
    "💙 Document this good moment in a journal.",
  ],
} as const

export type MoodType = keyof typeof careSuggestions
