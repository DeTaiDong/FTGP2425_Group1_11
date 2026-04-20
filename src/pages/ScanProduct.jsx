import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'

function ScanProduct() {
  const [productId, setProductId] = useState('')
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    setStatus(null)
    setResult(null)

    if (!productId.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a Product ID.' })
      return
    }

    try {
      setLoading(true)
      setStatus({ type: 'info', msg: 'Searching blockchain...' })

      if (!window.ethereum) throw new Error('MetaMask not found, please connect wallet first.')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = getContract(provider)

      const exists = await contract.passportExists(productId.trim())
      if (!exists) {
        setStatus({ type: 'error', msg: 'No passport found for this Product ID.' })
        return
      }

      const [ipfsCID, metadataHash, issuer, timestamp] = await contract.getPassport(productId.trim())

      setResult({
        productId: productId.trim(),
        ipfsCID,
        metadataHash,
        issuer,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
      })
      setStatus(null)

    } catch (err) {
      setStatus({ type: 'error', msg: 'Error: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const getIpfsUrl = (cid) => {
    return 'https://ipfs.io/ipfs/' + cid.replace('ipfs://', '')
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔍 Scan Product Passport</h2>
      <p style={styles.subtitle}>
        Enter a Product ID to retrieve its verified digital passport from the blockchain.
      </p>

      <div style={styles.searchBox}>
        <input
          style={styles.input}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID (e.g. SKU-2024-001)"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          style={loading ? styles.btnDisabled : styles.btn}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      {status && (
        <div style={status.type === 'error' ? styles.error : styles.info}>
          {status.msg}
        </div>
      )}

      {result && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✅ Passport Found</h3>

          <div style={styles.row}>
            <span style={styles.key}>Product ID</span>
            <span style={styles.value}>{result.productId}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.key}>Issuer</span>
            <span style={styles.value}>
              {result.issuer.slice(0, 8) + '...' + result.issuer.slice(-6)}
            </span>
          </div>

          <div style={styles.row}>
            <span style={styles.key}>Registered At</span>
            <span style={styles.value}>{result.timestamp}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.key}>IPFS Document</span>
            <span style={styles.value}>
              {result.ipfsCID === 'ipfs://placeholder'
                ? 'No document attached'
                : <a href={getIpfsUrl(result.ipfsCID)} target="_blank" rel="noreferrer" style={styles.link}>
                    {result.ipfsCID.slice(0, 20) + '...'}
                  </a>
              }
            </span>
          </div>

          <div style={styles.row}>
            <span style={styles.key}>Metadata Hash</span>
            <span style={styles.valueSmall}>
              {result.metadataHash.slice(0, 20) + '...'}
            </span>
          </div>

          <button
            style={styles.detailBtn}
            onClick={() => navigate('/product/' + result.productId)}
          >
            📋 View Full Detail
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: '650px', margin: '0 auto', padding: '3rem 1rem' },
  title: { fontSize: '1.8rem', marginBottom: '0.5rem' },
  subtitle: { color: '#666', marginBottom: '2rem' },
  searchBox: { display: 'flex', gap: '0.8rem', marginBottom: '1rem' },
  input: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDisabled: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#aaa',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  info: { padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px', color: '#1565c0', marginBottom: '1rem' },
  error: { padding: '1rem', backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828', marginBottom: '1rem' },
  card: {
    backgroundColor: '#f0f7f4',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardTitle: { color: '#2d6a4f', marginBottom: '1rem', fontSize: '1.2rem' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.6rem 0',
    borderBottom: '1px solid #d0e8d8',
  },
  key: { fontWeight: 'bold', color: '#444', fontSize: '0.95rem' },
  value: { color: '#222', fontSize: '0.95rem' },
  valueSmall: { color: '#666', fontSize: '0.85rem', fontFamily: 'monospace' },
  link: { color: '#2d6a4f', textDecoration: 'underline' },
  detailBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '0.7rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  }
}

export default ScanProduct