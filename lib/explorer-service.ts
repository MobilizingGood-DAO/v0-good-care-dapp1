// Network stats interface
export interface NetworkStats {
  latestBlock: number
  gasPrice: string
  totalTransactions: number
  tps: number
  activeValidators: number
}

// Block interface
export interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  gasUsed: string
  gasLimit: string
  miner: string
  difficulty: string
  size: number
  baseFeePerGas?: string
}

// Transaction interface
export interface Transaction {
  hash: string
  blockNumber: number
  from: string
  to: string | null
  value: string
  gasPrice: string
  gasPriceCARE: string
  gasUsed: string
  gasLimit: string
  timestamp: number
  status: "success" | "failed" | "pending"
  input: string
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

// Explorer base URL
export const EXPLORER_URL = "https://subnets.avax.network/goodcare"

// Fetch network stats
export async function fetchNetworkStats(): Promise<NetworkStats> {
  try {
    // Mock data for demo
    return {
      latestBlock: 1000000 + Math.floor(Math.random() * 1000),
      gasPrice: (Math.random() * 50).toFixed(2),
      totalTransactions: 5000000 + Math.floor(Math.random() * 100000),
      tps: Math.random() * 10,
      activeValidators: 50 + Math.floor(Math.random() * 10),
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
    // Mock data for demo
    return Array.from({ length: count }, (_, i) => ({
      number: 1000000 - i,
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      timestamp: Math.floor(Date.now() / 1000) - i * 15,
      transactions: Math.floor(Math.random() * 100),
      gasUsed: (Math.random() * 8000000).toFixed(0),
      gasLimit: "8000000",
      miner: `0x${Math.random().toString(16).substring(2, 42)}`,
      difficulty: (Math.random() * 1000000).toFixed(0),
      size: Math.floor(Math.random() * 50000),
      baseFeePerGas: (Math.random() * 20).toFixed(0),
    }))
  } catch (error) {
    console.error("Error fetching latest blocks:", error)
    return []
  }
}

// Convert Gwei to CARE
function gweiToCARE(gweiAmount: string): string {
  const gweiValue = Number.parseFloat(gweiAmount)
  const careValue = gweiValue / 1_000_000_000
  return careValue.toFixed(9)
}

// Fetch latest transactions
export async function fetchLatestTransactions(count = 10): Promise<Transaction[]> {
  try {
    // Mock data for demo
    return Array.from({ length: count }, (_, i) => {
      const gasPriceGwei = (Math.random() * 50).toFixed(2)
      const gasPriceCARE = gweiToCARE(gasPriceGwei)

      return {
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: 1000000 - Math.floor(i / 3),
        from: `0x${Math.random().toString(16).substring(2, 42)}`,
        to: `0x${Math.random().toString(16).substring(2, 42)}`,
        value: (Math.random() * 10).toFixed(4),
        gasPrice: gasPriceGwei,
        gasPriceCARE: gasPriceCARE,
        gasUsed: (Math.random() * 21000).toFixed(0),
        gasLimit: "21000",
        timestamp: Math.floor(Date.now() / 1000) - i * 30,
        status: Math.random() > 0.1 ? "success" : "failed",
        input: "0x",
        method: Math.random() > 0.7 ? "Contract Interaction" : "Transfer",
      }
    })
  } catch (error) {
    console.error("Error fetching latest transactions:", error)
    return []
  }
}

// Fetch block by number or hash
export async function fetchBlock(blockHashOrNumber: string | number): Promise<Block | null> {
  try {
    // Mock implementation
    const blockNumber = typeof blockHashOrNumber === "string" ? Number.parseInt(blockHashOrNumber) : blockHashOrNumber

    return {
      number: blockNumber,
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      timestamp: Math.floor(Date.now() / 1000),
      transactions: Math.floor(Math.random() * 100),
      gasUsed: (Math.random() * 8000000).toFixed(0),
      gasLimit: "8000000",
      miner: `0x${Math.random().toString(16).substring(2, 42)}`,
      difficulty: (Math.random() * 1000000).toFixed(0),
      size: Math.floor(Math.random() * 50000),
      baseFeePerGas: (Math.random() * 20).toFixed(0),
    }
  } catch (error) {
    console.error(`Error fetching block ${blockHashOrNumber}:`, error)
    return null
  }
}

// Fetch transaction by hash
export async function fetchTransaction(txHash: string): Promise<Transaction | null> {
  try {
    const gasPriceGwei = (Math.random() * 50).toFixed(2)
    const gasPriceCARE = gweiToCARE(gasPriceGwei)

    return {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000),
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      value: (Math.random() * 10).toFixed(4),
      gasPrice: gasPriceGwei,
      gasPriceCARE: gasPriceCARE,
      gasUsed: (Math.random() * 21000).toFixed(0),
      gasLimit: "21000",
      timestamp: Math.floor(Date.now() / 1000),
      status: "success",
      input: "0x",
      method: "Transfer",
    }
  } catch (error) {
    console.error(`Error fetching transaction ${txHash}:`, error)
    return null
  }
}

// Fetch account details
export async function fetchAccount(address: string): Promise<Account | null> {
  try {
    return {
      address,
      balance: (Math.random() * 100).toFixed(4),
      transactionCount: Math.floor(Math.random() * 1000),
      code: "0x",
      isContract: Math.random() > 0.8,
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

// Legacy class for backward compatibility
export class ExplorerService {
  static async getLatestBlocks(limit = 10): Promise<Block[]> {
    return fetchLatestBlocks(limit)
  }

  static async getLatestTransactions(limit = 10): Promise<Transaction[]> {
    return fetchLatestTransactions(limit)
  }

  static async getBlock(blockNumber: string): Promise<Block | null> {
    return fetchBlock(blockNumber)
  }

  static async getTransaction(txHash: string): Promise<Transaction | null> {
    return fetchTransaction(txHash)
  }

  static async getAddress(address: string): Promise<Account | null> {
    return fetchAccount(address)
  }
}
