"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Zap, DollarSign } from "lucide-react"

export function PolygonInfo() {
  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Zap className="h-5 w-5" />
          Réseau Polygon
        </CardTitle>
        <CardDescription className="text-purple-700">Transactions rapides et peu coûteuses sur Polygon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Frais de transaction:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            ~$0.01
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Temps de confirmation:</span>
          <Badge variant="secondary">~2 secondes</Badge>
        </div>

        <div className="pt-2">
          <a
            href="https://polygon.technology/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
          >
            En savoir plus sur Polygon
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
