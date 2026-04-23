import { Link, useLocation } from 'react-router-dom'
import { Leaf, House, ClipboardPlus, Search, Package } from 'lucide-react'
import WalletConnect, { getConnectedAccount } from './WalletConnect'

function Navbar() {
  const location = useLocation()
  const account = getConnectedAccount()

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{ ...styles.nav, position: 'sticky', top: 0 }}>
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

      <Link to="/home" style={styles.logo}>
        <Leaf size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
        EcoPassEU
      </Link>

      <div style={styles.navCenter}>
        <Link to="/home" className={'nav-link' + (isActive('/home') ? ' nav-link-active' : '')} style={styles.navBtn}>
          <House size={14} style={styles.navIcon} /> Home
        </Link>
        <Link to="/register" className={'nav-link' + (isActive('/register') ? ' nav-link-active' : '')} style={styles.navBtn}>
          <ClipboardPlus size={14} style={styles.navIcon} /> Register
        </Link>
        <Link to="/scan" className={'nav-link' + (isActive('/scan') ? ' nav-link-active' : '')} style={styles.navBtn}>
          <Search size={14} style={styles.navIcon} /> Search
        </Link>
        {account && (
          <Link to="/my-products" className={'nav-link' + (isActive('/my-products') ? ' nav-link-active' : '')} style={styles.navBtn}>
            <Package size={14} style={styles.navIcon} /> My Products
          </Link>
        )}
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
    isolation: 'isolate',
  },
  navCenter: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
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
    gap: '0.2rem',
  },
  navBtn: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: '500',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  navIcon: { flexShrink: 0 },
}

export default Navbar