"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Coins, Clock, ArrowUp, Flame, ImageIcon, Send, RefreshCw } from "lucide-react"
import { useEzKey } from "@/hooks/use-ezkey"
import { useToken } from "@/hooks/use-token"
import { DebugPanel } from "@/components/debug-panel"
import { InternalTokensDebug } from "@/components/internal-tokens-debug"
import { ContractExplorer } from "@/components/contract-explorer"
import { EZKEY_CONTRACT_ADDRESS, EZOCH_CONTRACT_ADDRESS } from "@/lib/contracts"

import { NetworkStatus } from "@/components/network-status"
import { usePolygonNetwork } from "@/hooks/use-polygon-network"
import { MintTester } from "@/components/mint-tester"
import { BurnTester } from "@/components/burn-tester"
import { TransferNFT } from "@/components/transfer-nft"

export default function EzKeyInterface() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [userAddress, setUserAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [showBurnTester, setShowBurnTester] = useState(false)
  const [showTransferTester, setShowTransferTester] = useState(false)
  const [showInternalDebug, setShowInternalDebug] = useState(false)
  const [showContractExplorer, setShowContractExplorer] = useState(false)

  // Hooks pour les contrats et le réseau (tout sur Polygon)
  const polygonNetwork = usePolygonNetwork()
  const ezKey = useEzKey(EZKEY_CONTRACT_ADDRESS)
  const ezochToken = useToken(EZOCH_CONTRACT_ADDRESS) // Token principal EZOCH sur Polygon

  // Vérifier le réseau au chargement
  useEffect(() => {
    if (provider) {
      polygonNetwork.checkNetwork(provider)
    }
  }, [provider])

  // Connexion du wallet
  const connectWallet = async () => {
    try {
      setLoading(true)
      setError("")

      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])

      // Vérifier le réseau avec le hook
      const isCorrectNetwork = await polygonNetwork.checkNetwork(provider)

      if (!isCorrectNetwork) {
        setProvider(provider) // Définir le provider même si mauvais réseau
        setError("Veuillez vous connecter au réseau Polygon")
        return
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setProvider(provider)
      setSigner(signer)
      setUserAddress(address)

      // Initialiser les contrats (tout sur Polygon)
      await ezKey.initialize(provider, signer, address)
      await ezochToken.initialize(provider, address)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Rafraîchir les données
  const refreshData = async () => {
    if (!userAddress || !provider) return

    try {
      setLoading(true)
      await ezKey.refreshUserData(userAddress)
      await ezochToken.refreshBalance(userAddress)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Claim rewards
  const claimRewards = async () => {
    try {
      setLoading(true)
      setError("")

      const userData = ezKey.userData
      if (!userData) return

      // Valeurs requises pour claim selon le niveau (valeurs exactes confirmées)
      let requiredAmount = 100 // Bronze
      if (userData.level === 1) {
        requiredAmount = 5000 // Silver
      } else if (userData.level === 2) {
        requiredAmount = 15000 // Gold
      }

      if (Number.parseFloat(ezochToken.balance) < requiredAmount) {
        throw new Error(
          `Vous devez avoir au moins ${requiredAmount} EZOCH pour claim au niveau ${getLevelName(userData.level)}`,
        )
      }

      const success = await ezKey.claimReward()
      if (success) {
        await refreshData()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Upgrade to Silver (utilise les tokens internes Ez-POL et Ez-SUSHI)
  const upgradeToSilver = async () => {
    try {
      setLoading(true)
      setError("")

      const userData = ezKey.userData
      if (!userData) return

      if (Number.parseFloat(userData.ezPolBalance) < 50 || Number.parseFloat(userData.ezSushiBalance) < 50) {
        throw new Error("Vous devez avoir au moins 50 Ez-POL et 50 Ez-SUSHI internes")
      }

      const success = await ezKey.upgradeToSilver()
      if (success) {
        await refreshData()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Upgrade to Gold (utilise les tokens internes Ez-POL et Ez-SUSHI)
  const upgradeToGold = async () => {
    try {
      setLoading(true)
      setError("")

      const userData = ezKey.userData
      if (!userData) return

      if (Number.parseFloat(userData.ezPolBalance) < 150 || Number.parseFloat(userData.ezSushiBalance) < 150) {
        throw new Error("Vous devez avoir au moins 150 Ez-POL et 150 Ez-SUSHI internes")
      }

      const success = await ezKey.upgradeToGold()
      if (success) {
        await refreshData()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-amber-600"
      case 1:
        return "bg-gray-400"
      case 2:
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-6 w-6" />
              EzKey Interface
            </CardTitle>
            <CardDescription>Connectez votre wallet pour commencer</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} disabled={loading} className="w-full">
              {loading ? "Connexion..." : "Connecter Wallet"}
            </Button>
            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                EzKey Interface
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Déconnecter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!polygonNetwork.isCorrectNetwork && provider && <NetworkStatus onNetworkSwitch={refreshData} />}

        {/* Outils de debug */}
        {polygonNetwork.isCorrectNetwork && ezKey.contract && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowInternalDebug(!showInternalDebug)}>
                {showInternalDebug ? "Masquer" : "Afficher"} Debug Tokens Internes
              </Button>
              <Button variant="outline" onClick={() => setShowContractExplorer(!showContractExplorer)}>
                {showContractExplorer ? "Masquer" : "Afficher"} Explorateur de Contrat
              </Button>
            </div>

            {showInternalDebug && <InternalTokensDebug contract={ezKey.contract} userAddress={userAddress} />}
            {showContractExplorer && <ContractExplorer contract={ezKey.contract} userAddress={userAddress} />}
          </div>
        )}

        {polygonNetwork.isCorrectNetwork && ezKey.userData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-mono text-sm">{userAddress}</p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Niveau:</p>
                  <Badge className={getLevelColor(ezKey.userData.level)}>{getLevelName(ezKey.userData.level)}</Badge>
                </div>

                <Separator />

                {/* Token principal EZOCH */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">Token principal</h4>
                    <Badge variant="secondary" className="text-xs">
                      ERC20
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">EZOCH:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ezochToken.balance}</span>
                      {ezochToken.loading && (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  {ezochToken.error && <div className="text-xs text-red-500">Erreur: {ezochToken.error}</div>}
                </div>

                <Separator />

                {/* Tokens internes seulement */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">Tokens internes Ez-Key</h4>
                    <Badge variant="outline" className="text-xs">
                      Interne
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ez-POL:</span>
                    <span className="font-medium">{ezKey.userData.ezPolBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ez-SUSHI:</span>
                    <span className="font-medium">{ezKey.userData.ezSushiBalance}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Claim: {ezKey.userData.canClaim ? "Disponible" : "En cooldown"}</span>
                  {ezKey.userData.canClaim && <Badge variant="secondary">Prêt</Badge>}
                </div>

                {/* Claim requirements */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Requirement pour claim:</span>
                  <span>
                    {ezKey.userData.level === 0 && "100 EZOCH"}
                    {ezKey.userData.level === 1 && "5000 EZOCH"}
                    {ezKey.userData.level === 2 && "15000 EZOCH"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* NFT Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Votre Ez-Key NFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ezKey.userData.hasNFT ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      {ezKey.userData.tokenURI ? (
                        <img
                          src={ezKey.userData.tokenURI || "/placeholder.svg"}
                          alt="Ez-Key NFT"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                          }}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p>Ez-Key #{ezKey.userData.tokenId}</p>
                          <p className="text-sm">{getLevelName(ezKey.userData.level)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Aucun NFT</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mint Tester */}
                {!ezKey.userData.hasNFT && (
                  <div className="mb-6">
                    <MintTester
                      contract={ezKey.contract}
                      userAddress={userAddress}
                      ezochBalance={ezochToken.balance}
                      hasNFT={ezKey.userData.hasNFT}
                      onMintSuccess={refreshData}
                    />
                  </div>
                )}

                {/* Burn Tester */}
                {ezKey.userData.hasNFT && showBurnTester && (
                  <div className="mb-6">
                    <BurnTester
                      contract={ezKey.contract}
                      userAddress={userAddress}
                      hasNFT={ezKey.userData.hasNFT}
                      ezPolBalance={ezKey.userData.ezPolBalance}
                      ezSushiBalance={ezKey.userData.ezSushiBalance}
                      burnReward={ezKey.userData.burnReward}
                      onBurnSuccess={refreshData}
                    />
                  </div>
                )}

                {/* Transfer NFT */}
                {ezKey.userData.hasNFT && showTransferTester && (
                  <div className="mb-6">
                    <TransferNFT
                      contract={ezKey.contract}
                      userAddress={userAddress}
                      tokenId={ezKey.userData.tokenId}
                      level={ezKey.userData.level}
                      ezPolBalance={ezKey.userData.ezPolBalance}
                      ezSushiBalance={ezKey.userData.ezSushiBalance}
                      onTransferSuccess={refreshData}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Claim Button */}
                  {ezKey.userData.hasNFT && (
                    <Button onClick={claimRewards} disabled={loading || !ezKey.userData.canClaim} className="w-full">
                      <Coins className="h-4 w-4 mr-2" />
                      Claim
                    </Button>
                  )}

                  {/* Upgrade Buttons - utilisent les tokens internes */}
                  {ezKey.userData.hasNFT && ezKey.userData.level === 0 && (
                    <Button
                      onClick={upgradeToSilver}
                      disabled={
                        loading ||
                        Number.parseFloat(ezKey.userData.ezPolBalance) < 50 ||
                        Number.parseFloat(ezKey.userData.ezSushiBalance) < 50
                      }
                      className="w-full"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Upgrade Silver
                    </Button>
                  )}

                  {ezKey.userData.hasNFT && ezKey.userData.level === 1 && (
                    <Button
                      onClick={upgradeToGold}
                      disabled={
                        loading ||
                        Number.parseFloat(ezKey.userData.ezPolBalance) < 150 ||
                        Number.parseFloat(ezKey.userData.ezSushiBalance) < 150
                      }
                      className="w-full"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Upgrade Gold
                    </Button>
                  )}

                  {/* Burn Button */}
                  {ezKey.userData.hasNFT && (
                    <Button
                      onClick={() => {
                        setShowBurnTester(!showBurnTester)
                        if (!showBurnTester) setShowTransferTester(false)
                      }}
                      variant={showBurnTester ? "outline" : "destructive"}
                      className="w-full"
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      {showBurnTester ? "Masquer Burn" : "Burn Key → EZOCH"}
                    </Button>
                  )}

                  {/* Transfer Button */}
                  {ezKey.userData.hasNFT && (
                    <Button
                      onClick={() => {
                        setShowTransferTester(!showTransferTester)
                        if (!showTransferTester) setShowBurnTester(false)
                      }}
                      variant={showTransferTester ? "outline" : "secondary"}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {showTransferTester ? "Masquer Transfert" : "Transférer NFT"}
                    </Button>
                  )}
                </div>

                {/* Burn Reward Info */}
                {ezKey.userData.hasNFT && !showBurnTester && !showTransferTester && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Gain potentiel du burn:</strong> {ezKey.userData.burnReward} EZOCH
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Calculé à partir de vos tokens internes Ez-POL ({ezKey.userData.ezPolBalance}) et Ez-SUSHI (
                      {ezKey.userData.ezSushiBalance})
                    </p>
                    <div className="mt-2 text-xs">
                      <p>Formule: 1 Ez-POL = 5 EZOCH, 1 Ez-SUSHI = 20 EZOCH</p>
                      <p>
                        Calcul: ({ezKey.userData.ezPolBalance} × 5) + ({ezKey.userData.ezSushiBalance} × 20) ={" "}
                        {(
                          Number.parseFloat(ezKey.userData.ezPolBalance) * 5 +
                          Number.parseFloat(ezKey.userData.ezSushiBalance) * 20
                        ).toFixed(2)}{" "}
                        EZOCH
                      </p>
                    </div>
                  </div>
                )}

                {/* Upgrade Requirements Info */}
                {ezKey.userData.hasNFT && !showBurnTester && !showTransferTester && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Upgrades:</strong> Utilisent vos tokens internes Ez-POL et Ez-SUSHI
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <p>• Silver: 50 Ez-POL + 50 Ez-SUSHI internes</p>
                      <p>• Gold: 150 Ez-POL + 150 Ez-SUSHI internes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {/* Debug Panel - seulement en développement */}
        {process.env.NODE_ENV === "development" && (
          <DebugPanel
            provider={provider}
            signer={signer}
            userAddress={userAddress}
            ezKeyData={ezKey.userData}
            tokenBalances={{
              ezoch: ezochToken.balance,
              pol: "0", // Pas de token POL externe
              sushi: "0", // Pas de token SUSHI externe
            }}
          />
        )}
      </div>
    </div>
  )
}
