"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MessageCircle } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"

// Mood emojis mapping
const MOOD_EMOJIS = {
  1: "😢",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
}

const MOOD_LABELS = {
  1: "Very Upset",
  2: "Somewhat Upset",
  3: "Neutral",
  4: "Somewhat Happy",
  5: "Very Happy",
}

const MOOD_COLORS = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-blue-100 text-blue-800",
  5: "bg-green-100 text-green-800",
}

interface CheckInEntry {
  date: string
  mood: number
  reflection?: string
  timestamp: number
}

interface CheckInHistoryProps {
  limit?: number
}

export function CheckInHistory({ limit = 10 }: CheckInHistoryProps) {
  const { address, isConnected } = useWallet()
  const [entries, setEntries] = useState<CheckInEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      const storedData = localStorage.getItem(`checkIn_${address}`)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          const sortedEntries = (parsedData.entries || [])
            .sort((a: CheckInEntry, b: CheckInEntry) => b.timestamp - a.timestamp)
            .slice(0, limit)
          setEntries(sortedEntries)
        } catch (error) {
          console.error("Error parsing check-in data:", error)
        }
      }
    }
    setIsLoading(false)
  }, [address, isConnected, limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-in History
          </CardTitle>
          <CardDescription>Your recent mood check-ins and reflections</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Connect your wallet to view your check-in history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Check-in History
        </CardTitle>
        <CardDescription>Your recent mood check-ins and reflections</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading check-in history...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-muted-foreground">No check-ins yet</p>
            <p className="text-sm text-muted-foreground">Start your daily reflection journey!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <div className="text-2xl">{MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS]}>
                        {MOOD_LABELS[entry.mood as keyof typeof MOOD_LABELS]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                    </div>
                    {entry.reflection && (
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.reflection}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
