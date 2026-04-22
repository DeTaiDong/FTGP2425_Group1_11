import { useState } from 'react'
import { locationData } from '../utils/locationData'

function LocationPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [selectedContinent, setSelectedContinent] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')

  const continents = Object.keys(locationData)
  const countries = selectedContinent ? Object.keys(locationData[selectedContinent]) : []
  const cities = selectedContinent && selectedCountry
    ? Object.keys(locationData[selectedContinent][selectedCountry])
    : []

  const handleCitySelect = (city) => {
    const coords = locationData[selectedContinent][selectedCountry][city]
    const locationStr = city + ', ' + selectedCountry
    onChange(locationStr, coords)
    setOpen(false)
  }

  return (
    <div style={styles.wrapper}>
      <div
        style={styles.inputDisplay}
        onClick={() => setOpen(!open)}
        className="location-picker-trigger"
      >
        {value || 'Select city...'}
        <span style={styles.arrow}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={styles.dropdown}>
          {/* Continent */}
          <div style={styles.level}>
            <div style={styles.levelTitle}>🌍 Continent</div>
            <div style={styles.options}>
              {continents.map(c => (
                <div
                  key={c}
                  style={{
                    ...styles.option,
                    backgroundColor: selectedContinent === c ? '#2d6a4f' : 'transparent',
                    color: selectedContinent === c ? 'white' : '#333',
                  }}
                  onClick={() => {
                    setSelectedContinent(c)
                    setSelectedCountry('')
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Country */}
          {selectedContinent && (
            <div style={styles.level}>
              <div style={styles.levelTitle}>🏳️ Country</div>
              <div style={styles.options}>
                {countries.map(c => (
                  <div
                    key={c}
                    style={{
                      ...styles.option,
                      backgroundColor: selectedCountry === c ? '#2d6a4f' : 'transparent',
                      color: selectedCountry === c ? 'white' : '#333',
                    }}
                    onClick={() => setSelectedCountry(c)}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* City */}
          {selectedCountry && (
            <div style={styles.level}>
              <div style={styles.levelTitle}>🏙️ City</div>
              <div style={styles.options}>
                {cities.map(c => (
                  <div
                    key={c}
                    style={styles.option}
                    onClick={() => handleCitySelect(c)}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: { position: 'relative', width: '100%' },
  inputDisplay: {
    padding: '0.7rem 0.9rem',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '0.92rem',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#333',
    userSelect: 'none',
  },
  arrow: { fontSize: '0.75rem', color: '#888' },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1.5px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    zIndex: 9999,
    display: 'flex',
    gap: 0,
    overflow: 'hidden',
    minWidth: '500px',
  },
  level: {
    flex: 1,
    borderRight: '1px solid #f0f0f0',
  },
  levelTitle: {
    padding: '0.6rem 0.8rem',
    backgroundColor: '#f0f7f4',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#2d6a4f',
    borderBottom: '1px solid #e0e0e0',
  },
  options: {
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '0.3rem',
  },
  option: {
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    transition: 'all 0.15s ease',
  },
}

export default LocationPicker