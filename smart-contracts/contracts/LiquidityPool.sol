// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LiquidityPool {
    using SafeERC20 for IERC20;

    IERC20 public tokenA;
    IERC20 public tokenB;

    uint public reserveA;
    uint public reserveB;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    event SwappedAForB(address indexed trader, uint256 amountIn, uint256 amountOut, uint256 minAmountOut, uint256 deadline);
    event SwappedBForA(address indexed trader, uint256 amountIn, uint256 amountOut, uint256 minAmountOut, uint256 deadline);

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }
    function addLiquidity(uint amountA, uint amountB) public {

    require(amountA > 0 && amountB > 0, "Invalid amounts");

    // Transfer tokens from user to pool
    tokenA.safeTransferFrom(msg.sender, address(this), amountA);
    tokenB.safeTransferFrom(msg.sender, address(this), amountB);

    // Update reserves
    reserveA += amountA;
    reserveB += amountB;

    emit LiquidityAdded(msg.sender, amountA, amountB);
}
function removeLiquidity(uint amountA, uint amountB) public {

    require(amountA > 0 && amountB > 0, "Invalid amounts");
    require(reserveA >= amountA && reserveB >= amountB, "Not enough liquidity");

    // Update reserves first
    reserveA -= amountA;
    reserveB -= amountB;

    // Transfer tokens back to user
    tokenA.safeTransfer(msg.sender, amountA);
    tokenB.safeTransfer(msg.sender, amountB);

    emit LiquidityRemoved(msg.sender, amountA, amountB);
}
function swapAforB(uint amountA, uint minAmountOut, uint deadline) public {

    require(amountA > 0, "Invalid amount");
    require(block.timestamp <= deadline, "Swap expired");
    require(reserveA > 0 && reserveB > 0, "Pool has no liquidity");

    // Transfer TokenA from user to pool
    tokenA.safeTransferFrom(msg.sender, address(this), amountA);

    // Calculate output using constant product formula
    uint amountB = (reserveB * amountA) / (reserveA + amountA);

    require(amountB <= reserveB, "Insufficient liquidity");
    require(amountB >= minAmountOut, "Slippage exceeded");

    // Transfer TokenB to user
    tokenB.safeTransfer(msg.sender, amountB);

    // Update reserves
    reserveA += amountA;
    reserveB -= amountB;

    emit SwappedAForB(msg.sender, amountA, amountB, minAmountOut, deadline);
}

function swapBforA(uint amountB, uint minAmountOut, uint deadline) public {

    require(amountB > 0, "Invalid amount");
    require(block.timestamp <= deadline, "Swap expired");
    require(reserveA > 0 && reserveB > 0, "Pool has no liquidity");

    // Transfer TokenB from user to pool
    tokenB.safeTransferFrom(msg.sender, address(this), amountB);

    // Calculate output using constant product formula
    uint amountA = (reserveA * amountB) / (reserveB + amountB);

    require(amountA <= reserveA, "Insufficient liquidity");
    require(amountA >= minAmountOut, "Slippage exceeded");

    // Transfer TokenA to user
    tokenA.safeTransfer(msg.sender, amountA);

    // Update reserves
    reserveB += amountB;
    reserveA -= amountA;

    emit SwappedBForA(msg.sender, amountB, amountA, minAmountOut, deadline);
}

function getSwapAmountAforB(uint amountA) public view returns (uint) {
    if (reserveA == 0 || reserveB == 0) return 0;
    return (reserveB * amountA) / (reserveA + amountA);
}

function getSwapAmountBforA(uint amountB) public view returns (uint) {
    if (reserveA == 0 || reserveB == 0) return 0;
    return (reserveA * amountB) / (reserveB + amountB);
}
}
