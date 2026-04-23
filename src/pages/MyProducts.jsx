import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract, CONTRACT_ABI } from '../utils/contract'
import { getConnectedAccount } from '../components/WalletConnect'

function MyProducts() {
  const navigate = useNavigate()
  const account = getConnectedAccount()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!account) { setLoading(false); return }
    fetchMyProducts()
  }, [account])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      let provider
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
      }
      const contract = getContract(provider)

      // Get all events, filter by issuer client-side
      // (indexed string params can't be decoded from topics in Solidity)
      const events = await contract.queryFilter(contract.filters.PassportIssued(), 0, 'latest')
      const myEvents = events.filter(
        e => e.args.issuer.toLowerCase() === account.toLowerCase()
      )

      // Decode productId from transaction input data
      const iface = new ethers.Interface(CONTRACT_ABI)
      const list = await Promise.all(myEvents.map(async e => {
        const tx = await provider.getTransaction(e.transactionHash)
        const decoded = iface.parseTransaction({ data: tx.data })
        return {
          productId: decoded.args[0],
          timestamp: new Date(Number(e.args.timestamp) * 1000).toLocaleDateString(),
        }
      }))

      setProducts(list.reverse())
    } catch (err) {
      setError('Failed to load products: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <div style={styles.center}>
        <p style={styles.warnText}>Connect your wallet to view your registered products.</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>Go to Login</button>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Products</h1>
        <p style={styles.subtitle}>
          Products registered by {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      </div>

      <div style={styles.container}>
        {loading && <p style={styles.loadingText}>Loading from blockchain...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>You have not registered any products yet.</p>
            <button style={styles.registerBtn} onClick={() => navigate('/register')}>
              Register your first product
            </button>
          </div>
        )}

        {!loading && products.map((p, i) => (
          <div key={i} style={styles.card} onClick={() => navigate('/product/' + p.productId)}>
            <div>
              <div style={styles.productId}>{p.productId}</div>
              <div style={styles.meta}>Registered: {p.timestamp}</div>
            </div>
            <div style={styles.arrow}>→</div>
          </div>
        ))}

        {!loading && products.length > 0 && (
          <p style={styles.count}>{products.length} product{products.length > 1 ? 's' : ''} registered</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8faf9' },
  header: {
    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: 'white',
  },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  subtitle: { fontSize: '0.95rem', opacity: 0.8 },
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  loadingText: { textAlign: 'center', color: '#888', padding: '2rem' },
  errorText: { textAlign: 'center', color: '#c62828', padding: '2rem' },
  center: { textAlign: 'center', padding: '5rem 2rem' },
  warnText: { color: '#555', fontSize: '1rem', marginBottom: '1.5rem' },
  backBtn: {
    padding: '0.7rem 1.5rem', backgroundColor: '#2d6a4f', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem',
  },
  empty: { textAlign: 'center', padding: '4rem 2rem' },
  emptyText: { color: '#666', marginBottom: '1.5rem', fontSize: '1rem' },
  registerBtn: {
    padding: '0.8rem 1.8rem', backgroundColor: '#2d6a4f', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem',
    marginBottom: '0.8rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    cursor: 'pointer', border: '1px solid #e8f5e9',
  },
  productId: { fontWeight: 'bold', color: '#1b4332', fontSize: '1rem', marginBottom: '0.3rem' },
  meta: { fontSize: '0.85rem', color: '#888' },
  arrow: { color: '#2d6a4f', fontSize: '1.2rem' },
  count: { textAlign: 'center', color: '#aaa', fontSize: '0.85rem', marginTop: '1rem' },
}

export default MyProducts
