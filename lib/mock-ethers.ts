// Mock ethers providers and utils for compatibility
export const providers = {
  JsonRpcProvider: class MockJsonRpcProvider {
    constructor(url: string) {
      console.log("Mock JsonRpcProvider created with URL:", url)
    }

    async getBalance(address: string) {
      // Return mock balance
      return "1000000000000000000" // 1 ETH in wei
    }

    async getNetwork() {
      return { chainId: 43114, name: "avalanche" }
    }
  },

  Web3Provider: class MockWeb3Provider {
    constructor(provider: any) {
      console.log("Mock Web3Provider created")
    }

    async getSigner() {
      return {
        getAddress: () => "0x742d35Cc6634C0532925a3b8D4C2C4e0C8b8E8E8",
        signMessage: (message: string) => Promise.resolve("0x" + "0".repeat(130)),
      }
    }
  },
}

export const utils = {
  formatEther: (value: string) => {
    // Simple conversion from wei to ether
    const num = Number.parseFloat(value) / Math.pow(10, 18)
    return num.toString()
  },

  parseEther: (value: string) => {
    // Simple conversion from ether to wei
    const num = Number.parseFloat(value) * Math.pow(10, 18)
    return num.toString()
  },

  isAddress: (address: string) => {
    return address.startsWith("0x") && address.length === 42
  },
}

export const Contract = class MockContract {
  constructor(address: string, abi: any, provider: any) {
    console.log("Mock Contract created for address:", address)
  }

  async balanceOf(address: string) {
    return "1000000000000000000" // 1 token
  }

  async transfer(to: string, amount: string) {
    console.log("Mock transfer:", { to, amount })
    return { hash: "0x" + Math.random().toString(16).slice(2) }
  }
}
