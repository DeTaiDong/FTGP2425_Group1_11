import { Link } from 'react-router-dom'
import WalletConnect from './WalletConnect'

function Navbar() {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🌿 EcoPassEU</span>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/register" style={styles.link}>Register Product</Link>
        <Link to="/scan" style={styles.link}>Search Product</Link>
      </div>
      <WalletConnect />
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: { fontSize: '1.5rem', fontWeight: 'bold' },
  links: { display: 'flex', alignItems: 'center' },
  link: {
    color: 'white',
    marginLeft: '1.5rem',
    textDecoration: 'none',
    fontSize: '1rem',
  }
}

export default Navbar