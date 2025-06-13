"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Lightbulb } from "lucide-react"
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
  const [completedSuggestions, setCompletedSuggestions] = useState<Record<string, boolean>>({})

  const toggleSuggestionCompletion = (id: string) => {
    setCompletedSuggestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getEmojiForRating = (rating: number): string => {
    switch (rating) {
      case 1:
        return "😢"
      case 2:
        return "😕"
      case 3:
        return "😐"
      case 4:
        return "😊"
      case 5:
        return "😄"
      default:
        return "😐"
    }
  }

  const getColorForRating = (rating: number): string => {
    switch (rating) {
      case 1:
        return "text-red-600"
      case 2:
        return "text-orange-600"
      case 3:
        return "text-yellow-600"
      case 4:
        return "text-green-600"
      case 5:
        return "text-purple-600"
      default:
        return "text-blue-600"
    }
  }

  const getBackgroundForRating = (rating: number): string => {
    switch (rating) {
      case 1:
        return "bg-red-50"
      case 2:
        return "bg-orange-50"
      case 3:
        return "bg-yellow-50"
      case 4:
        return "bg-green-50"
      case 5:
        return "bg-purple-50"
      default:
        return "bg-blue-50"
    }
  }

  const getBorderForRating = (rating: number): string => {
    switch (rating) {
      case 1:
        return "border-red-200"
      case 2:
        return "border-orange-200"
      case 3:
        return "border-yellow-200"
      case 4:
        return "border-green-200"
      case 5:
        return "border-purple-200"
      default:
        return "border-blue-200"
    }
  }

  const getMessageForRating = (rating: number): string => {
    switch (rating) {
      case 1:
        return "Be gentle with yourself today. Here are some suggestions that might help:"
      case 2:
        return "Tough days happen. Consider these ideas to help shift your energy:"
      case 3:
        return "Here are some ways to boost your day:"
      case 4:
        return "Great job! Here are some ways to maintain this positive energy:"
      case 5:
        return "You're doing amazing! Here are some ways to make the most of this great mood:"
      default:
        return "Here are some suggestions based on your check-in:"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{getEmojiForRating(emojiRating)}</span>
            <span>Check-in Complete!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Points Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="font-medium text-green-800">You earned {totalPoints} CARE Points!</div>
            {streakDays > 1 && <div className="text-sm text-green-700">{streakDays} day streak! 🔥</div>}
          </div>

          {/* Suggestions */}
          <div
            className={`p-4 rounded-lg border space-y-3 ${getBackgroundForRating(
              emojiRating,
            )} ${getBorderForRating(emojiRating)}`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className={`h-4 w-4 ${getColorForRating(emojiRating)}`} />
              <h4 className={`font-medium text-sm ${getColorForRating(emojiRating)}`}>
                {getMessageForRating(emojiRating)}
              </h4>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`flex items-start gap-3 p-3 rounded-md border ${
                    completedSuggestions[suggestion.id]
                      ? "bg-gray-50 border-gray-200 text-gray-500"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="text-xl flex-shrink-0">{suggestion.icon}</div>
                  <div className="flex-grow">
                    <p className={`text-sm ${completedSuggestions[suggestion.id] ? "line-through text-gray-400" : ""}`}>
                      {suggestion.text}
                    </p>
                    <div className="mt-2">
                      <Button
                        variant={completedSuggestions[suggestion.id] ? "outline" : "secondary"}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => toggleSuggestionCompletion(suggestion.id)}
                      >
                        {completedSuggestions[suggestion.id] ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          "Mark as done"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
