import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 1337
        },
        amoy: {
            url: process.env.AMOY_RPC_URL,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY]
        }
    },
    paths: {
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
