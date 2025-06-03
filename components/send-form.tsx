"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/providers/wallet-provider"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { searchUsers, getDisplayName } from "@/lib/user-profile"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SendFormProps {
  type: "token" | "nft"
}

export function SendForm({ type }: SendFormProps) {
  const { address, isConnected } = useWallet()
  const { balances } = useTokenBalances(address)
  const { toast } = useToast()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [tokenType, setTokenType] = useState("GCT")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleRecipientSearch = (query: string) => {
    setRecipient(query)
    if (query.length > 2) {
      const results = searchUsers(query)
      setSearchResults(results.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }

  const selectRecipient = (userAddress: string) => {
    setRecipient(userAddress)
    setSearchResults([])
  }

  const handleSend = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please enter recipient and amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Transaction sent!",
        description: `Sent ${amount} ${tokenType} to ${getDisplayName(recipient)}`,
      })

      // Reset form
      setRecipient("")
      setAmount("")
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "Could not send tokens. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Connect your wallet to send {type === "token" ? "tokens" : "NFTs"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient</Label>
        <div className="relative">
          <Input
            id="recipient"
            placeholder="Enter username or wallet address"
            value={recipient}
            onChange={(e) => handleRecipientSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 mt-1">
              {searchResults.map((user) => (
                <button
                  key={user.address}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                  onClick={() => selectRecipient(user.address)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {type === "token" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="token-type">Token</Label>
            <Select value={tokenType} onValueChange={setTokenType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GCT">GCT (Balance: {balances.gct})</SelectItem>
                <SelectItem value="CARE">CARE (Balance: {balances.care})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </>
      )}

      <Button onClick={handleSend} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Send {type === "token" ? "Tokens" : "NFT"}
      </Button>
    </div>
  )
}
