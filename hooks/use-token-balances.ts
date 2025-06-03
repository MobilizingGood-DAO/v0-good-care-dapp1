"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@txnlab/use-wallet"
import { useAccount } from "wagmi"
import { providers, utils, Contract } from "@/lib/mock-ethers"

interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
}

interface UseTokenBalancesResult {
  balances: TokenBalance[] | null
  isLoading: boolean
  error: Error | null
}

const useTokenBalances = (tokenAddresses: string[], providerUrl: string | undefined): UseTokenBalancesResult => {
  const { address: wagmiAddress } = useAccount()
  const { activeAccount } = useWallet()
  const [balances, setBalances] = useState<TokenBalance[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!wagmiAddress && !activeAccount?.address) {
          setBalances(null)
          return
        }

        if (!providerUrl) {
          throw new Error("Provider URL is required.")
        }

        const ethProvider = new providers.JsonRpcProvider(providerUrl)
        const signer = ethProvider.getSigner(wagmiAddress || activeAccount?.address)

        const fetchedBalances: TokenBalance[] = []

        for (const tokenAddress of tokenAddresses) {
          const tokenContract = new Contract(
            tokenAddress,
            [
              "function symbol() view returns (string)",
              "function balanceOf(address) view returns (uint256)",
              "function decimals() view returns (uint8)",
            ],
            signer,
          )

          const symbol = await tokenContract.symbol()
          const decimals = await tokenContract.decimals()
          const balance = await tokenContract.balanceOf(wagmiAddress || activeAccount?.address)
          const formattedBalance = utils.formatUnits(balance, decimals)

          fetchedBalances.push({
            symbol,
            balance: formattedBalance,
            decimals,
          })
        }

        setBalances(fetchedBalances)
      } catch (err: any) {
        setError(err)
        setBalances(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [tokenAddresses, providerUrl, wagmiAddress, activeAccount?.address])

  return { balances, isLoading, error }
}

export default useTokenBalances
