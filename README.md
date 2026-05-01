# EcoPassEU — Digital Product Passport DApp

> A privacy-aware, blockchain-powered Digital Product Passport (DPP) platform for sustainable consumer goods in Europe, built for the EU's Ecodesign for Sustainable Products Regulation (ESPR).

🌐 **Live Demo:** [https://ftgp-2526-group1-11.vercel.app/home](https://ftgp-2526-group1-11.vercel.app/home)  
📜 **Smart Contract:** [0x0617635eA34a7835807EbC6D0A7aECC9de8E1Cf0](https://sepolia.etherscan.io/address/0x0617635eA34a7835807EbC6D0A7aECC9de8E1Cf0)  
🔗 **Network:** Ethereum Sepolia Testnet

---

## Overview

EcoPassEU allows manufacturers to issue tamper-proof digital product passports on the blockchain. Consumers, regulators, and auditors can instantly verify any product's sustainability credentials — including material composition, supply chain provenance, recycling guidance, and certifications — without requiring any blockchain knowledge.

The platform is designed around a **hybrid on-chain / off-chain architecture**:
- **On-chain (Sepolia):** Product ID, IPFS document pointer (CID), cryptographic metadata hash, issuer address, timestamp
- **Off-chain (IPFS via Pinata):** Full product details — materials, supply chain stages, repair guides, recycling instructions

This approach keeps gas costs low while protecting commercially sensitive supply chain data.

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🔒 Privacy-Aware | Sensitive data stays off-chain; only verifiable hashes on the ledger |
| ✅ Anti-Greenwashing | Cryptographic proofs prevent falsification of sustainability claims |
| 🏛️ ESPR Aligned | Built to meet EU Digital Product Passport regulation requirements |
| 🗺️ Supply Chain Map | Interactive map visualises the product's full journey |
| 📱 Mobile Compatible | Fully responsive design for smartphones and tablets |
| 💸 SME Friendly | Batch registration support keeps gas costs minimal |
| 🌐 Decentralised Storage | Documents stored on IPFS — no single point of failure |
| 🔍 Instant Verification | Anyone can verify any product in seconds, no account needed |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite |
| Routing | React Router DOM v7 |
| Blockchain Interaction | Ethers.js v6 |
| Wallet | MetaMask |
| Smart Contract | Solidity ^0.8.20 / Hardhat |
| Decentralised Storage | IPFS via Pinata |
| Supply Chain Map | Leaflet.js + OpenStreetMap |
| QR Code | qrcode.react |
| Icons | lucide-react |
| Deployment | Vercel (frontend) + Sepolia Testnet (contract) |

---

## Project Structure

| Directory / File | Description |
|-----------------|-------------|
| `contracts/` | Solidity smart contract source code |
| `scripts/` | IPFS upload, batch data, and deployment scripts |
| `src/components/` | Reusable UI components (Navbar, WalletConnect, SupplyChainMap, LocationPicker) |
| `src/pages/` | Page components (Landing, Home, RegisterProduct, ScanProduct, ProductDetail, MyProducts, IssuerProfile) |
| `src/utils/` | Contract ABI, address helpers, issuer profiles, city coordinates |
| `test/` | Hardhat smart contract tests |
| `hardhat.config.js` | Hardhat development and deployment configuration |
| `upload-result.json` | Latest IPFS upload results |

---

## System Architecture

```mermaid
graph LR
    subgraph UL["👥 User Layer"]
        MFR([🏭 Manufacturer])
        CNS([🛒 Consumer / Regulator])
    end

    MM([🦊 MetaMask\nSepolia Testnet])

    subgraph AL["⚛️ Application Layer · Vercel"]
        FE([React + Vite\nEthers.js v6])
    end

    subgraph SL["🌐 Decentralised Storage"]
        IPFS([IPFS\nPinata])
    end

    subgraph BL["⛓️ Blockchain · Sepolia"]
        SC([📜 PassportRegistry\nSmart Contract])
        BC[(Sepolia\nLedger)]
    end

    %% Registration Flow
    MFR -->|"Connect Wallet"| MM
    MM -->|"Sign Transaction"| FE
    FE -->|"① Upload JSON metadata"| IPFS
    IPFS -.->|"② Return CID"| FE
    FE -->|"③ registerPassport\nid · CID · keccak256 hash"| SC
    SC -->|"Emit PassportIssued\nStore on-chain"| BC

    %% Verification Flow
    CNS -->|"Search Product ID\nno wallet needed"| FE
    FE -->|"getPassport(id)"| SC
    SC -.->|"CID · hash · issuer · timestamp"| FE
    FE -->|"Fetch full document"| IPFS
    IPFS -.->|"Product JSON"| FE
    FE -.->|"Verify keccak256 = on-chain hash ✅"| FE
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant M as 🏭 Manufacturer
    participant F as ⚛️ Frontend
    participant I as 🌐 IPFS
    participant C as 📜 Contract
    participant U as 🛒 Consumer

    Note over M,C: ── Registration Flow ──────────────────────────

    M->>F: Fill product details
    F->>I: Upload JSON metadata to Pinata
    I-->>F: Return IPFS CID
    F->>F: Compute keccak256(JSON) → metadataHash
    Note over M,F: MetaMask prompts for transaction signature
    M->>F: Confirm transaction
    F->>C: registerPassport(productId, CID, metadataHash)
    C-->>F: Emit PassportIssued · Transaction confirmed ✅
    F-->>M: Display QR code + Etherscan link

    Note over U,C: ── Verification Flow (wallet-free) ────────────

    U->>F: Enter Product ID
    F->>C: passportExists(id)
    C-->>F: true
    F->>C: getPassport(id)
    C-->>F: Return CID · hash · issuer · timestamp
    F->>I: Fetch full document from IPFS
    I-->>F: Return product JSON
    F->>F: Recompute keccak256(JSON) · compare with on-chain hash
    F-->>U: Display verified passport + integrity badge ✅ / ⚠️
```

---

## Use Case Diagram

> **Note:** GitHub renders Mermaid but not PlantUML. The diagram below uses Mermaid with UML `«actor»` stereotypes. For the formal report, use the PlantUML source in the appendix to generate a standard stick-figure diagram.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'background': '#ffffff', 'lineColor': '#64748b', 'fontSize': '13px'}}}%%
graph LR

    classDef actor  fill:#f1f5f9,stroke:#334155,stroke-width:2px,color:#0f172a,font-weight:bold
    classDef ucBlue fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a5f
    classDef ucGreen fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d
    classDef ucAmber fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#713f12,font-weight:bold

    %% ── Actors (UML «actor» stereotype) ──
    MFR["«actor»\n🏭 Manufacturer"]:::actor
    ADM["«actor»\n⚙️ Admin"]:::actor
    CNS["«actor»\n🛒 Consumer / Regulator"]:::actor

    %% ── System Boundary ──
    subgraph SYS["EcoPassEU — System Boundary"]
        direction TB

        subgraph SHARED["Shared Prerequisite"]
            UC01(["UC-01\nConnect MetaMask Wallet"]):::ucAmber
        end

        subgraph REG["Manufacturer Use Cases"]
            UC02(["UC-02\nComplete Registration Form"]):::ucBlue
            UC03(["UC-03\nUpload to IPFS"]):::ucBlue
            UC04(["UC-04\nRegister On-chain"]):::ucBlue
            UC05(["UC-05\nDownload QR Code"]):::ucBlue
            UC06(["UC-06\nMy Products"]):::ucBlue
            UC12(["UC-12\nBatch-register Products"]):::ucBlue
        end

        subgraph VER["Consumer / Regulator Use Cases"]
            UC07(["UC-07\nSearch by Product ID"]):::ucGreen
            UC08(["UC-08\nView Full Passport"]):::ucGreen
            UC09(["UC-09\nVerify Data Integrity"]):::ucGreen
            UC10(["UC-10\nSupply Chain Map"]):::ucGreen
            UC11(["UC-11\nIssuer Profile"]):::ucGreen
        end
    end

    %% ── Actor Associations ──
    MFR --- UC02
    MFR --- UC05
    MFR --- UC06
    ADM --- UC12
    CNS --- UC07
    CNS --- UC08

    %% ── Include (mandatory sub-flows) ──
    UC02 -.->|"«include»"| UC03
    UC02 -.->|"«include»"| UC04
    UC04 -.->|"«include»"| UC01
    UC12 -.->|"«include»"| UC01
    UC08 -.->|"«include»"| UC09
    UC08 -.->|"«include»"| UC10

    %% ── Extend (optional sub-flows) ──
    UC11 -.->|"«extend»"| UC08
    UC05 -.->|"«extend»"| UC06

    style SYS    fill:#f8fafc,stroke:#475569,stroke-width:2px
    style SHARED fill:#ffffff,stroke:#fde68a,stroke-width:1px
    style REG    fill:#ffffff,stroke:#93c5fd,stroke-width:1px
    style VER    fill:#ffffff,stroke:#86efac,stroke-width:1px
