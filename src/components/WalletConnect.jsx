import { useState } from 'react'

function WalletConnect() {
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  const connectWallet = async () => {
    setError(null)

    // check MetaMask status
    if (!window.ethereum) {
      setError('Please install MetaMask first!')
      return
    }

    try {
      // Ask user permission
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])

      // check if user in Sepolia 
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      if (chainId !== '0xaa36a7') {
        setError('⚠️ Please switch MetaMask to Sepolia Testnet!')
      }

    } catch (err) {
      setError('Connection rejected by user.')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setError(null)
  }


  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  return (
    <div>
      {!account ? (
        <button onClick={connectWallet} style={styles.connectBtn}>
          🦊 Connect Wallet
        </button>
      ) : (
        <div style={styles.connected}>
          <span style={styles.dot}>🟢</span>
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
  dot: { fontSize: '0.8rem' },
  address: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#2d6a4f',
  },
  disconnectBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.2rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#888',
  },
  error: {
    color: 'red',
    fontSize: '0.8rem',
    marginTop: '0.3rem',
  }
}

export default WalletConnect