import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroBg from '../assets/background2.png'

function Landing() {
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  const connect = async () => {
    setError(null)
    if (!window.ethereum) return
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        localStorage.setItem('connectedAccount', accounts[0])
        setAccount(accounts[0])
        setConnected(true)
      }
    } catch (err) {
      setError('Connection rejected.')
    }
  }

  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum

  return (
    <div className="page-fade-in" style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>EcoPassEU</div>
        <p style={styles.desc}>
          A blockchain-based Digital Product Passport platform for EU ESPR compliance.
        </p>

        <div style={styles.divider} />

        {connected ? (
          <>
            <div style={styles.connectedBadge}>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <button style={styles.enterBtn} onClick={() => navigate('/home')}>
              Enter App
            </button>
          </>
        ) : hasMetaMask ? (
          <>
            <p style={styles.hint}>Connect your MetaMask wallet to continue.</p>
            <button style={styles.connectBtn} onClick={connect}>
              Connect with MetaMask
            </button>
            {error && <p style={styles.errorText}>{error}</p>}
          </>
        ) : (
          <>
            <p style={styles.hint}>MetaMask is required to use this application.</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              style={styles.connectBtn}
            >
              Install MetaMask
            </a>
            <p style={styles.installNote}>
              After installing, refresh this page and connect your wallet.
            </p>
          </>
        )}

        {!connected && (
          <p style={styles.readOnly}>
            Just browsing?{' '}
            <span style={styles.link} onClick={() => navigate('/home')}>
              Continue without wallet
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.65), rgba(45, 106, 79, 0.65)), url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.8rem',
    letterSpacing: '-0.5px',
  },
  desc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.93rem',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  divider: {
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    marginBottom: '1.5rem',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    marginBottom: '1.2rem',
  },
  connectBtn: {
    display: 'block',
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#f6851b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  connectedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    fontSize: '0.88rem',
    fontWeight: '600',
    marginBottom: '1.2rem',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  enterBtn: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  errorText: {
    color: '#c62828',
    fontSize: '0.85rem',
    marginTop: '-1rem',
    marginBottom: '1rem',
  },
  installNote: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.82rem',
    marginBottom: '1.5rem',
  },
  readOnly: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.85rem',
    margin: 0,
  },
  link: {
    color: 'white',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}

export default Landing
