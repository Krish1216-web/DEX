# DEX - Decentralized Exchange

A full-stack decentralized exchange (DEX) platform built with React, Express, and Solidity smart contracts. This project enables users to swap tokens through a liquidity pool with wallet integration and real-time market data.

## 📁 Project Structure

```
dex-project/
├── dex-frontend/           # React frontend application
├── Dexxxx-main/           # Full-stack application (React + Express)
├── smart-contracts/       # Solidity smart contracts
└── docs/                  # Documentation
```

## 🎯 Features

- **Wallet Connection**: MetaMask and browser wallet integration for secure authentication
- **Token Swapping**: Swap between tokens (Token A ↔ Token B) through liquidity pools
- **Real-time Market Data**: Live price charts and token metrics
- **Liquidity Pool**: Automated market maker (AMM) with liquidity management
- **Transaction History**: Track all swap transactions locally
- **Protected Routes**: Secure pages requiring wallet connection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- MetaMask or compatible Web3 wallet
- Hardhat (for smart contract deployment)

### Installation

#### 1. Smart Contracts Setup

```bash
cd smart-contracts
npm install
```

Deploy contracts:
```bash
npx hardhat run scripts/deploy.js
```

Update contract addresses in `.env` and `client/lib/contracts.ts`

#### 2. Full-Stack Application (Dexxxx-main)

```bash
cd Dexxxx-main/Dexxxx-main
npm install
```

Create `.env` file with contract addresses:
```
VITE_TOKEN_A_ADDRESS=0x88243e665dee3db495a094bb29dbd49f8472fb26
VITE_TOKEN_B_ADDRESS=0x2dc037c600887a3ea87356e44dd02b51977a37ab
VITE_LIQUIDITY_POOL_ADDRESS=0x0a3064a24b2d09c6859e23f3d5a016d3226d44a8
```

Run development server:
```bash
npm run dev
```

#### 3. Frontend Application (dex-frontend)

```bash
cd dex-frontend
npm install
npm run dev
```

## 📦 Tech Stack

### Frontend
- **React** 19.2 - UI library
- **Vite** - Build tool
- **Ethers.js** - Web3 interaction
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Backend
- **Express** - Web framework
- **SQLite3** - Database
- **Viem** - Web3 library
- **Zod** - Schema validation

### Smart Contracts
- **Solidity** 0.8.28 - Smart contract language
- **OpenZeppelin** - Security audited contracts
- **Hardhat** - Development environment
- **Hardhat Ignition** - Deployment framework

## 🔐 Smart Contracts

### Deployed Contracts

- **Token A**: `0x88243e665dee3db495a094bb29dbd49f8472fb26`
- **Token B**: `0x2dc037c600887a3ea87356e44dd02b51977a37ab`
- **Liquidity Pool**: `0x0a3064a24b2d09c6859e23f3d5a016d3226d44a8`

### Available Contracts

- `TokenA.sol` - ERC20 token implementation
- `TokenB.sol` - ERC20 token implementation
- `LiquidityPool.sol` - AMM with swapping functionality
- `Counter.sol` - Test contract

## 💻 Available Commands

### Dexxxx-main
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run build:client  # Build React frontend
npm run build:server  # Build Express server
npm start            # Start production server
npm run test         # Run tests
npm run format.fix   # Format code with Prettier
npm run typecheck    # Type check with TypeScript
```

### dex-frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### smart-contracts
```bash
npx hardhat compile      # Compile contracts
npx hardhat deploy       # Deploy contracts
npx hardhat test         # Run contract tests
```

## 📝 Project Status

### ✅ Completed Features
- Smart contracts deployed
- Wallet connection via MetaMask
- Token A → Token B swapping
- Real-time market data integration
- Transaction history
- Protected authenticated routes

### 🚧 In Progress
- Token B → Token A swapping
- Enhanced liquidity management UI
- Advanced trading features

## 📖 Documentation

See [DEX Safety Checklist](./docs/DEX_SAFETY_CHECKLIST.md) for implementation details and safety status.

## 🔗 Smart Contract Addresses

| Contract | Address |
|----------|---------|
| Token A | `0x88243e665dee3db495a094bb29dbd49f8472fb26` |
| Token B | `0x2dc037c600887a3ea87356e44dd02b51977a37ab` |
| Liquidity Pool | `0x0a3064a24b2d09c6859e23f3d5a016d3226d44a8` |

## ⚠️ Security Notes

- This is a development/educational project
- Always audit smart contracts before mainnet deployment
- Keep private keys secure and never commit `.env` files with real keys
- Test thoroughly on testnet before production use

## 📄 License

ISC

## 👤 Author

Krish Sankhavara