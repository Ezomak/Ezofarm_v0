"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { EZKEY_ABI } from "@/lib/contracts"
import { getUserLevel, hasNFT, getUserTokenId, canUserClaim } from "@/lib/contract-utils"

export interface EzKeyUserData {
  address: string
  level: number
  hasNFT: boolean
  canClaim: boolean
  tokenId?: number
  tokenURI?: string
  lastClaimTime?: number
  burnReward?: string
  // Tokens internes
  ezPolBalance: string
  ezSushiBalance: string
}

export function useEzKey(contractAddress: string) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [userData, setUserData] = useState<EzKeyUserData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initialize = async (provider: ethers.Provider, signer: ethers.Signer, userAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      // Initialiser le contrat avec le signer pour les transactions
      const ezKeyContract = new ethers.Contract(contractAddress, EZKEY_ABI, signer)
      setContract(ezKeyContract)

      // Charger les données utilisateur
      await loadUserData(ezKeyContract, userAddress)

      return ezKeyContract
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (ezKeyContract: ethers.Contract, userAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 === CHARGEMENT DES DONNÉES UTILISATEUR ===")
      console.log("📋 Contrat EzKey:", ezKeyContract.target)
      console.log("👤 Utilisateur:", userAddress)

      // Vérifier si l'utilisateur a un NFT
      const userHasNFT = await hasNFT(ezKeyContract, userAddress)
      console.log("🎫 A un NFT:", userHasNFT)

      // Récupérer le niveau de l'utilisateur
      const userLevel = await getUserLevel(ezKeyContract, userAddress)
      console.log("🏆 Niveau:", userLevel)

      // Vérifier si l'utilisateur peut claim
      const userCanClaim = await canUserClaim(ezKeyContract, userAddress)
      console.log("⏰ Peut claim:", userCanClaim)

      // Récupérer les soldes des tokens internes - PLUSIEURS MÉTHODES
      let ezPolBalance = "0"
      let ezSushiBalance = "0"

      console.log("💰 === RÉCUPÉRATION DES TOKENS INTERNES ===")

      // Méthode 1: Mappings publics directs (comme version 1-5)
      try {
        console.log("🔄 Méthode 1: Mappings publics directs...")
        const polBal = await ezKeyContract.internalPolBalances(userAddress)
        const sushiBal = await ezKeyContract.internalSushiBalances(userAddress)

        ezPolBalance = ethers.formatEther(polBal)
        ezSushiBalance = ethers.formatEther(sushiBal)

        console.log("✅ Méthode 1 - Ez-POL (interne):", ezPolBalance)
        console.log("✅ Méthode 1 - Ez-SUSHI (interne):", ezSushiBalance)
      } catch (err) {
        console.error("❌ Méthode 1 échouée:", err)

        // Méthode 2: Fonctions getter spécifiques
        try {
          console.log("🔄 Méthode 2: Fonctions getter...")
          const polBal = await ezKeyContract.getInternalPolBalance(userAddress)
          const sushiBal = await ezKeyContract.getInternalSushiBalance(userAddress)

          ezPolBalance = ethers.formatEther(polBal)
          ezSushiBalance = ethers.formatEther(sushiBal)

          console.log("✅ Méthode 2 - Ez-POL (interne):", ezPolBalance)
          console.log("✅ Méthode 2 - Ez-SUSHI (interne):", ezSushiBalance)
        } catch (err2) {
          console.error("❌ Méthode 2 échouée:", err2)

          // Méthode 3: Via holders mapping
          try {
            console.log("🔄 Méthode 3: Via holders mapping...")
            const holderInfo = await ezKeyContract.holders(userAddress)
            console.log("📊 Holder info brut:", holderInfo)

            // Si holders retourne plus que level et lastClaim
            if (holderInfo.length > 2) {
              ezPolBalance = ethers.formatEther(holderInfo[2] || 0)
              ezSushiBalance = ethers.formatEther(holderInfo[3] || 0)
              console.log("✅ Méthode 3 - Ez-POL (interne):", ezPolBalance)
              console.log("✅ Méthode 3 - Ez-SUSHI (interne):", ezSushiBalance)
            }
          } catch (err3) {
            console.error("❌ Méthode 3 échouée:", err3)
            console.log("⚠️ Toutes les méthodes ont échoué, utilisation des valeurs par défaut")
          }
        }
      }

      // Récupérer le tokenId si l'utilisateur a un NFT
      let tokenId: number | null = null
      let tokenURI: string | null = null

      if (userHasNFT) {
        tokenId = await getUserTokenId(ezKeyContract, userAddress)
        if (tokenId !== null) {
          try {
            tokenURI = await ezKeyContract.tokenURI(tokenId)
          } catch (err) {
            console.error("Erreur lors de la récupération du tokenURI:", err)
            tokenURI = null
          }
        }
      }

      // Récupérer la dernière date de claim
      let lastClaimTime: number | null = null
      try {
        const holderInfo = await ezKeyContract.holders(userAddress)
        lastClaimTime = Number(holderInfo.lastClaim)
        console.log("⏰ Dernière claim:", new Date(lastClaimTime * 1000))
      } catch (err) {
        console.error("Erreur lors de la récupération de la dernière date de claim:", err)
      }

      // Calculer la récompense du burn
      let burnReward = "0"
      if (userHasNFT) {
        try {
          const reward = await ezKeyContract.calculateBurnReward(userAddress)
          burnReward = ethers.formatEther(reward)
          console.log("🔥 Récompense burn du contrat:", burnReward)
        } catch (err) {
          console.error("Erreur lors du calcul de la récompense de burn:", err)
          // Calculer manuellement
          const polReward = Number.parseFloat(ezPolBalance) * 5
          const sushiReward = Number.parseFloat(ezSushiBalance) * 20
          burnReward = (polReward + sushiReward).toFixed(2)
          console.log("🔥 Récompense burn calculée manuellement:", burnReward)
        }
      }

      console.log("📊 === RÉSULTAT FINAL ===")
      console.log("🏆 Niveau:", userLevel)
      console.log("🎫 NFT:", userHasNFT)
      console.log("💰 Ez-POL:", ezPolBalance)
      console.log("💰 Ez-SUSHI:", ezSushiBalance)
      console.log("🔥 Burn reward:", burnReward)

      const userData = {
        address: userAddress,
        level: userLevel,
        hasNFT: userHasNFT,
        canClaim: userCanClaim,
        tokenId: tokenId || undefined,
        tokenURI: tokenURI || undefined,
        lastClaimTime: lastClaimTime || undefined,
        burnReward,
        ezPolBalance,
        ezSushiBalance,
      }

      setUserData(userData)
      return userData
    } catch (err: any) {
      setError(err.message)
      console.error("❌ Erreur générale:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async (userAddress: string) => {
    if (!contract) return null
    return await loadUserData(contract, userAddress)
  }

  const mintKey = async () => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🚀 Appel de mintKey()")
      const tx = await contract.mintKey()
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async () => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🚀 Appel de claimReward()")
      const tx = await contract.claimReward()
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const upgradeToSilver = async () => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🚀 Appel de upgradeToSilver()")
      const tx = await contract.upgradeToSilver()
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const upgradeToGold = async () => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🚀 Appel de upgradeToGold()")
      const tx = await contract.upgradeToGold()
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const burnKeyForEzoch = async () => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🔥 Appel de burnKeyForEzoch()")
      const tx = await contract.burnKeyForEzoch()
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const transferNFT = async (to: string, tokenId: number) => {
    if (!contract) return false

    try {
      setLoading(true)
      console.log("🔄 Appel de transferFrom()")
      const tx = await contract.transferFrom(userData?.address || "", to, tokenId)
      await tx.wait()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    contract,
    userData,
    loading,
    error,
    initialize,
    refreshUserData,
    mintKey,
    claimReward,
    upgradeToSilver,
    upgradeToGold,
    burnKeyForEzoch,
    transferNFT,
  }
}
