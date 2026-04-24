import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Leaf, House, ClipboardPlus, Search, Package } from 'lucide-react'
import WalletConnect, { getConnectedAccount } from './WalletConnect'

function Navbar() {
  const location = useLocation()
  const account = getConnectedAccount()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  const navStyle = {
    ...styles.nav,
    backgroundColor: scrolled ? 'rgba(27, 67, 50, 0.82)' : '#2d6a4f',
    backdropFilter: scrolled ? 'blur(14px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.22)' : '0 2px 12px rgba(0,0,0,0.15)',
    transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
  }

  const navLinks = [
    { to: '/home', icon: House, label: 'Home' },
    { to: '/register', icon: ClipboardPlus, label: 'Register' },
    { to: '/scan', icon: Search, label: 'Search' },
    ...(account ? [{ to: '/my-products', icon: Package, label: 'My Products' }] : []),
  ]

  return (
    <>
      <style>{`
        .nav-link:hover {
          background-color: rgba(255,255,255,0.15) !important;
          transform: translateY(-1px);
        }
        .nav-link { transition: all 0.2s ease !important; }
        .nav-link-active { background-color: rgba(255,255,255,0.2) !important; }

        @media (max-width: 768px) {
          .navbar { padding: 0.6rem 1rem !important; }
          .nav-center { display: none !important; }
        }

        /* ── Mobile bottom nav ── */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top: 1px solid #e8f0ec;
          z-index: 999;
          padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
          justify-content: space-around;
          box-shadow: 0 -2px 16px rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex; }
        }
        .mob-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          color: #aaa;
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 500;
          padding: 0.35rem 1rem;
          border-radius: 10px;
          transition: color 0.2s ease;
        }
        .mob-nav-item.mob-active { color: #2d6a4f; }
        .mob-nav-item:hover { color: #40916c; }
      `}</style>

      <nav className="navbar" style={navStyle}>
        <Link to="/home" style={styles.logo}>
          <Leaf size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          EcoPassEU
        </Link>

        <div className="nav-center" style={styles.navCenter}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={'nav-link' + (isActive(to) ? ' nav-link-active' : '')}
              style={styles.navBtn}
            >
              <Icon size={14} style={styles.navIcon} />
              <span className="nav-btn-text"> {label}</span>
            </Link>
          ))}
        </div>

        <WalletConnect />
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={'mob-nav-item' + (isActive(to) ? ' mob-active' : '')}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.8rem 2rem',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
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
