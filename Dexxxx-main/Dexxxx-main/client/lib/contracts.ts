import { ethers } from "ethers";

/**
 * NOTE: Update these addresses to match the deployment used by your frontend.
 * The smart-contracts folder currently uses these token addresses in scripts/deploy.js.
 */
export const TOKEN_A_ADDRESS = import.meta.env.VITE_TOKEN_A_ADDRESS ?? "0x88243e665dee3db495a094bb29dbd49f8472fb26";
export const TOKEN_B_ADDRESS = import.meta.env.VITE_TOKEN_B_ADDRESS ?? "0x2dc037c600887a3ea87356e44dd02b51977a37ab";

/**
 * Set this to the LiquidityPool contract address after deploying it.
 * The frontend can interact with it for swapping and adding liquidity.
 */
export const POOL_ADDRESS = import.meta.env.VITE_POOL_ADDRESS ?? "0x0a3064a24b2d09c6859e23f3d5a016d3226d44a8";

/** Minimal ERC-20 ABI used by the frontend */
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

/** Minimal LiquidityPool ABI used by the frontend */
export const POOL_ABI = [
  "function addLiquidity(uint256 amountA, uint256 amountB)",
  "function removeLiquidity(uint256 amountA, uint256 amountB)",
  "function swapAforB(uint256 amountA, uint256 minAmountOut, uint256 deadline)",
  "function reserveA() view returns (uint256)",
  "function reserveB() view returns (uint256)",
];

export function getBrowserProvider() {
  if (typeof window === "undefined") {
    throw new Error("window is not defined");
  }

  const anyWin = window as any;
  if (!anyWin.ethereum) {
    throw new Error("No Ethereum provider found. Install MetaMask or another wallet.");
  }

  return new ethers.BrowserProvider(anyWin.ethereum);
}

export async function getSigner() {
  const provider = getBrowserProvider();
  return provider.getSigner();
}

export async function getPoolContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const signer = signerOrProvider ?? (await getSigner());
  return new ethers.Contract(POOL_ADDRESS, POOL_ABI, signer);
}

export async function getTokenContract(tokenAddress: string, signerOrProvider?: ethers.Signer | ethers.Provider) {
  const signer = signerOrProvider ?? (await getSigner());
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}
