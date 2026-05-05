import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import { Building2, Globe, Loader, ShieldCheck, WalletCards } from 'lucide-react'
import { CONTRACT_ABI, getContract } from '../utils/contract'
import { getIssuerProfile, getShortAddress, saveIssuerProfile } from '../utils/issuerProfiles'
import { getConnectedAccount } from '../components/WalletConnect'

function IssuerProfile() {
  const { address } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(() => getIssuerProfile(address))
  const [editing, setEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [form, setForm] = useState(() => ({
    name: getIssuerProfile(address)?.name || '',
    role: getIssuerProfile(address)?.role || 'Manufacturer',
    country: getIssuerProfile(address)?.country || '',
    description: getIssuerProfile(address)?.description || '',
    website: getIssuerProfile(address)?.website || '',
  }))
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const connectedAccount = getConnectedAccount()
  const isOwner = connectedAccount?.toLowerCase() === address?.toLowerCase()

  useEffect(() => {
    const nextProfile = getIssuerProfile(address)
    setProfile(nextProfile)
    setForm({
      name: nextProfile?.name || '',
      role: nextProfile?.role || 'Manufacturer',
      country: nextProfile?.country || '',
      description: nextProfile?.description || '',
      website: nextProfile?.website || '',
    })
    setEditing(false)
    setSaveStatus(null)
    fetchIssuedProducts()
  }, [address])

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()
    if (!isOwner) return

    const name = form.name.trim()
    if (!name) {
      setSaveStatus({ type: 'error', msg: 'Organisation name is required.' })
      return
    }

    const saved = saveIssuerProfile(address, {
      name,
      role: form.role.trim() || 'Manufacturer',
      country: form.country.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
      verification: profile?.verification || 'Self-declared',
    })

    setProfile(saved)
    setEditing(false)
    setSaveStatus({ type: 'success', msg: 'Issuer profile saved in this browser.' })
  }

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
            <div style={styles.profileTitleBlock}>
              <h1 style={styles.title}>{profile?.name || 'Unknown Issuer'}</h1>
              <p style={styles.subtitle}>
                {profile ? [profile.role, profile.country].filter(Boolean).join(' - ') : 'Wallet address only'}
              </p>
            </div>
            {isOwner && (
              <button
                style={styles.editBtn}
                onClick={() => {
                  setEditing(value => !value)
                  setSaveStatus(null)
                }}
              >
                {editing ? 'Cancel' : 'Edit profile'}
              </button>
            )}
          </div>

          {editing ? (
            <form style={styles.form} onSubmit={handleSaveProfile}>
              <label style={styles.formLabel}>
                Organisation name
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  placeholder="e.g. SunTech EU"
                />
              </label>
              <div style={styles.formGrid}>
                <label style={styles.formLabel}>
                  Role
                  <input
                    style={styles.input}
                    value={form.role}
                    onChange={(event) => updateForm('role', event.target.value)}
                    placeholder="e.g. Manufacturer"
                  />
                </label>
                <label style={styles.formLabel}>
                  Country
                  <input
                    style={styles.input}
                    value={form.country}
                    onChange={(event) => updateForm('country', event.target.value)}
                    placeholder="e.g. Germany"
                  />
                </label>
              </div>
              <label style={styles.formLabel}>
                Website
                <input
                  style={styles.input}
                  value={form.website}
                  onChange={(event) => updateForm('website', event.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label style={styles.formLabel}>
                Description
                <textarea
                  style={{ ...styles.input, ...styles.textarea }}
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  placeholder="Describe your organisation and passport issuing role."
                />
              </label>
              {saveStatus && <p style={saveStatus.type === 'error' ? styles.formError : styles.formSuccess}>{saveStatus.msg}</p>}
              <button style={styles.saveBtn} type="submit">Save profile</button>
            </form>
          ) : (
            <>
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

              {saveStatus && <p style={styles.formSuccess}>{saveStatus.msg}</p>}
            </>
          )}

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
  profileTitleBlock: { flex: 1, minWidth: 0 },
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
  editBtn: {
    border: '1.5px solid #2d6a4f',
    backgroundColor: 'white',
    color: '#2d6a4f',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    cursor: 'pointer',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  form: {
    display: 'grid',
    gap: '0.85rem',
    marginBottom: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem',
  },
  formLabel: {
    display: 'grid',
    gap: '0.35rem',
    color: '#1b4332',
    fontSize: '0.86rem',
    fontWeight: '700',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    border: '1px solid #b7d7c2',
    borderRadius: '8px',
    padding: '0.65rem 0.75rem',
    color: '#1f2933',
    fontSize: '0.92rem',
    outlineColor: '#2d6a4f',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  textarea: {
    minHeight: '92px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  saveBtn: {
    justifySelf: 'start',
    border: 'none',
    backgroundColor: '#2d6a4f',
    color: 'white',
    borderRadius: '8px',
    padding: '0.65rem 1rem',
    cursor: 'pointer',
    fontWeight: '700',
  },
  formSuccess: {
    color: '#2d6a4f',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '8px',
    padding: '0.55rem 0.7rem',
    margin: '0 0 1rem',
    fontSize: '0.86rem',
    fontWeight: '700',
  },
  formError: {
    color: '#b42318',
    backgroundColor: '#fff1f0',
    border: '1px solid #ffccc7',
    borderRadius: '8px',
    padding: '0.55rem 0.7rem',
    margin: 0,
    fontSize: '0.86rem',
    fontWeight: '700',
  },
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
