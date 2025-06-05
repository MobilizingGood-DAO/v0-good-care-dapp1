"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, CheckCircle } from "lucide-react"
import type { EmojiSuggestion } from "@/lib/emoji-suggestions-service"

interface SuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  suggestions: EmojiSuggestion[]
  emojiRating: number
  totalPoints: number
  streakDays: number
}

export function SuggestionsModal({
  isOpen,
  onClose,
  suggestions,
  emojiRating,
  totalPoints,
  streakDays,
}: SuggestionsModalProps) {
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set())

  const handleMarkComplete = (suggestionId: string) => {
    setCompletedSuggestions((prev) => new Set([...prev, suggestionId]))
  }

  const getRatingMessage = (rating: number) => {
    switch (rating) {
      case 1:
        return "It's okay to have tough days. Here are some gentle suggestions to help you through:"
      case 2:
        return "Things feel a bit challenging today. These might help lift your spirits:"
      case 3:
        return "You're doing okay! Here are some ways to boost your day:"
      case 4:
        return "You're feeling good! Let's keep that positive energy flowing:"
      case 5:
        return "You're having an amazing day! Here's how to make it even better:"
      default:
        return "Here are some personalized suggestions for you:"
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1:
        return "text-red-600 bg-red-50 border-red-200"
      case 2:
        return "text-orange-600 bg-orange-50 border-orange-200"
      case 3:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 4:
        return "text-green-600 bg-green-50 border-green-200"
      case 5:
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Check-in Complete! 🎉
          </DialogTitle>
          <DialogDescription>
            You earned <strong>{totalPoints} CARE Points</strong>
            {streakDays > 1 && (
              <span>
                {" "}
                and maintained your <strong>{streakDays}-day streak</strong>!
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Message */}
          <div className={`p-4 rounded-lg border ${getRatingColor(emojiRating)}`}>
            <p className="font-medium">{getRatingMessage(emojiRating)}</p>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Personalized Suggestions
            </h3>

            {suggestions.map((suggestion, index) => (
              <Card key={suggestion.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{suggestion.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{suggestion.text}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        {completedSuggestions.has(suggestion.id) ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed!
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkComplete(suggestion.id)}
                            className="text-xs"
                          >
                            Mark as Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Encouragement */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <p className="text-sm text-gray-600">Remember: Small actions create big changes. You're doing great! 💙</p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button onClick={onClose} className="w-full max-w-xs">
              Continue Your Journey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
