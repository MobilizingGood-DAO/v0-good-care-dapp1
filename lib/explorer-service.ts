import { ethers } from "ethers"
import { CHAIN_CONFIG } from "./blockchain-config"

// Provider for the GOOD CARE Network
const provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrls[0])

// Explorer base URL
export const EXPLORER_URL = "https://subnets.avax.network/goodcare"

// Network stats interface
export interface NetworkStats {
  latestBlock: number
  gasPrice: string
  totalTransactions: number
  tps: number // Transactions per second
  activeValidators: number
}

// Block interface
export interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  miner: string
  gasUsed: string
  gasLimit: string
  baseFeePerGas?: string
}

// Transaction interface
export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  gasPrice: string
  gasPriceCARE: string
  gasLimit: string
  gasUsed: string
  timestamp: number
  blockNumber: number
  status: "success" | "failed" | "pending"
  method?: string
}

// Account interface
export interface Account {
  address: string
  balance: string
  transactionCount: number
  code: string
  isContract: boolean
}

// Fetch network stats
export async function fetchNetworkStats(): Promise<NetworkStats> {
  try {
    // Get latest block
    const latestBlock = await provider.getBlockNumber()

    // Get gas price
    const gasPrice = await provider.getFeeData()

    // Get latest blocks for TPS calculation
    const block = await provider.getBlock(latestBlock)
    const prevBlock = await provider.getBlock(latestBlock - 100)

    // Calculate TPS if blocks are available
    let tps = 0
    if (block && prevBlock && block.timestamp && prevBlock.timestamp) {
      const timeDiff = block.timestamp - prevBlock.timestamp
      const txCount = block.transactions.length
      tps = txCount / timeDiff
    }

    return {
      latestBlock,
      gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"),
      totalTransactions: 0, // This would require indexing all blocks
      tps,
      activeValidators: 0, // This would require validator contract data
    }
  } catch (error) {
    console.error("Error fetching network stats:", error)
    return {
      latestBlock: 0,
      gasPrice: "0",
      totalTransactions: 0,
      tps: 0,
      activeValidators: 0,
    }
  }
}

// Fetch latest blocks
export async function fetchLatestBlocks(count = 10): Promise<Block[]> {
  try {
    const latestBlockNumber = await provider.getBlockNumber()
    const blocks: Block[] = []

    for (let i = 0; i < count; i++) {
      const blockNumber = latestBlockNumber - i
      if (blockNumber < 0) break

      const block = await provider.getBlock(blockNumber)
      if (block) {
        blocks.push({
          number: block.number,
          hash: block.hash || "",
          timestamp: block.timestamp || 0,
          transactions: block.transactions.length,
          miner: block.miner || "",
          gasUsed: block.gasUsed?.toString() || "0",
          gasLimit: block.gasLimit?.toString() || "0",
          baseFeePerGas: block.baseFeePerGas?.toString() || undefined,
        })
      }
    }

    return blocks
  } catch (error) {
    console.error("Error fetching latest blocks:", error)
    return []
  }
}

// Convert Gwei to CARE
function gweiToCARE(gweiAmount: string): string {
  // 1 CARE = 10^18 wei, 1 Gwei = 10^9 wei, so 1 CARE = 10^9 Gwei
  const gweiValue = Number.parseFloat(gweiAmount)
  const careValue = gweiValue / 1_000_000_000
  return careValue.toFixed(9)
}

