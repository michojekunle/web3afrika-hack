import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // for testnet
    "arbitrum-sepolia": {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL!,
      accounts: [
        process.env.ACCOUNT_PRIVATE_KEY!
      ],
      gasPrice: 1000000000,
    },
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_API_KEY_URL!,
        // url: process.env.LISK_MAINNET_RPC_URL!,
      }
    }
  },
 
  sourcify: {
    enabled: false,
  },
};

export default config;