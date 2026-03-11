import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI and Address will be set after deployment
let contractAddress = process.env.CONTRACT_ADDRESS;
let provider;
let wallet;
let contract;

function initBlockchain() {
    try {
        const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
        provider = new ethers.JsonRpcProvider(rpcUrl);

        // Default Hardhat account #0 private key for the master regulator/deployer
        const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        wallet = new ethers.Wallet(privateKey, provider);

        // Read ABI from Hardhat artifacts
        const artifactPath = path.join(process.cwd(), 'artifacts/contracts/LicenseRegistry.sol/LicenseRegistry.json');
        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

            if (contractAddress) {
                contract = new ethers.Contract(contractAddress, artifact.abi, wallet);
                console.log("Blockchain initialized successfully");
            } else {
                console.log("Warning: No CONTRACT_ADDRESS provided in .env yet.");
                contract = new ethers.Contract(ethers.ZeroAddress, artifact.abi, wallet); // dummy setup
            }
        } else {
            console.log("Warning: Contract artifact not found. Please run 'npx hardhat compile'.");
        }
    } catch (e) {
        console.error("Blockchain init error:", e);
    }
}

function getContract() {
    return contract;
}

function setContractAddress(address) {
    contractAddress = address;
    // Re-init with new address
    initBlockchain();
}

export { initBlockchain, getContract, setContractAddress };