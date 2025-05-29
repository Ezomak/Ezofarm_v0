// Adresses des contrats sur Polygon
export const EZKEY_CONTRACT_ADDRESS = "0xbca0C59Ee51CaA9837EA2f05d541E9936738Ce6b" // NFT principal
export const EZOCH_CONTRACT_ADDRESS = "0xB7E15E994270A6B251C51B9a7358E10ce0054cd2" // Token principal ERC20

// Configuration réseau Polygon
export const POLYGON_NETWORK = {
  chainId: 137,
  name: "Polygon Mainnet",
  rpcUrl: "https://polygon-rpc.com/",
  blockExplorerUrl: "https://polygonscan.com/",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
}

// ABI standard ERC20 pour EZOCH
export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
]

// ABI standard ERC721
export const ERC721_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
]

// ABI spécifique pour EzKeyV2 avec tokens internes seulement
export const EZKEY_ABI = [
  // Fonctions ERC721 standard
  ...ERC721_ABI,

  // Fonctions spécifiques à EzKeyV2
  "function mintKey() external",
  "function claimReward() external",
  "function upgradeToSilver() external",
  "function upgradeToGold() external",
  "function burnKeyForEzoch() external",

  // Gestion des holders et niveaux
  "function holders(address) external view returns (uint256 level, uint256 lastClaim)",
  "function canUserClaim(address user) external view returns (bool)",
  "function getUserLevel(address user) external view returns (uint256)",
  "function getClaimCooldown() external view returns (uint256)",
  "function getLastClaimTime(address user) external view returns (uint256)",
  "function calculateBurnReward(address user) external view returns (uint256)",

  // Fonctions pour les tokens internes Ez-POL et Ez-SUSHI (pas de tokens externes POL/SUSHI)
  "function getInternalPolBalance(address user) external view returns (uint256)",
  "function getInternalSushiBalance(address user) external view returns (uint256)",
  "function internalPolBalances(address) external view returns (uint256)",
  "function internalSushiBalances(address) external view returns (uint256)",
]
