"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coins, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface MintTesterProps {
  contract: ethers.Contract | null
  userAddress: string
  ezochBalance: string
  hasNFT: boolean
  onMintSuccess: () => void
}

export function MintTester({ contract, userAddress, ezochBalance, hasNFT, onMintSuccess }: MintTesterProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState<string>("")

  // Vérifier les prérequis
  const canMint = () => {
    if (hasNFT) return { can: false, reason: "Vous avez déjà un NFT Ez-Key" }
    if (Number.parseFloat(ezochBalance) < 100) return { can: false, reason: "Solde EZOCH insuffisant (minimum 100)" }
    if (!contract) return { can: false, reason: "Contrat non connecté" }
    return { can: true, reason: "Prêt pour le mint" }
  }

  // Estimer le gas
  const estimateGas = async () => {
    if (!contract) return

    try {
      const estimate = await contract.mintKey.estimateGas()
      const gasPrice = await contract.provider.getFeeData()
      const gasCost = estimate * (gasPrice.gasPrice || BigInt(0))
      const gasCostInMatic = ethers.formatEther(gasCost)
      setGasEstimate(`${Number.parseFloat(gasCostInMatic).toFixed(6)} MATIC`)
    } catch (err: any) {
      console.error("Erreur estimation gas:", err)
      setGasEstimate("Estimation impossible")
    }
  }

  // Fonction de mint avec logs détaillés
  const executeMint = async () => {
    if (!contract) return

    try {
      setLoading(true)
      setError("")
      setTxHash("")

      console.log("🔍 === DÉBUT DU PROCESSUS DE MINT ===")
      console.log("📋 Contrat EzKey:", contract.target)
      console.log("👤 Utilisateur:", userAddress)
      console.log("💰 Solde EZOCH:", ezochBalance)

      // Vérifications préliminaires
      const mintCheck = canMint()
      if (!mintCheck.can) {
        throw new Error(mintCheck.reason)
      }

      // Estimer le gas
      await estimateGas()

      console.log("⛽ Gas estimé:", gasEstimate)
      console.log("🚀 Appel de la fonction mintKey()...")

      // Appeler mintKey avec des options de gas
      const tx = await contract.mintKey({
        gasLimit: 300000, // Limite de gas fixe pour éviter les erreurs
      })

      console.log("📝 Transaction envoyée:", tx.hash)
      setTxHash(tx.hash)

      console.log("⏳ Attente de confirmation...")
      const receipt = await tx.wait()

      console.log("✅ Transaction confirmée!")
      console.log("📊 Receipt:", receipt)
      console.log("⛽ Gas utilisé:", receipt.gasUsed.toString())

      // Vérifier les événements émis
      if (receipt.logs && receipt.logs.length > 0) {
        console.log("📢 Événements émis:", receipt.logs.length)
        receipt.logs.forEach((log: any, index: number) => {
          console.log(`📢 Log ${index}:`, log)
        })
      }

      onMintSuccess()
    } catch (err: any) {
      console.error("❌ === ERREUR LORS DU MINT ===")
      console.error("❌ Message:", err.message)
      console.error("❌ Code:", err.code)
      console.error("❌ Détails:", err)

      // Analyser les erreurs courantes
      let userFriendlyError = err.message

      if (err.code === "INSUFFICIENT_FUNDS") {
        userFriendlyError = "Fonds insuffisants pour payer les frais de transaction"
      } else if (err.message.includes("execution reverted")) {
        userFriendlyError = "Transaction rejetée par le contrat. Vérifiez les conditions."
      } else if (err.code === "ACTION_REJECTED") {
        userFriendlyError = "Transaction annulée par l'utilisateur"
      } else if (err.message.includes("gas")) {
        userFriendlyError = "Erreur de gas. Essayez d'augmenter la limite de gas."
      }

      setError(userFriendlyError)
    } finally {
      setLoading(false)
    }
  }

  const mintStatus = canMint()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Test Mint Ez-Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status des prérequis */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vérifications :</h4>

          <div className="flex items-center gap-2">
            {hasNFT ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm">NFT existant: {hasNFT ? "Oui" : "Non"}</span>
          </div>

          <div className="flex items-center gap-2">
            {Number.parseFloat(ezochBalance) >= 100 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Solde EZOCH: {ezochBalance} (min: 100)</span>
          </div>

          <div className="flex items-center gap-2">
            {contract ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Contrat: {contract ? "Connecté" : "Non connecté"}</span>
          </div>
        </div>

        <Separator />

        {/* Informations de gas */}
        {gasEstimate && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Estimation des frais :</h4>
            <Badge variant="outline">{gasEstimate}</Badge>
          </div>
        )}

        {/* Bouton de mint */}
        <div className="space-y-2">
          <Button onClick={executeMint} disabled={loading || !mintStatus.can} className="w-full" size="lg">
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Mint en cours...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Mint Ez-Key NFT
              </>
            )}
          </Button>

          {!mintStatus.can && <p className="text-sm text-muted-foreground text-center">{mintStatus.reason}</p>}
        </div>

        {/* Hash de transaction */}
        {txHash && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Transaction envoyée :</p>
                <p className="font-mono text-xs break-all">{txHash}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://polygonscan.com/tx/${txHash}`, "_blank")}
                >
                  Voir sur PolygonScan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bouton d'estimation du gas */}
        {contract && !loading && (
          <Button variant="outline" onClick={estimateGas} className="w-full">
            Estimer les frais de gas
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
