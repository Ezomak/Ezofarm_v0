"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bug, Search } from "lucide-react"

interface InternalTokensDebugProps {
  contract: ethers.Contract | null
  userAddress: string
}

export function InternalTokensDebug({ contract, userAddress }: InternalTokensDebugProps) {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testAllMethods = async () => {
    if (!contract) return

    setLoading(true)
    const testResults: any = {}

    console.log("🔍 === TEST DE TOUTES LES MÉTHODES POUR TOKENS INTERNES ===")

    // Test 1: Mappings publics directs
    try {
      console.log("🔄 Test 1: internalPolBalances() et internalSushiBalances()")
      const polBal = await contract.internalPolBalances(userAddress)
      const sushiBal = await contract.internalSushiBalances(userAddress)

      testResults.method1 = {
        success: true,
        polBalance: ethers.formatEther(polBal),
        sushiBalance: ethers.formatEther(sushiBal),
        polRaw: polBal.toString(),
        sushiRaw: sushiBal.toString(),
      }
      console.log("✅ Test 1 réussi:", testResults.method1)
    } catch (err: any) {
      testResults.method1 = { success: false, error: err.message }
      console.error("❌ Test 1 échoué:", err)
    }

    // Test 2: Fonctions getter
    try {
      console.log("🔄 Test 2: getInternalPolBalance() et getInternalSushiBalance()")
      const polBal = await contract.getInternalPolBalance(userAddress)
      const sushiBal = await contract.getInternalSushiBalance(userAddress)

      testResults.method2 = {
        success: true,
        polBalance: ethers.formatEther(polBal),
        sushiBalance: ethers.formatEther(sushiBal),
        polRaw: polBal.toString(),
        sushiRaw: sushiBal.toString(),
      }
      console.log("✅ Test 2 réussi:", testResults.method2)
    } catch (err: any) {
      testResults.method2 = { success: false, error: err.message }
      console.error("❌ Test 2 échoué:", err)
    }

    // Test 3: holders mapping
    try {
      console.log("🔄 Test 3: holders() mapping")
      const holderInfo = await contract.holders(userAddress)
      console.log("📊 Holder info complet:", holderInfo)

      testResults.method3 = {
        success: true,
        holderInfo: holderInfo.toString(),
        length: holderInfo.length,
        level: holderInfo.level ? holderInfo.level.toString() : "N/A",
        lastClaim: holderInfo.lastClaim ? holderInfo.lastClaim.toString() : "N/A",
      }

      // Si il y a plus de 2 éléments, essayer de les interpréter
      if (holderInfo.length > 2) {
        testResults.method3.polBalance = ethers.formatEther(holderInfo[2] || 0)
        testResults.method3.sushiBalance = ethers.formatEther(holderInfo[3] || 0)
      }

      console.log("✅ Test 3 réussi:", testResults.method3)
    } catch (err: any) {
      testResults.method3 = { success: false, error: err.message }
      console.error("❌ Test 3 échoué:", err)
    }

    // Test 4: Vérifier les fonctions disponibles
    try {
      console.log("🔄 Test 4: Fonctions disponibles dans le contrat")
      const functions = Object.keys(contract.interface.functions)
      const internalTokenFunctions = functions.filter(
        (f) => f.includes("internal") || f.includes("Internal") || f.includes("Pol") || f.includes("Sushi"),
      )

      testResults.method4 = {
        success: true,
        allFunctions: functions.length,
        internalTokenFunctions,
      }
      console.log("✅ Test 4 - Fonctions liées aux tokens internes:", internalTokenFunctions)
    } catch (err: any) {
      testResults.method4 = { success: false, error: err.message }
      console.error("❌ Test 4 échoué:", err)
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debug Tokens Internes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testAllMethods} disabled={loading || !contract} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Test en cours..." : "Tester toutes les méthodes"}
        </Button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {Object.entries(results).map(([method, result]: [string, any]) => (
              <Alert
                key={method}
                className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
              >
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? "default" : "destructive"}>{method}</Badge>
                      <span className="text-sm font-medium">
                        {method === "method1" && "Mappings publics"}
                        {method === "method2" && "Fonctions getter"}
                        {method === "method3" && "Holders mapping"}
                        {method === "method4" && "Fonctions disponibles"}
                      </span>
                    </div>

                    {result.success ? (
                      <div className="text-sm space-y-1">
                        {result.polBalance && (
                          <p>
                            <strong>Ez-POL:</strong> {result.polBalance} (raw: {result.polRaw})
                          </p>
                        )}
                        {result.sushiBalance && (
                          <p>
                            <strong>Ez-SUSHI:</strong> {result.sushiBalance} (raw: {result.sushiRaw})
                          </p>
                        )}
                        {result.holderInfo && (
                          <p>
                            <strong>Holder Info:</strong> {result.holderInfo}
                          </p>
                        )}
                        {result.internalTokenFunctions && (
                          <p>
                            <strong>Fonctions trouvées:</strong> {result.internalTokenFunctions.join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
