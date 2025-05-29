"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bug, CheckCircle, XCircle } from "lucide-react"

interface DebugPanelProps {
  provider: any
  signer: any
  userAddress: string
  ezKeyData: any
  tokenBalances: {
    ezoch: string
    pol: string
    sushi: string
  }
}

export function DebugPanel({ provider, signer, userAddress, ezKeyData, tokenBalances }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResults, setTestResults] = useState<any>({})

  const runTests = async () => {
    const results: any = {}

    // Test 1: Provider connection
    try {
      if (provider) {
        const network = await provider.getNetwork()
        results.provider = {
          status: "success",
          data: `Connecté au réseau ${network.chainId}`,
        }
      } else {
        results.provider = { status: "error", data: "Provider non connecté" }
      }
    } catch (err: any) {
      results.provider = { status: "error", data: err.message }
    }

    // Test 2: Signer
    try {
      if (signer) {
        const address = await signer.getAddress()
        results.signer = {
          status: "success",
          data: `Signer: ${address}`,
        }
      } else {
        results.signer = { status: "error", data: "Signer non disponible" }
      }
    } catch (err: any) {
      results.signer = { status: "error", data: err.message }
    }

    // Test 3: EzKey contract
    try {
      if (ezKeyData) {
        results.ezkey = {
          status: "success",
          data: `Niveau: ${ezKeyData.level}, NFT: ${ezKeyData.hasNFT}`,
        }
      } else {
        results.ezkey = { status: "error", data: "Données EzKey non chargées" }
      }
    } catch (err: any) {
      results.ezkey = { status: "error", data: err.message }
    }

    // Test 4: Token balances
    try {
      const totalBalance =
        Number.parseFloat(tokenBalances.ezoch) +
        Number.parseFloat(tokenBalances.pol) +
        Number.parseFloat(tokenBalances.sushi)
      results.tokens = {
        status: totalBalance > 0 ? "success" : "warning",
        data: `EZOCH: ${tokenBalances.ezoch}, POL: ${tokenBalances.pol}, SUSHI: ${tokenBalances.sushi}`,
      }
    } catch (err: any) {
      results.tokens = { status: "error", data: err.message }
    }

    setTestResults(results)
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4">
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Panel de Debug
          </span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={runTests} size="sm" className="w-full">
          Lancer les tests
        </Button>

        <Separator />

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className="flex items-start gap-2">
                {result.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-xs font-medium capitalize">{key}</p>
                  <p className="text-xs text-muted-foreground">{result.data}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-medium">Informations système</p>
          <p className="text-xs text-muted-foreground">Adresse: {userAddress || "Non connecté"}</p>
          <p className="text-xs text-muted-foreground">
            MetaMask: {window.ethereum?.isMetaMask ? "Détecté" : "Non détecté"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
