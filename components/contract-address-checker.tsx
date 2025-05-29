"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search } from "lucide-react"
import { ethers } from "ethers"
import { ERC20_ABI } from "@/lib/contracts"

interface ContractAddressCheckerProps {
  provider: ethers.Provider | null
}

export function ContractAddressChecker({ provider }: ContractAddressCheckerProps) {
  const [address, setAddress] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const checkAddress = async () => {
    if (!provider || !address) return

    try {
      setLoading(true)
      setResult(null)

      console.log("🔍 Vérification de l'adresse:", address)

      // Vérifier si c'est une adresse valide
      if (!ethers.isAddress(address)) {
        setResult({ error: "Adresse invalide" })
        return
      }

      // Vérifier si c'est un contrat
      const code = await provider.getCode(address)
      if (code === "0x") {
        setResult({ error: "Cette adresse n'est pas un contrat" })
        return
      }

      // Essayer de lire les informations du token
      const contract = new ethers.Contract(address, ERC20_ABI, provider)

      try {
        const [name, symbol, decimals] = await Promise.all([contract.name(), contract.symbol(), contract.decimals()])

        setResult({
          success: true,
          name,
          symbol,
          decimals: Number(decimals),
          address,
        })

        console.log("✅ Contrat trouvé:", { name, symbol, decimals })
      } catch (err) {
        setResult({ error: "Ce contrat n'est pas un token ERC20 valide" })
      }
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Vérificateur d'adresse de contrat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} className="flex-1" />
          <Button onClick={checkAddress} disabled={loading || !address}>
            {loading ? "..." : "Vérifier"}
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">Contrat ERC20 trouvé !</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Nom:</span>
                        <Badge variant="outline">{result.name}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Symbole:</span>
                        <Badge variant="outline">{result.symbol}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Decimals:</span>
                        <Badge variant="outline">{result.decimals}</Badge>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-green-700 break-all">{result.address}</p>
                  </div>
                ) : (
                  <AlertDescription className="text-red-800">{result.error}</AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Adresses connues :</strong>
          </p>
          <p>• EzKey NFT: 0xbca0C59Ee51CaA9837EA2f05d541E9936738Ce6b</p>
          <p>• EZOCH Token: [À déterminer]</p>
        </div>
      </CardContent>
    </Card>
  )
}
