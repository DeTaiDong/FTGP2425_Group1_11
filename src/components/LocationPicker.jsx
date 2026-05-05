import { useState, useEffect, useRef } from 'react'

function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = (q) => {
    if (!q.trim() || q.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'EcoPassEU/1.0' } }
    )
      .then(r => r.json())
      .then(data => {
        setSuggestions(data)
        setOpen(data.length > 0)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }

  const handleInput = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 500)
  }

  const normalizeLabel = (displayName) => {
    const label = displayName.split(',').slice(0, 2).join(',').trim()
    if (/taiwan/i.test(displayName) && !/china/i.test(label)) {
      return label.replace(/,?\s*taiwan/i, '').trim() + ', Taiwan, China'
    }
    return label
  }

  const handleSelect = (item) => {
    const label = normalizeLabel(item.display_name)
    const coords = [parseFloat(item.lat), parseFloat(item.lon)]
    setQuery(label)
    onChange(label, coords)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <div style={styles.inputRow}>
        <input
          className="field-input"
          style={styles.input}
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search any city..."
        />
        {loading && <span style={styles.spinner}>⟳</span>}
      </div>

      {open && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((item) => {
            const main = normalizeLabel(item.display_name)
            const parts = item.display_name.split(',')
            const sub = /taiwan/i.test(item.display_name) ? 'China' : parts.slice(2, 4).join(',').trim()
            return (
              <div
                key={item.place_id}
                style={styles.option}
                onMouseDown={() => handleSelect(item)}
              >
                <span style={styles.optionMain}>{main}</span>
                {sub && <span style={styles.optionSub}>{sub}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: { position: 'relative', width: '100%' },
  inputRow: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: {
    width: '100%',
    padding: '0.7rem 2rem 0.7rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '0.92rem',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box',
  },
  spinner: {
    position: 'absolute',
    right: '0.7rem',
    color: '#888',
    fontSize: '1rem',
    animation: 'spin 1s linear infinite',
    pointerEvents: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 9999,
    overflow: 'hidden',
  },
  option: {
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    transition: 'background 0.15s',
  },
  optionMain: { fontSize: '0.9rem', color: '#1b4332', fontWeight: '600' },
  optionSub: { fontSize: '0.78rem', color: '#888' },
}

export default LocationPicker
