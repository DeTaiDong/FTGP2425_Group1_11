function Home() {
  return (
    <div style={styles.container}>
      <h1>Welcome to EcoPassEU 🌍</h1>
      <p style={styles.subtitle}>
        A privacy-aware Digital Product Passport DApp for sustainable consumer goods in Europe.
      </p>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>🏭 Manufacturers</h3>
          <p>Register your products and issue verified digital passports.</p>
        </div>
        <div style={styles.card}>
          <h3>🛒 Consumers</h3>
          <p>Scan any product to view its verified sustainability record.</p>
        </div>
        <div style={styles.card}>
          <h3>🏛️ Regulators</h3>
          <p>Access auditable, tamper-evident compliance records.</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '3rem', textAlign: 'center' },
  subtitle: { fontSize: '1.1rem', color: '#555', marginBottom: '2rem' },
  cards: { display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' },
  card: {
    padding: '1.5rem',
    border: '1px solid #ccc',
    borderRadius: '12px',
    width: '200px',
    backgroundColor: '#f0f7f4',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }
}

export default Home