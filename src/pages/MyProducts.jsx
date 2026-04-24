import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract, CONTRACT_ABI } from '../utils/contract'
import { getConnectedAccount } from '../components/WalletConnect'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCode, Download, X, Loader } from 'lucide-react'
import backgroundImg from '../assets/background.png'

function MyProducts() {
  const navigate = useNavigate()
  const account = getConnectedAccount()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qrProduct, setQrProduct] = useState(null)

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

      const events = await contract.queryFilter(contract.filters.PassportIssued(), 0, 'latest')
      const myEvents = events.filter(
        e => e.args.issuer.toLowerCase() === account.toLowerCase()
      )

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

  const downloadQR = (productId) => {
    const canvas = document.getElementById('modal-qr-canvas')
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `passport-qr-${productId}.png`
    a.click()
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
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader size={24} color="#2d6a4f" className="spin" style={{ marginBottom: '0.5rem' }} />
            <p style={styles.loadingText}>Loading from blockchain...</p>
          </div>
        )}
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
          <div key={i} style={styles.card}>
            <div style={styles.cardLeft} onClick={() => navigate('/product/' + p.productId)}>
              <div style={styles.productId}>{p.productId}</div>
              <div style={styles.meta}>Registered: {p.timestamp}</div>
            </div>
            <div style={styles.cardRight}>
              <button
                style={styles.qrBtn}
                onClick={(e) => { e.stopPropagation(); setQrProduct(p.productId) }}
                title="Show QR Code"
              >
                <QrCode size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                QR
              </button>
              <div style={styles.arrow} onClick={() => navigate('/product/' + p.productId)}>→</div>
            </div>
          </div>
        ))}

        {!loading && products.length > 0 && (
          <p style={styles.count}>{products.length} product{products.length > 1 ? 's' : ''} registered</p>
        )}
      </div>

      {/* QR Modal */}
      {qrProduct && (
        <div style={styles.overlay} onClick={() => setQrProduct(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Product QR Code</span>
              <button style={styles.closeBtn} onClick={() => setQrProduct(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={styles.modalProductId}>{qrProduct}</p>
            <div style={styles.qrWrapper}>
              <QRCodeCanvas
                id="modal-qr-canvas"
                value={window.location.origin + '/product/' + qrProduct}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p style={styles.qrUrl}>{window.location.origin}/product/{qrProduct}</p>
            <button style={styles.downloadBtn} onClick={() => downloadQR(qrProduct)}>
              <Download size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8faf9' },
  header: {
    backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.35), rgba(45, 106, 79, 0.22)), url(${backgroundImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '3.5rem 2rem 7rem',
    color: 'white',
  },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  subtitle: { fontSize: '0.95rem', opacity: 0.8 },
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  loadingText: { textAlign: 'center', color: '#888' },
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
    border: '1px solid #e8f5e9',
  },
  cardLeft: { flex: 1, cursor: 'pointer' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 },
  productId: { fontWeight: 'bold', color: '#1b4332', fontSize: '1rem', marginBottom: '0.3rem' },
  meta: { fontSize: '0.85rem', color: '#888' },
  arrow: { color: '#2d6a4f', fontSize: '1.2rem', cursor: 'pointer' },
  qrBtn: {
    display: 'inline-flex', alignItems: 'center',
    padding: '0.35rem 0.8rem', backgroundColor: '#f0f7f4',
    color: '#2d6a4f', border: '1px solid #a5d6a7',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600',
  },
  count: { textAlign: 'center', color: '#aaa', fontSize: '0.85rem', marginTop: '1rem' },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '20px', padding: '2rem',
    maxWidth: '360px', width: '100%', textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.5rem',
  },
  modalTitle: { fontWeight: 'bold', fontSize: '1.1rem', color: '#1b4332' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#888', padding: '0.2rem', borderRadius: '6px',
    display: 'flex', alignItems: 'center',
  },
  modalProductId: { color: '#2d6a4f', fontWeight: '600', fontSize: '0.95rem', marginBottom: '1.2rem' },
  qrWrapper: {
    display: 'inline-block', padding: '0.5rem', backgroundColor: 'white',
    borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    marginBottom: '0.8rem', border: '1px solid #e8f5e9',
  },
  qrUrl: { color: '#aaa', fontSize: '0.72rem', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1.2rem' },
  downloadBtn: {
    display: 'inline-flex', alignItems: 'center', padding: '0.6rem 1.4rem',
    backgroundColor: '#2d6a4f', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
  },
}

export default MyProducts
