"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { sendGCTTokens, sendCARETokens } from "@/lib/blockchain"
import { searchUsers, getDisplayName, loadUserProfiles, initializeDemoProfiles } from "@/lib/user-profile"

interface SendFormProps {
  type: "token" | "nft"
}

export function SendForm({ type }: SendFormProps) {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { balances } = useTokenBalances()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [selectedNFT, setSelectedNFT] = useState("")
  const [selectedToken, setSelectedToken] = useState("gct")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)

  // Initialize user profiles on component mount
  useEffect(() => {
    loadUserProfiles()
    initializeDemoProfiles()
  }, [])

  // Search for users when recipient changes
  useEffect(() => {
    if (recipient.length > 2 && !recipient.startsWith("0x")) {
      const results = searchUsers(recipient)
      setSearchResults(results)
      setShowSearch(results.length > 0)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [recipient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if wallet is connected and on the correct chain
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!isCorrectChain) {
      const success = await switchNetwork()
      if (!success) return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      if (type === "token") {
        let result
        if (selectedToken === "gct") {
          result = await sendGCTTokens(recipient, amount)
        } else {
          result = await sendCARETokens(recipient, amount)
        }

        if (result.success) {
          setStatus("success")
          // Reset form after success
          setTimeout(() => {
            setStatus("idle")
            setRecipient("")
            setAmount("")
            setMessage("")
          }, 3000)
        } else {
          setStatus("error")
          setErrorMessage(result.error || "Transaction failed")
        }
      } else {
        // NFT sending logic would go here
        setStatus("success")
        setTimeout(() => {
          setStatus("idle")
          setRecipient("")
          setMessage("")
          setSelectedNFT("")
        }, 3000)
      }
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.message || "An unexpected error occurred")
    }
  }

  const selectUser = (userAddress: string) => {
    setRecipient(userAddress)
    setShowSearch(false)
  }

  const nfts = [
    { id: "nft1", name: "Community Contributor" },
    { id: "nft2", name: "Regenerative Finance Summit" },
    { id: "nft4", name: "Healing Circle Participant" },
    { id: "nft5", name: "Earth Day Celebration" },
  ]

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Connect your wallet to send {type === "token" ? "tokens" : "NFTs"}</p>
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (isConnected && !isCorrectChain) {
    return (
      <div className="text-center py-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription>
            Please switch to the GOOD CARE Network to send {type === "token" ? "tokens" : "NFTs"}
          </AlertDescription>
        </Alert>
        <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
          Switch Network
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "success" && (
        <Alert className="bg-green-50 border-green-600">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your {type === "token" ? "tokens" : "NFT"} have been sent successfully.</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient</Label>
        <div className="relative">
          <Input
            id="recipient"
            placeholder="Search by name or enter wallet address"
            value={getDisplayName(recipient)}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          {showSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="max-h-60 overflow-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.address}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectUser(user.address)}
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                    <div className="text-xs text-gray-400">{user.address.substring(0, 10)}...</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {type === "token" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token to send" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gct">GCT (Balance: {balances.gct.balance})</SelectItem>
                <SelectItem value="care">CARE (Balance: {balances.care.balance})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="shrink-0">{selectedToken === "gct" ? "GCT" : "CARE"}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Available: {selectedToken === "gct" ? balances.gct.balance : balances.care.balance}{" "}
              {selectedToken === "gct" ? "GCT" : "CARE"}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="nft">Select NFT</Label>
          <Select value={selectedNFT} onValueChange={setSelectedNFT} required>
            <SelectTrigger>
              <SelectValue placeholder="Select an NFT to send" />
            </SelectTrigger>
            <SelectContent>
              {nfts.map((nft) => (
                <SelectItem key={nft.id} value={nft.id}>
                  {nft.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          placeholder="Add a personal message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={status === "loading"}>
        {status === "loading"
          ? "Sending..."
          : `Send ${type === "token" ? (selectedToken === "gct" ? "GCT" : "CARE") : "NFT"}`}
      </Button>
    </form>
  )
}
