import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract, getProviderAndSigner } from '../utils/contract'

function RegisterProduct() {
  const [form, setForm] = useState({
    productId: '', productName: '', material: '',
    origin: '', recyclable: '', ipfsCID: ''
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setStatus(null)
    if (!form.productId || !form.productName || !form.material || !form.origin) {
      setStatus({ type: 'error', msg: 'Please fill in all required fields.' })
      return
    }
    try {
      setLoading(true)
      setStatus({ type: 'info', msg: 'Waiting for MetaMask confirmation...' })
      const metadata = {
        productName: form.productName, material: form.material,
        origin: form.origin, recyclable: form.recyclable,
        timestamp: new Date().toISOString()
      }
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)))
      const ipfsCID = form.ipfsCID || 'ipfs://placeholder'
      const { signer } = await getProviderAndSigner()
      const contract = getContract(signer)
      const tx = await contract.registerPassport(form.productId, ipfsCID, metadataHash)
      setStatus({ type: 'info', msg: 'Transaction submitted, waiting for confirmation...' })
      await tx.wait()
      setStatus({ type: 'success', msg: `Product registered successfully! Tx: ${tx.hash.slice(0, 20)}...` })
      setForm({ productId: '', productName: '', material: '', origin: '', recyclable: '', ipfsCID: '' })
    } catch (err) {
      if (err.message.includes('Passport already exists')) {
        setStatus({ type: 'error', msg: 'This Product ID already exists on the blockchain!' })
      } else if (err.message.includes('user rejected')) {
        setStatus({ type: 'error', msg: 'Transaction rejected by user.' })
      } else {
        setStatus({ type: 'error', msg: `Error: ${err.message}` })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        .field-input:focus {
          border-color: #2d6a4f !important;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.15) !important;
          outline: none;
        }
        .field-input:hover {
          border-color: #40916c !important;
        }
        .register-btn:hover:not(:disabled) {
          background-color: #1b4332 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45,106,79,0.4) !important;
        }
        .register-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .register-btn { transition: all 0.2s ease !important; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>🏭</div>
        <h1 style={styles.title}>Register Product Passport</h1>
        <p style={styles.subtitle}>
          Issue a tamper-proof Digital Product Passport on the Sepolia blockchain.
          Your product data will be cryptographically verified and permanently recorded.
        </p>
      </div>

      <div style={styles.container}>
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <span>🔗</span>
          <span>Connected to <strong>Sepolia Testnet</strong> — 
          Contract: 0x0617...Cf0</span>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Product ID <span style={styles.required}>*</span>
                <span style={styles.hint}> — unique identifier</span>
              </label>
              <input
                className="field-input"
                style={styles.input}
                name="productId"
                value={form.productId}
                onChange={handleChange}
                placeholder="e.g. ECO-TX-2025-001"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Product Name <span style={styles.required}>*</span>
              </label>
              <input
                className="field-input"
                style={styles.input}
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="e.g. Organic Cotton T-Shirt"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Material Composition <span style={styles.required}>*</span>
              </label>
              <input
                className="field-input"
                style={styles.input}
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="e.g. 100% Organic Cotton"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Country of Origin <span style={styles.required}>*</span>
              </label>
              <input
                className="field-input"
                style={styles.input}
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="e.g. Portugal"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Recyclable</label>
              <select
                className="field-input"
                style={styles.input}
                name="recyclable"
                value={form.recyclable}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Yes">✅ Yes</option>
                <option value="No">❌ No</option>
                <option value="Partially">⚠️ Partially</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                IPFS CID
                <span style={styles.hint}> — optional document link</span>
              </label>
              <input
                className="field-input"
                style={styles.input}
                name="ipfsCID"
                value={form.ipfsCID}
                onChange={handleChange}
                placeholder="e.g. QmZQpFPywrZT..."
              />
            </div>
          </div>

          <button
            className="register-btn"
            style={loading ? styles.btnDisabled : styles.btn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : '🔗 Register on Blockchain'}
          </button>

          {status && (
            <div style={
              status.type === 'success' ? styles.success :
              status.type === 'info' ? styles.info : styles.error
            }>
              {status.type === 'success' && '✅ '}
              {status.type === 'info' && '⏳ '}
              {status.type === 'error' && '❌ '}
              {status.msg}
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={styles.tips}>
          <h4 style={styles.tipsTitle}>💡 Tips</h4>
          <ul style={styles.tipsList}>
            <li>Product ID must be unique — it cannot be changed once registered.</li>
            <li>Use the IPFS upload script to generate a CID for detailed product data.</li>
            <li>Registration requires a small amount of Sepolia ETH for gas fees.</li>
          </ul>
        </div>
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
  subtitle: { fontSize: '1rem', opacity: 0.85, maxWidth: '550px', margin: '0 auto', lineHeight: 1.6 },
  container: { maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: '#e8f5e9',
    border: '1px solid #a5d6a7',
    borderRadius: '8px',
    padding: '0.8rem 1.2rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#2d6a4f',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontWeight: '600', fontSize: '0.9rem', color: '#333' },
  required: { color: '#e53e3e' },
  hint: { fontWeight: 'normal', color: '#888', fontSize: '0.82rem' },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '0.95rem',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(45,106,79,0.3)',
  },
  btnDisabled: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#b0b0b0',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.05rem',
    cursor: 'not-allowed',
  },
  success: { marginTop: '1rem', padding: '1rem 1.2rem', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2d6a4f', fontWeight: '500' },
  info: { marginTop: '1rem', padding: '1rem 1.2rem', backgroundColor: '#e3f2fd', borderRadius: '8px', color: '#1565c0', fontWeight: '500' },
  error: { marginTop: '1rem', padding: '1rem 1.2rem', backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828', fontWeight: '500' },
  tips: { backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '1.2rem 1.5rem' },
  tipsTitle: { color: '#f57f17', marginBottom: '0.6rem', fontSize: '0.95rem' },
  tipsList: { margin: 0, paddingLeft: '1.2rem', color: '#555', fontSize: '0.88rem', lineHeight: 2 },
}

export default RegisterProduct