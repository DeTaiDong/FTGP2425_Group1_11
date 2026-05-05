import { ethers } from 'ethers'

export const CONTRACT_ADDRESS = '0x0617635eA34a7835807EbC6D0A7aECC9de8E1Cf0'
const EVENT_QUERY_CHUNK_SIZE = 45000
const DEFAULT_EVENT_LOOKBACK_BLOCKS = 300000

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
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "bytes32", "name": "metadataHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "PassportIssued",
    "type": "event"
  }
]

export const getContract = (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner)
}

export const queryPassportIssuedEvents = async (provider, filter, options = {}) => {
  const contract = getContract(provider)
  const latest = await provider.getBlockNumber()
  const fromBlock = options.fromBlock ?? Math.max(0, latest - DEFAULT_EVENT_LOOKBACK_BLOCKS)
  const events = []

  for (let end = latest; end >= fromBlock; end -= EVENT_QUERY_CHUNK_SIZE + 1) {
    const start = Math.max(fromBlock, end - EVENT_QUERY_CHUNK_SIZE)
    const chunk = await contract.queryFilter(filter || contract.filters.PassportIssued(), start, end)
    events.push(...chunk)
  }

  return events.sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index)
}

export const getProviderAndSigner = async () => {
  if (!window.ethereum) throw new Error('MetaMask not installed')
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return { provider, signer }
}
