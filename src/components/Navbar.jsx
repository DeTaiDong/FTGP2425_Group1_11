import { Link, useLocation } from 'react-router-dom'
import WalletConnect from './WalletConnect'

function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <style>{`
        .nav-link:hover {
          background-color: rgba(255,255,255,0.15) !important;
          transform: translateY(-1px);
        }
        .nav-link { transition: all 0.2s ease !important; }
        .nav-link-active {
          background-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>

      <Link to="/" style={styles.logo}>🌿 EcoPassEU</Link>

      <div style={styles.links}>
        <Link
          to="/"
          className={'nav-link' + (isActive('/') ? ' nav-link-active' : '')}
          style={styles.navBtn}
        >
          🏠 Home
        </Link>
        <Link
          to="/register"
          className={'nav-link' + (isActive('/register') ? ' nav-link-active' : '')}
          style={styles.navBtn}
        >
          🏭 Register
        </Link>
        <Link
          to="/scan"
          className={'nav-link' + (isActive('/scan') ? ' nav-link-active' : '')}
          style={styles.navBtn}
        >
          🔍 Search
        </Link>
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
    padding: '0.8rem 2rem',
    backgroundColor: '#2d6a4f',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  navBtn: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.92rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid rgba(255,255,255,0.25)',
    display: 'inline-block',
  },
}

export default Navbar