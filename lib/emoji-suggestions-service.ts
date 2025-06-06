export interface EmojiSuggestion {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  category: "wellness" | "mindfulness" | "social" | "activity" | "gratitude"
  icon: string
}

export class EmojiSuggestionsService {
  // Get suggestions for a specific rating
  static getSuggestionsForRating(rating: number, count = 2): EmojiSuggestion[] {
    const suggestions = this.getAllSuggestions().filter((s) => s.rating === rating)

    // Shuffle the suggestions
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random())

    // Return the requested number of suggestions
    return shuffled.slice(0, count)
  }

  // Get all suggestions
  static getAllSuggestions(): EmojiSuggestion[] {
    return [
      // Rating 1: Struggling
      {
        id: "1-1",
        rating: 1,
        text: "Take 5 deep breaths. Inhale for 4 counts, hold for 4, exhale for 6.",
        category: "mindfulness",
        icon: "🧘",
      },
      {
        id: "1-2",
        rating: 1,
        text: "Place your hand on your heart and say 'This is hard right now, and that's okay.'",
        category: "mindfulness",
        icon: "❤️",
      },
      {
        id: "1-3",
        rating: 1,
        text: "Text or call someone who makes you feel safe and supported.",
        category: "social",
        icon: "📱",
      },
      {
        id: "1-4",
        rating: 1,
        text: "Drink a glass of water slowly and mindfully.",
        category: "wellness",
        icon: "💧",
      },
      {
        id: "1-5",
        rating: 1,
        text: "Step outside for 5 minutes of fresh air.",
        category: "activity",
        icon: "🌳",
      },
      {
        id: "1-6",
        rating: 1,
        text: "Write down what you're feeling without judgment.",
        category: "mindfulness",
        icon: "📝",
      },
      {
        id: "1-7",
        rating: 1,
        text: "Listen to a song that has helped you through difficult times before.",
        category: "wellness",
        icon: "🎵",
      },
      {
        id: "1-8",
        rating: 1,
        text: "Wrap yourself in a blanket and give yourself permission to rest.",
        category: "wellness",
        icon: "🛌",
      },

      // Rating 2: Difficult
      {
        id: "2-1",
        rating: 2,
        text: "Name three things you can see, hear, and feel right now.",
        category: "mindfulness",
        icon: "👁️",
      },
      {
        id: "2-2",
        rating: 2,
        text: "Do a quick 2-minute stretch focusing on your shoulders and neck.",
        category: "wellness",
        icon: "🧠",
      },
      {
        id: "2-3",
        rating: 2,
        text: "Write down one small thing that went well today, no matter how tiny.",
        category: "gratitude",
        icon: "✏️",
      },
      {
        id: "2-4",
        rating: 2,
        text: "Make yourself a warm, comforting drink and savor it.",
        category: "wellness",
        icon: "☕",
      },
      {
        id: "2-5",
        rating: 2,
        text: "Look at photos of a happy memory or loved ones.",
        category: "gratitude",
        icon: "📸",
      },
      {
        id: "2-6",
        rating: 2,
        text: "Set a timer for 10 minutes to do something that usually brings you joy.",
        category: "activity",
        icon: "⏱️",
      },
      {
        id: "2-7",
        rating: 2,
        text: "Send a kind message to someone else who might be having a tough day.",
        category: "social",
        icon: "💌",
      },
      {
        id: "2-8",
        rating: 2,
        text: "Practice 'box breathing': inhale for 4, hold for 4, exhale for 4, hold for 4.",
        category: "mindfulness",
        icon: "📦",
      },

      // Rating 3: Okay
      {
        id: "3-1",
        rating: 3,
        text: "Take a 10-15 minute walk, even if it's just around your home or office.",
        category: "activity",
        icon: "🚶",
      },
      {
        id: "3-2",
        rating: 3,
        text: "Write down three things you're looking forward to this week.",
        category: "gratitude",
        icon: "📅",
      },
      {
        id: "3-3",
        rating: 3,
        text: "Do a small act of organization that will make tomorrow easier.",
        category: "activity",
        icon: "🧹",
      },
      {
        id: "3-4",
        rating: 3,
        text: "Take a social media break for the next few hours.",
        category: "wellness",
        icon: "📵",
      },
      {
        id: "3-5",
        rating: 3,
        text: "Listen to an upbeat song and move your body to it.",
        category: "activity",
        icon: "🎧",
      },
      {
        id: "3-6",
        rating: 3,
        text: "Reach out to a friend you haven't spoken to in a while.",
        category: "social",
        icon: "👋",
      },
      {
        id: "3-7",
        rating: 3,
        text: "Try a new herbal tea or healthy snack.",
        category: "wellness",
        icon: "🍵",
      },
      {
        id: "3-8",
        rating: 3,
        text: "Set one small, achievable goal for today.",
        category: "activity",
        icon: "🎯",
      },

      // Rating 4: Good
      {
        id: "4-1",
        rating: 4,
        text: "Share your positive energy by complimenting someone today.",
        category: "social",
        icon: "💬",
      },
      {
        id: "4-2",
        rating: 4,
        text: "Build on this momentum by tackling something you've been putting off.",
        category: "activity",
        icon: "🏃",
      },
      {
        id: "4-3",
        rating: 4,
        text: "Take a photo of something beautiful or meaningful today.",
        category: "gratitude",
        icon: "📷",
      },
      {
        id: "4-4",
        rating: 4,
        text: "Try a 5-minute mindfulness meditation to enhance your good mood.",
        category: "mindfulness",
        icon: "🧠",
      },
      {
        id: "4-5",
        rating: 4,
        text: "Plan something fun for later this week to look forward to.",
        category: "activity",
        icon: "🗓️",
      },
      {
        id: "4-6",
        rating: 4,
        text: "Write a thank-you note to someone who has helped you recently.",
        category: "gratitude",
        icon: "✉️",
      },
      {
        id: "4-7",
        rating: 4,
        text: "Do a random act of kindness for someone else.",
        category: "social",
        icon: "🎁",
      },
      {
        id: "4-8",
        rating: 4,
        text: "Take a moment to appreciate your progress on a recent goal.",
        category: "gratitude",
        icon: "🏆",
      },

      // Rating 5: Great
      {
        id: "5-1",
        rating: 5,
        text: "Reflect on what's contributing to your great mood and how to do more of it.",
        category: "mindfulness",
        icon: "🌟",
      },
      {
        id: "5-2",
        rating: 5,
        text: "Channel this energy into a creative project or activity you enjoy.",
        category: "activity",
        icon: "🎨",
      },
      {
        id: "5-3",
        rating: 5,
        text: "Share your joy with someone else through a call, text, or visit.",
        category: "social",
        icon: "📞",
      },
      {
        id: "5-4",
        rating: 5,
        text: "Write down this feeling to revisit on harder days.",
        category: "mindfulness",
        icon: "📔",
      },
      {
        id: "5-5",
        rating: 5,
        text: "Set an intention or goal while you're feeling motivated and positive.",
        category: "activity",
        icon: "🚀",
      },
      {
        id: "5-6",
        rating: 5,
        text: "Express gratitude to someone who has positively impacted your life.",
        category: "gratitude",
        icon: "🙏",
      },
      {
        id: "5-7",
        rating: 5,
        text: "Pay it forward with a kind gesture for someone else.",
        category: "social",
        icon: "💝",
      },
      {
        id: "5-8",
        rating: 5,
        text: "Take a moment to appreciate your body and what it allows you to do.",
        category: "wellness",
        icon: "💪",
      },
    ]
  }
}
