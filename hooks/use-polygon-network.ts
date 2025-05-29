"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"

// Ajouter au début du fichier
declare global {
  interface Window {
    ethereum?: any
  }
}

const POLYGON_CHAIN_ID = 137
const POLYGON_NETWORK_CONFIG = {
  chainId: "0x89", // 137 en hexadécimal
  chainName: "Polygon Mainnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://polygon-rpc.com/"],
  blockExplorerUrls: ["https://polygonscan.com/"],
}

export function usePolygonNetwork() {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifier le réseau actuel
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      setCurrentChainId(chainId)
      setIsCorrectNetwork(chainId === POLYGON_CHAIN_ID)
      return chainId === POLYGON_CHAIN_ID
    } catch (err: any) {
      setError(err.message)
      setIsCorrectNetwork(false)
      return false
    }
  }

  // Changer vers le réseau Polygon
  const switchToPolygon = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé")
    }

    try {
      setLoading(true)
      setError(null)

      // Essayer de changer vers Polygon
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_NETWORK_CONFIG.chainId }],
      })

      setIsCorrectNetwork(true)
      setCurrentChainId(POLYGON_CHAIN_ID)
    } catch (switchError: any) {
      // Si le réseau n'est pas ajouté, l'ajouter
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_NETWORK_CONFIG],
          })
          setIsCorrectNetwork(true)
          setCurrentChainId(POLYGON_CHAIN_ID)
        } catch (addError: any) {
          setError(`Erreur lors de l'ajout du réseau Polygon: ${addError.message}`)
        }
      } else {
        setError(`Erreur lors du changement de réseau: ${switchError.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Écouter les changements de réseau
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const newChainId = Number.parseInt(chainId, 16)
        setCurrentChainId(newChainId)
        setIsCorrectNetwork(newChainId === POLYGON_CHAIN_ID)
      }

      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 137:
        return "Polygon Mainnet"
      case 80001:
        return "Polygon Mumbai Testnet"
      case 56:
        return "BSC Mainnet"
      default:
        return `Réseau ${chainId}`
    }
  }

  return {
    isCorrectNetwork,
    currentChainId,
    loading,
    error,
    checkNetwork,
    switchToPolygon,
    getNetworkName,
  }
}
