import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken, TRUCK_COLORS, SIZES, timeAgo, fmtClock } from '../api/client'
import MapView, { createDivIcon } from '../components/MapView'
import ReportModal from '../components/ReportModal'
import PhotoViewer from '../components/PhotoViewer'
import Leaderboard from '../components/Leaderboard'
import L from 'leaflet'

export default function Resident() {
  const navigate = useNavigate()
  const mapRef = useRef(null)

  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('truck') // 'truck' | 'reports' | 'board' | 'rules'

  // Report modal state
  const [reportCoord, setReportCoord] = useState(null)
  const [reportSuccessMsg, setReportSuccessMsg] = useState('')

  // Route & truck tracking
  const [processedRoutes, setProcessedRoutes] = useState([])
  const [myRouteIndex, setMyRouteIndex] = useState(-1)
  const [truckProgress, setTruckProgress] = useState({})

  useEffect(() => {
    loadHomeData()
    const pollInterval = setInterval(() => {
      loadHomeData(true)
    }, 15000)
    return () => clearInterval(pollInterval)
  }, [])

  // Live truck simulation update (every 1 second)
  useEffect(() => {
    if (!home?.dispatch || processedRoutes.length === 0) return

    const tick = setInterval(() => {
      updateTruckPositions()
    }, 1000)

    return () => clearInterval(tick)
  }, [home, processedRoutes, myRouteIndex])

  async function loadHomeData(silent = false) {
    if (!silent) setLoading(true)
    try {
      const data = await api.get('/api/resident/home')
      setHome(data)
      setError('')
      processRoutes(data)
      drawResidentMap(data)
    } catch (err) {
      if (err.message && err.message.includes('sign in')) {
        clearToken()
        navigate('/')
      } else {
        setError(err.message)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  function handleLogout() {
    clearToken()
    navigate('/')
  }

  // Pre-calculate route geometry and distance along path
  function processRoutes(data) {
    if (!data.dispatch || !data.dispatch.routes) {
      setProcessedRoutes([])
      setMyRouteIndex(-1)
      return
    }

    const depot = [data.depot.lat, data.depot.lng]
    const homePt = [data.me.homeLat, data.me.homeLng]
    const parsed = []

    data.dispatch.routes.forEach((r, idx) => {
      const path = [depot, ...r.stops.map((s) => [s.lat, s.lng]), depot]
      const cumDistances = [0]
      for (let i = 1; i < path.length; i++) {
        const d = distKm(path[i - 1][0], path[i - 1][1], path[i][0], path[i][1])
        cumDistances.push(cumDistances[i - 1] + d)
      }

      // Find closest distance to resident's home
      let closestHomeDist = Infinity
      let alongAtClosest = 0

      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1]
        const b = path[i]
        const legDist = cumDistances[i] - cumDistances[i - 1]
        const steps = Math.max(2, Math.ceil(legDist / 0.05))

        for (let s = 0; s <= steps; s++) {
          const t = s / steps
          const pLat = a[0] + (b[0] - a[0]) * t
          const pLng = a[1] + (b[1] - a[1]) * t
          const d = distKm(pLat, pLng, homePt[0], homePt[1])
          if (d < closestHomeDist) {
            closestHomeDist = d
            alongAtClosest = cumDistances[i - 1] + legDist * t
          }
        }
      }

      parsed.push({
        truck: r.truck,
        path,
        cumDistances,
        totalKm: cumDistances[cumDistances.length - 1],
        stopsCount: r.stops.length,
        color: TRUCK_COLORS[idx % TRUCK_COLORS.length],
        closestHomeDist,
        alongAtClosest,
      })
    })

    // Assign resident to the closest route
    let bestIdx = 0
    let minD = Infinity
    parsed.forEach((pr, i) => {
      if (pr.closestHomeDist < minD) {
        minD = pr.closestHomeDist
        bestIdx = i
      }
    })

    setProcessedRoutes(parsed)
    setMyRouteIndex(bestIdx)
  }

  // Draw home, depot, and reports on map
  function drawResidentMap(data) {
    if (!mapRef.current) return
    const layers = mapRef.current.getLayers()
    if (!layers) return

    // 1. Radius & Depot
    layers.radius.clearLayers()
    const d = data.depot
    if (d && data.municipality) {
      L.circle([d.lat, d.lng], {
        radius: data.municipality.radiusKm * 1000,
        color: '#0e7c86',
        weight: 1.5,
        dashArray: '5 5',
        fillOpacity: 0.04,
      }).addTo(layers.radius)

      L.marker([d.lat, d.lng], {
        icon: createDivIcon(`<div class="marker-depot">🏢 Depot: ${d.name}</div>`, [130, 24]),
        zIndexOffset: 1000,
      }).addTo(layers.radius)
    }

    // 2. My Home Marker
    const me = data.me
    if (me.homeLat && me.homeLng) {
      L.marker([me.homeLat, me.homeLng], {
        icon: createDivIcon(
          `<div style="background:#0e7c86;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:18px;">🏠</div>`,
          [34, 34]
        ),
        zIndexOffset: 1200,
      }).bindTooltip(`<b>Your Home</b> (${me.householdId})`).addTo(layers.radius)

      mapRef.current.setView([me.homeLat, me.homeLng], 15)
    }

    // 3. Citizen Reports
    layers.pings.clearLayers()
    data.pings.forEach((p) => {
      const isMine = p.mine
      const isVerified = p.status === 'VERIFIED'
      const isCollected = p.status === 'COLLECTED'

      let color = '#e3a92b'
      if (isCollected) color = '#0e7c86'
      else if (isVerified) color = '#4d8b2f'

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: isMine ? 9 : 6,
        fillColor: color,
        color: isMine ? '#1b2b34' : '#ffffff',
        weight: isMine ? 2.5 : 1.5,
        fillOpacity: 0.9,
      }).bindTooltip(
        `${isMine ? 'Your Report' : 'Neighbour Report'} #${p.id} (${p.kind}) - ${p.status}`
      )

      marker.addTo(layers.pings)
    })
  }

  // Update animated truck positions
  function updateTruckPositions() {
    if (!mapRef.current || !home?.dispatch || processedRoutes.length === 0) return
    const layers = mapRef.current.getLayers()
    if (!layers) return

    // Draw route polylines
    layers.routes.clearLayers()
    processedRoutes.forEach((r, idx) => {
      const isMyRoute = idx === myRouteIndex
      L.polyline(r.path, {
        color: r.color,
        weight: isMyRoute ? 5 : 3,
        opacity: isMyRoute ? 0.9 : 0.45,
        dashArray: isMyRoute ? null : '4 6',
      }).addTo(layers.routes)
    })

    // Move trucks
    layers.trucks.clearLayers()
    const speed = home.dispatch.speedKmh || 30
    const startedAt = home.dispatch.startedAt || Date.now()
    const elapsedHours = (Date.now() - startedAt) / 3600000

    processedRoutes.forEach((r, idx) => {
      const progressKm = Math.min(r.totalKm, Math.max(0, elapsedHours * speed))
      const pt = interpolatePointAlongPath(r, progressKm)
      const isMyRoute = idx === myRouteIndex
      const isBackAtDepot = progressKm >= r.totalKm

      const iconHtml = `
        <div class="marker-truck" style="background:${r.color};border:${isMyRoute ? '2.5px solid #fff' : 'none'};">
          🚛${r.truck}
        </div>
      `

      L.marker(pt, {
        icon: createDivIcon(iconHtml, [34, 34]),
        zIndexOffset: 1500,
      }).bindTooltip(
        `Truck ${r.truck} ${isMyRoute ? '(Serving Your Street)' : ''} ${isBackAtDepot ? '· Finished Route' : ''}`
      ).addTo(layers.trucks)
    })
  }

  function interpolatePointAlongPath(route, km) {
    const { path, cumDistances } = route
    for (let i = 1; i < cumDistances.length; i++) {
      if (km <= cumDistances[i] || i === cumDistances.length - 1) {
        const segDist = cumDistances[i] - cumDistances[i - 1] || 0.0001
        const t = Math.min(1, Math.max(0, (km - cumDistances[i - 1]) / segDist))
        const lat = path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t
        const lng = path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t
        return [lat, lng]
      }
    }
    return path[0]
  }

  function handleMapClick(latlng) {
    if (home?.me?.strikes >= home?.me?.strikeLimit) {
      alert('Reporting is paused for your household due to 3 incorrect reports. Contact municipality.')
      return
    }
    setReportCoord(latlng)
  }

  function handleUseGps() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please tap the map instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (mapRef.current) mapRef.current.setView([latlng.lat, latlng.lng], 17)
        setReportCoord(latlng)
      },
      () => {
        alert('Could not retrieve your GPS location. Please tap directly on the map.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Calculate Haversine distance in km
  function distKm(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    return 2 * R * Math.asin(Math.sqrt(a))
  }

  const me = home?.me
  const myReports = (home?.pings || []).filter((p) => p.mine)
  const myRoute = processedRoutes[myRouteIndex]
  const dispatchActive = Boolean(home?.dispatch && myRoute)

  // Truck status text calculation
  let truckHead = 'No collection published yet'
  let truckBody = 'The municipality has not published today’s truck schedule yet. You can still report waste spots.'
  let isLive = false

  if (dispatchActive) {
    const speed = home.dispatch.speedKmh || 30
    const elapsedHours = (Date.now() - (home.dispatch.startedAt || Date.now())) / 3600000
    const currentProgress = Math.min(myRoute.totalKm, Math.max(0, elapsedHours * speed))

    if (currentProgress >= myRoute.totalKm) {
      truckHead = `Today's collection completed for Truck ${myRoute.truck}`
      truckBody = `Truck ${myRoute.truck} has finished its neighborhood round and returned to the depot. Spotted waste? Pin it on the map!`
    } else {
      isLive = true
      if (currentProgress <= myRoute.alongAtClosest) {
        const remainingKm = myRoute.alongAtClosest - currentProgress
        const remainingMinutes = Math.max(1, Math.round((remainingKm / speed) * 60))
        const etaTimestamp = Date.now() + remainingMinutes * 60000
        truckHead = `Truck ${myRoute.truck} is on its way to your street!`
        truckBody = `Estimated arrival near your home: ~${remainingMinutes} minutes (${fmtClock(etaTimestamp)}). Please keep segregated waste outside your gate.`
      } else {
        const passedMinutes = Math.max(1, Math.round(((currentProgress - myRoute.alongAtClosest) / speed) * 60))
        truckHead = `Truck ${myRoute.truck} has passed your street`
        truckBody = `The collection crew serviced your street approximately ${passedMinutes} minutes ago. If waste was missed, tap the map to report it.`
      }
    }
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="app-logo">Clean<span>Route</span></div>
          <span className="chip chip-small" style={{ fontSize: '0.7rem' }}>Resident Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#5a6e74', textAlign: 'right' }}>
            <strong style={{ color: '#1b2b34' }}>{me?.nickname || 'Resident'}</strong>
            <div>{me?.householdId} · <span style={{ color: '#0e7c86', fontWeight: 700 }}>{me?.points || 0} pts</span></div>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* Points & Daily Stats Card */}
          <div className="card" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #f0f9fa 0%, #e8f5e9 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#5a6e74' }}>Green Points</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0e7c86' }}>{me?.points || 0} pts</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#5a6e74' }}>Reports Today</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1b2b34' }}>
                  {me?.reportsToday} of {me?.maxReportsPerDay}
                </div>
              </div>
            </div>

            {me?.strikes > 0 && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#cf4b35', fontWeight: 600 }}>
                ⚠️ {me.strikes} / {me.strikeLimit} strikes recorded for incorrect reports.
              </div>
            )}
          </div>

          {/* Quick Action: Report Waste */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.7rem' }}
              onClick={handleUseGps}
            >
              📍 Report Waste at My GPS Location
            </button>
          </div>

          {reportSuccessMsg && <div className="message message-ok">{reportSuccessMsg}</div>}
          {error && <div className="message message-error">{error}</div>}

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'truck' ? 'active' : ''}`}
              onClick={() => setActiveTab('truck')}
            >
              Today's Truck
            </button>
            <button
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              My Reports ({myReports.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
              onClick={() => setActiveTab('board')}
            >
              Leaderboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              Points & Rules
            </button>
          </div>

          {/* TAB 1: Live Truck Tracker */}
          {activeTab === 'truck' && (
            <div>
              <div className="truck-card">
                <div className="truck-card-header">
                  <div className={`pulse ${isLive ? 'live' : ''}`} />
                  <div className="truck-card-title">{truckHead}</div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#5a6e74', margin: '0.4rem 0' }}>{truckBody}</p>

                {dispatchActive && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                    <span className="chip" style={{ background: myRoute.color, color: '#fff' }}>
                      Truck #{myRoute.truck}
                    </span>
                    <span className="chip chip-small">{myRoute.stopsCount} stops scheduled</span>
                    <span className="chip chip-medium">Departed depot at {fmtClock(home.dispatch.startedAt)}</span>
                  </div>
                )}
              </div>

              <div className="card">
                <h4 style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>🗺️ How to report waste:</h4>
                <ol style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#5a6e74', lineHeight: 1.6 }}>
                  <li>Tap anywhere on the map where waste has accumulated.</li>
                  <li>Select waste type and take a quick photo of the spot.</li>
                  <li>Once verified by municipal staff, you earn reward points!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: My Reports */}
          {activeTab === 'reports' && (
            <div>
              {myReports.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <p style={{ color: '#5a6e74', fontSize: '0.9rem' }}>You haven't submitted any waste reports yet.</p>
                  <p style={{ fontSize: '0.82rem', color: '#0e7c86', marginTop: '0.4rem' }}>
                    Tap anywhere on the map or use GPS to submit your first report!
                  </p>
                </div>
              ) : (
                myReports.map((p) => (
                  <div key={p.id} className="report-item">
                    <div className="report-header">
                      <span className={`chip chip-${p.status.toLowerCase()}`}>{p.status}</span>
                      <span style={{ fontWeight: 700 }}>#{p.id} · {p.kind}</span>
                      <span style={{ fontSize: '0.75rem', color: '#5a6e74', marginLeft: 'auto' }}>
                        {timeAgo(p.createdAt)}
                      </span>
                    </div>

                    <div className="report-meta">
                      Size: {SIZES[p.size]?.label || p.size}
                      {p.pointsEarned > 0 && (
                        <span style={{ color: '#2e7d32', fontWeight: 700, marginLeft: '0.5rem' }}>
                          +{p.pointsEarned} pts earned
                        </span>
                      )}
                      {!p.owner && <span> · Confirmed neighbour's report</span>}
                    </div>

                    {p.note && <div className="report-note">"{p.note}"</div>}
                    {p.photo && <PhotoViewer pingId={p.id} />}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Leaderboard */}
          {activeTab === 'board' && (
            <div>
              <Leaderboard data={home?.leaderboard} myUsername={me?.username} />
            </div>
          )}

          {/* TAB 4: Rules & Points */}
          {activeTab === 'rules' && (
            <div className="card" style={{ fontSize: '0.86rem', color: '#3a5058', lineHeight: 1.6 }}>
              <h3 style={{ marginBottom: '0.6rem' }}>📜 CleanRoute Community Rules</h3>
              <p><strong>Points Reward:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.75rem' }}>
                <li>Small bag (~10 kg): <strong>+5 points</strong></li>
                <li>Medium pile (~40 kg): <strong>+10 points</strong></li>
                <li>Large pile (~150 kg): <strong>+20 points</strong></li>
                <li>Massive pile (~400 kg): <strong>+30 points</strong></li>
                <li>Neighbour confirming nearby report: <strong>+2 points</strong></li>
              </ul>
              <p><strong>Anti-Spam & Duplicate Merging:</strong></p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.75rem' }}>
                <li>Maximum 3 new reports per household each day.</li>
                <li>Reports within 40 metres of an open report are automatically merged to prevent clutter.</li>
              </ul>
              <p><strong>Photo & Strike Policy:</strong></p>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li>A real photo is required for every report.</li>
                <li>If municipal crew finds nothing at the spot, 1 strike is added and points are revoked. 3 strikes pause reporting.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Map Area */}
        <div className="map-area">
          <MapView ref={mapRef} onMapClick={handleMapClick} />
        </div>
      </div>

      {/* Report Modal Popup */}
      {reportCoord && (
        <ReportModal
          latlng={reportCoord}
          onClose={() => setReportCoord(null)}
          onSuccess={(res) => {
            setReportSuccessMsg(res.message)
            loadHomeData(true)
            setActiveTab('reports')
          }}
        />
      )}
    </div>
  )
}
