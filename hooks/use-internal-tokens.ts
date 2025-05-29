"use client"

import { useState } from "react"
import { ethers } from "ethers"

export function useInternalTokens() {
  const [ezPolBalance, setEzPolBalance] = useState<string>("0")
  const [ezSushiBalance, setEzSushiBalance] = useState<string>("0")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadInternalBalances = async (contract: ethers.Contract, userAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Récupération des soldes internes (méthode simple)...")

      // Méthode simple et directe comme dans la version 1
      let polBalance = "0"
      let sushiBalance = "0"

      try {
        // Essayer directement les mappings publics (comme version 1)
        const polBal = await contract.internalPolBalances(userAddress)
        const sushiBal = await contract.internalSushiBalances(userAddress)

        polBalance = ethers.formatEther(polBal)
        sushiBalance = ethers.formatEther(sushiBal)

        console.log("✅ Soldes internes récupérés:")
        console.log("💰 Ez-POL:", polBalance)
        console.log("💰 Ez-SUSHI:", sushiBalance)
      } catch (err) {
        console.error("❌ Erreur récupération soldes internes:", err)
        // Garder les valeurs par défaut
      }

      setEzPolBalance(polBalance)
      setEzSushiBalance(sushiBalance)

      return { ezPol: polBalance, ezSushi: sushiBalance }
    } catch (err: any) {
      setError(err.message)
      console.error("❌ Erreur générale:", err)
      return { ezPol: "0", ezSushi: "0" }
    } finally {
      setLoading(false)
    }
  }

  return {
    ezPolBalance,
    ezSushiBalance,
    loading,
    error,
    loadInternalBalances,
  }
}
