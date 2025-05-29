"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Network, ArrowLeftRight, ExternalLink, Info } from "lucide-react"
import { useMultiNetwork } from "@/hooks/use-multi-network"

interface NetworkSwitcherProps {
  onNetworkChange?: () => void
  ezochBalance?: string
  polBalance?: string
  sushiBalance?: string
}

export function NetworkSwitcher({ onNetworkChange, ezochBalance, polBalance, sushiBalance }: NetworkSwitcherProps) {
  const { currentChainId, isEthereum, isPolygon, loading, error, switchToEthereum, switchToPolygon, getNetworkName } =
    useMultiNetwork()

  const handleNetworkSwitch = async (switchFunction: () => Promise<void>) => {
    await switchFunction()
    if (onNetworkChange) {
      onNetworkChange()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Sélecteur de réseau
        </CardTitle>
        <CardDescription>
          EzKey fonctionne sur plusieurs réseaux. Changez de réseau pour voir vos différents soldes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Réseau actuel */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Réseau actuel:</span>
          <Badge variant={isPolygon || isEthereum ? "default" : "destructive"}>
            {currentChainId ? getNetworkName(currentChainId) : "Non connecté"}
          </Badge>
        </div>

        <Separator />

        {/* Information sur les réseaux */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p>
                <strong>Ethereum Mainnet (Layer 1):</strong> Token EZOCH
              </p>
              <p>
                <strong>Polygon Mainnet (Layer 2):</strong> Contrat EzKeyV2, tokens POL et SUSHI
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Boutons de changement de réseau */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleNetworkSwitch(switchToEthereum)}
            disabled={loading || isEthereum}
            variant={isEthereum ? "default" : "outline"}
            className="w-full"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {isEthereum ? "✓ Ethereum" : "Vers Ethereum"}
          </Button>

          <Button
            onClick={() => handleNetworkSwitch(switchToPolygon)}
            disabled={loading || isPolygon}
            variant={isPolygon ? "default" : "outline"}
            className="w-full"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {isPolygon ? "✓ Polygon" : "Vers Polygon"}
          </Button>
        </div>

        {/* Affichage des soldes selon le réseau */}
        {isEthereum && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Soldes sur Ethereum
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span>EZOCH:</span>
                <span className="font-medium">{ezochBalance || "0"}</span>
              </div>
            </div>
          </div>
        )}

        {isPolygon && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Soldes sur Polygon
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </h4>
            <div className="bg-gray-50 p-3 rounded-md space-y-1">
              <div className="flex justify-between text-sm">
                <span>POL:</span>
                <span className="font-medium">{polBalance || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>SUSHI:</span>
                <span className="font-medium">{sushiBalance || "0"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Liens vers les explorateurs */}
        <div className="flex gap-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://etherscan.io/", "_blank")}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Etherscan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://polygonscan.com/", "_blank")}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            PolygonScan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
