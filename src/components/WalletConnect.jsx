import { useState, useEffect } from 'react'

export function getConnectedAccount() {
  return localStorage.getItem('connectedAccount')
}

function WalletConnect() {
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('connectedAccount')
    if (saved) setAccount(saved)

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null)
          localStorage.removeItem('connectedAccount')
        } else {
          setAccount(accounts[0])
          localStorage.setItem('connectedAccount', accounts[0])
        }
      })
    }
  }, [])

  const connectWallet = async () => {
    setError(null)
    if (!window.ethereum) {
      setError('Please install MetaMask!')
      return
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      localStorage.setItem('connectedAccount', accounts[0])
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0xaa36a7') {
        setError('⚠️ Please switch to Sepolia Testnet!')
      }
    } catch (err) {
      setError('Connection rejected.')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    localStorage.removeItem('connectedAccount')
    setError(null)
  }

  const shortAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

  return (
    <div>
      {!account ? (
        <button onClick={connectWallet} style={styles.connectBtn}>
          🦊 Connect Wallet
        </button>
      ) : (
        <div style={styles.connected}>
          <span>🟢</span>
          <span style={styles.address}>{shortAddress(account)}</span>
          <button onClick={disconnectWallet} style={styles.disconnectBtn}>
            Disconnect
          </button>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}

const styles = {
  connectBtn: {
    backgroundColor: '#f6851b',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  connected: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#e8f5e9',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    border: '1px solid #a5d6a7',
  },
  address: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2d6a4f' },
  disconnectBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#888',
  },
  error: { color: 'red', fontSize: '0.8rem', marginTop: '0.3rem' }
}

export default WalletConnect