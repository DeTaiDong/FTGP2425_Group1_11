# EcoPassEU - Digital Product Passport DApp

A privacy-aware Digital Product Passport (DPP) DApp for sustainable consumer goods in Europe.

---

## Project Structure
![
](image.png)

---

## Pages

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | ✅ Done |
| Register Product | `/register` | 🔨 In Progress |
| Scan Product | `/scan` | 🔨 In Progress |
| Product Detail | `/product/:id` | 🔨 In Progress |

---

## Smart Contract

- Language: Solidity
- Network: Sepolia Testnet
- Development Tool: Remix IDE
- After deployment, fill in the contract address and ABI in `src/utils/contract.js`

---

## Notes for Teammates

### Frontend
```bash
# Clone the repository
git clone https://github.com/DeTaiDong/FTGP2425_Group1_11.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Smart Contract
1. Write Solidity contract in Remix IDE
2. Deploy to Sepolia Testnet
3. Fill in the contract address and ABI into `src/utils/contract.js`
4. Verify and publish the contract code on Etherscan Sepolia

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React + Vite |
| Routing | React Router DOM |
| Blockchain Interaction | Ethers.js |
| Wallet | MetaMask |
| Smart Contract | Solidity (ERC-1155) |
| Decentralised Storage | IPFS |
| Test Network | Ethereum Sepolia |

---

## Requirements

- Node.js >= 18
- MetaMask browser extension
- MetaMask switched to **Sepolia Testnet**
- Test ETH (get for free at: https://sepoliafaucet.com)