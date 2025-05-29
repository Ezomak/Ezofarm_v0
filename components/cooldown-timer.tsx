"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface CooldownTimerProps {
  lastClaimTime: number
  cooldownPeriod: number // en secondes
}

export function CooldownTimer({ lastClaimTime, cooldownPeriod }: CooldownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000) // Timestamp actuel en secondes
      const nextClaimTime = lastClaimTime + cooldownPeriod
      const diff = nextClaimTime - now

      if (diff <= 0) {
        setIsReady(true)
        setTimeLeft("Prêt")
        return
      }

      setIsReady(false)

      // Calculer heures, minutes, secondes
      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`,
      )
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [lastClaimTime, cooldownPeriod])

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Prochain claim:</span>
      <Badge variant={isReady ? "success" : "outline"} className={isReady ? "bg-green-500" : ""}>
        {timeLeft}
      </Badge>
    </div>
  )
}
