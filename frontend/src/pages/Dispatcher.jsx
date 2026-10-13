import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken, TRUCK_COLORS, SIZES, timeAgo } from '../api/client'
import MapView, { createDivIcon } from '../components/MapView'
import PlanTable from '../components/PlanTable'
import PhotoViewer from '../components/PhotoViewer'
import Leaderboard from '../components/Leaderboard'
import L from 'leaflet'

export default function Dispatcher() {
  const navigate = useNavigate()
  const mapRef = useRef(null)

  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('plan') // 'plan' | 'reports' | 'households' | 'board'

  // Plan optimizer controls
  const [threshold, setThreshold] = useState(70)
  const [fleet, setFleet] = useState(3)
  const [truckCapacity, setTruckCapacity] = useState(600)
  const [binCapacity, setBinCapacity] = useState(100)
  const [includePending, setIncludePending] = useState(false)
  const [plan, setPlan] = useState(null)
  const [selectedAlgo, setSelectedAlgo] = useState(-1)
  const [optimizing, setOptimizing] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [dispatchMsg, setDispatchMsg] = useState('')

  // Households controls
  const [households, setHouseholds] = useState([])
  const [houseNo, setHouseNo] = useState('')
  const [ward, setWard] = useState('Ward 1')
  const [houseMsg, setHouseMsg] = useState('')
  const [addingHouse, setAddingHouse] = useState(false)

  // Reports state
  const [reportsFilter, setReportsFilter] = useState('pending') // 'pending' | 'verified' | 'closed'
  const [actionMsg, setActionMsg] = useState('')

  // Leaderboard data
  const [boardData, setBoardData] = useState(null)

  useEffect(() => {
    loadState()
    const interval = setInterval(() => {
      loadState(true)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  async function loadState(silent = false) {
    if (!silent) setLoading(true)
    try {
      const data = await api.get('/api/state')
      setState(data)
      setError('')
      drawMapElements(data)
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

  // Draw bins, reports, and depot on map
  function drawMapElements(data, currentRoutes = null) {
    if (!mapRef.current) return
    const layers = mapRef.current.getLayers()
    if (!layers) return

    // 1. Depot & Radius
    layers.radius.clearLayers()
    const depot = data.depot
    if (depot && data.municipality) {
      L.circle([depot.lat, depot.lng], {
        radius: data.municipality.radiusKm * 1000,
        color: '#0e7c86',
        weight: 1.5,
        dashArray: '5 5',
        fillOpacity: 0.04,
      }).addTo(layers.radius)

      L.marker([depot.lat, depot.lng], {
        icon: createDivIcon(`<div class="marker-depot">🏢 ${depot.name}</div>`, [120, 24]),
        zIndexOffset: 1000,
      }).addTo(layers.radius)
    }

    // 2. Bins
    layers.bins.clearLayers()
    const bounds = []
    if (depot) bounds.push([depot.lat, depot.lng])

    data.bins.forEach((b) => {
      bounds.push([b.lat, b.lng])
      const isOver = b.fill >= threshold
      const fillColor = b.fill >= 70 ? '#cf4b35' : b.fill >= 40 ? '#e3a92b' : '#4e9f6b'

      const circle = L.circleMarker([b.lat, b.lng], {
        radius: isOver ? 10 : 7,
        fillColor,
        color: isOver ? '#1b2b34' : '#ffffff',
        weight: isOver ? 2.5 : 1.5,
        fillOpacity: isOver ? 0.95 : 0.45,
      }).bindTooltip(`<b>${b.name}</b>: ${b.fill}% full ${isOver ? '(Selected)' : ''}`)

      circle.addTo(layers.bins)
    })

    // 3. Citizen Reports
    layers.pings.clearLayers()
    data.pings.forEach((p) => {
      if (p.status !== 'PENDING' && p.status !== 'VERIFIED') return
      bounds.push([p.lat, p.lng])
      const isVerified = p.status === 'VERIFIED'
      const iconClass = isVerified ? 'marker-report verified' : 'marker-report pending'
      const iconHtml = `<div class="${iconClass}">${isVerified ? '✓' : '!'}</div>`

      const marker = L.marker([p.lat, p.lng], {
        icon: createDivIcon(iconHtml, [26, 26]),
        zIndexOffset: 800,
      }).bindTooltip(`Citizen Report #${p.id} (${p.kind}) - ${isVerified ? 'Verified' : 'Pending Review'}`)

      marker.addTo(layers.pings)
    })

    // Fit map bounds on initial load
    if (bounds.length > 0 && !currentRoutes) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  // Draw truck routes on the map
  function drawTruckRoutes(planResult) {
    if (!mapRef.current || !state) return
    const layers = mapRef.current.getLayers()
    if (!layers) return

    layers.routes.clearLayers()
    if (!planResult || !planResult.routes) return

    const depotPt = [state.depot.lat, state.depot.lng]
    const stopLookup = {}
    state.bins.forEach((b) => { stopLookup[b.id] = b })
    state.pings.forEach((p) => {
      stopLookup[p.id] = { lat: p.lat, lng: p.lng, name: `Report #${p.id}` }
    })

    planResult.routes.forEach((route, idx) => {
      const color = TRUCK_COLORS[idx % TRUCK_COLORS.length]
      const stops = (route.stopIds || []).map((id) => stopLookup[id]).filter(Boolean)

      const linePoints = [depotPt, ...stops.map((s) => [s.lat, s.lng]), depotPt]

      L.polyline(linePoints, {
        color,
        weight: 4.5,
        opacity: 0.85,
      }).addTo(layers.routes)

      // Add stop badges
      stops.forEach((s, stopIdx) => {
        const badgeHtml = `<div class="stop-num" style="background:${color}">${stopIdx + 1}</div>`
        L.marker([s.lat, s.lng], {
          icon: createDivIcon(badgeHtml, [22, 22]),
          zIndexOffset: 950,
        }).bindTooltip(`Truck ${idx + 1}, Stop ${stopIdx + 1}: ${s.name}`).addTo(layers.routes)
      })
    })
  }

  // Optimize routes
  async function handleOptimize() {
    setOptimizing(true)
    setDispatchMsg('')
    try {
      const res = await api.get(
        `/api/optimize?threshold=${threshold}&truckCapacity=${truckCapacity}&binCapacity=${binCapacity}&trucks=${fleet}&includePending=${includePending}`
      )
      setPlan(res)
      const best = res.bestIndex >= 0 ? res.bestIndex : 'baseline'
      setSelectedAlgo(best)
      const activeData = best === 'baseline' ? res.baseline : res.results[best]
      drawTruckRoutes(activeData)
    } catch (err) {
      setError(err.message)
    } finally {
      setOptimizing(false)
    }
  }

  function handleSelectAlgo(key) {
    setSelectedAlgo(key)
    if (!plan) return
    const activeData = key === 'baseline' ? plan.baseline : plan.results[key]
    drawTruckRoutes(activeData)
  }

  // Simulate new sensor readings
  async function handleSimulate() {
    try {
      const res = await api.post('/api/simulate', {})
      setState(res)
      setPlan(null)
      if (mapRef.current) mapRef.current.getLayers().routes.clearLayers()
      drawMapElements(res)
    } catch (err) {
      setError(err.message)
    }
  }

  // Dispatch selected routes to trucks and citizens
  async function handleDispatch() {
    if (selectedAlgo === 'baseline') {
      alert('Please select an optimized plan to dispatch to the fleet.')
      return
    }
    setDispatching(true)
    setDispatchMsg('')
    try {
      const res = await api.post('/api/dispatch', {
        threshold,
        truckCapacity,
        trucks: fleet,
        binCapacity,
        algorithm: selectedAlgo,
      })
      setState(res)
      setDispatchMsg('🚀 Routes successfully dispatched! Citizens can now track their truck in real time.')
    } catch (err) {
      setError(err.message)
    } finally {
      setDispatching(false)
    }
  }

  // Review report (Verify / Reject)
  async function handleReviewReport(id, action) {
    setActionMsg('')
    try {
      const res = await api.post('/api/pings/review', { id, action })
      setState(res)
      setActionMsg(`Report #${id} ${action === 'verify' ? 'verified and points awarded' : 'rejected'}.`)
      drawMapElements(res)
    } catch (err) {
      setActionMsg(err.message)
    }
  }

  // Complete report after visit (Genuine / False)
  async function handleCompleteReport(id, outcome) {
    if (outcome === 'false' && !window.confirm(`Mark report #${id} as FALSE? This deducts points and issues a strike.`)) {
      return
    }
    setActionMsg('')
    try {
      const res = await api.post('/api/pings/complete', { id, outcome })
      setState(res)
      setActionMsg(`Report #${id} recorded as ${outcome === 'genuine' ? 'collected' : 'false report (strike issued)'}.`)
      drawMapElements(res)
    } catch (err) {
      setActionMsg(err.message)
    }
  }

  // Households tab: load and add
  async function loadHouseholds() {
    try {
      const list = await api.get('/api/households')
      setHouseholds(list)
    } catch (err) {
      setHouseMsg(err.message)
    }
  }

  async function handleAddHousehold(e) {
    e.preventDefault()
    setAddingHouse(true)
    setHouseMsg('')
    try {
      const res = await api.post('/api/households', { houseNo, ward })
      setHouseMsg(`✅ Created household ${res.id}! Activation Code: ${res.code}`)
      setHouseNo('')
      loadHouseholds()
    } catch (err) {
      setHouseMsg(err.message)
    } finally {
      setAddingHouse(false)
    }
  }

  // Leaderboard tab: load
  async function loadBoard() {
    try {
      const data = await api.get('/api/leaderboard')
      setBoardData(data)
    } catch (err) {
      // ignore
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'households') loadHouseholds()
    if (tab === 'board') loadBoard()
  }

  if (loading && !state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 36, height: 36 }} />
          <p style={{ marginTop: '0.75rem', color: '#5a6e74' }}>Loading municipality control room…</p>
        </div>
      </div>
    )
  }

  const pendingReports = (state?.pings || []).filter((p) => p.status === 'PENDING')
  const verifiedReports = (state?.pings || []).filter((p) => p.status === 'VERIFIED')
  const closedReports = (state?.pings || []).filter((p) => p.status === 'COLLECTED' || p.status === 'REJECTED' || p.status === 'FALSE_REPORT')
  const fullBinsCount = (state?.bins || []).filter((b) => b.fill >= threshold).length

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="app-logo">Clean<span>Route</span></div>
          <span className="chip chip-verified" style={{ fontSize: '0.7rem' }}>Municipality Control Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#5a6e74', textAlign: 'right' }}>
            <strong style={{ color: '#1b2b34' }}>{state?.me?.nickname || 'Dispatcher'}</strong>
            <div>{state?.municipality?.name}</div>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main split view */}
      <div className="dashboard-body">
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* KPI strip */}
          <div className="kpi-strip">
            <div className="kpi-card">
              <div className="kpi-label">Full Bins (≥{threshold}%)</div>
              <div className="kpi-value">{fullBinsCount}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Pending Reports</div>
              <div className="kpi-value" style={{ color: pendingReports.length > 0 ? '#e3a92b' : '#0e7c86' }}>
                {pendingReports.length}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Trucks Active</div>
              <div className="kpi-value">
                {state?.dispatch ? state.dispatch.routes?.length || 0 : 0}
              </div>
            </div>
          </div>

          {error && <div className="message message-error">{error}</div>}

          {/* Navigation Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
              onClick={() => handleTabChange('plan')}
            >
              Route Planner
            </button>
            <button
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
              style={{ position: 'relative' }}
            >
              Citizen Reports
              {pendingReports.length > 0 && (
                <span
                  style={{
                    background: '#e3a92b',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0.1rem 0.4rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    marginLeft: '0.35rem',
                  }}
                >
                  {pendingReports.length}
                </span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === 'households' ? 'active' : ''}`}
              onClick={() => handleTabChange('households')}
            >
              Households
            </button>
            <button
              className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
              onClick={() => handleTabChange('board')}
            >
              Leaderboard
            </button>
          </div>

          {/* TAB 1: Route Planner */}
          {activeTab === 'plan' && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>⚙️ Collection Parameters</h3>
                  <button
                    type="button"
                    onClick={handleSimulate}
                    className="btn btn-secondary btn-sm"
                    title="Simulate random IoT fill levels for bins"
                  >
                    🎲 Randomize Fill Levels
                  </button>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <label>Bin Fill Threshold</label>
                    <span className="slider-val">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={threshold}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setThreshold(val)
                      if (state) drawMapElements(state)
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#5a6e74' }}>
                    Only bins at or above {threshold}% full are scheduled for pickup today.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Truck Fleet Size</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      value={fleet}
                      onChange={(e) => setFleet(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Truck Max Capacity (kg)</label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      className="form-control"
                      value={truckCapacity}
                      onChange={(e) => setTruckCapacity(Math.max(50, Number(e.target.value)))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={includePending}
                      onChange={(e) => setIncludePending(e.target.checked)}
                    />
                    <span>Include pending citizen reports in simulation</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleOptimize}
                  disabled={optimizing}
                >
                  {optimizing ? <><span className="spinner" /> Calculating Optimal Routes…</> : '⚡ Run Route Optimizer'}
                </button>
              </div>

              {/* Plan Results & Comparison */}
              {plan && (
                <div style={{ marginBottom: '1rem' }}>
                  {plan.warning && (
                    <div className="message message-warn" style={{ marginBottom: '0.75rem' }}>
                      {plan.warning}
                    </div>
                  )}

                  <PlanTable plan={plan} selected={selectedAlgo} onSelect={handleSelectAlgo} />

                  {/* Dispatch Button */}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.8rem', background: '#0e7c86', fontSize: '1rem' }}
                      onClick={handleDispatch}
                      disabled={dispatching || selectedAlgo === 'baseline'}
                    >
                      {dispatching ? (
                        <><span className="spinner" /> Dispatching to Trucks…</>
                      ) : (
                        '📢 Send Selected Routes to Trucks & Citizens'
                      )}
                    </button>
                    {dispatchMsg && <div className="message message-ok" style={{ marginTop: '0.75rem' }}>{dispatchMsg}</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Citizen Reports */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${reportsFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setReportsFilter('pending')}
                >
                  Pending ({pendingReports.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${reportsFilter === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setReportsFilter('verified')}
                >
                  Verified ({verifiedReports.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${reportsFilter === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setReportsFilter('closed')}
                >
                  History ({closedReports.length})
                </button>
              </div>

              {actionMsg && <div className="message message-ok">{actionMsg}</div>}

              {reportsFilter === 'pending' && (
                <div>
                  {pendingReports.length === 0 ? (
                    <p style={{ color: '#5a6e74', fontSize: '0.9rem' }}>No reports waiting for verification.</p>
                  ) : (
                    pendingReports.map((p) => (
                      <div key={p.id} className="report-item">
                        <div className="report-header">
                          <span className={`chip chip-${p.size}`}>{SIZES[p.size]?.label || p.size}</span>
                          <span style={{ fontWeight: 700 }}>#{p.id} · {p.kind}</span>
                          <span style={{ fontSize: '0.75rem', color: '#5a6e74', marginLeft: 'auto' }}>
                            {timeAgo(p.createdAt)}
                          </span>
                        </div>

                        <div className="report-meta">
                          Reported by: <strong>{p.reporter}</strong> ({p.household})
                          {p.reporterStrikes > 0 && (
                            <span style={{ color: '#cf4b35', marginLeft: '0.5rem' }}>
                              ⚠️ {p.reporterStrikes} strike(s)
                            </span>
                          )}
                          {p.supporters > 0 && (
                            <span> · Supported by {p.supporters} neighbour(s)</span>
                          )}
                        </div>

                        {p.note && <div className="report-note">"{p.note}"</div>}
                        {p.photo && <PhotoViewer pingId={p.id} />}

                        <div className="report-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewReport(p.id, 'verify')}
                          >
                            ✓ Verify & Award Points
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleReviewReport(p.id, 'reject')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {reportsFilter === 'verified' && (
                <div>
                  {verifiedReports.length === 0 ? (
                    <p style={{ color: '#5a6e74', fontSize: '0.9rem' }}>No verified reports waiting for collection.</p>
                  ) : (
                    verifiedReports.map((p) => (
                      <div key={p.id} className="report-item">
                        <div className="report-header">
                          <span className="chip chip-verified">Verified</span>
                          <span style={{ fontWeight: 700 }}>#{p.id} · {p.kind}</span>
                        </div>
                        <div className="report-meta">
                          {p.reporter} ({p.household}) · {p.kg} kg approx
                        </div>
                        {p.note && <div className="report-note">"{p.note}"</div>}
                        {p.photo && <PhotoViewer pingId={p.id} />}

                        <div className="report-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCompleteReport(p.id, 'genuine')}
                          >
                            ✓ Crew Collected
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCompleteReport(p.id, 'false')}
                          >
                            ⚠️ Nothing Found (Issue Strike)
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {reportsFilter === 'closed' && (
                <div>
                  {closedReports.length === 0 ? (
                    <p style={{ color: '#5a6e74', fontSize: '0.9rem' }}>No closed reports yet.</p>
                  ) : (
                    closedReports.map((p) => (
                      <div key={p.id} className="report-item" style={{ opacity: 0.85 }}>
                        <div className="report-header">
                          <span className={`chip chip-${p.status.toLowerCase()}`}>{p.status}</span>
                          <span style={{ fontWeight: 600 }}>#{p.id} · {p.kind}</span>
                        </div>
                        <div className="report-meta">
                          {p.reporter} · Resolved {timeAgo(p.resolvedAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Households */}
          {activeTab === 'households' && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>➕ Register New Household</h3>
                <p style={{ fontSize: '0.8rem', color: '#5a6e74', marginBottom: '0.75rem' }}>
                  Add a household to generate an official one-time activation code.
                </p>
                {houseMsg && (
                  <div className={`message ${houseMsg.includes('✅') ? 'message-ok' : 'message-error'}`}>
                    {houseMsg}
                  </div>
                )}
                <form onSubmit={handleAddHousehold}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div className="form-group">
                      <label>House No. / Flat</label>
                      <input
                        className="form-control"
                        placeholder="e.g. 113 or B-204"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Ward</label>
                      <input
                        className="form-control"
                        placeholder="Ward 1"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingHouse}>
                    {addingHouse ? 'Creating…' : 'Generate Household Code'}
                  </button>
                </form>
              </div>

              <h4 style={{ marginBottom: '0.5rem' }}>Registered Households ({households.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {households.map((h) => (
                  <div key={h.id} className="card" style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{h.id}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#5a6e74' }}>{h.ward}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>
                      {h.activated ? (
                        <span style={{ color: '#2e7d32' }}>
                          ● Active: <strong>{h.nickname}</strong> ({h.points} pts)
                        </span>
                      ) : (
                        <span style={{ color: '#e65100' }}>
                          ○ Waiting: Code <code>{h.code}</code>
                        </span>
                      )}
                    </div>
                    {h.strikes > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#cf4b35', marginTop: '0.2rem' }}>
                        ⚠️ {h.strikes} false report strike(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Leaderboard */}
          {activeTab === 'board' && (
            <div>
              <Leaderboard data={boardData} myUsername={state?.me?.username} />
            </div>
          )}
        </div>

        {/* Right Map Area */}
        <div className="map-area">
          <MapView ref={mapRef} />
        </div>
      </div>
    </div>
  )
}
