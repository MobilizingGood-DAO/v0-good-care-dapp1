export interface EmojiSuggestion {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  category: "wellness" | "mindfulness" | "social" | "activity" | "gratitude"
  icon: string
}

export class EmojiSuggestionsService {
  private static suggestions: Record<number, EmojiSuggestion[]> = {
    1: [
      {
        id: "breathe-1",
        rating: 1,
        text: "Take 5 deep breaths. Inhale for 4 counts, hold for 4, exhale for 6.",
        category: "wellness",
        icon: "🫁",
      },
      {
        id: "journal-1",
        rating: 1,
        text: "Write down 3 things you're feeling right now. No judgment, just awareness.",
        category: "mindfulness",
        icon: "📝",
      },
      {
        id: "support-1",
        rating: 1,
        text: "Reach out to someone you trust. You don't have to face this alone.",
        category: "social",
        icon: "🤝",
      },
      {
        id: "gentle-1",
        rating: 1,
        text: "Be extra gentle with yourself today. You're doing the best you can.",
        category: "wellness",
        icon: "💛",
      },
      {
        id: "rest-1",
        rating: 1,
        text: "Consider taking a warm bath or shower to reset your energy.",
        category: "wellness",
        icon: "🛁",
      },
    ],
    2: [
      {
        id: "gratitude-2",
        rating: 2,
        text: "Name one small thing that went well today, even if it seems tiny.",
        category: "gratitude",
        icon: "🙏",
      },
      {
        id: "stretch-2",
        rating: 2,
        text: "Try gentle stretching or yoga for 5-10 minutes to release tension.",
        category: "activity",
        icon: "🧘",
      },
      {
        id: "music-2",
        rating: 2,
        text: "Listen to a song that usually lifts your spirits.",
        category: "wellness",
        icon: "🎵",
      },
      {
        id: "nature-2",
        rating: 2,
        text: "Step outside for a few minutes, even if just to feel fresh air.",
        category: "activity",
        icon: "🌿",
      },
      {
        id: "tea-2",
        rating: 2,
        text: "Make yourself a warm drink and savor it mindfully.",
        category: "mindfulness",
        icon: "🍵",
      },
    ],
    3: [
      {
        id: "walk-3",
        rating: 3,
        text: "Take a 10-15 minute walk. Movement can shift your energy.",
        category: "activity",
        icon: "🚶",
      },
      {
        id: "wins-3",
        rating: 3,
        text: "Celebrate one small accomplishment from today, no matter how minor.",
        category: "gratitude",
        icon: "🎉",
      },
      {
        id: "organize-3",
        rating: 3,
        text: "Tidy up one small space around you. External order can create internal calm.",
        category: "activity",
        icon: "🧹",
      },
      {
        id: "hydrate-3",
        rating: 3,
        text: "Drink a full glass of water and notice how your body feels.",
        category: "wellness",
        icon: "💧",
      },
      {
        id: "future-3",
        rating: 3,
        text: "Think of one thing you're looking forward to this week.",
        category: "mindfulness",
        icon: "🌅",
      },
    ],
    4: [
      {
        id: "momentum-4",
        rating: 4,
        text: "Keep this positive energy going! Share a smile with someone today.",
        category: "social",
        icon: "😊",
      },
      {
        id: "appreciate-4",
        rating: 4,
        text: "Take a moment to appreciate yourself for how far you've come.",
        category: "gratitude",
        icon: "💙",
      },
      {
        id: "creative-4",
        rating: 4,
        text: "Channel this good energy into something creative or fun.",
        category: "activity",
        icon: "🎨",
      },
      {
        id: "connect-4",
        rating: 4,
        text: "Reach out to someone you care about and let them know you're thinking of them.",
        category: "social",
        icon: "💌",
      },
      {
        id: "learn-4",
        rating: 4,
        text: "Use this positive mindset to learn something new or tackle a small challenge.",
        category: "activity",
        icon: "📚",
      },
    ],
    5: [
      {
        id: "thrive-5",
        rating: 5,
        text: "Reflect on what's helping you thrive. How can you do more of it?",
        category: "mindfulness",
        icon: "🌟",
      },
      {
        id: "forward-5",
        rating: 5,
        text: "Pay it forward! Support a friend or do something kind for a stranger.",
        category: "social",
        icon: "🤲",
      },
      {
        id: "document-5",
        rating: 5,
        text: "Write down what made today great so you can remember this feeling.",
        category: "gratitude",
        icon: "📖",
      },
      {
        id: "energy-5",
        rating: 5,
        text: "Use this amazing energy to tackle something you've been putting off.",
        category: "activity",
        icon: "⚡",
      },
      {
        id: "inspire-5",
        rating: 5,
        text: "Share your positive energy! Post something uplifting or encouraging.",
        category: "social",
        icon: "✨",
      },
    ],
  }

  static getSuggestionsForRating(rating: number, count = 2): EmojiSuggestion[] {
    const normalizedRating = Math.min(Math.max(rating, 1), 5)
    const ratingSuggestions = this.suggestions[normalizedRating] || this.suggestions[3]

    // Randomly select suggestions
    const shuffled = [...ratingSuggestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  static getAllSuggestions(): EmojiSuggestion[] {
    return Object.values(this.suggestions).flat()
  }

  static getSuggestionsByCategory(category: EmojiSuggestion["category"]): EmojiSuggestion[] {
    return this.getAllSuggestions().filter((s) => s.category === category)
  }

  static getRandomSuggestion(): EmojiSuggestion {
    const all = this.getAllSuggestions()
    return all[Math.floor(Math.random() * all.length)]
  }
}
