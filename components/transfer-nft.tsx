"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Send, AlertTriangle, Clock, Info } from "lucide-react"

interface TransferNFTProps {
  contract: ethers.Contract | null
  userAddress: string
  tokenId?: number
  level: number
  ezPolBalance: string
  ezSushiBalance: string
  onTransferSuccess: () => void
}

export function TransferNFT({
  contract,
  userAddress,
  tokenId,
  level,
  ezPolBalance,
  ezSushiBalance,
  onTransferSuccess,
}: TransferNFTProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [recipientAddress, setRecipientAddress] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Vérifier si l'adresse est valide
  const isValidAddress = (address: string) => {
    return ethers.isAddress(address) && address !== userAddress
  }

  // Vérifier les prérequis
  const canTransfer = () => {
    if (!tokenId) return { can: false, reason: "Aucun NFT à transférer" }
    if (!contract) return { can: false, reason: "Contrat non connecté" }
    if (!isValidAddress(recipientAddress)) return { can: false, reason: "Adresse de destination invalide" }
    return { can: true, reason: "Prêt pour le transfert" }
  }

  // Fonction de transfert avec logs détaillés
  const executeTransfer = async () => {
    if (!contract || !tokenId) return

    try {
      setLoading(true)
      setError("")
      setTxHash("")

      console.log("🔄 === DÉBUT DU PROCESSUS DE TRANSFERT ===")
      console.log("📋 Contrat EzKey:", contract.target)
      console.log("👤 Expéditeur:", userAddress)
      console.log("👥 Destinataire:", recipientAddress)
      console.log("🎫 TokenId:", tokenId)
      console.log("🏆 Niveau actuel:", level)
      console.log("💰 Solde Ez-POL (interne):", ezPolBalance)
      console.log("💰 Solde Ez-SUSHI (interne):", ezSushiBalance)

      // Vérifications préliminaires
      const transferCheck = canTransfer()
      if (!transferCheck.can) {
        throw new Error(transferCheck.reason)
      }

      console.log("🚀 Appel de la fonction transferFrom()...")
      console.log("📝 Cette fonction va:")
      console.log("   - Transférer votre NFT Ez-Key au destinataire")
      console.log("   - Transférer tous vos tokens internes Ez-POL et Ez-SUSHI associés")
      console.log("   - Vous donner automatiquement une nouvelle clé Ez-Key Bronze")
      console.log(
        "   - Le destinataire conservera le niveau le plus élevé entre son niveau actuel et celui du NFT reçu",
      )

      // Appeler transferFrom
      const tx = await contract.transferFrom(userAddress, recipientAddress, tokenId, {
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

      onTransferSuccess()
    } catch (err: any) {
      console.error("❌ === ERREUR LORS DU TRANSFERT ===")
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

  const transferStatus = canTransfer()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Send className="h-5 w-5" />
          Transférer Ez-Key NFT
        </CardTitle>
        <CardDescription>
          Transférez votre NFT Ez-Key à une autre adresse. Vous recevrez automatiquement une nouvelle clé Bronze.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations sur le transfert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Informations importantes</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Pour vous</strong> : Vous perdrez votre NFT actuel et tous vos tokens internes, mais recevrez
                automatiquement une nouvelle clé Bronze.
              </li>
              <li>
                <strong>Pour le destinataire</strong> : Il recevra votre NFT et ses tokens internes. Son niveau sera le
                plus élevé entre son niveau actuel et celui de votre NFT.
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Adresse du destinataire */}
        <div className="space-y-2">
          <label htmlFor="recipient" className="text-sm font-medium">
            Adresse du destinataire:
          </label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className={
              recipientAddress && !isValidAddress(recipientAddress) ? "border-red-500 focus:border-red-500" : ""
            }
          />
          {recipientAddress && !isValidAddress(recipientAddress) && (
            <p className="text-xs text-red-500">Adresse invalide ou identique à la vôtre</p>
          )}
        </div>

        <Separator />

        {/* Résumé du transfert */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Résumé du transfert:</h4>

          <div className="bg-gray-50 p-3 rounded-md space-y-2">
            <div className="flex justify-between text-sm">
              <span>NFT Ez-Key #{tokenId}:</span>
              <span className="font-medium">Niveau {level}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-POL (interne):</span>
              <span className="font-medium">{ezPolBalance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ez-SUSHI (interne):</span>
              <span className="font-medium">{ezSushiBalance}</span>
            </div>
          </div>
        </div>

        {/* Bouton de transfert */}
        <div className="space-y-2">
          {!showConfirmation ? (
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={loading || !transferStatus.can}
              className="w-full"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Préparer le transfert
            </Button>
          ) : (
            <Alert variant="destructive" className="bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Confirmation requise</AlertTitle>
              <AlertDescription>
                <p className="mb-4">
                  Vous êtes sur le point de transférer votre NFT Ez-Key #{tokenId} et tous vos tokens internes à
                  l'adresse <span className="font-mono text-xs">{recipientAddress}</span>.
                </p>
                <div className="flex gap-2">
                  <Button onClick={executeTransfer} variant="destructive" className="flex-1">
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Transfert en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Confirmer le transfert
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

          {!transferStatus.can && <p className="text-sm text-muted-foreground text-center">{transferStatus.reason}</p>}
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
      </CardContent>
    </Card>
  )
}
