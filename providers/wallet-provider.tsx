"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { Connection, type PublicKey, clusterApiUrl } from "@solana/web3.js"
import { Program, AnchorProvider } from "@project-serum/anchor"
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSlopeWallet,
  getBackpackWallet,
  getExodusWallet,
  getGlowWallet,
  getTorusWallet,
  getLedgerWallet,
  getMathWallet,
  getSafePalWallet,
  getSolongWallet,
  getTokenPocketWallet,
} from "@solana/wallet-adapter-wallets"
import { useWallet, WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

require("@solana/wallet-adapter-react-ui/styles.css")

// Define the context
interface WalletContextState {
  wallet: any
  publicKey: PublicKey | null
  connection: Connection | null
  program: Program | null
  // Add any other relevant state or functions here
}

const WalletContext = createContext<WalletContextState | undefined>(undefined)

// Define the provider
interface WalletProviderProps {
  children: ReactNode
  network?: string
  programId?: string
  idl?: any
}

const WalletContextProvider: React.FC<WalletProviderProps> = ({ children, network = "devnet", programId, idl }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const wallet = useWallet()
  const endpoint = clusterApiUrl(network)
  const connection = new Connection(endpoint, "processed")

  const { publicKey } = wallet

  const opts = {
    preflightCommitment: "processed",
  }

  const provider = new AnchorProvider(connection, wallet, opts.preflightCommitment)

  const program = programId && idl ? new Program(idl, programId, provider) : null

  if (!mounted) {
    return <>{children}</>
  }

  return <WalletContext.Provider value={{ wallet, publicKey, connection, program }}>{children}</WalletContext.Provider>
}

// Custom hook to use the context
const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletContextProvider")
  }
  return context
}

const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = "devnet"

  const wallets = [
    /* new PhantomWalletAdapter(),
    new GlowWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new SolletWalletAdapter({ network }), */
    getPhantomWallet(),
    getSolflareWallet(),
    getSolletWallet(),
    getSlopeWallet(),
    getBackpackWallet(),
    getExodusWallet(),
    getGlowWallet(),
    getTorusWallet(),
    getLedgerWallet(),
    getMathWallet(),
    getSafePalWallet(),
    getSolongWallet(),
    getTokenPocketWallet(),
  ]

  return (
    <ConnectionProvider endpoint={clusterApiUrl(network)}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export { WalletContextProvider, useWalletContext, WalletProviderWrapper }
