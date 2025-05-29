"use client"

import { useState } from "react"
import { ethers } from "ethers"

// Hook personnalisé pour gérer les interactions avec le contrat
export function useContract(contractAddress: string, abi: any[]) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask n'est pas installé")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    setProvider(provider)
    setSigner(signer)
    setContract(contract)

    return { provider, signer, contract }
  }

  return {
    contract,
    provider,
    signer,
    connect,
  }
}
