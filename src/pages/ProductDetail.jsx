import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [passport, setPassport] = useState(null)
  const [ipfsData, setIpfsData] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPassport()
  }, [id])

  const fetchPassport = async () => {
    try {
      setLoading(true)
      if (!window.ethereum) throw new Error('MetaMask not found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = getContract(provider)

      const exists = await contract.passportExists(id)
      if (!exists) {
        setStatus({ type: 'error', msg: 'No passport found for this Product ID.' })
        return
      }

      const [ipfsCID, metadataHash, issuer, timestamp] = await contract.getPassport(id)
      setPassport({
        productId: id,
        ipfsCID,
        metadataHash,
        issuer,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
      })

      // 如果有 IPFS 数据就获取
      if (ipfsCID && ipfsCID !== 'ipfs://placeholder') {
        const cid = ipfsCID.replace('ipfs://', '')
        const res = await fetch('https://gateway.pinata.cloud/ipfs/' + cid)
        if (res.ok) {
          const data = await res.json()
          setIpfsData(data)
        }
      }

    } catch (err) {
      setStatus({ type: 'error', msg: 'Error: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.center}>
      <p>⏳ Loading passport data from blockchain...</p>
    </div>
  )

  if (status) return (
    <div style={styles.center}>
      <p style={{ color: '#c62828' }}>{status.msg}</p>
      <button style={styles.backBtn} onClick={() => navigate('/scan')}>
        ← Back to Scan
      </button>
    </div>
  )

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/scan')}>
        ← Back
      </button>

      <h2 style={styles.title}>📋 Product Passport Detail</h2>

      {/* 区块链信息 */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔗 Blockchain Record</h3>
        <div style={styles.row}>
          <span style={styles.key}>Product ID</span>
          <span style={styles.value}>{passport.productId}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.key}>Issuer</span>
          <span style={styles.value}>{passport.issuer}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.key}>Registered At</span>
          <span style={styles.value}>{passport.timestamp}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.key}>Metadata Hash</span>
          <span style={styles.valueSmall}>{passport.metadataHash}</span>
        </div>
      </div>

      {/* IPFS 产品详情 */}
      {ipfsData && (
        <>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏷️ Product Information</h3>
            <div style={styles.row}>
              <span style={styles.key}>Brand</span>
              <span style={styles.value}>{ipfsData.brand}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.key}>Category</span>
              <span style={styles.value}>{ipfsData.category}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.key}>Recycling</span>
              <span style={styles.value}>{ipfsData.recycling}</span>
            </div>
            {ipfsData.repairGuide && (
              <div style={styles.row}>
                <span style={styles.key}>Repair Guide</span>
                <a href={ipfsData.repairGuide} target="_blank" rel="noreferrer" style={styles.link}>
                  View Guide →
                </a>
              </div>
            )}
          </div>

          {/* 材料信息 */}
          {ipfsData.materials && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🧵 Material Composition</h3>
              {ipfsData.materials.map((mat, i) => (
                <div key={i} style={styles.materialCard}>
                  <div style={styles.row}>
                    <span style={styles.key}>{mat.name}</span>
                    <span style={styles.badge}>{mat.percentage}%</span>
                  </div>
                  <div style={styles.row}>
                    <span style={styles.subKey}>Origin</span>
                    <span style={styles.value}>{mat.origin}</span>
                  </div>
                  <div style={styles.row}>
                    <span style={styles.subKey}>Certified</span>
                    <span style={styles.certBadge}>{mat.certified}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 供应链信息 */}
          {ipfsData.provenance && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🌍 Supply Chain Provenance</h3>
              {ipfsData.provenance.map((step, i) => (
                <div key={i} style={styles.provenanceRow}>
                  <div style={styles.stepNumber}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{step.stage}</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      📍 {step.location} · 📅 {step.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!ipfsData && (
        <div style={styles.section}>
          <p style={{ color: '#888' }}>No detailed product data available (no IPFS document attached).</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  center: { textAlign: 'center', padding: '4rem' },
  title: { fontSize: '1.8rem', marginBottom: '1.5rem' },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  section: {
    backgroundColor: '#f0f7f4',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: { color: '#2d6a4f', marginBottom: '1rem', fontSize: '1.1rem' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #d0e8d8',
  },
  key: { fontWeight: 'bold', color: '#444', fontSize: '0.95rem' },
  subKey: { color: '#666', fontSize: '0.9rem' },
  value: { color: '#222', fontSize: '0.95rem' },
  valueSmall: { color: '#666', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '60%', textAlign: 'right' },
  link: { color: '#2d6a4f', textDecoration: 'underline' },
  badge: {
    backgroundColor: '#2d6a4f',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
  },
  certBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2d6a4f',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    border: '1px solid #a5d6a7',
  },
  materialCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '0.8rem',
    marginBottom: '0.8rem',
  },
  provenanceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.8rem 0',
    borderBottom: '1px solid #d0e8d8',
  },
  stepNumber: {
    backgroundColor: '#2d6a4f',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    flexShrink: 0,
  },
}

export default ProductDetail