"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Badge } from "@/components/ui/badge"
import { Fuel } from "lucide-react"

interface GasEstimatorProps {
  contract: ethers.Contract | null
  functionName: string
  args?: any[]
}

export function GasEstimator({ contract, functionName, args = [] }: GasEstimatorProps) {
  const [gasEstimate, setGasEstimate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const estimateGas = async () => {
      if (!contract) return

      try {
        setLoading(true)
        const estimate = await contract[functionName].estimateGas(...args)
        const gasPrice = await contract.provider.getFeeData()

        // Calculer le coût en MATIC
        const gasCost = estimate * (gasPrice.gasPrice || BigInt(0))
        const gasCostInMatic = ethers.formatEther(gasCost)

        setGasEstimate(Number.parseFloat(gasCostInMatic).toFixed(6))
      } catch (error) {
        console.error("Erreur lors de l'estimation du gas:", error)
        setGasEstimate("N/A")
      } finally {
        setLoading(false)
      }
    }

    estimateGas()
  }, [contract, functionName, args])

  if (loading) {
    return (
      <Badge variant="outline" className="text-xs">
        <Fuel className="h-3 w-3 mr-1" />
        Calcul...
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-xs">
      <Fuel className="h-3 w-3 mr-1" />~{gasEstimate} MATIC
    </Badge>
  )
}
