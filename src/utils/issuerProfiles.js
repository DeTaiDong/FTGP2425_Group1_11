export const issuerProfiles = {
  '0xd3d3f56d21342ecaa19d21a7e6ee155352a2e8dc': {
    name: 'SunTech EU',
    role: 'Manufacturer',
    country: 'Germany',
    verification: 'Self-declared',
    description: 'Electronics manufacturer issuing blockchain-verifiable product passports.',
  },
}

export const getIssuerProfile = (address) => {
  if (!address) return null
  return issuerProfiles[address.toLowerCase()] || null
}

export const getShortAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
