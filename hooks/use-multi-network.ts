"use client"

import { useState, useEffect } from "react"
import type { ethers } from "ethers"

// Ajouter au début du fichier
declare global {
  interface Window {
    ethereum?: any
  }
}

const ETHEREUM_CHAIN_ID = 1
const POLYGON_CHAIN_ID = 137

const ETHEREUM_NETWORK_CONFIG = {
  chainId: "0x1", // 1 en hexadécimal
  chainName: "Ethereum Mainnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.infura.io/v3/"],
  blockExplorerUrls: ["https://etherscan.io/"],
}

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

export function useMultiNetwork() {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifier le réseau actuel
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      setCurrentChainId(chainId)
      return chainId
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  // Changer vers Ethereum mainnet
  const switchToEthereum = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé")
    }

    try {
      setLoading(true)
      setError(null)

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ETHEREUM_NETWORK_CONFIG.chainId }],
      })

      setCurrentChainId(ETHEREUM_CHAIN_ID)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ETHEREUM_NETWORK_CONFIG],
          })
          setCurrentChainId(ETHEREUM_CHAIN_ID)
        } catch (addError: any) {
          setError(`Erreur lors de l'ajout du réseau Ethereum: ${addError.message}`)
        }
      } else {
        setError(`Erreur lors du changement de réseau: ${switchError.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Changer vers Polygon
  const switchToPolygon = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé")
    }

    try {
      setLoading(true)
      setError(null)

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_NETWORK_CONFIG.chainId }],
      })

      setCurrentChainId(POLYGON_CHAIN_ID)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [POLYGON_NETWORK_CONFIG],
          })
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
      case 11155111:
        return "Sepolia Testnet"
      case 80001:
        return "Polygon Mumbai Testnet"
      case 56:
        return "BSC Mainnet"
      default:
        return `Réseau ${chainId}`
    }
  }

  const isEthereum = currentChainId === ETHEREUM_CHAIN_ID
  const isPolygon = currentChainId === POLYGON_CHAIN_ID

  return {
    currentChainId,
    isEthereum,
    isPolygon,
    loading,
    error,
    checkNetwork,
    switchToEthereum,
    switchToPolygon,
    getNetworkName,
  }
}
