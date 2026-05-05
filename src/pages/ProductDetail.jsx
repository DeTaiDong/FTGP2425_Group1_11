import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'
import { getIssuerProfile, getShortAddress } from '../utils/issuerProfiles'
import SupplyChainMap from '../components/SupplyChainMap'
import { Link2, Tag, Layers, Route, Map, MapPin, Calendar, Loader, ShieldCheck, TriangleAlert, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [passport, setPassport] = useState(null)
  const [ipfsData, setIpfsData] = useState(null)
  const [integrityCheck, setIntegrityCheck] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMaterialDetail, setShowMaterialDetail] = useState(false)
  const [activeMaterial, setActiveMaterial] = useState(null)
  const [hoveredSlice, setHoveredSlice] = useState(null)

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

  const issuerProfile = getIssuerProfile(passport.issuer)

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

      <div className="pd-section" style={styles.section}>
        <h3 className="pd-section-title" style={styles.sectionTitle}>
          <Building2 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Issuer Profile
        </h3>
        <div style={styles.issuerCard}>
          <div style={styles.issuerAvatar}>
            <Building2 size={24} color="white" />
          </div>
          <div style={styles.issuerContent}>
            <div style={styles.issuerTopRow}>
              <div>
                <div style={styles.issuerName}>{issuerProfile?.name || 'Unknown Issuer'}</div>
                <div style={styles.issuerMeta}>
                  {issuerProfile ? [issuerProfile.role, issuerProfile.country].filter(Boolean).join(' - ') : 'Wallet address only'}
                </div>
              </div>
              <span style={issuerProfile ? styles.issuerVerifiedBadge : styles.issuerUnknownBadge}>
                {issuerProfile?.verification || 'Unverified'}
              </span>
            </div>
            <div style={styles.issuerWallet}>{getShortAddress(passport.issuer)}</div>
            <button style={styles.issuerBtn} onClick={() => navigate('/issuer/' + passport.issuer)}>
              View issuer profile
            </button>
          </div>
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

          {/* Material Composition — Pie Chart + collapsible detail */}
          {ipfsData.materials && ipfsData.materials.length > 0 && (() => {
            const PIE_COLORS = ['#2d6a4f','#40916c','#52b788','#74c69d','#95d5b2','#b7e4c7','#d8f3dc']
            const total = ipfsData.materials.reduce((s, m) => s + (parseFloat(m.percentage) || 0), 0)
            const pieData = [
              ...ipfsData.materials.map((m, i) => ({
                name: m.name, value: parseFloat(m.percentage) || 0,
                origin: m.origin, certified: m.certified, colorIndex: i,
              })),
              ...(total < 100 ? [{ name: 'Unknown', value: 100 - total, unknown: true }] : []),
            ]

            const hovered = hoveredSlice !== null ? pieData[hoveredSlice] : null
            const centerLabel = hovered || { name: 'Total', value: Math.min(total, 100) }

            const handlePieClick = (_, index) => {
              setActiveMaterial(activeMaterial === index ? null : index)
            }

            return (
              <div className="pd-section" style={styles.section}>
                <h3 className="pd-section-title" style={styles.sectionTitle}>
                  <Layers size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Material Composition
                </h3>

                <div style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={72}
                        outerRadius={110}
                        dataKey="value"
                        onClick={handlePieClick}
                        onMouseEnter={(_, i) => setHoveredSlice(i)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        style={{ cursor: 'pointer' }}
                        activeIndex={hoveredSlice ?? -1}
                        activeShape={(props) => {
                          const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
                          return (
                            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
                              startAngle={startAngle} endAngle={endAngle} fill={fill} />
                          )
                        }}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.unknown ? '#d0d0d0' : PIE_COLORS[entry.colorIndex % PIE_COLORS.length]}
                            stroke={activeMaterial === i ? '#1b4332' : 'white'}
                            strokeWidth={activeMaterial === i ? 3 : 1}
                            opacity={hoveredSlice !== null && hoveredSlice !== i ? 0.45 : 1}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.donutCenter}>
                    <div style={styles.donutCenterPct}>{centerLabel.value.toFixed(0)}%</div>
                    <div style={styles.donutCenterName}>{hovered ? hovered.name.split(' ')[0] : 'Total'}</div>
                  </div>
                </div>

                {/* Legend */}
                <div style={styles.legend}>
                  {pieData.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.legendItem,
                        opacity: hoveredSlice !== null && hoveredSlice !== i ? 0.4 : 1,
                        fontWeight: activeMaterial === i ? '700' : '400',
                      }}
                      onMouseEnter={() => setHoveredSlice(i)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      onClick={() => handlePieClick(null, i)}
                    >
                      <span style={{ ...styles.legendDot, backgroundColor: entry.unknown ? '#d0d0d0' : PIE_COLORS[entry.colorIndex % PIE_COLORS.length] }} />
                      <span style={styles.legendName}>{entry.name}</span>
                      <span style={styles.legendPct}>{entry.value.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>

                {activeMaterial !== null && !pieData[activeMaterial]?.unknown && (
                  <div style={styles.activeCard}>
                    <div style={styles.activeName}>{pieData[activeMaterial].name}</div>
                    <div style={styles.activeRow}><span style={styles.subKey}>Percentage</span><span style={styles.badge}>{pieData[activeMaterial].value.toFixed(1)}%</span></div>
                    {pieData[activeMaterial].origin && <div style={styles.activeRow}><span style={styles.subKey}>Origin</span><span style={styles.value}>{pieData[activeMaterial].origin}</span></div>}
                    {pieData[activeMaterial].certified && <div style={styles.activeRow}><span style={styles.subKey}>Certification</span><span style={styles.certBadge}>{pieData[activeMaterial].certified}</span></div>}
                  </div>
                )}

                <button style={styles.toggleBtn} onClick={() => setShowMaterialDetail(v => !v)}>
                  {showMaterialDetail ? <ChevronUp size={15} style={{ marginRight: '0.3rem' }} /> : <ChevronDown size={15} style={{ marginRight: '0.3rem' }} />}
                  {showMaterialDetail ? 'Hide detail' : 'More detail'}
                </button>

                {showMaterialDetail && ipfsData.materials.map((mat, i) => (
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
            )
          })()}

          {/* Supply Chain Map (default open) + collapsible provenance list */}
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
  issuerCard: {
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1rem',
  },
  issuerAvatar: {
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: '8px',
    backgroundColor: '#2d6a4f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issuerContent: { flex: 1, minWidth: 0 },
  issuerTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.8rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  issuerName: { color: '#1b4332', fontWeight: '700', fontSize: '1rem' },
  issuerMeta: { color: '#666', fontSize: '0.85rem', marginTop: '0.2rem' },
  issuerWallet: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    marginTop: '0.7rem',
    wordBreak: 'break-all',
  },
  issuerVerifiedBadge: {
    color: '#2d6a4f',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '999px',
    padding: '0.25rem 0.6rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  issuerUnknownBadge: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '999px',
    padding: '0.25rem 0.6rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  issuerBtn: {
    marginTop: '0.8rem',
    border: 'none',
    backgroundColor: '#2d6a4f',
    color: 'white',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  key: { fontWeight: 'bold', color: '#444', fontSize: '0.95rem', flexShrink: 0 },
  subKey: { color: '#666', fontSize: '0.9rem', flexShrink: 0 },
  value: { color: '#222', fontSize: '0.95rem', textAlign: 'right' },
  link: { color: '#2d6a4f', textDecoration: 'underline' },
  badge: { backgroundColor: '#2d6a4f', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', flexShrink: 0 },
  certBadge: { backgroundColor: '#e8f5e9', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #a5d6a7', flexShrink: 0 },
  materialCard: { backgroundColor: 'white', borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem' },
  provenanceRow: { display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid #d0e8d8' },
  stepNumber: { backgroundColor: '#2d6a4f', color: 'white', width: '28px', height: '28px', minWidth: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' },
  donutCenter: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center', pointerEvents: 'none',
  },
  donutCenterPct: { fontSize: '1.8rem', fontWeight: '800', color: '#2d6a4f', lineHeight: 1 },
  donutCenterName: { fontSize: '0.75rem', fontWeight: '600', color: '#888', marginTop: '3px' },
  legend: { display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '0.5rem 0 0.8rem' },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  legendDot: { width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 },
  legendName: { flex: 1, fontSize: '0.88rem', color: '#333' },
  legendPct: { fontSize: '0.88rem', fontWeight: '600', color: '#2d6a4f' },
  toggleBtn: {
    display: 'flex', alignItems: 'center', marginTop: '0.8rem',
    padding: '0.45rem 1rem', backgroundColor: 'white',
    border: '1.5px solid #a5d6a7', borderRadius: '20px',
    color: '#2d6a4f', fontSize: '0.85rem', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.15s ease',
  },
  tooltip: {
    backgroundColor: 'white', border: '1px solid #a5d6a7',
    borderRadius: '8px', padding: '0.6rem 0.9rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '0.85rem',
  },
  tooltipName: { fontWeight: '700', color: '#1b4332', marginBottom: '0.3rem' },
  tooltipRow: { color: '#555', marginTop: '0.15rem' },
  activeCard: {
    backgroundColor: 'white', borderRadius: '10px', padding: '0.9rem 1rem',
    border: '2px solid #52b788', marginTop: '0.5rem',
  },
  activeName: { fontWeight: '700', color: '#1b4332', fontSize: '1rem', marginBottom: '0.5rem' },
  activeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid #e8f5e9' },
}

export default ProductDetail
