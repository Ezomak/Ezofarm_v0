"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ExternalLink, X } from "lucide-react"

interface TransactionToastProps {
  isVisible: boolean
  type: "success" | "error" | "pending"
  message: string
  txHash?: string
  onClose: () => void
}

export function TransactionToast({ isVisible, type, message, txHash, onClose }: TransactionToastProps) {
  useEffect(() => {
    if (isVisible && type !== "pending") {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, type, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "pending":
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <Card className={`fixed top-4 right-4 w-96 z-50 ${getBgColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
            {txHash && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => window.open(`https://polygonscan.com/tx/${txHash}`, "_blank")}
              >
                Voir sur PolygonScan
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
