import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🌿 EcoPassEU</span>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/register" style={styles.link}>Register Product</Link>
        <Link to="/scan" style={styles.link}>Scan Product</Link>
      </div>
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
  },
  logo: { fontSize: '1.5rem', fontWeight: 'bold' },
  link: {
    color: 'white',
    marginLeft: '1.5rem',
    textDecoration: 'none',
    fontSize: '1rem',
  }
}

export default Navbar