import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
   
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    
    sepolia: {
      url: "https://rpc.ankr.com/eth_sepolia", // (或者你之前测试跑通的那个URL)
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;