import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SEPOLIA_CHAIN_ID = '0xaa36a7'

export function getConnectedAccount() {
  return localStorage.getItem('connectedAccount')
}

function WalletConnect() {
  const [account, setAccount] = useState(null)
  const [wrongNetwork, setWrongNetwork] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const checkNetwork = async () => {
    if (!window.ethereum) return
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    setWrongNetwork(chainId !== SEPOLIA_CHAIN_ID)
  }

  useEffect(() => {
    const saved = localStorage.getItem('connectedAccount')
    if (saved) { setAccount(saved); checkNetwork() }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null)
          localStorage.removeItem('connectedAccount')
          setWrongNetwork(false)
        } else {
          setAccount(accounts[0])
          localStorage.setItem('connectedAccount', accounts[0])
        }
      })
      window.ethereum.on('chainChanged', (chainId) => {
        setWrongNetwork(chainId !== SEPOLIA_CHAIN_ID)
      })
    }
  }, [])

  const connectWallet = async () => {
    setError(null)
    if (!window.ethereum) { setError('Please install MetaMask!'); return }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      localStorage.setItem('connectedAccount', accounts[0])
      await checkNetwork()
    } catch (err) {
      setError('Connection rejected.')
    }
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
    } catch (err) {
      setError('Failed to switch network.')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    localStorage.removeItem('connectedAccount')
    setWrongNetwork(false)
    setError(null)
    navigate('/')
  }

  const shortAddress = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

  return (
    <div>
      {!account ? (
        <button onClick={connectWallet} style={styles.connectBtn}>
          Connect Wallet
        </button>
      ) : wrongNetwork ? (
        <div style={styles.wrongNetwork}>
          <span style={styles.wrongText}>Wrong Network</span>
          <button onClick={switchToSepolia} style={styles.switchBtn}>
            Switch to Sepolia
          </button>
        </div>
      ) : (
        <div style={styles.connected}>
          <span style={styles.dot}>●</span>
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
    backgroundColor: '#f6851b', color: 'white', border: 'none',
    padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: 'bold',
  },
  connected: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    backgroundColor: '#e8f5e9', padding: '0.4rem 1rem',
    borderRadius: '8px', border: '1px solid #a5d6a7',
  },
  dot: { color: '#2d6a4f', fontSize: '0.7rem' },
  address: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2d6a4f' },
  disconnectBtn: {
    backgroundColor: 'transparent', border: '1px solid #ccc',
    borderRadius: '6px', padding: '0.2rem 0.6rem',
    cursor: 'pointer', fontSize: '0.8rem', color: '#888',
  },
  wrongNetwork: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    backgroundColor: '#fff3e0', padding: '0.4rem 1rem',
    borderRadius: '8px', border: '1px solid #ffb74d',
  },
  wrongText: { fontSize: '0.85rem', color: '#e65100', fontWeight: '600' },
  switchBtn: {
    backgroundColor: '#f57c00', color: 'white', border: 'none',
    borderRadius: '6px', padding: '0.25rem 0.7rem',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
  },
  error: { color: '#c62828', fontSize: '0.8rem', marginTop: '0.3rem' },
}

export default WalletConnect