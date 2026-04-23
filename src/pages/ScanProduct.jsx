import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'
import { ScanSearch, Search, ShieldCheck, CircleCheck, CircleX, Loader, FileText, Copy, User, Calendar, Package, Hash, Leaf } from 'lucide-react'

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
    let provider
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum)
    } else {
      provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
    }


      const contract = getContract(provider)
      const exists = await contract.passportExists(productId.trim())
      if (!exists) {
        setStatus({ type: 'error', msg: 'No passport found for this Product ID.' })
        return
      }
      const [ipfsCID, metadataHash, issuer, timestamp] = await contract.getPassport(productId.trim())
      setResult({
        productId: productId.trim(),
        ipfsCID, metadataHash, issuer,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
      })
      setStatus(null)
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const getIpfsUrl = (cid) => 'https://ipfs.io/ipfs/' + cid.replace('ipfs://', '')

  const quickSearchIds = ['ECO-TX-2025-001', 'ECO-EL-2025-001', 'ECO-FN-2025-001']

  return (
    <div style={styles.page}>
      <style>{`
        .search-input:focus {
          border-color: #2d6a4f !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.15) !important;
          outline: none;
        }
        .search-btn:hover:not(:disabled) {
          background-color: #1b4332 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45,106,79,0.4) !important;
        }
        .search-btn { transition: all 0.2s ease !important; }
        .quick-tag:hover {
          background-color: #2d6a4f !important;
          color: white !important;
          transform: translateY(-1px);
          cursor: pointer;
        }
        .quick-tag { transition: all 0.15s ease !important; }
        .detail-btn:hover {
          background-color: #1b4332 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45,106,79,0.3) !important;
        }
        .detail-btn { transition: all 0.2s ease !important; }
        .result-row:hover {
          background-color: #f0f7f4 !important;
        }
        .result-row { transition: background 0.15s ease !important; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}><ScanSearch size={40} color="white" strokeWidth={1.5} /></div>
        <h1 style={styles.title}>Search Product Passport</h1>
        <p style={styles.subtitle}>
          Enter a Product ID to instantly retrieve its verified Digital Product
          Passport from the Sepolia blockchain.
        </p>
      </div>

      <div style={styles.container}>

        {/* Search Box */}
        <div style={styles.searchCard}>
          <label style={styles.searchLabel}>Product ID</label>
          <div style={styles.searchRow}>
            <input
              className="search-input"
              style={styles.searchInput}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. ECO-TX-2025-001"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="search-btn"
              style={loading ? styles.btnDisabled : styles.btn}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <Loader size={18} className="spin" /> : <><Search size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Search</>}
            </button>
          </div>

          {/* Quick Search Tags */}
          <div style={styles.quickRow}>
            <span style={styles.quickLabel}>Quick search:</span>
            {quickSearchIds.map(id => (
              <span
                key={id}
                className="quick-tag"
                style={styles.quickTag}
                onClick={() => { setProductId(id) }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>

        {/* Status */}
        {status && (
          <div style={
            status.type === 'error' ? styles.error :
            status.type === 'info' ? styles.info : styles.success
          }>
            {status.type === 'error' && <CircleX size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />}
            {status.type === 'info' && <Loader size={16} className="spin" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />}
            {status.msg}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div style={styles.resultCard}>

            {/* Result Header */}
            <div style={styles.resultHeader}>
              <div>
                <div style={styles.resultBadge}><CircleCheck size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Passport Found</div>
                <h2 style={styles.resultProductId}>{result.productId}</h2>
              </div>
              <div style={styles.verifiedBadge}>
                <ShieldCheck size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Blockchain Verified
              </div>
            </div>

            {/* Result Rows */}
            <div style={styles.resultBody}>
              <div className="result-row" style={styles.resultRow}>
                <span style={styles.rowKey}><Package size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Product ID</span>
                <span style={styles.rowValue}>{result.productId}</span>
              </div>
              <div className="result-row" style={styles.resultRow}>
                <span style={styles.rowKey}><User size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Issuer</span>
                <span style={styles.rowValue}>
                  {result.issuer.slice(0, 10) + '...' + result.issuer.slice(-8)}
                </span>
              </div>
              <div className="result-row" style={styles.resultRow}>
                <span style={styles.rowKey}><Calendar size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Registered At</span>
                <span style={styles.rowValue}>{result.timestamp}</span>
              </div>
              <div className="result-row" style={styles.resultRow}>
                <span style={styles.rowKey}><FileText size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />IPFS Document</span>
                <span style={styles.rowValue}>
                  {result.ipfsCID === 'ipfs://placeholder'
                    ? <span style={{ color: '#999' }}>No document attached</span>
                    : <a
                        href={'https://ipfs.io/ipfs/' + result.ipfsCID.replace('ipfs://', '')}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        {result.ipfsCID.slice(0, 24) + '...'}
                      </a>
                  }
                </span>
              </div>
              <div className="result-row" style={{ ...styles.resultRow, borderBottom: 'none' }}>
                <span style={styles.rowKey}><Hash size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />Metadata Hash</span>
                <span style={styles.rowValueMono}>
                  {result.metadataHash.slice(0, 22) + '...'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.resultActions}>
              <button
                className="detail-btn"
                style={styles.detailBtn}
                onClick={() => navigate('/product/' + result.productId)}
              >
                <FileText size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />View Full Detail
              </button>
              <button
                style={styles.copyBtn}
                onClick={() => { navigator.clipboard.writeText(result.productId); alert('Product ID copied!') }}
              >
                <Copy size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Copy ID
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !status && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><Leaf size={52} color="#a5d6a7" strokeWidth={1.5} /></div>
            <p style={styles.emptyText}>
              Enter a Product ID above to verify its Digital Product Passport
            </p>
            <p style={styles.emptySubtext}>
              All registered products are publicly verifiable on the blockchain
            </p>
          </div>
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
  headerIcon: { fontSize: '3rem', marginBottom: '1rem' },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.8rem' },
  subtitle: { fontSize: '1rem', opacity: 0.85, maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 },
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  searchCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  searchLabel: { display: 'block', fontWeight: '600', fontSize: '0.95rem', color: '#333', marginBottom: '0.6rem' },
  searchRow: { display: 'flex', gap: '0.8rem', marginBottom: '1rem' },
  searchInput: {
    flex: 1,
    padding: '0.85rem 1.2rem',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '1rem',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease',
  },
  btn: {
    padding: '0.85rem 1.8rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(45,106,79,0.3)',
    whiteSpace: 'nowrap',
  },
  btnDisabled: {
    padding: '0.85rem 1.8rem',
    backgroundColor: '#b0b0b0',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    whiteSpace: 'nowrap',
  },
  quickRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  quickLabel: { fontSize: '0.85rem', color: '#888' },
  quickTag: {
    fontSize: '0.8rem',
    padding: '0.3rem 0.7rem',
    backgroundColor: '#f0f7f4',
    color: '#2d6a4f',
    borderRadius: '20px',
    border: '1px solid #a5d6a7',
    fontWeight: '500',
  },
  info: { padding: '1rem 1.2rem', backgroundColor: '#e3f2fd', borderRadius: '10px', color: '#1565c0', marginBottom: '1.5rem', fontWeight: '500' },
  error: { padding: '1rem 1.2rem', backgroundColor: '#ffebee', borderRadius: '10px', color: '#c62828', marginBottom: '1.5rem', fontWeight: '500' },
  success: { padding: '1rem 1.2rem', backgroundColor: '#e8f5e9', borderRadius: '10px', color: '#2d6a4f', marginBottom: '1.5rem', fontWeight: '500' },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, #f0f7f4, #e8f5e9)',
    borderBottom: '1px solid #d0e8d8',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  resultBadge: { fontSize: '0.85rem', color: '#2d6a4f', fontWeight: '600', marginBottom: '0.3rem' },
  resultProductId: { fontSize: '1.4rem', fontWeight: 'bold', color: '#1b4332', margin: 0 },
  verifiedBadge: {
    backgroundColor: '#2d6a4f',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  resultBody: { padding: '0.5rem 0' },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 2rem',
    borderBottom: '1px solid #f0f0f0',
  },
  rowKey: { fontWeight: '600', color: '#555', fontSize: '0.92rem', minWidth: '160px' },
  rowValue: { color: '#222', fontSize: '0.92rem', textAlign: 'right' },
  rowValueMono: { color: '#666', fontSize: '0.82rem', fontFamily: 'monospace', textAlign: 'right' },
  link: { color: '#2d6a4f', textDecoration: 'underline', fontSize: '0.92rem' },
  resultActions: {
    display: 'flex',
    gap: '1rem',
    padding: '1.2rem 2rem',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #f0f0f0',
  },
  detailBtn: {
    flex: 1,
    padding: '0.8rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(45,106,79,0.25)',
  },
  copyBtn: {
    padding: '0.8rem 1.2rem',
    backgroundColor: 'white',
    color: '#2d6a4f',
    border: '1.5px solid #2d6a4f',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyText: { fontSize: '1.1rem', color: '#444', marginBottom: '0.5rem', fontWeight: '500' },
  emptySubtext: { fontSize: '0.9rem', color: '#888' },
}

export default ScanProduct