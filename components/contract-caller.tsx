"use client"

import { useState } from "react"
import type { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Play } from "lucide-react"

interface ContractCallerProps {
  contract: ethers.Contract | null
  userAddress: string
}

export function ContractCaller({ contract, userAddress }: ContractCallerProps) {
  const [functionName, setFunctionName] = useState("mintKey")
  const [args, setArgs] = useState("[]")
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const callFunction = async () => {
    if (!contract) return

    try {
      setLoading(true)
      setError("")
      setResult("")

      console.log(`🔧 Appel de ${functionName}() sur le contrat ${contract.target}`)

      let parsedArgs: any[] = []
      try {
        parsedArgs = JSON.parse(args)
      } catch (err) {
        throw new Error("Arguments invalides (format JSON attendu)")
      }

      console.log("📋 Arguments:", parsedArgs)

      // Vérifier si la fonction existe
      if (typeof contract[functionName] !== "function") {
        throw new Error(`La fonction ${functionName} n'existe pas sur ce contrat`)
      }

      // Appeler la fonction
      let txOrResult
      if (
        functionName === "mintKey" ||
        functionName === "claimReward" ||
        functionName === "upgradeToSilver" ||
        functionName === "upgradeToGold" ||
        functionName === "burnKeyForEzoch"
      ) {
        // Fonctions de transaction
        console.log("📝 Envoi de la transaction...")
        const tx = await contract[functionName](...parsedArgs)
        console.log("📝 Hash de transaction:", tx.hash)

        setResult(`Transaction envoyée: ${tx.hash}\nAttente de confirmation...`)

        const receipt = await tx.wait()
        console.log("✅ Transaction confirmée:", receipt)

        setResult(
          `✅ Transaction confirmée!\nHash: ${tx.hash}\nGas utilisé: ${receipt.gasUsed.toString()}\nBlock: ${receipt.blockNumber}`,
        )
      } else {
        // Fonctions de lecture
        console.log("📖 Appel de fonction de lecture...")
        txOrResult = await contract[functionName](...parsedArgs)
        console.log("📖 Résultat:", txOrResult)

        setResult(JSON.stringify(txOrResult, null, 2))
      }
    } catch (err: any) {
      console.error("❌ Erreur:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickFunctions = [
    { name: "mintKey", args: "[]", description: "Mint un nouveau NFT Ez-Key" },
    { name: "balanceOf", args: `["${userAddress}"]`, description: "Vérifier le solde NFT" },
    { name: "getUserLevel", args: `["${userAddress}"]`, description: "Obtenir le niveau utilisateur" },
    { name: "canUserClaim", args: `["${userAddress}"]`, description: "Vérifier si peut claim" },
    { name: "holders", args: `["${userAddress}"]`, description: "Infos du holder" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Testeur de Contrat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fonctions rapides */}
        <div className="space-y-2">
          <Label>Fonctions rapides :</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickFunctions.map((func) => (
              <Button
                key={func.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setFunctionName(func.name)
                  setArgs(func.args)
                }}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-mono text-xs">{func.name}()</div>
                  <div className="text-xs text-muted-foreground">{func.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Fonction personnalisée */}
        <div className="space-y-2">
          <Label htmlFor="function-name">Nom de la fonction :</Label>
          <Input
            id="function-name"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            placeholder="mintKey"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="args">Arguments (JSON) :</Label>
          <Textarea
            id="args"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            placeholder='["arg1", "arg2"]'
            rows={3}
          />
        </div>

        <Button onClick={callFunction} disabled={loading || !contract} className="w-full">
          {loading ? (
            "Exécution..."
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Appeler {functionName}()
            </>
          )}
        </Button>

        {/* Résultat */}
        {result && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs whitespace-pre-wrap">{result}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info contrat */}
        {contract && (
          <div className="text-xs text-muted-foreground">
            <p>Contrat: {contract.target}</p>
            <p>Utilisateur: {userAddress}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
