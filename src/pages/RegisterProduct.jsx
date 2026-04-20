import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract, getProviderAndSigner } from '../utils/contract'
import { getConnectedAccount } from '../components/WalletConnect'

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkNDg1MzhmMC0zMmEzLTQ4Y2MtODIwMi02ZDNlNWQ0NzczOTYiLCJlbWFpbCI6ImRldGFpX2RvbmdAMTYzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzMDk5ZmMwYmU4ZDg1ODRmMDUxMCIsInNjb3BlZEtleVNlY3JldCI6ImNkMzhlNGMzOTkwMjNlOTYyNjI2YTg2YjUzZmMxZjRhYjExMzk1NGIyZjRhYzFlZmU2ODM5ZmViMGNlMWIxYTkiLCJleHAiOjE4MDgyMzk2MDl9.Cuh58MqUvHoHgvPvOiFVAgvveXySQtq1RHxpuc8fQ_U'

const emptyMaterial = { name: '', percentage: '', origin: '', certified: '' }
const emptyStage = { stage: '', location: '', date: '' }

function RegisterProduct() {
  const account = getConnectedAccount()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    productId: '', productName: '', brand: '', category: '',
    recyclable: '', repairGuide: '', recycling: '',
    materials: [{ ...emptyMaterial }],
    provenance: [{ ...emptyStage }],
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ipfsResult, setIpfsResult] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value.trim() })

  const handleMaterialChange = (i, e) => {
    const updated = [...form.materials]
    updated[i][e.target.name] = e.target.value
    setForm({ ...form, materials: updated })
  }

  const handleStageChange = (i, e) => {
    const updated = [...form.provenance]
    updated[i][e.target.name] = e.target.value
    setForm({ ...form, provenance: updated })
  }

  const addMaterial = () => setForm({ ...form, materials: [...form.materials, { ...emptyMaterial }] })
  const removeMaterial = (i) => setForm({ ...form, materials: form.materials.filter((_, idx) => idx !== i) })
  const addStage = () => setForm({ ...form, provenance: [...form.provenance, { ...emptyStage }] })
  const removeStage = (i) => setForm({ ...form, provenance: form.provenance.filter((_, idx) => idx !== i) })

  const uploadToIPFS = async () => {
    setStatus(null)
    if (!form.productId || !form.productName || !form.brand) {
      setStatus({ type: 'error', msg: 'Please fill in Product ID, Name and Brand first.' })
      return
    }
    try {
      setLoading(true)
      setStatus({ type: 'info', msg: 'Uploading product data to IPFS...' })
      const passportData = {
        productId: form.productId,
        category: form.category,
        brand: form.brand,
        materials: form.materials.filter(m => m.name),
        provenance: form.provenance.filter(s => s.stage),
        repairGuide: form.repairGuide,
        recycling: form.recycling,
      }
      const jsonStr = JSON.stringify(passportData)
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(jsonStr))
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + PINATA_JWT
        },
        body: JSON.stringify({
          pinataContent: passportData,
          pinataMetadata: { name: 'passport-' + form.productId + '.json' }
        })
      })
      if (!response.ok) throw new Error('IPFS upload failed: ' + response.statusText)
      const result = await response.json()
      setIpfsResult({ cid: result.IpfsHash, metadataHash })
      setStatus({ type: 'success', msg: 'Uploaded to IPFS! Ready to register on blockchain.' })
      setStep(2)
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const registerOnChain = async () => {
    setStatus(null)
    if (!ipfsResult) {
      setStatus({ type: 'error', msg: 'Please upload to IPFS first.' })
      return
    }
    try {
      setLoading(true)
      setStatus({ type: 'info', msg: 'Waiting for MetaMask confirmation...' })
      const { signer } = await getProviderAndSigner()
      const contract = getContract(signer)
      const tx = await contract.registerPassport(
        form.productId,
        ipfsResult.cid,
        ipfsResult.metadataHash
      )
      setStatus({ type: 'info', msg: 'Transaction submitted, waiting for confirmation...' })
      await tx.wait()
      setStatus({ type: 'success', msg: 'Product registered successfully! Tx: ' + tx.hash.slice(0, 20) + '...' })
      setStep(3)
    } catch (err) {
      if (err.message.includes('Passport already exists')) {
        setStatus({ type: 'error', msg: 'This Product ID already exists on the blockchain!' })
      } else if (err.message.includes('user rejected')) {
        setStatus({ type: 'error', msg: 'Transaction rejected by user.' })
      } else {
        setStatus({ type: 'error', msg: 'Error: ' + err.message })
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      productId: '', productName: '', brand: '', category: '',
      recyclable: '', repairGuide: '', recycling: '',
      materials: [{ ...emptyMaterial }],
      provenance: [{ ...emptyStage }],
    })
    setStatus(null)
    setIpfsResult(null)
    setStep(1)
  }

  return (
    <div style={styles.page}>
      <style>{`
        .field-input:focus { border-color: #2d6a4f !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.15) !important; outline: none; }
        .field-input:hover { border-color: #40916c !important; }
        .btn-green:hover:not(:disabled) { background-color: #1b4332 !important; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(45,106,79,0.4) !important; }
        .btn-green { transition: all 0.2s ease !important; }
        .btn-outline:hover { background-color: #2d6a4f !important; color: white !important; transform: translateY(-1px); }
        .btn-outline { transition: all 0.2s ease !important; }
        .btn-red:hover { background-color: #c62828 !important; color: white !important; }
        .btn-red { transition: all 0.2s ease !important; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>🏭</div>
        <h1 style={styles.title}>Register Product Passport</h1>
        <p style={styles.subtitle}>
          Issue a tamper-proof Digital Product Passport on the Sepolia blockchain.
        </p>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {['Fill Details', 'Upload IPFS', 'Register Chain', 'Done'].map((label, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{
                ...styles.stepDot,
                backgroundColor: step > i ? '#40916c' : step === i + 1 ? 'white' : 'rgba(255,255,255,0.3)',
                color: step === i + 1 ? '#2d6a4f' : 'white',
                border: step === i + 1 ? '3px solid white' : 'none',
              }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.75rem', opacity: step === i + 1 ? 1 : 0.6 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.container}>

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={styles.successCard}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#2d6a4f', marginBottom: '0.5rem' }}>Registration Complete!</h2>
            <p style={{ color: '#555', marginBottom: '0.5rem' }}>Product ID: <strong>{form.productId}</strong></p>
            <p style={{ color: '#555', marginBottom: '0.5rem' }}>IPFS CID: <code style={{ fontSize: '0.8rem' }}>{ipfsResult?.cid}</code></p>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your product passport is now permanently recorded on the Sepolia blockchain.
            </p>
            <button className="btn-green" style={styles.btnGreen} onClick={resetForm}>
              + Register Another Product
            </button>
          </div>
        )}

        {/* Disconnected Wallet Warn！！ */}
        {!account && (
          <div style={styles.walletWarning}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🦊</div>
            <h3 style={{ color: '#b45309', marginBottom: '0.5rem' }}>Wallet Not Connected</h3>
            <p style={{ color: '#78350f', fontSize: '0.95rem' }}>
              You need to connect your MetaMask wallet to register a product.
              Registration requires a small amount of Sepolia ETH for gas fees.
            </p>
            <p style={{ color: '#78350f', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Click <strong>"Connect Wallet"</strong> in the top right corner to continue.
            </p>
          </div>
        )}

        {step < 3 && (
          <>
            {/* Basic Info */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📋 Basic Information</h3>
              <div style={styles.grid2}>
                <div style={styles.field}>
                  <label style={styles.label}>Product ID <span style={styles.req}>*</span></label>
                  <input className="field-input" style={styles.input} name="productId" value={form.productId} onChange={handleChange} placeholder="e.g. ECO-TX-2025-001" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Product Name <span style={styles.req}>*</span></label>
                  <input className="field-input" style={styles.input} name="productName" value={form.productName} onChange={handleChange} placeholder="e.g. Organic Cotton T-Shirt" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Brand <span style={styles.req}>*</span></label>
                  <input className="field-input" style={styles.input} name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. EcoWear GmbH" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select className="field-input" style={styles.input} name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="textile">Textile</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Recyclable</label>
                  <select className="field-input" style={styles.input} name="recyclable" value={form.recyclable} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="Yes">✅ Yes</option>
                    <option value="No">❌ No</option>
                    <option value="Partially">⚠️ Partially</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Repair Guide URL</label>
                  <input className="field-input" style={styles.input} name="repairGuide" value={form.repairGuide} onChange={handleChange} placeholder="https://..." />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Recycling Instructions</label>
                  <input className="field-input" style={styles.input} name="recycling" value={form.recycling} onChange={handleChange} placeholder="e.g. Drop-off at any H&M store" />
                </div>
              </div>
            </div>

            {/* Materials */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🧵 Material Composition</h3>
              {form.materials.map((mat, i) => (
                <div key={i} style={styles.subCard}>
                  <div style={styles.subCardHeader}>
                    <span style={{ fontWeight: '600', color: '#2d6a4f' }}>Material {i + 1}</span>
                    {form.materials.length > 1 && (
                      <button className="btn-red" style={styles.btnRemove} onClick={() => removeMaterial(i)}>✕ Remove</button>
                    )}
                  </div>
                  <div style={styles.grid4}>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Name</label>
                      <input className="field-input" style={styles.input} name="name" value={mat.name} onChange={(e) => handleMaterialChange(i, e)} placeholder="e.g. Organic Cotton" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Percentage %</label>
                      <input className="field-input" style={styles.input} name="percentage" type="number" value={mat.percentage} onChange={(e) => handleMaterialChange(i, e)} placeholder="e.g. 85" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Origin</label>
                      <input className="field-input" style={styles.input} name="origin" value={mat.origin} onChange={(e) => handleMaterialChange(i, e)} placeholder="e.g. India" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Certification</label>
                      <input className="field-input" style={styles.input} name="certified" value={mat.certified} onChange={(e) => handleMaterialChange(i, e)} placeholder="e.g. GOTS" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn-outline" style={styles.btnOutline} onClick={addMaterial}>
                + Add Material
              </button>
            </div>

            {/* Supply Chain */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🌍 Supply Chain Provenance</h3>
              {form.provenance.map((stage, i) => (
                <div key={i} style={styles.subCard}>
                  <div style={styles.subCardHeader}>
                    <span style={{ fontWeight: '600', color: '#2d6a4f' }}>Stage {i + 1}</span>
                    {form.provenance.length > 1 && (
                      <button className="btn-red" style={styles.btnRemove} onClick={() => removeStage(i)}>✕ Remove</button>
                    )}
                  </div>
                  <div style={styles.grid3}>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Stage Name</label>
                      <input className="field-input" style={styles.input} name="stage" value={stage.stage} onChange={(e) => handleStageChange(i, e)} placeholder="e.g. Raw material" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Location</label>
                      <input className="field-input" style={styles.input} name="location" value={stage.location} onChange={(e) => handleStageChange(i, e)} placeholder="e.g. Hamburg, DE" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.labelSm}>Date</label>
                      <input className="field-input" style={styles.input} name="date" type="date" value={stage.date} onChange={(e) => handleStageChange(i, e)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn-outline" style={styles.btnOutline} onClick={addStage}>
                + Add Stage
              </button>
            </div>

            {/* Status */}
            {status && (
              <div style={
                status.type === 'success' ? styles.statusSuccess :
                status.type === 'info' ? styles.statusInfo : styles.statusError
              }>
                {status.type === 'success' && '✅ '}
                {status.type === 'info' && '⏳ '}
                {status.type === 'error' && '❌ '}
                {status.msg}
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actionRow}>
              {!ipfsResult ? (
                <button className="btn-green" style={loading ? styles.btnDisabled : styles.btnGreen} onClick={uploadToIPFS} disabled={loading}>
                  {loading ? '⏳ Uploading...' : '☁️ Upload to IPFS'}
                </button>
              ) : (
                <>
                  <div style={styles.ipfsSuccess}>
                    ✅ IPFS uploaded! CID: <code style={{ fontSize: '0.8rem' }}>{ipfsResult.cid.slice(0, 20)}...</code>
                  </div>
                  <button className="btn-green" style={loading ? styles.btnDisabled : styles.btnGreen} onClick={registerOnChain} disabled={loading}>
                    {loading ? '⏳ Processing...' : '🔗 Register on Blockchain'}
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div style={styles.tips}>
              <h4 style={styles.tipsTitle}>💡 How it works</h4>
              <ul style={styles.tipsList}>
                <li><strong>Step 1:</strong> Fill in your product details above.</li>
                <li><strong>Step 2:</strong> Click "Upload to IPFS" — your data is stored on IPFS and you get a CID.</li>
                <li><strong>Step 3:</strong> Click "Register on Blockchain" — MetaMask will ask you to confirm the transaction.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8faf9' },
  header: {
    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
    padding: '3rem 2rem 2rem',
    textAlign: 'center',
    color: 'white',
  },
  headerIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  subtitle: { fontSize: '1rem', opacity: 0.85, marginBottom: '2rem' },
  stepIndicator: { display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', color: 'white' },
  stepDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#1b4332', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e8f5e9' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  grid4: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontWeight: '600', fontSize: '0.9rem', color: '#333' },
  labelSm: { fontWeight: '600', fontSize: '0.82rem', color: '#555' },
  req: { color: '#e53e3e' },
  input: { padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '0.92rem', backgroundColor: '#fafafa', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' },
  subCard: { backgroundColor: '#f8faf9', borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem', border: '1px solid #e8f5e9' },
  subCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' },
  btnOutline: { padding: '0.6rem 1.2rem', backgroundColor: 'transparent', color: '#2d6a4f', border: '1.5px solid #2d6a4f', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  btnRemove: { padding: '0.3rem 0.7rem', backgroundColor: 'transparent', color: '#c62828', border: '1px solid #c62828', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  actionRow: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },
  btnGreen: { width: '100%', padding: '1rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(45,106,79,0.3)' },
  btnDisabled: { width: '100%', padding: '1rem', backgroundColor: '#b0b0b0', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', cursor: 'not-allowed' },
  ipfsSuccess: { padding: '0.8rem 1rem', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2d6a4f', fontSize: '0.9rem', fontWeight: '500' },
  statusSuccess: { padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2d6a4f', fontWeight: '500', marginBottom: '1rem' },
  statusInfo: { padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px', color: '#1565c0', fontWeight: '500', marginBottom: '1rem' },
  statusError: { padding: '1rem', backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828', fontWeight: '500', marginBottom: '1rem' },
  tips: { backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '1.2rem 1.5rem' },
  tipsTitle: { color: '#f57f17', marginBottom: '0.6rem' },
  tipsList: { margin: 0, paddingLeft: '1.2rem', color: '#555', fontSize: '0.88rem', lineHeight: 2.2 },
  successCard: { backgroundColor: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' },
  walletWarning: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '16px',
    padding: '2.5rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
}


export default RegisterProduct