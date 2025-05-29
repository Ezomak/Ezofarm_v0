import { ethers } from "ethers"
import { ERC20_ABI } from "./contracts"

// Fonction utilitaire pour récupérer le solde d'un token
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: ethers.Provider,
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const balance = await contract.balanceOf(userAddress)
    const decimals = await contract.decimals()

    return ethers.formatUnits(balance, decimals)
  } catch (error) {
    console.error("Erreur lors de la récupération du solde:", error)
    return "0"
  }
}

// Fonction pour formater les adresses
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Fonction pour valider une adresse Ethereum
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address)
}

// Fonction pour vérifier si un utilisateur peut claim
export async function canUserClaim(contract: ethers.Contract, userAddress: string): Promise<boolean> {
  try {
    return await contract.canUserClaim(userAddress)
  } catch (error) {
    console.error("Erreur lors de la vérification du claim:", error)
    return false
  }
}

// Fonction pour obtenir le niveau d'un utilisateur
export async function getUserLevel(contract: ethers.Contract, userAddress: string): Promise<number> {
  try {
    const level = await contract.getUserLevel(userAddress)
    return Number(level)
  } catch (error) {
    console.error("Erreur lors de la récupération du niveau:", error)
    return 0
  }
}

// Fonction pour calculer la récompense du burn
export async function calculateBurnReward(contract: ethers.Contract, userAddress: string): Promise<string> {
  try {
    const reward = await contract.calculateBurnReward(userAddress)
    return ethers.formatEther(reward)
  } catch (error) {
    console.error("Erreur lors du calcul de la récompense:", error)
    return "0"
  }
}

// Fonction pour vérifier si un utilisateur a un NFT
export async function hasNFT(contract: ethers.Contract, userAddress: string): Promise<boolean> {
  try {
    const balance = await contract.balanceOf(userAddress)
    return balance > 0
  } catch (error) {
    console.error("Erreur lors de la vérification du NFT:", error)
    return false
  }
}

// Fonction pour obtenir le tokenId d'un utilisateur
export async function getUserTokenId(contract: ethers.Contract, userAddress: string): Promise<number | null> {
  try {
    const balance = await contract.balanceOf(userAddress)
    if (balance > 0) {
      const tokenId = await contract.tokenOfOwnerByIndex(userAddress, 0)
      return Number(tokenId)
    }
    return null
  } catch (error) {
    console.error("Erreur lors de la récupération du tokenId:", error)
    return null
  }
}

// Ajouter des fonctions utilitaires pour Polygon

// Fonction pour obtenir le prix du MATIC en USD (optionnel)
export async function getMaticPrice(): Promise<number> {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd")
    const data = await response.json()
    return data["matic-network"]?.usd || 0
  } catch (error) {
    console.error("Erreur lors de la récupération du prix MATIC:", error)
    return 0
  }
}

// Fonction pour formater les montants avec la devise appropriée
export function formatTokenAmount(amount: string, symbol: string): string {
  const num = Number.parseFloat(amount)
  if (num === 0) return `0 ${symbol}`
  if (num < 0.001) return `<0.001 ${symbol}`
  if (num < 1) return `${num.toFixed(6)} ${symbol}`
  if (num < 1000) return `${num.toFixed(3)} ${symbol}`
  return `${num.toLocaleString()} ${symbol}`
}

// Fonction pour vérifier si une transaction est confirmée sur Polygon
export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations = 3,
): Promise<boolean> {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations)
    return receipt?.status === 1
  } catch (error) {
    console.error("Erreur lors de l'attente de la transaction:", error)
    return false
  }
}
