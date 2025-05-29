"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionLinkProps {
  txHash: string
  className?: string
}

export function TransactionLink({ txHash, className }: TransactionLinkProps) {
  const polygonScanUrl = `https://polygonscan.com/tx/${txHash}`

  return (
    <Button variant="outline" size="sm" className={className} onClick={() => window.open(polygonScanUrl, "_blank")}>
      <ExternalLink className="h-4 w-4 mr-2" />
      Voir sur PolygonScan
    </Button>
  )
}
