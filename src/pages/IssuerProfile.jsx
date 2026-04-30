import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import { Building2, Globe, Loader, ShieldCheck, WalletCards } from 'lucide-react'
import { CONTRACT_ABI, getContract } from '../utils/contract'
import { getIssuerProfile, getShortAddress } from '../utils/issuerProfiles'

function IssuerProfile() {
  const { address } = useParams()
  const navigate = useNavigate()
  const profile = getIssuerProfile(address)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchIssuedProducts()
  }, [address])

  const fetchIssuedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      let provider
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
      }

      const contract = getContract(provider)
      const events = await contract.queryFilter(contract.filters.PassportIssued(), 0, 'latest')
      const issuerEvents = events.filter(
        e => e.args.issuer.toLowerCase() === address.toLowerCase()
      )

      const iface = new ethers.Interface(CONTRACT_ABI)
      const issued = await Promise.all(issuerEvents.map(async e => {
        const tx = await provider.getTransaction(e.transactionHash)
        const decoded = iface.parseTransaction({ data: tx.data })
        const productId = decoded.name === 'batchRegisterPassports'
          ? decoded.args[0][0]
          : decoded.args[0]

        return {
          productId,
          timestamp: new Date(Number(e.args.timestamp) * 1000).toLocaleDateString(),
        }
      }))

      setProducts(issued.reverse())
    } catch (err) {
      setError('Failed to load issuer products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              <Building2 size={30} color="white" />
            </div>
            <div>
              <h1 style={styles.title}>{profile?.name || 'Unknown Issuer'}</h1>
              <p style={styles.subtitle}>
                {profile ? `${profile.role} - ${profile.country}` : 'Wallet address only'}
              </p>
            </div>
          </div>

          <p style={styles.description}>
            {profile?.description || 'No verified organisation metadata is currently attached to this issuer address.'}
          </p>

          <div style={styles.statusRow}>
            <div style={styles.statusBadge}>
              <ShieldCheck size={15} />
              {profile?.verification || 'Unverified'}
            </div>
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" style={styles.websiteLink}>
                <Globe size={15} />
                Website
              </a>
            )}
          </div>

          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Wallet Address</span>
            <span style={styles.walletValue}>{address}</span>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <WalletCards size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Issued Passports
          </h2>

          {loading && (
            <div style={styles.center}>
              <Loader size={22} color="#2d6a4f" className="spin" />
              <p style={styles.muted}>Loading issuer records from blockchain...</p>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p style={styles.muted}>No passports found for {getShortAddress(address)}.</p>
          )}

          {!loading && !error && products.map((product, i) => (
            <div key={`${product.productId}-${i}`} style={styles.productRow}>
              <div>
                <div style={styles.productId}>{product.productId}</div>
                <div style={styles.productMeta}>Registered: {product.timestamp}</div>
              </div>
              <button style={styles.viewBtn} onClick={() => navigate('/product/' + product.productId)}>
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8faf9', paddingBottom: '3rem' },
  container: { maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1.5px solid #2d6a4f',
    color: '#2d6a4f',
    borderRadius: '8px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  profileCard: {
    backgroundColor: '#f0f7f4',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  profileHeader: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: { color: '#1b4332', fontSize: '1.8rem', margin: 0 },
  subtitle: { color: '#555', margin: '0.3rem 0 0', fontSize: '0.95rem' },
  description: { color: '#444', lineHeight: 1.6, margin: '0 0 1rem' },
  statusRow: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#2d6a4f',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '999px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  websiteLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#1b4332',
    textDecoration: 'none',
    border: '1px solid #b7d7c2',
    borderRadius: '999px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  infoBlock: { borderTop: '1px solid #d0e8d8', paddingTop: '0.9rem' },
  infoLabel: { display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '700' },
  walletValue: { color: '#333', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' },
  section: {
    backgroundColor: '#f0f7f4',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  sectionTitle: { color: '#2d6a4f', margin: '0 0 1rem', fontSize: '1.15rem' },
  center: { textAlign: 'center', padding: '2rem 0' },
  muted: { color: '#777', margin: '0.5rem 0 0' },
  error: { color: '#c62828' },
  productRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '0.9rem 1rem',
    marginBottom: '0.8rem',
  },
  productId: { color: '#1b4332', fontWeight: '700', wordBreak: 'break-word' },
  productMeta: { color: '#777', fontSize: '0.85rem', marginTop: '0.2rem' },
  viewBtn: {
    border: 'none',
    backgroundColor: '#2d6a4f',
    color: 'white',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer',
    fontWeight: '700',
  },
}

export default IssuerProfile
