import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployContract() {
    try {
        console.log("Deploying LicenseRegistry contract...");
        
        // Connect to local Hardhat network
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        
        // Use default Hardhat account #0
        const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Read contract artifact
        const artifactPath = path.join(__dirname, "artifacts/contracts/LicenseRegistry.sol/LicenseRegistry.json");
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        
        // Deploy contract
        const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
        const contract = await contractFactory.deploy();
        
        console.log("Contract deployed to:", contract.target);
        console.log("Transaction hash:", contract.deploymentTransaction().hash);
        
        // Wait for confirmation
        await contract.deploymentTransaction().wait();
        console.log("Contract deployment confirmed!");
        
        // Update .env file with new contract address
        const envPath = path.join(__dirname, ".env");
        let envContent = fs.readFileSync(envPath, "utf8");
        
        // Replace existing contract address or add new one
        if (envContent.includes("CONTRACT_ADDRESS=")) {
            envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contract.target}`);
        } else {
            envContent += `\nCONTRACT_ADDRESS=${contract.target}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log("Updated .env file with new contract address");
        
    } catch (error) {
        console.error("Deployment failed:", error.message);
    }
}

deployContract();