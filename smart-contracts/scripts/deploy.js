import { network } from "hardhat";

async function main() {

  const { viem } = await network.connect();

  // Replace with your actual token addresses
  const tokenAAddress = "0x88243e665dee3db495a094bb29dbd49f8472fb26";
  const tokenBAddress = "0x2dc037c600887a3ea87356e44dd02b51977a37ab";

  const pool = await viem.deployContract("LiquidityPool", [
    tokenAAddress,
    tokenBAddress
  ]);

  console.log("Liquidity Pool deployed to:", pool.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
