import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 城市坐标数据库
const CITY_COORDS = {
  // India
  'Tamil Nadu, IN': [11.1271, 78.6569],
  'Mumbai, IN': [19.0760, 72.8777],
  'Delhi, IN': [28.6139, 77.2090],
  'India': [20.5937, 78.9629],
  // Germany
  'Berlin, DE': [52.5200, 13.4050],
  'Munich, DE': [48.1351, 11.5820],
  'Hamburg, DE': [53.5511, 9.9937],
  'Stuttgart, DE': [48.7758, 9.1829],
  'Frankfurt, DE': [50.1109, 8.6821],
  // Netherlands
  'Amsterdam, NL': [52.3676, 4.9041],
  'Rotterdam, NL': [51.9244, 4.4777],
  // France
  'Paris, FR': [48.8566, 2.3522],
  // Portugal
  'Lisbon, PT': [38.7223, -9.1393],
  'Porto, PT': [41.1579, -8.6291],
  // Sweden
  'Stockholm, SE': [59.3293, 18.0686],
  // Default Europe center
  'DE': [51.1657, 10.4515],
  'NL': [52.1326, 5.2913],
  'FR': [46.2276, 2.2137],
  'PT': [39.3999, -8.2245],
  'SE': [60.1282, 18.6435],
  'IN': [20.5937, 78.9629],
}

function getCoords(location) {
  if (!location) return null
  if (CITY_COORDS[location]) return CITY_COORDS[location]
  for (const key of Object.keys(CITY_COORDS)) {
    if (location.includes(key)) return CITY_COORDS[key]
  }
  return null
}

function getStepColor(index, total) {
  const colors = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d']
  return colors[index % colors.length]
}

function SupplyChainMap({ provenance }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!provenance || provenance.length === 0) return null

  const points = provenance
    .map((step, i) => ({ ...step, coords: getCoords(step.location), index: i }))
    .filter(p => p.coords)

  if (points.length === 0) return (
    <div style={styles.noMap}>
      📍 No mappable locations found in supply chain data.
    </div>
  )

  const polylinePoints = points.map(p => p.coords)
  const center = points[Math.floor(points.length / 2)].coords

  const customIcon = (index) => L.divIcon({
    html: `<div style="
      background: ${getStepColor(index, points.length)};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${index + 1}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  if (!mounted) return <div style={styles.loading}>🗺️ Loading map...</div>

  return (
    <div style={styles.wrapper}>
      {/* Legend */}
      <div style={styles.legend}>
        {points.map((point, i) => (
          <div key={i} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: getStepColor(i, points.length) }}>
              {i + 1}
            </div>
            <div>
              <div style={styles.legendStage}>{point.stage}</div>
              <div style={styles.legendLocation}>📍 {point.location} · {point.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '420px', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Lines */}
        <Polyline
          positions={polylinePoints}
          color="#2d6a4f"
          weight={3}
          opacity={0.8}
          dashArray="8, 6"
        />

        {/* Markers */}
        {points.map((point, i) => (
          <Marker key={i} position={point.coords} icon={customIcon(i)}>
            <Popup>
              <div style={styles.popup}>
                <div style={styles.popupStep}>Stage {i + 1}</div>
                <div style={styles.popupTitle}>{point.stage}</div>
                <div style={styles.popupLocation}>📍 {point.location}</div>
                <div style={styles.popupDate}>📅 {point.date}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <p style={styles.mapNote}>
        💡 Click on any marker to see stage details. Dashed line shows the supply chain route.
      </p>
    </div>
  )
}

const styles = {
  wrapper: { marginTop: '0.5rem' },
  loading: { padding: '2rem', textAlign: 'center', color: '#888' },
  noMap: { padding: '1rem', color: '#888', textAlign: 'center', fontSize: '0.9rem' },
  legend: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  legendDot: {
    width: '24px', height: '24px', borderRadius: '50%',
    color: 'white', fontWeight: 'bold', fontSize: '0.8rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  legendStage: { fontWeight: '600', fontSize: '0.9rem', color: '#333' },
  legendLocation: { fontSize: '0.8rem', color: '#888' },
  popup: { minWidth: '150px' },
  popupStep: { fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' },
  popupTitle: { fontWeight: 'bold', color: '#1b4332', marginBottom: '0.3rem' },
  popupLocation: { fontSize: '0.85rem', color: '#555' },
  popupDate: { fontSize: '0.85rem', color: '#555' },
  mapNote: { fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '0.8rem' },
}

export default SupplyChainMap