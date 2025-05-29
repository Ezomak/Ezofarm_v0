"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

interface ClaimRequirementsProps {
  currentLevel: number
  ezochBalance: string
}

export function ClaimRequirements({ currentLevel, ezochBalance }: ClaimRequirementsProps) {
  const getRequiredAmount = (level: number) => {
    switch (level) {
      case 0:
        return 100 // Bronze
      case 1:
        return 5000 // Silver
      case 2:
        return 15000 // Gold
      default:
        return 0
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 0:
        return "Bronze"
      case 1:
        return "Silver"
      case 2:
        return "Gold"
      default:
        return "Unknown"
    }
  }

  const currentRequired = getRequiredAmount(currentLevel)
  const currentBalance = Number.parseFloat(ezochBalance)
  const hasEnough = currentBalance >= currentRequired

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          Requirements de Claim
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Niveau actuel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Votre niveau actuel:</span>
            <Badge variant="outline">{getLevelName(currentLevel)}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">EZOCH requis:</span>
            <span className={`font-medium ${hasEnough ? "text-green-600" : "text-red-600"}`}>
              {currentRequired} EZOCH
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Votre solde:</span>
            <span className={`font-medium ${hasEnough ? "text-green-600" : "text-red-600"}`}>{ezochBalance} EZOCH</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={hasEnough ? "default" : "destructive"}>{hasEnough ? "✓ Suffisant" : "✗ Insuffisant"}</Badge>
          </div>
        </div>

        {/* Tous les niveaux */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tous les requirements:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Bronze:</span>
              <span>100 EZOCH</span>
            </div>
            <div className="flex justify-between">
              <span>Silver:</span>
              <span>5,000 EZOCH</span>
            </div>
            <div className="flex justify-between">
              <span>Gold:</span>
              <span>15,000 EZOCH</span>
            </div>
          </div>
        </div>

        {!hasEnough && (
          <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded">
            <p>
              <strong>Il vous manque {(currentRequired - currentBalance).toFixed(2)} EZOCH</strong> pour pouvoir claim
              au niveau {getLevelName(currentLevel)}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
