import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../utils/contract'
import {
  ShieldCheck, BadgeCheck, Landmark, CircleDollarSign,
  Smartphone, MapPin, Globe, Zap,
  PackagePlus, Search, RefreshCw
} from 'lucide-react'

function Home() {
  const navigate = useNavigate()
  const [productCount, setProductCount] = useState(null)
  const [counting, setCounting] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setCounting(true)
      let provider
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
      }
      const contract = getContract(provider)

      // Fix： update function： real registered products number
      const filter = contract.filters.PassportIssued()
      const events = await contract.queryFilter(filter, 0, 'latest')
      setProductCount(events.length)
    } catch (err) {
      console.log('Stats fetch failed:', err.message)
      setProductCount('—')
    } finally {
      setCounting(false)
    }
  }




    {/* Icon list here */}

  const features = [
    { icon: ShieldCheck, title: 'Privacy-Aware', desc: 'Sensitive supply chain data stays off-chain. Only verifiable hashes are stored on the public ledger.', color: '#e8f5e9', iconColor: '#2d6a4f' },
    { icon: BadgeCheck, title: 'Anti-Greenwashing', desc: 'Cryptographic proofs make it impossible to fake or alter sustainability claims after registration.', color: '#e3f2fd', iconColor: '#1565c0' },
    { icon: Landmark, title: 'ESPR Aligned', desc: 'Built to meet the EU Ecodesign for Sustainable Products Regulation requirements for digital product passports.', color: '#f3e5f5', iconColor: '#6a1b9a' },
    { icon: CircleDollarSign, title: 'SME Friendly', desc: 'Low gas costs via batch registration. No need to build bespoke infrastructure — plug in and comply.', color: '#fff8e1', iconColor: '#f57f17' },
    { icon: Smartphone, title: 'Mobile Compatible', desc: 'Fully responsive design works seamlessly on smartphones and tablets — no app download required.', color: '#fce4ec', iconColor: '#c62828' },
    { icon: MapPin, title: 'Supply Chain Map', desc: "Interactive map visualises your product's entire journey from raw material to finished product.", color: '#e0f7fa', iconColor: '#00838f' },
    { icon: Globe, title: 'Decentralised Storage', desc: 'Product documents are stored on IPFS — no single point of failure, permanently accessible.', color: '#f1f8e9', iconColor: '#33691e' },
    { icon: Zap, title: 'Instant Verification', desc: 'Anyone can verify any product passport in seconds — no account or blockchain knowledge needed.', color: '#ede7f6', iconColor: '#4527a0' },
  ]

  return (
    <div style={styles.page}>
      <style>{`
        .hero-primary-btn:hover {
          background-color: #f0f0f0 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        }
        .hero-primary-btn { transition: all 0.2s ease !important; }
        .hero-secondary-btn:hover {
          background-color: rgba(255,255,255,0.15) !important;
          transform: translateY(-2px);
        }
        .hero-secondary-btn { transition: all 0.2s ease !important; }
        .cta-primary-btn:hover {
          background-color: #1b4332 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(45,106,79,0.4) !important;
        }
        .cta-primary-btn { transition: all 0.2s ease !important; }
        .cta-secondary-btn:hover {
          background-color: #2d6a4f !important;
          color: white !important;
          transform: translateY(-2px);
        }
        .cta-secondary-btn { transition: all 0.2s ease !important; }
        .step-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(45,106,79,0.15) !important;
        }
        .step-card { transition: all 0.25s ease !important; }
        .refresh-btn:hover {
          background-color: #1b4332 !important;
          transform: rotate(180deg);
        }
        .refresh-btn { transition: all 0.4s ease !important; }

        /* Horizontal scroll for features */
        .features-scroll {
          display: flex;
          gap: 1.2rem;
          overflow-x: auto;
          padding: 1rem 0.5rem 1.5rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #a5d6a7 #f0f0f0;
        }
        .features-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .features-scroll::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }
        .features-scroll::-webkit-scrollbar-thumb {
          background: #a5d6a7;
          border-radius: 3px;
        }
        .feature-card-scroll {
          min-width: 240px;
          max-width: 240px;
          scroll-snap-align: start;
          padding: 1.8rem 1.5rem;
          border-radius: 16px;
          border: 1px solid #e0e0e0;
          text-align: center;
          flex-shrink: 0;
          transition: transform 0.25s ease, box-shadow 0.25s ease !important;
        }
        .feature-card-scroll:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}> EU ESPR Compliant</div>
          <h1 style={styles.heroTitle}>
            Digital Product Passports<br />for a Sustainable Europe
          </h1>
          <p style={styles.heroSubtitle}>
            EcoPassEU uses blockchain technology to provide tamper-proof,
            privacy-aware product transparency — helping manufacturers,
            consumers, and regulators navigate the EU's sustainability requirements.
          </p>
          <div style={styles.heroBtns}>
            <button className="hero-primary-btn" style={styles.primaryBtn} onClick={() => navigate('/register')}>
              <PackagePlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Register Product
            </button>
            <button className="hero-secondary-btn" style={styles.secondaryBtn} onClick={() => navigate('/scan')}>
              <Search size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Search Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={styles.statNumber}>
              {counting ? '...' : (productCount !== null ? productCount : '—')}
            </span>
            <button
              className="refresh-btn"
              style={styles.refreshBtn}
              onClick={fetchStats}
              title="Refresh count"
            >
              <RefreshCw size={14} color="white" />
            </button>
          </div>
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
          <div className="step-card" style={styles.step}>
            <div style={styles.stepIcon}>1</div>
            <h3 style={styles.stepTitle}>Manufacturer Registers</h3>
            <p style={styles.stepDesc}>
              Brands upload product data — materials, origin, certifications —
              and receive a blockchain-verified Digital Product Passport.
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div className="step-card" style={styles.step}>
            <div style={styles.stepIcon}>2</div>
            <h3 style={styles.stepTitle}>Data Stored Securely</h3>
            <p style={styles.stepDesc}>
              Detailed documents are stored on IPFS. Only cryptographic hashes
              and pointers are written to the blockchain — keeping costs low
              and commercial data private.
            </p>
          </div>
          <div style={styles.stepArrow}>→</div>
          <div className="step-card" style={styles.step}>
            <div style={styles.stepIcon}>3</div>
            <h3 style={styles.stepTitle}>Anyone Can Verify</h3>
            <p style={styles.stepDesc}>
              Consumers, regulators, and auditors can instantly search any
              product and view its verified sustainability record — no
              blockchain knowledge required.
            </p>
          </div>
        </div>
      </div>

      {/* Why EcoPassEU - Horizontal Scroll */}
      <div style={styles.featureSection}>
        <div style={styles.featureSectionInner}>
          <h2 style={styles.sectionTitle}>Why EcoPassEU?</h2>
          <p style={styles.featureHint}>← Scroll to explore all features →</p>
          <div className="features-scroll">
            {features.map((f, i) => (
              <div key={i} className="feature-card-scroll" style={{ backgroundColor: f.color }}>
                <div style={styles.featureIcon}>
                  <f.icon size={28} color={f.iconColor} strokeWidth={1.8} />
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
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
          <button className="cta-primary-btn" style={styles.ctaPrimaryBtn} onClick={() => navigate('/register')}>
            <PackagePlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Register Product
          </button>
          <button className="cta-secondary-btn" style={styles.ctaSecondaryBtn} onClick={() => navigate('/scan')}>
            <Search size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Search Product
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
  heroTitle: { fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.2 },
  heroSubtitle: {
    fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem',
    lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2.5rem',
  },
  heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    backgroundColor: 'white', color: '#2d6a4f', border: 'none',
    padding: '0.9rem 2rem', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  secondaryBtn: {
    backgroundColor: 'transparent', color: 'white', border: '2px solid white',
    padding: '0.9rem 2rem', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer',
  },
  statsBar: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '2rem', padding: '2rem', backgroundColor: '#f8f9fa', flexWrap: 'wrap',
  },
  stat: { textAlign: 'center' },
  statNumber: { display: 'block', fontSize: '1.8rem', fontWeight: 'bold', color: '#2d6a4f' },
  statLabel: { fontSize: '0.85rem', color: '#666' },
  statDivider: { width: '1px', height: '40px', backgroundColor: '#ddd' },
  refreshBtn: {
    background: '#2d6a4f', border: 'none', borderRadius: '50%',
    width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  section: { maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' },
  sectionTitle: { textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem', color: '#1b4332' },
  featureHint: { textAlign: 'center', color: '#888', fontSize: '0.88rem', marginBottom: '1.2rem' },
  steps: { display: 'flex', alignItems: 'stretch', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2.5rem' },
  step: { flex: 1, minWidth: '200px', maxWidth: '260px', textAlign: 'center', padding: '1.5rem', backgroundColor: '#f0f7f4', borderRadius: '12px', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepIcon: { fontSize: '2.5rem', fontWeight: 'bold', color: '#2d6a4f', marginBottom: '1rem', lineHeight: 1 },
  stepTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#2d6a4f', marginBottom: '0.8rem' },
  stepDesc: { fontSize: '0.9rem', color: '#555', lineHeight: 1.6 },
  stepArrow: { fontSize: '2rem', color: '#2d6a4f', paddingTop: '3rem' },
  featureSection: { backgroundColor: '#f8faf9', padding: '3rem 0' },
  featureSectionInner: { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' },
  featureIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  featureTitle: { fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#1b4332' },
  featureDesc: { fontSize: '0.88rem', color: '#555', lineHeight: 1.6 },
  cta: { backgroundColor: '#f0f7f4', padding: '4rem 2rem', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', color: '#1b4332', marginBottom: '1rem' },
  ctaDesc: { color: '#555', marginBottom: '2rem', fontSize: '1.1rem' },
  ctaPrimaryBtn: {
    backgroundColor: '#2d6a4f', color: 'white', border: 'none',
    padding: '0.9rem 2rem', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(45,106,79,0.3)',
  },
  ctaSecondaryBtn: {
    backgroundColor: 'transparent', color: '#2d6a4f', border: '2px solid #2d6a4f',
    padding: '0.9rem 2rem', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 'bold', cursor: 'pointer',
  },
}

export default Home