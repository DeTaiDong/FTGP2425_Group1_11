import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'

function Home() {
  const navigate = useNavigate()
  const [productCount, setProductCount] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      if (!window.ethereum) return
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = getContract(provider)
      const testIds = [
        'ECO-TX-2025-001',
        'ECO-EL-2025-001',
        'ECO-FN-2025-001',
        'SKU-2026-001',
        'SKU-TEST-001'
      ]
      let count = 0
      for (const id of testIds) {
        const exists = await contract.passportExists(id)
        if (exists) count++
      }
      setProductCount(count)
    } catch (err) {
      console.log('Stats fetch failed:', err.message)
    }
  }

  return (
    <div style={styles.page}>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>★ EU ESPR Compliant</div>
          <h1 style={styles.heroTitle}>
            Digital Product Passports<br />for a Sustainable Europe
          </h1>
          <p style={styles.heroSubtitle}>
            EcoPassEU uses blockchain technology to provide tamper-proof,
            privacy-aware product transparency — helping manufacturers,
            consumers, and regulators navigate the EU's sustainability requirements.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
              🏭 Register Product
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('/scan')}>
              🔍 Search Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {productCount !== null ? productCount : '...'}
          </span>
          <span style={styles.statLabel}>Products Registered</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNumber}>Sepolia</span>
          <span style={styles.statLabel}>Blockchain Network</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNumber}>IPFS</span>
          <span style={styles.statLabel}>Decentralised Storage</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNumber}>ESPR</span>
          <span style={styles.statLabel}>EU Regulation Aligned</span>
        </div>
      </div>

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepIcon}>1️⃣</div>
            <h3 style={styles.stepTitle}>Manufacturer Registers</h3>
            <p style={styles.stepDesc}>
              Brands upload product data — materials, origin, certifications —
              and receive a blockchain-verified Digital Product Passport.
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>2️⃣</div>
            <h3 style={styles.stepTitle}>Data Stored Securely</h3>
            <p style={styles.stepDesc}>
              Detailed documents are stored on IPFS. Only cryptographic hashes
              and pointers are written to the blockchain — keeping costs low
              and commercial data private.
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>3️⃣</div>
            <h3 style={styles.stepTitle}>Anyone Can Verify</h3>
            <p style={styles.stepDesc}>
              Consumers, regulators, and auditors can instantly search any
              product and view its verified sustainability record — no
              blockchain knowledge required.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why EcoPassEU?</h2>
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔒</div>
            <h3 style={styles.featureTitle}>Privacy-Aware</h3>
            <p style={styles.featureDesc}>
              Sensitive supply chain data stays off-chain. Only verifiable
              hashes are stored on the public ledger.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>✅</div>
            <h3 style={styles.featureTitle}>Anti-Greenwashing</h3>
            <p style={styles.featureDesc}>
              Cryptographic proofs make it impossible to fake or alter
              sustainability claims after registration.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏛️</div>
            <h3 style={styles.featureTitle}>ESPR Aligned</h3>
            <p style={styles.featureDesc}>
              Built to meet the EU Ecodesign for Sustainable Products
              Regulation requirements for digital product passports.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💸</div>
            <h3 style={styles.featureTitle}>SME Friendly</h3>
            <p style={styles.featureDesc}>
              Low gas costs via batch registration. No need to build
              bespoke infrastructure — plug in and comply.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
        <p style={styles.ctaDesc}>
          Register your first product passport or search for an existing one.
        </p>
        <div style={styles.heroBtns}>
          <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
            🏭 Register Product
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/scan')}>
            🔍 Search Product
          </button>
        </div>
      </div>

    </div>
  )
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif' },
  hero: {
    background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)',
    padding: '5rem 2rem',
    textAlign: 'center',
    color: 'white',
  },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    marginBottom: '2.5rem',
    lineHeight: 1.7,
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
  },
  heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    backgroundColor: 'white',
    color: '#2d6a4f',
    border: 'none',
    padding: '0.9rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '0.9rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    flexWrap: 'wrap',
  },
  stat: { textAlign: 'center' },
  statNumber: { display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: '#2d6a4f' },
  statLabel: { fontSize: '0.85rem', color: '#666' },
  statDivider: { width: '1px', height: '40px', backgroundColor: '#ddd' },
  section: { maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' },
  sectionTitle: { textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: '#1b4332' },
  steps: { display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' },
  step: { flex: 1, minWidth: '200px', maxWidth: '260px', textAlign: 'center', padding: '1.5rem', backgroundColor: '#f0f7f4', borderRadius: '12px' },
  stepIcon: { fontSize: '2rem', marginBottom: '1rem' },
  stepTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#2d6a4f', marginBottom: '0.8rem' },
  stepDesc: { fontSize: '0.9rem', color: '#555', lineHeight: 1.6 },
  stepArrow: { fontSize: '2rem', color: '#2d6a4f', paddingTop: '3rem' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  featureCard: { padding: '2rem', border: '1px solid #e0e0e0', borderRadius: '12px', textAlign: 'center' },
  featureIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  featureTitle: { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#1b4332' },
  featureDesc: { fontSize: '0.9rem', color: '#555', lineHeight: 1.6 },
  cta: {
    backgroundColor: '#f0f7f4',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  ctaTitle: { fontSize: '2rem', color: '#1b4332', marginBottom: '1rem' },
  ctaDesc: { color: '#555', marginBottom: '2rem', fontSize: '1.1rem' },
}

export default Home