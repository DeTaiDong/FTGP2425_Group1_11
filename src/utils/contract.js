import { ethers } from 'ethers'
// input your contract address here
export const CONTRACT_ADDRESS = '0x0617635eA34a7835807EbC6D0A7aECC9de8E1Cf0'

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "productId", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "bytes32", "name": "metadataHash", "type": "bytes32" }
    ],
    "name": "registerPassport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string[]", "name": "productIds", "type": "string[]" },
      { "internalType": "string[]", "name": "ipfsCIDs", "type": "string[]" },
      { "internalType": "bytes32[]", "name": "metadataHashes", "type": "bytes32[]" }
    ],
    "name": "batchRegisterPassports",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "productId", "type": "string" }
    ],
    "name": "getPassport",
    "outputs": [
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "bytes32", "name": "metadataHash", "type": "bytes32" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "productId", "type": "string" }
    ],
    "name": "passportExists",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export const getContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner)
}

export const getProviderAndSigner = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return { provider, signer }
}