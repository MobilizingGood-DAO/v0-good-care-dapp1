"use client"

import { useWallet } from "@/providers/wallet-provider"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ethers } from "ethers"

// Mock transaction data for display
const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    type: "received",
    amount: "+10.0",
    token: "GCT",
    from: "0x1234567890123456789012345678901234567890",
    to: "",
    date: "2023-05-15",
    status: "completed",
  },
  {
    id: "tx2",
    type: "sent",
    amount: "-5.0",
    token: "GCT",
    from: "",
    to: "0x0987654321098765432109876543210987654321",
    date: "2023-05-10",
    status: "completed",
  },
  {
    id: "tx3",
    type: "received",
    amount: "+0.5",
    token: "CARE",
    from: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    to: "",
    date: "2023-05-05",
    status: "completed",
  },
]

export function SimplifiedTransactionHistory() {
  const { address, isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)

  useEffect(() => {
    // Simulate loading
    if (isConnected && isCorrectChain) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        fetchTransactions()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, isCorrectChain, address])

  const fetchTransactions = async () => {
    if (!isConnected || !address || typeof window === "undefined" || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)

      // We'll attempt to fetch a few real transactions if possible
      // This is a simplified implementation - in production you'd use an indexer or API

      // For now, we'll just use our mock data
      // In a real implementation, you'd fetch from the blockchain or an API

      // setTransactions(realTransactions)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Connect your wallet to view your transaction history</p>
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Switch to the GOOD CARE Network to view your transaction history</p>
        <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
          Switch Network
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading your transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium capitalize">
              {tx.type} {tx.token}
            </h4>
            <p className="text-sm text-muted-foreground">
              {tx.type === "received"
                ? `From: ${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`
                : `To: ${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}`}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {tx.amount} {tx.token}
            </p>
            <p className="text-sm text-muted-foreground">{tx.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
