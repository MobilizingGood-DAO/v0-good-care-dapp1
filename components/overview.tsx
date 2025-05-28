"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { useWallet } from "@/providers/wallet-provider"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Format date as "Mon DD"
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
}

// Generate past days
const generatePastDays = (days: number) => {
  const result = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    result.push({
      date: date,
      dateString: formatDate(date),
      timestamp: date.getTime(),
    })
  }

  return result
}

export function Overview() {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork, address } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (isConnected && address) {
      // Generate empty chart data for the past 7 days
      const pastDays = generatePastDays(7)
      const emptyData = pastDays.map((day) => ({
        date: day.dateString,
        timestamp: day.timestamp,
        mood: null,
        color: "#e5e7eb",
      }))

      setChartData(emptyData)
      setIsLoading(false)
    }
  }, [isConnected, address])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 bg-white shadow-lg border">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-muted-foreground">No check-in data yet</div>
        </Card>
      )
    }
    return null
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Check-in History</CardTitle>
          <CardDescription>View your daily mood check-ins</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="mb-4">Connect your wallet to view your mood history</p>
          <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isCorrectChain) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Check-in History</CardTitle>
          <CardDescription>View your daily mood check-ins</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="mb-4">Switch to the GOOD CARE Network to view your mood history</p>
          <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
            Switch Network
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Check-in History</CardTitle>
          <CardDescription>View your daily mood check-ins</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading your mood history...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Check-in History</CardTitle>
        <CardDescription>Start checking in to see your mood trends</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={3} stroke="#9ca3af" strokeDasharray="3 3" />
                <Bar dataKey="mood" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No check-in data available yet</p>
            <p className="text-sm text-muted-foreground">Start checking in daily to see your mood trends</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