```

<details>
<summary>PlantUML source (for LaTeX / formal report)</summary>

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Manufacturer" as M
actor "Admin" as A
actor "Consumer / Regulator" as CR

rectangle "EcoPassEU — System Boundary" {

    package "Shared Prerequisite" {
        usecase "UC-01\nConnect MetaMask Wallet" as UC01
    }

    package "Manufacturer Use Cases" {
        usecase "UC-02\nComplete Registration Form" as UC02
        usecase "UC-03\nUpload to IPFS" as UC03
        usecase "UC-04\nRegister On-chain" as UC04
        usecase "UC-05\nDownload QR Code" as UC05
        usecase "UC-06\nMy Products" as UC06
        usecase "UC-12\nBatch-register Products" as UC12
    }

    package "Consumer / Regulator Use Cases" {
        usecase "UC-07\nSearch by Product ID" as UC07
        usecase "UC-08\nView Full Passport" as UC08
        usecase "UC-09\nVerify Data Integrity" as UC09
        usecase "UC-10\nSupply Chain Map" as UC10
        usecase "UC-11\nIssuer Profile" as UC11
    }
}

M  -- UC02
M  -- UC05
M  -- UC06
A  -- UC12
CR -- UC07
CR -- UC08

UC02 .> UC03 : <<include>>
UC02 .> UC04 : <<include>>
UC04 .> UC01 : <<include>>
UC12 .> UC01 : <<include>>
UC08 .> UC09 : <<include>>
UC08 .> UC10 : <<include>>
UC11 .> UC08 : <<extend>>
UC05 .> UC06 : <<extend>>
@enduml
```

