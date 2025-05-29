"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { ERC20_ABI } from "@/lib/contracts"

export function useToken(tokenAddress: string) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [symbol, setSymbol] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initialize = async (provider: ethers.Provider, userAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 === RÉCUPÉRATION DU SOLDE TOKEN EXTERNE ===")
      console.log("📋 Adresse du token:", tokenAddress)
      console.log("👤 Utilisateur:", userAddress)

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      setContract(tokenContract)

      // Récupérer le symbole
      try {
        console.log("🔄 Récupération du symbole...")
        const tokenSymbol = await tokenContract.symbol()
        setSymbol(tokenSymbol)
        console.log("✅ Symbole:", tokenSymbol)
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du symbole:", err)
        setSymbol("UNKNOWN")
      }

      // Récupérer le solde
      let formattedBalance = "0" // Declare formattedBalance variable
      try {
        console.log("🔄 Récupération du solde...")
        const tokenBalance = await tokenContract.balanceOf(userAddress)
        console.log("📊 Solde brut:", tokenBalance.toString())

        const decimals = await tokenContract.decimals()
        console.log("📊 Decimals:", decimals)

        formattedBalance = ethers.formatUnits(tokenBalance, decimals)
        console.log("✅ Solde formaté:", formattedBalance)

        setBalance(formattedBalance)
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du solde:", err)
        setBalance("0")
        setError(`Erreur récupération solde: ${err.message}`)
      }

      console.log("📊 === RÉSULTAT FINAL TOKEN EXTERNE ===")
      console.log("💰 Solde final:", formattedBalance || "0")

      return tokenContract
    } catch (err: any) {
      setError(err.message)
      console.error("❌ Erreur générale token externe:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const refreshBalance = async (userAddress: string) => {
    if (!contract) return

    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Rafraîchissement du solde token externe...")

      const tokenBalance = await contract.balanceOf(userAddress)
      console.log("📊 Nouveau solde brut:", tokenBalance.toString())

      const decimals = await contract.decimals()
      const formattedBalance = ethers.formatUnits(tokenBalance, decimals)

      console.log("✅ Nouveau solde formaté:", formattedBalance)
      setBalance(formattedBalance)
    } catch (err: any) {
      setError(err.message)
      setBalance("0")
    } finally {
      setLoading(false)
    }
  }

  const approve = async (spender: string, amount: string) => {
    if (!contract) return false

    try {
      setLoading(true)
      const decimals = await contract.decimals()
      const parsedAmount = ethers.parseUnits(amount, decimals)
      const tx = await contract.approve(spender, parsedAmount)
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
    balance,
    symbol,
    loading,
    error,
    initialize,
    refreshBalance,
    approve,
  }
}
