import { createHash, randomBytes } from "crypto"

export interface WalletKeyPair {
  address: string
  privateKey: string
  publicKey: string
}

export interface EncryptedWallet {
  address: string
  encryptedPrivateKey: string
  iv: string
}

// Simple wallet generation (in production, use AvaCloud or proper HD wallets)
export class WalletService {
  // Generate a new wallet keypair
  static generateWallet(): WalletKeyPair {
    // Generate 32 random bytes for private key
    const privateKeyBytes = randomBytes(32)
    const privateKey = "0x" + privateKeyBytes.toString("hex")

    // Derive public key and address (simplified for demo)
    const publicKeyHash = createHash("sha256").update(privateKeyBytes).digest()
    const addressHash = createHash("ripemd160").update(publicKeyHash).digest()
    const address = "0x" + addressHash.toString("hex").slice(0, 40)

    return {
      address,
      privateKey,
      publicKey: "0x" + publicKeyHash.toString("hex"),
    }
  }

  // Encrypt private key for storage
  static encryptPrivateKey(privateKey: string, password: string): EncryptedWallet {
    const crypto = require("crypto")
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher("aes-256-cbc", password)

    let encrypted = cipher.update(privateKey, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Extract address from private key (simplified)
    const address = this.privateKeyToAddress(privateKey)

    return {
      address,
      encryptedPrivateKey: encrypted,
      iv: iv.toString("hex"),
    }
  }

  // Decrypt private key
  static decryptPrivateKey(encryptedWallet: EncryptedWallet, password: string): string {
    const crypto = require("crypto")
    const decipher = crypto.createDecipher("aes-256-cbc", password)

    let decrypted = decipher.update(encryptedWallet.encryptedPrivateKey, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  // Convert private key to address (simplified)
  private static privateKeyToAddress(privateKey: string): string {
    const keyBytes = Buffer.from(privateKey.slice(2), "hex")
    const publicKeyHash = createHash("sha256").update(keyBytes).digest()
    const addressHash = createHash("ripemd160").update(publicKeyHash).digest()
    return "0x" + addressHash.toString("hex").slice(0, 40)
  }

  // Validate wallet address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Generate a deterministic wallet from seed (for demo purposes)
  static generateDemoWallet(seed: string): WalletKeyPair {
    const hash = createHash("sha256").update(seed).digest()
    const privateKey = "0x" + hash.toString("hex")
    const address = "0x" + hash.toString("hex").slice(0, 40)

    return {
      address,
      privateKey,
      publicKey: "0x" + createHash("sha256").update(hash).digest("hex"),
    }
  }
}
