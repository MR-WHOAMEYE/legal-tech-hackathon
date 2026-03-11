# BizBlock
<p align="center">
  <img src="./mobile/assets/icon.png" width="150" alt="BizBlock Logo">
</p>

Blockchain-Based License Management System

## Overview
BizBlock is a secure, decentralized application built to revolutionize business license management and verification. Utilizing blockchain technology (Solidity Smart Contracts via Hardhat) and a React Native mobile application, BizBlock enables seamless, verifiable, and transparent interactions between businesses and regulatory bodies. 

The system provides instant verification of business credentials (such as GST registrations, trade licenses, and FSSAI permits) using Zero-Knowledge Proof (ZKP) principles and blockchain minting, preventing fraud and ensuring absolute authenticity.

## Features
- **Blockchain Verification:** Licenses are minted as verifiable assets on the blockchain, eliminating forgery.
- **Role-Based Workflows:** Distinct interfaces and functionality for 'Businesses' and 'Regulators'.
- **Web3 Wallet Authentication:** Integrated seamlessly with MetaMask and WalletConnect v2 for robust, decentralized identity validation.
- **Zero-Knowledge Capabilities:** Verifiable proof of credentials without exposing sensitive underlying logic or data.
- **Offline & Local Verification:** Capable of verifying QR codes and license data directly via the mobile app.
- **Modern UI:** Built with Tailwind CSS (NativeWind) and Lucide React Native for a beautiful and intuitive user experience.

## Tech Stack
### Frontend (Mobile App)
- **Framework:** React Native (Expo SDK 54)
- **Styling:** NativeWind (Tailwind CSS)
- **Web3/Blockchain:** ethers.js, @walletconnect/modal-react-native
- **Animations:** react-native-reanimated

### Backend / Smart Contracts
- **Server:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Smart Contracts:** Solidity, Hardhat
- **Cryptography:** Ethers.js
- **Network:** Polygon Amoy (Testnet)

## Project Structure
The repository is split into two primary workspaces:
- `/backend`: Contains the Node.js API, MongoDB schemas, and the Hardhat configuration/Solidity smart contracts.
- `/mobile`: The React Native Expo application source code.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MetaMask Mobile App (for testing wallet connections)
- Expo Go (or appropriate Android/iOS simulators)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `/backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   PRIVATE_KEY=your_wallet_private_key
   POLYGON_AMOY_RPC_URL=your_rpc_url
   PINATA_API_KEY=your_pinata_key
   PINATA_SECRET_KEY=your_pinata_secret
   ```
4. Compile and deploy smart contracts (if necessary):
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network amoy
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### Mobile App Setup
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies (using legacy peer deps for SDK 54 compatibility):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables. Create a `.env` file in the `/mobile` directory:
   ```env
   EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   EXPO_PUBLIC_API_URL=http://your-local-ip:5000/api
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
   *(Note: Use `npx expo start --lan` and the Expo Go app on your physical device for the best Web3 wallet testing experience).*

## Building for Production (Android APK)
This project is configured for Expo Application Services (EAS).
To build an Android APK:
1. Ensure EAS CLI is installed: `npm install -g eas-cli`
2. Run the build command:
   ```bash
   npx eas build -p android --profile preview
   ```