</details>

---

## Smart Contract

**Contract Address (Sepolia):**
0x0617635eA34a7835807EbC6D0A7aECC9de8E1Cf0

**On-chain Data Structure:**

Each registered passport stores the following fields immutably on the ledger:

| Field | Type | Description |
|-------|------|-------------|
| `ipfsCID` | `string` | IPFS content identifier pointing to the full product JSON |
| `metadataHash` | `bytes32` | keccak256 hash of the product JSON for tamper detection |
| `issuer` | `address` | Ethereum address of the registering manufacturer |
| `timestamp` | `uint256` | Block timestamp of registration |
| `exists` | `bool` | Prevents duplicate registration of the same product ID |

**Key Functions:**

| Function | Description |
|----------|-------------|
| `registerPassport(productId, ipfsCID, metadataHash)` | Register a single product passport |
| `batchRegisterPassports(ids[], CIDs[], hashes[])` | Register multiple products in one transaction |
| `getPassport(productId)` | Retrieve a product's passport data |
| `passportExists(productId)` | Check if a passport exists |

---

## Getting Started

### Prerequisites
- Node.js >= 22 ([Download](https://nodejs.org))
- MetaMask browser extension
- MetaMask switched to **Sepolia Testnet**
- Free test ETH from [Google Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

### Installation

```bash
# Clone the repository
git clone https://github.com/DeTaiDong/FTGP2425_Group1_11.git

# Navigate to frontend
cd FTGP2425_Group1_11

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### For Manufacturers — Register a Product
1. Connect your MetaMask wallet (Sepolia Testnet)
2. Navigate to **Register Product**
3. Fill in product details: basic info, material composition, supply chain stages
4. Click **Upload to IPFS** — your data is stored on IPFS and a CID is returned
5. Click **Register on Blockchain** — confirm the MetaMask transaction
6. Your product passport is now permanently on-chain ✅
7. Download the generated **QR code** to attach to your physical product
8. View all your registered products under **My Products**

### For Consumers & Regulators — Verify a Product
1. Navigate to **Search Product** (no wallet required)
2. Enter the Product ID (e.g. `ECO-TX-2025-001`)
3. View the on-chain record — issuer address, timestamp, IPFS document link
4. Click **View Full Detail** to see:
   - Material composition and certifications
   - Supply chain provenance with interactive map
   - Data integrity badge (✅ hash match / ⚠️ mismatch)
   - Issuer profile and verification status

---

## IPFS Upload Script

To upload product data to IPFS before registering, create a `.env` file in the project root:

```bash
VITE_PINATA_JWT=your_pinata_jwt_token
```

Then run the upload script:

```bash
node scripts/uploadToIPFS.js
```

Results are saved to `upload-result.json`.

---

## Team

**Group 11 — University of Bristol, SEMTM0029 Financial Technology**

| Name | Role |
|------|------|
| Detai Dong | Frontend Development, UI/UX, Deployment |
| Akshansh Rajora | Smart Contract, IPFS Integration |
| Luxiao Cao | Backend Scripts, Testing, Thesis Writing |
| Fuyu Cao | Research, Documentation |
| Tianwei Yu | Data Design, Product Passport Schema |

---

## Acknowledgements

- [EU ESPR Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1781)
- [Pinata IPFS](https://pinata.cloud)
- [OpenStreetMap](https://www.openstreetmap.org)
- [Sepolia Testnet](https://sepolia.etherscan.io)

