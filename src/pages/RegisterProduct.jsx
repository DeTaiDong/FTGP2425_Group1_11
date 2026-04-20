import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract, getProviderAndSigner } from '../utils/contract'

function RegisterProduct() {
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    material: '',
    origin: '',
    recyclable: '',
    ipfsCID: ''
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setStatus(null)

    // 检查所有字段
    if (!form.productId || !form.productName || !form.material || !form.origin) {
      setStatus({ type: 'error', msg: '❌ Please fill in all required fields.' })
      return
    }

    try {
      setLoading(true)
      setStatus({ type: 'info', msg: '⏳ Waiting for MetaMask confirmation...' })

      // 生成 metadata JSON 并计算哈希
      const metadata = {
        productName: form.productName,
        material: form.material,
        origin: form.origin,
        recyclable: form.recyclable,
        timestamp: new Date().toISOString()
      }
      const metadataString = JSON.stringify(metadata)
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataString))

      // 如果没有填 IPFS CID，用占位符
      const ipfsCID = form.ipfsCID || 'ipfs://placeholder'

      // 连接合约
      const { signer } = await getProviderAndSigner()
      const contract = getContract(signer)

      // 调用合约
      const tx = await contract.registerPassport(
        form.productId,
        ipfsCID,
        metadataHash
      )

      setStatus({ type: 'info', msg: '⏳ Transaction submitted, waiting for confirmation...' })
      await tx.wait()

      setStatus({
        type: 'success',
        msg: `✅ Product registered successfully! Transaction: ${tx.hash.slice(0, 20)}...`
      })

      // 清空表单
      setForm({ productId: '', productName: '', material: '', origin: '', recyclable: '', ipfsCID: '' })

    } catch (err) {
      if (err.message.includes('Passport already exists')) {
        setStatus({ type: 'error', msg: '❌ This Product ID already exists on the blockchain!' })
      } else if (err.message.includes('user rejected')) {
        setStatus({ type: 'error', msg: '❌ Transaction rejected by user.' })
      } else {
        setStatus({ type: 'error', msg: `❌ Error: ${err.message}` })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏭 Register Product Passport</h2>
      <p style={styles.subtitle}>
        Register your product on the Sepolia blockchain with a verified digital passport.
      </p>

      <div style={styles.form}>
        <label style={styles.label}>Product ID * <span style={styles.hint}>(unique identifier, e.g. SKU-001)</span></label>
        <input
          style={styles.input}
          name="productId"
          value={form.productId}
          onChange={handleChange}
          placeholder="e.g. SKU-2024-001"
        />

        <label style={styles.label}>Product Name *</label>
        <input
          style={styles.input}
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="e.g. Organic Cotton T-Shirt"
        />

        <label style={styles.label}>Material Composition *</label>
        <input
          style={styles.input}
          name="material"
          value={form.material}
          onChange={handleChange}
          placeholder="e.g. 100% Organic Cotton"
        />

        <label style={styles.label}>Country of Origin *</label>
        <input
          style={styles.input}
          name="origin"
          value={form.origin}
          onChange={handleChange}
          placeholder="e.g. Portugal"
        />

        <label style={styles.label}>Recyclable</label>
        <select
          style={styles.input}
          name="recyclable"
          value={form.recyclable}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Partially">Partially</option>
        </select>

        <label style={styles.label}>IPFS CID <span style={styles.hint}>(optional - off-chain document link)</span></label>
        <input
          style={styles.input}
          name="ipfsCID"
          value={form.ipfsCID}
          onChange={handleChange}
          placeholder="e.g. QmXyz..."
        />

        <button
          style={loading ? styles.btnDisabled : styles.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Processing...' : '🔗 Register on Blockchain'}
        </button>

        {status && (
          <div style={status.type === 'success' ? styles.success : status.type === 'info' ? styles.info : styles.error}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '3rem 1rem' },
  title: { fontSize: '1.8rem', marginBottom: '0.5rem' },
  subtitle: { color: '#666', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 'bold', fontSize: '0.95rem', marginTop: '0.8rem' },
  hint: { fontWeight: 'normal', color: '#888', fontSize: '0.85rem' },
  input: {
    padding: '0.7rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    outline: 'none',
  },
  btn: {
    marginTop: '1.5rem',
    padding: '0.8rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDisabled: {
    marginTop: '1.5rem',
    padding: '0.8rem',
    backgroundColor: '#aaa',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  success: { marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2d6a4f' },
  info: { marginTop: '1rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px', color: '#1565c0' },
  error: { marginTop: '1rem', padding: '1rem', backgroundColor: '#ffebee', borderRadius: '8px', color: '#c62828' },
}

export default RegisterProduct