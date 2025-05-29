"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Flame, AlertTriangle, CheckCircle, Clock, Calculator } from "lucide-react"

interface BurnTesterProps {
  contract: ethers.Contract | null
  userAddress: string
  hasNFT: boolean
  ezPolBalance: string // Tokens internes Ez-POL seulement
  ezSushiBalance: string // Tokens internes Ez-SUSHI seulement
  burnReward?: string
  onBurnSuccess: () => void
}

export function BurnTester({
  contract,
  userAddress,
  hasNFT,
  ezPolBalance,
  ezSushiBalance,
  burnReward,
  onBurnSuccess,
}: BurnTesterProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [gasEstimate, setGasEstimate] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [calculatedReward, setCalculatedReward] = useState<string>("0")

  // Calculer la récompense manuellement
  useEffect(() => {
    const polReward = Number.parseFloat(ezPolBalance) * 5 // 1 Ez-POL = 5 EZOCH
    const sushiReward = Number.parseFloat(ezSushiBalance) * 20 // 1 Ez-SUSHI = 20 EZOCH
    const totalReward = polReward + sushiReward
    setCalculatedReward(totalReward.toFixed(2))
  }, [ezPolBalance, ezSushiBalance])

  // Vérifier les prérequis
  const canBurn = () => {
    if (!hasNFT) return { can: false, reason: "Vous n'avez pas de NFT Ez-Key" }
    if (!contract) return { can: false, reason: "Contrat non connecté" }
    const totalTokens = Number.parseFloat(ezPolBalance) + Number.parseFloat(ezSushiBalance)
    if (totalTokens === 0) return { can: false, reason: "Aucun token interne à brûler" }
    return { can: true, reason: "Prêt pour le burn" }
  }

  // Estimer le gas
  const estimateGas = async () => {
    if (!contract) return

    try {
      const estimate = await contract.burnKeyForEzoch.estimateGas()
      const gasPrice = await contract.provider.getFeeData()
      const gasCost = estimate * (gasPrice.gasPrice || BigInt(0))
      const gasCostInMatic = ethers.formatEther(gasCost)
      setGasEstimate(`${Number.parseFloat(gasCostInMatic).toFixed(6)} MATIC`)
    } catch (err: any) {
      console.error("Erreur estimation gas:", err)
      setGasEstimate("Estimation impossible")
    }
  }

  // Fonction de burn avec logs détaillés
  const executeBurn = async () => {
    if (!contract) return

    try {
      setLoading(true)
      setError("")
      setTxHash("")

      console.log("🔥 === DÉBUT DU PROCESSUS DE BURN ===")
      console.log("📋 Contrat EzKey:", contract.target)
      console.log("👤 Utilisateur:", userAddress)
      console.log("💰 Solde Ez-POL (interne):", ezPolBalance)
      console.log("💰 Solde Ez-SUSHI (interne):", ezSushiBalance)
      console.log("💰 Récompense calculée:", calculatedReward, "EZOCH")
      console.log("💰 Récompense du contrat:", burnReward, "EZOCH")

      // Vérifications préliminaires
      const burnCheck = canBurn()
      if (!burnCheck.can) {
        throw new Error(burnCheck.reason)
      }

      // Estimer le gas
      await estimateGas()
      console.log("⛽ Gas estimé:", gasEstimate)

      console.log("🚀 Appel de la fonction burnKeyForEzoch()...")
      console.log("📝 Cette fonction va:")
      console.log("   - Détruire votre NFT Ez-Key")
      console.log("   - Détruire tous vos tokens internes Ez-POL et Ez-SUSHI")
      console.log("   - Vous donner des tokens EZOCH en échange")

      // Appeler burnKeyForEzoch avec des options de gas
      const tx = await contract.burnKeyForEzoch({
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

      onBurnSuccess()
    } catch (err: any) {
      console.error("❌ === ERREUR LORS DU BURN ===")
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
      setShowConfirmation(false)
    }
  }

  const burnStatus = canBurn()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Flame className="h-5 w-5" />
          Burn Ez-Key NFT
        </CardTitle>
        <CardDescription>
          Cette action est irréversible. Vous allez détruire votre NFT et tous vos tokens internes Ez-POL et Ez-SUSHI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status des prérequis */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vérifications :</h4>

          <div className="flex items-center gap-2">
            {hasNFT ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">NFT Ez-Key: {hasNFT ? "Présent" : "Absent"}</span>
          </div>

          <div className="flex items-center gap-2">
            {contract ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Contrat: {contract ? "Connecté" : "Non connecté"}</span>
          </div>

          <div className="flex items-center gap-2">
            {Number.parseFloat(ezPolBalance) + Number.parseFloat(ezSushiBalance) > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-sm">
              Tokens internes:{" "}
              {Number.parseFloat(ezPolBalance) + Number.parseFloat(ezSushiBalance) > 0 ? "Présents" : "Aucun"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Calcul de la récompense */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calcul de la récompense EZOCH:
          </h4>

          <div className="bg-amber-50 p-3 rounded-md space-y-2">
            <div className="text-xs text-amber-700 mb-2">
              <strong>Tokens internes (seront détruits):</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-POL (interne):</span>
              <span className="font-medium">{ezPolBalance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-SUSHI (interne):</span>
              <span className="font-medium">{ezSushiBalance}</span>
            </div>
            <Separator className="my-2" />
            <div className="text-xs text-green-700 mb-2">
              <strong>Récompense en EZOCH:</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-POL → EZOCH (×5):</span>
              <span className="font-medium">{(Number.parseFloat(ezPolBalance) * 5).toFixed(2)} EZOCH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-SUSHI → EZOCH (×20):</span>
              <span className="font-medium">{(Number.parseFloat(ezSushiBalance) * 20).toFixed(2)} EZOCH</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total calculé:</span>
              <span className="text-green-700">{calculatedReward} EZOCH</span>
            </div>
            {burnReward && (
              <div className="flex justify-between font-medium text-green-700">
                <span>Total du contrat:</span>
                <span>{burnReward} EZOCH</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations de gas */}
        {gasEstimate && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Estimation des frais :</h4>
            <Badge variant="outline">{gasEstimate}</Badge>
          </div>
        )}

        {/* Bouton de burn */}
        <div className="space-y-2">
          {!showConfirmation ? (
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={loading || !burnStatus.can}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <Flame className="h-4 w-4 mr-2" />
              Préparer le burn
            </Button>
          ) : (
            <Alert variant="destructive" className="bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Confirmation requise</AlertTitle>
              <AlertDescription>
                <p className="mb-4">Vous êtes sur le point de détruire définitivement :</p>
                <ul className="list-disc list-inside mb-4 text-sm">
                  <li>Votre NFT Ez-Key</li>
                  <li>{ezPolBalance} Ez-POL (tokens internes)</li>
                  <li>{ezSushiBalance} Ez-SUSHI (tokens internes)</li>
                </ul>
                <p className="mb-4 text-sm">
                  En échange, vous recevrez <strong>{calculatedReward} EZOCH</strong>.
                </p>
                <div className="flex gap-2">
                  <Button onClick={executeBurn} variant="destructive" className="flex-1">
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Burn en cours...
                      </>
                    ) : (
                      <>
                        <Flame className="h-4 w-4 mr-2" />
                        Confirmer le burn
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setShowConfirmation(false)} variant="outline" className="flex-1">
                    Annuler
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!burnStatus.can && <p className="text-sm text-muted-foreground text-center">{burnStatus.reason}</p>}
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