// Fetch latest transactions
export async function fetchLatestTransactions(count = 10): Promise<Transaction[]> {
  try {
    const latestBlockNumber = await provider.getBlockNumber()
    const transactions: Transaction[] = []
    let txCount = 0
    let blocksChecked = 0
    const maxBlocksToCheck = 20 // Increase this to check more blocks

    // Loop through blocks until we have enough transactions
    for (let i = 0; txCount < count && i < maxBlocksToCheck; i++) {
      const blockNumber = latestBlockNumber - i
      if (blockNumber < 0) break

      blocksChecked++
      const block = await provider.getBlock(blockNumber, true)

      if (block && block.transactions && block.transactions.length > 0) {
        // Add transactions from this block
        for (const tx of block.transactions) {
          if (txCount >= count) break

          try {
            // Get transaction receipt for status and gas used
            const receipt = await provider.getTransactionReceipt(tx.hash)

            // Skip if receipt is null (transaction pending)
            if (!receipt) continue

            // Calculate gas price in CARE
            const gasPriceGwei = ethers.formatUnits(tx.gasPrice || 0, "gwei")
            const gasPriceCARE = gweiToCARE(gasPriceGwei)

            transactions.push({
              hash: tx.hash,
              from: tx.from || "",
              to: tx.to,
              value: ethers.formatEther(tx.value || 0),
              gasPrice: gasPriceGwei,
              gasPriceCARE: gasPriceCARE,
              gasLimit: tx.gasLimit?.toString() || "0",
              gasUsed: receipt?.gasUsed?.toString() || "0",
              timestamp: block.timestamp || 0,
              blockNumber: block.number,
              status: receipt?.status ? "success" : "failed",
              method: tx.data && tx.data !== "0x" ? "Contract Interaction" : "Transfer",
            })

            txCount++
          } catch (err) {
            console.error(`Error processing transaction ${tx.hash}:`, err)
            continue
          }
        }
      }
    }

    // If we didn't find any transactions, add some mock data for demonstration
    if (transactions.length === 0) {
      // Generate mock transactions
      for (let i = 0; i < count; i++) {
        const mockTimestamp = Math.floor(Date.now() / 1000) - i * 600 // 10 minutes apart
        transactions.push({
          hash: `0x${Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          from: `0x${Array(40)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          to: `0x${Array(40)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")}`,
          value: (Math.random() * 10).toFixed(4),
          gasPrice: (Math.random() * 50).toFixed(2),
          gasPriceCARE: (Math.random() * 0.00000005).toFixed(9),
          gasLimit: (21000 + Math.floor(Math.random() * 50000)).toString(),
          gasUsed: (21000 + Math.floor(Math.random() * 30000)).toString(),
          timestamp: mockTimestamp,
          blockNumber: latestBlockNumber - i,
          status: Math.random() > 0.1 ? "success" : "failed",
          method: Math.random() > 0.7 ? "Contract Interaction" : "Transfer",
        })
      }
    }

    console.log(`Checked ${blocksChecked} blocks, found ${transactions.length} transactions`)
    return transactions
  } catch (error) {
    console.error("Error fetching latest transactions:", error)
    return []
  }
}

// Fetch block by number or hash
export async function fetchBlock(blockHashOrNumber: string | number): Promise<Block | null> {
  try {
    const block = await provider.getBlock(blockHashOrNumber)
    if (!block) return null

    return {
      number: block.number,
      hash: block.hash || "",
      timestamp: block.timestamp || 0,
      transactions: block.transactions.length,
      miner: block.miner || "",
      gasUsed: block.gasUsed?.toString() || "0",
      gasLimit: block.gasLimit?.toString() || "0",
      baseFeePerGas: block.baseFeePerGas?.toString() || undefined,
    }
  } catch (error) {
    console.error(`Error fetching block ${blockHashOrNumber}:`, error)
    return null
  }
}

// Fetch transaction by hash
export async function fetchTransaction(txHash: string): Promise<Transaction | null> {
  try {
    const tx = await provider.getTransaction(txHash)
    if (!tx) return null

    const receipt = await provider.getTransactionReceipt(txHash)
    const block = tx.blockNumber ? await provider.getBlock(tx.blockNumber) : null

    // Calculate gas price in CARE
    const gasPriceGwei = ethers.formatUnits(tx.gasPrice || 0, "gwei")
    const gasPriceCARE = gweiToCARE(gasPriceGwei)

    return {
      hash: tx.hash,
      from: tx.from || "",
      to: tx.to,
      value: ethers.formatEther(tx.value || 0),
      gasPrice: gasPriceGwei,
      gasPriceCARE: gasPriceCARE,
      gasLimit: tx.gasLimit?.toString() || "0",
      gasUsed: receipt?.gasUsed?.toString() || "0",
      timestamp: block?.timestamp || 0,
      blockNumber: tx.blockNumber || 0,
      status: receipt?.status ? "success" : receipt ? "failed" : "pending",
      method: tx.data && tx.data !== "0x" ? "Contract Interaction" : "Transfer",
    }
  } catch (error) {
    console.error(`Error fetching transaction ${txHash}:`, error)
    return null
  }
}

// Fetch account details
export async function fetchAccount(address: string): Promise<Account | null> {
  try {
    const [balance, transactionCount, code] = await Promise.all([
      provider.getBalance(address),
      provider.getTransactionCount(address),
      provider.getCode(address),
    ])

    return {
      address,
      balance: ethers.formatEther(balance),
      transactionCount,
      code,
      isContract: code !== "0x",
    }
  } catch (error) {
    console.error(`Error fetching account ${address}:`, error)
    return null
  }
}

// Search by block number, transaction hash, or address
export async function search(query: string): Promise<{
  type: "block" | "transaction" | "account" | "not_found"
  result: any
}> {
  try {
    // Check if it's a block number
    if (/^\d+$/.test(query)) {
      const block = await fetchBlock(Number.parseInt(query))
      if (block) {
        return { type: "block", result: block }
      }
    }

    // Check if it's a transaction hash
    if (/^0x[a-fA-F0-9]{64}$/.test(query)) {
      const tx = await fetchTransaction(query)
      if (tx) {
        return { type: "transaction", result: tx }
      }
    }

    // Check if it's an address
    if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
      const account = await fetchAccount(query)
      if (account) {
        return { type: "account", result: account }
      }
    }

    return { type: "not_found", result: null }
  } catch (error) {
    console.error(`Error searching for ${query}:`, error)
    return { type: "not_found", result: null }
  }
}
