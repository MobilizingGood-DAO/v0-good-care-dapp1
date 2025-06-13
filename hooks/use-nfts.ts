"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchNFTs, type NFTItem, ALL_NFT_CONTRACTS } from "@/lib/blockchain"

export function useNFTs(filter = "all") {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch NFTs
  useEffect(() => {
    async function getNFTs() {
      if (!address || !isConnected || !isCorrectChain) return

      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching NFTs for address:", address)
        const nftData = await fetchNFTs(address)
        console.log("NFT data received:", nftData)
        setNfts(nftData)
      } catch (err: any) {
        console.error("Error fetching NFTs:", err)
        setError(err?.message || "Failed to fetch NFTs")
      } finally {
        setIsLoading(false)
      }
    }

    getNFTs()
  }, [address, isConnected, isCorrectChain])

  // Update the filtering logic
  useEffect(() => {
    if (filter === "all") {
      setFilteredNfts(nfts)
    } else if (filter === "erc721") {
      // Filter by ERC-721 contracts
      const erc721Addresses = ALL_NFT_CONTRACTS.filter((contract) => contract.type === "ERC721").map((contract) =>
        contract.address.toLowerCase(),
      )
      setFilteredNfts(nfts.filter((nft) => erc721Addresses.includes(nft.contractAddress.toLowerCase())))
    } else if (filter === "erc1155") {
      // Filter by ERC-1155 contracts
      const erc1155Addresses = ALL_NFT_CONTRACTS.filter((contract) => contract.type === "ERC1155").map((contract) =>
        contract.address.toLowerCase(),
      )
      setFilteredNfts(nfts.filter((nft) => erc1155Addresses.includes(nft.contractAddress.toLowerCase())))
    } else if (filter === "reflections") {
      // Filter specifically for the reflections contract
      setFilteredNfts(
        nfts.filter(
          (nft) => nft.contractAddress.toLowerCase() === "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813".toLowerCase(),
        ),
      )
    } else {
      // Legacy filters for backward compatibility
      const nftType = filter.endsWith("s")
        ? (filter.slice(0, -1) as "badge" | "reflection" | "soulbound")
        : (filter as "badge" | "reflection" | "soulbound")
      setFilteredNfts(nfts.filter((nft) => nft.type === nftType))
    }
  }, [nfts, filter])

  // Update reflections count to be total NFT count
  const reflectionsCount = nfts.filter(
    (nft) => nft.contractAddress.toLowerCase() === "0xC28Bd1D69E390beF1547a63Fa705618C41F3B813".toLowerCase(),
  ).length

  return {
    nfts: filteredNfts,
    allNfts: nfts,
    reflectionsCount,
    isLoading,
    error,
  }
}
