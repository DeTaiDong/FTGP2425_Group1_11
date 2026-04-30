import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'
import SupplyChainMap from '../components/SupplyChainMap'
import { Link2, Tag, Layers, Route, Map, MapPin, Calendar, Loader, ShieldCheck, TriangleAlert } from 'lucide-react'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [passport, setPassport] = useState(null)
  const [ipfsData, setIpfsData] = useState(null)
  const [integrityCheck, setIntegrityCheck] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPassport()
  }, [id])

  const fetchPassport = async () => {
    try {
      setLoading(true)
      let provider
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
      }
      const contract = getContract(provider)

      const exists = await contract.passportExists(id)
      if (!exists) {
        setStatus({ type: 'error', msg: 'No passport found for this Product ID.' })
        return
      }

      const [ipfsCID, metadataHash, issuer, timestamp] = await contract.getPassport(id)
      setPassport({
        productId: id, ipfsCID, metadataHash, issuer,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
      })

      if (ipfsCID && ipfsCID !== 'ipfs://placeholder') {
        const cid = ipfsCID.replace('ipfs://', '')
        const res = await fetch('https://gateway.pinata.cloud/ipfs/' + cid)
        if (res.ok) {
          const data = await res.json()
          const computedHash = calculateMetadataHash(data)
          const verified = computedHash.toLowerCase() === metadataHash.toLowerCase()
          setIpfsData(data)
          setIntegrityCheck({
            verified,
            computedHash,
            message: verified
              ? 'IPFS metadata matches the on-chain hash.'
              : 'IPFS metadata does not match the on-chain hash.',
          })
        } else {
          setIntegrityCheck({
            verified: false,
            computedHash: null,
            message: 'Unable to fetch IPFS metadata for verification.',
          })
        }
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const calculateMetadataHash = (data) => {
    const passportData = {
      productId: data.productId,
      category: data.category,
      brand: data.brand,
      materials: data.materials || [],
      provenance: data.provenance || [],
      repairGuide: data.repairGuide || '',
      recycling: data.recycling || '',
    }
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(passportData)))
  }

  if (loading) return (
    <div style={{ ...styles.page, ...styles.center }}>
      <Loader size={28} color="#2d6a4f" className="spin" style={{ marginBottom: '0.5rem' }} />
      <p style={{ color: '#888' }}>Loading passport data from blockchain...</p>
    </div>
  )

  if (status) return (
    <div style={{ ...styles.page, ...styles.center }}>
      <p style={{ color: '#c62828' }}>{status.msg}</p>
      <button style={styles.backBtn} onClick={() => navigate('/scan')}>← Back to Search</button>
    </div>
  )

  return (
    <div style={styles.page}>
    <div style={styles.container}>
      <style>{`
        .pd-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0;
          border-bottom: 1px solid #d0e8d8;
          gap: 0.5rem;
        }
        .pd-row-stack {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.6rem 0;
          border-bottom: 1px solid #d0e8d8;
          gap: 0.5rem;
        }
        .pd-value-mono {
          color: #666;
          font-size: 0.75rem;
          font-family: monospace;
          word-break: break-all;
          text-align: right;
          max-width: 65%;
        }
        .pd-provenance-meta {
          color: #666;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.2rem;
        }
        @media (max-width: 600px) {
          .pd-container {
            padding: 1rem 0.75rem !important;
          }
          .pd-title {
            font-size: 1.3rem !important;
            margin-bottom: 1rem !important;
          }
          .pd-section {
            padding: 1rem !important;
            border-radius: 10px !important;
          }
          .pd-row, .pd-row-stack {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.2rem !important;
          }
          .pd-value-mono {
            max-width: 100% !important;
            text-align: left !important;
            font-size: 0.7rem !important;
          }
          .pd-value {
            font-size: 0.88rem !important;
            word-break: break-word !important;
          }
          .pd-key {
            font-size: 0.82rem !important;
            color: #888 !important;
            font-weight: 600 !important;
          }
          .pd-provenance-meta {
            font-size: 0.82rem !important;
          }
          .pd-material-card {
            padding: 0.6rem !important;
          }
          .pd-section-title {
            font-size: 0.98rem !important;
          }
        }
      `}</style>

      <button style={styles.backBtn} onClick={() => navigate('/scan')}>← Back</button>
      <h2 className="pd-title" style={styles.title}>Product Passport Detail</h2>

      {/* Blockchain Record */}
      <div className="pd-section" style={styles.section}>
        <h3 className="pd-section-title" style={styles.sectionTitle}>
          <Link2 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Blockchain Record
        </h3>
        <div className="pd-row">
          <span className="pd-key" style={styles.key}>Product ID</span>
          <span className="pd-value" style={styles.value}>{passport.productId}</span>
        </div>
        <div className="pd-row-stack">
          <span className="pd-key" style={styles.key}>Issuer</span>
          <span className="pd-value-mono">{passport.issuer}</span>
        </div>
        <div className="pd-row">
          <span className="pd-key" style={styles.key}>Registered At</span>
          <span className="pd-value" style={styles.value}>{passport.timestamp}</span>
        </div>
        <div className="pd-row-stack" style={{ borderBottom: 'none' }}>
          <span className="pd-key" style={styles.key}>Metadata Hash</span>
          <span className="pd-value-mono">{passport.metadataHash}</span>
        </div>
      </div>

      {integrityCheck && (
        <div className="pd-section" style={{
          ...styles.integritySection,
          ...(integrityCheck.verified ? styles.integrityVerified : styles.integrityWarning),
        }}>
          <div style={styles.integrityHeader}>
            {integrityCheck.verified ? (
              <ShieldCheck size={20} color="#2d6a4f" />
            ) : (
              <TriangleAlert size={20} color="#b45309" />
            )}
            <div>
              <h3 className="pd-section-title" style={styles.integrityTitle}>
                Data Integrity {integrityCheck.verified ? 'Verified' : 'Warning'}
              </h3>
              <p style={styles.integrityMessage}>{integrityCheck.message}</p>
            </div>
          </div>
          {integrityCheck.computedHash && (
            <div className="pd-row-stack" style={{ borderBottom: 'none', marginTop: '0.8rem' }}>
              <span className="pd-key" style={styles.key}>Computed IPFS Hash</span>
              <span className="pd-value-mono">{integrityCheck.computedHash}</span>
            </div>
          )}
        </div>
      )}

      {ipfsData && (
        <>
          {/* Product Information */}
          <div className="pd-section" style={styles.section}>
            <h3 className="pd-section-title" style={styles.sectionTitle}>
              <Tag size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Product Information
            </h3>
            <div className="pd-row">
              <span className="pd-key" style={styles.key}>Brand</span>
              <span className="pd-value" style={styles.value}>{ipfsData.brand}</span>
            </div>
            <div className="pd-row">
              <span className="pd-key" style={styles.key}>Category</span>
              <span className="pd-value" style={styles.value}>{ipfsData.category}</span>
            </div>
            <div className="pd-row">
              <span className="pd-key" style={styles.key}>Recycling</span>
              <span className="pd-value" style={styles.value}>{ipfsData.recycling}</span>
            </div>
            {ipfsData.repairGuide && (
              <div className="pd-row" style={{ borderBottom: 'none' }}>
                <span className="pd-key" style={styles.key}>Repair Guide</span>
                <a href={ipfsData.repairGuide} target="_blank" rel="noreferrer" style={styles.link}>
                  View Guide →
                </a>
              </div>
            )}
          </div>

          {/* Material Composition */}
          {ipfsData.materials && ipfsData.materials.length > 0 && (
            <div className="pd-section" style={styles.section}>
              <h3 className="pd-section-title" style={styles.sectionTitle}>
                <Layers size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Material Composition
              </h3>
              {ipfsData.materials.map((mat, i) => (
                <div className="pd-material-card" key={i} style={styles.materialCard}>
                  <div className="pd-row">
                    <span className="pd-key" style={styles.key}>{mat.name}</span>
                    <span style={styles.badge}>{mat.percentage}%</span>
                  </div>
                  <div className="pd-row">
                    <span className="pd-key" style={styles.subKey}>Origin</span>
                    <span className="pd-value" style={styles.value}>{mat.origin}</span>
                  </div>
                  <div className="pd-row" style={{ borderBottom: 'none' }}>
                    <span className="pd-key" style={styles.subKey}>Certified</span>
                    <span style={styles.certBadge}>{mat.certified}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Supply Chain Provenance */}
          {ipfsData.provenance && ipfsData.provenance.length > 0 && (
            <div className="pd-section" style={styles.section}>
              <h3 className="pd-section-title" style={styles.sectionTitle}>
                <Route size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Supply Chain Provenance
              </h3>
              {ipfsData.provenance.map((step, i) => (
                <div key={i} style={styles.provenanceRow}>
                  <div style={styles.stepNumber}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', wordBreak: 'break-word' }}>{step.stage}</div>
                    <div className="pd-provenance-meta">
                      <MapPin size={13} style={{ flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>{step.location}</span>
                      <span style={{ color: '#ccc' }}>·</span>
                      <Calendar size={13} style={{ flexShrink: 0 }} />
                      <span>{step.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Supply Chain Map */}
          {ipfsData.provenance && ipfsData.provenance.length > 0 && (
            <div className="pd-section" style={styles.section}>
              <h3 className="pd-section-title" style={styles.sectionTitle}>
                <Map size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Supply Chain Map
              </h3>
              <SupplyChainMap provenance={ipfsData.provenance} />
            </div>
          )}
        </>
      )}

      {!ipfsData && (
        <div className="pd-section" style={styles.section}>
          <p style={{ color: '#888' }}>No detailed product data available.</p>
        </div>
      )}
    </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8faf9', paddingBottom: '3rem' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  center: { textAlign: 'center', padding: '4rem 1rem' },
  title: { fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1b4332' },
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
  section: {
    backgroundColor: '#f0f7f4',
    border: '1px solid #a5d6a7',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  integritySection: {
    borderRadius: '12px',
    padding: '1.2rem 1.5rem',
    marginBottom: '1.5rem',
  },
  integrityVerified: {
    backgroundColor: '#edf7f0',
    border: '1px solid #74c69d',
  },
  integrityWarning: {
    backgroundColor: '#fff7ed',
    border: '1px solid #f59e0b',
  },
  integrityHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  integrityTitle: {
    color: '#1b4332',
    margin: 0,
    fontSize: '1rem',
  },
  integrityMessage: {
    color: '#555',
    margin: '0.25rem 0 0',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  sectionTitle: { color: '#2d6a4f', marginBottom: '1rem', fontSize: '1.1rem' },
  key: { fontWeight: 'bold', color: '#444', fontSize: '0.95rem', flexShrink: 0 },
  subKey: { color: '#666', fontSize: '0.9rem', flexShrink: 0 },
  value: { color: '#222', fontSize: '0.95rem', textAlign: 'right' },
  link: { color: '#2d6a4f', textDecoration: 'underline' },
  badge: { backgroundColor: '#2d6a4f', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', flexShrink: 0 },
  certBadge: { backgroundColor: '#e8f5e9', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #a5d6a7', flexShrink: 0 },
  materialCard: { backgroundColor: 'white', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem' },
  provenanceRow: { display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid #d0e8d8' },
  stepNumber: { backgroundColor: '#2d6a4f', color: 'white', width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' },
}

export default ProductDetail
