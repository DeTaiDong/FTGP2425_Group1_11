const STORAGE_KEY = 'issuerProfiles'

export const issuerProfiles = {
  '0xd3d3f56d21342ecaa19d21a7e6ee155352a2e8dc': {
    name: 'DetaiTech EU',
    role: 'Manufacturer',
    country: 'Germany',
    verification: 'Self-declared',
    description: 'Electronics manufacturer issuing blockchain-verifiable product passports.',
  },
}

const normalizeAddress = (address) => address?.toLowerCase()

export const getStoredIssuerProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const saveIssuerProfile = (address, profile) => {
  const normalized = normalizeAddress(address)
  if (!normalized) return null

  const stored = getStoredIssuerProfiles()
  const nextProfile = {
    ...(issuerProfiles[normalized] || {}),
    ...(stored[normalized] || {}),
    ...profile,
    verification: profile.verification || 'Self-declared',
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...stored,
    [normalized]: nextProfile,
  }))

  return nextProfile
}

export const getIssuerProfile = (address) => {
  if (!address) return null
  const normalized = normalizeAddress(address)
  const stored = getStoredIssuerProfiles()
  return stored[normalized] || issuerProfiles[normalized] || null
}

export const getShortAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
