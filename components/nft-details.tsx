"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"

interface NFTDetailsProps {
  tokenId: number
  tokenURI: string
  level: number
}

export function NFTDetails({ tokenId, tokenURI, level }: NFTDetailsProps) {
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true)

        // Si l'URI est une URL IPFS, la convertir en URL HTTP
        let uri = tokenURI
        if (uri.startsWith("ipfs://")) {
          uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        }

        const response = await fetch(uri)
        if (!response.ok) {
          throw new Error("Impossible de récupérer les métadonnées")
        }

        const data = await response.json()
        setMetadata(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (tokenURI) {
      fetchMetadata()
    }
  }, [tokenURI])

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

  if (loading) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p>Ez-Key #{tokenId}</p>
          <p className="text-sm">{getLevelName(level)}</p>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    )
  }

  // Préparer l'URL de l'image
  let imageUrl = metadata.image || ""
  if (imageUrl.startsWith("ipfs://")) {
    imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={metadata.name || `Ez-Key #${tokenId}`}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=400"
            }}
          />
        ) : (
          <div className="text-white text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p>{metadata.name || `Ez-Key #${tokenId}`}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{metadata.name || `Ez-Key #${tokenId}`}</span>
          <Badge className={level === 0 ? "bg-amber-600" : level === 1 ? "bg-gray-400" : "bg-yellow-500"}>
            {getLevelName(level)}
          </Badge>
        </div>
        {metadata.description && <p className="text-xs text-gray-500">{metadata.description}</p>}
      </div>
    </div>
  )
}
