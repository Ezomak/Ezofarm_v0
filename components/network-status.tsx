"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Network, AlertTriangle } from "lucide-react"
import { usePolygonNetwork } from "@/hooks/use-polygon-network"

interface NetworkStatusProps {
  onNetworkSwitch?: () => void
}

export function NetworkStatus({ onNetworkSwitch }: NetworkStatusProps) {
  const { isCorrectNetwork, currentChainId, loading, error, switchToPolygon, getNetworkName } = usePolygonNetwork()

  const handleSwitchNetwork = async () => {
    await switchToPolygon()
    if (onNetworkSwitch) {
      onNetworkSwitch()
    }
  }

  if (isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4 text-green-500" />
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Polygon Mainnet
        </Badge>
      </div>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Réseau incorrect
        </CardTitle>
        <CardDescription className="text-orange-700">
          Cette application fonctionne sur le réseau Polygon. Vous êtes actuellement connecté à{" "}
          {currentChainId ? getNetworkName(currentChainId) : "un réseau inconnu"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSwitchNetwork} disabled={loading} className="w-full">
          {loading ? "Changement en cours..." : "Changer vers Polygon"}
        </Button>
        {error && (
          <Alert className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
