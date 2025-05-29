"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Code, Database } from "lucide-react"

interface ContractExplorerProps {
  contract: ethers.Contract | null
  userAddress: string
}

export function ContractExplorer({ contract, userAddress }: ContractExplorerProps) {
  const [functions, setFunctions] = useState<string[]>([])
  const [events, setEvents] = useState<string[]>([])
  const [variables, setVariables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const [callResult, setCallResult] = useState<any>(null)
  const [callError, setCallError] = useState<string | null>(null)

  // Explorer le contrat
  const exploreContract = async () => {
    if (!contract) return

    setLoading(true)
    try {
      // Récupérer toutes les fonctions
      const allFunctions = Object.keys(contract.interface.functions)
      setFunctions(allFunctions)

      // Récupérer tous les événements
      const allEvents = Object.keys(contract.interface.events)
      setEvents(allEvents)

      // Essayer de récupérer les variables publiques (difficile à faire automatiquement)
      const possibleVariables = allFunctions.filter(
        (f) => !f.includes("(") && !f.startsWith("0x") && f !== "interface" && f !== "type",
      )
      setVariables(possibleVariables)
    } catch (err) {
      console.error("Erreur lors de l'exploration du contrat:", err)
    } finally {
      setLoading(false)
    }
  }

  // Appeler une fonction
  const callFunction = async (functionName: string) => {
    if (!contract) return

    setSelectedFunction(functionName)
    setCallResult(null)
    setCallError(null)

    try {
      // Déterminer les paramètres nécessaires
      const functionFragment = contract.interface.getFunction(functionName)
      const params = functionFragment.inputs

      // Si la fonction nécessite des paramètres et que l'un d'eux est une adresse, utiliser l'adresse de l'utilisateur
      let args: any[] = []
      if (params.length > 0) {
        args = params.map((param) => {
          if (param.type === "address") return userAddress
          if (param.type === "uint256") return 0
          if (param.type === "bool") return false
          return ""
        })
      }

      console.log(`Appel de ${functionName} avec arguments:`, args)
      const result = await contract[functionName](...args)

      // Formater le résultat
      let formattedResult: any
      if (ethers.isAddress(result)) {
        formattedResult = result
      } else if (typeof result === "bigint") {
        // Essayer de formater comme un nombre avec decimals
        try {
          formattedResult = {
            raw: result.toString(),
            formatted: ethers.formatEther(result),
          }
        } catch {
          formattedResult = result.toString()
        }
      } else {
        formattedResult = result
      }

      setCallResult(formattedResult)
    } catch (err: any) {
      console.error(`Erreur lors de l'appel de ${functionName}:`, err)
      setCallError(err.message)
    }
  }

  // Filtrer les fonctions liées aux tokens internes
  const getTokenFunctions = () => {
    return functions.filter(
      (f) =>
        f.toLowerCase().includes("pol") ||
        f.toLowerCase().includes("sushi") ||
        f.toLowerCase().includes("internal") ||
        f.toLowerCase().includes("balance"),
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Explorateur de Contrat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={exploreContract} disabled={loading || !contract} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Exploration en cours..." : "Explorer le contrat"}
        </Button>

        {functions.length > 0 && (
          <>
            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Fonctions liées aux tokens ({getTokenFunctions().length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getTokenFunctions().map((func) => (
                  <Button
                    key={func}
                    variant="outline"
                    size="sm"
                    onClick={() => callFunction(func)}
                    className={`text-left justify-start ${selectedFunction === func ? "border-blue-500" : ""}`}
                  >
                    <div className="truncate">
                      <div className="font-mono text-xs">{func}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {selectedFunction && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium">Résultat de {selectedFunction}</h4>

                {callError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{callError}</AlertDescription>
                  </Alert>
                ) : callResult !== null ? (
                  <div className="space-y-2">
                    {typeof callResult === "object" ? (
                      <>
                        {callResult.raw && (
                          <div className="flex justify-between">
                            <span className="text-sm">Valeur brute:</span>
                            <Badge variant="outline" className="font-mono">
                              {callResult.raw}
                            </Badge>
                          </div>
                        )}
                        {callResult.formatted && (
                          <div className="flex justify-between">
                            <span className="text-sm">Valeur formatée:</span>
                            <Badge variant="outline" className="font-mono">
                              {callResult.formatted}
                            </Badge>
                          </div>
                        )}
                        {!callResult.raw && !callResult.formatted && (
                          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                            {JSON.stringify(callResult, null, 2)}
                          </pre>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="font-mono">
                        {String(callResult)}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                )}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Toutes les fonctions ({functions.length})</h3>
              <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                <ul className="space-y-1">
                  {functions.map((func) => (
                    <li key={func} className="text-xs font-mono">
                      {func}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
