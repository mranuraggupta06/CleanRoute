import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveToken } from '../api/client'

export default function Home() {
  const navigate = useNavigate()
  const [role, setRole] = useState('resident')
  const [municipalities, setMunicipalities] = useState([])
  const [mode, setMode] = useState('login') // 'login' | 'register'

  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Register state
  const [municipalityId, setMunicipalityId] = useState('')
  const [householdId, setHouseholdId] = useState('')
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.get('/api/municipalities').then(data => {
      setMunicipalities(data)
      if (data.length > 0) setMunicipalityId(data[0].id)
    }).catch(() => {})
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await api.post('/api/login', { username, password, as: role })
      saveToken(data.token)
      if (data.role === 'dispatcher') navigate('/dispatcher')
      else navigate('/resident')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/api/register', { municipalityId, householdId, code, nickname, password: regPassword })
      setSuccess('Account created! You can now sign in.')
      setMode('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-hero">
      <div className="home-logo">Clean<span>Route</span></div>
      <p className="home-tagline">Smart waste collection — for a cleaner neighbourhood</p>

      <div className="login-card">
        {/* Role selector */}
        <div className="role-selector" style={{ marginBottom: '1rem' }}>
          <button
            className={`role-btn ${role === 'resident' ? 'active' : ''}`}
            onClick={() => { setRole('resident'); setError(''); setSuccess('') }}
            type="button"
          >
            🏠 Resident
          </button>
          <button
            className={`role-btn ${role === 'dispatcher' ? 'active' : ''}`}
            onClick={() => { setRole('dispatcher'); setMode('login'); setError(''); setSuccess('') }}
            type="button"
          >
            🚛 Municipality
          </button>
        </div>

        {/* Mode switcher (residents can register) */}
        {role === 'resident' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            >Sign In</button>
            <button
              type="button"
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
            >Activate Account</button>
          </div>
        )}

        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-ok">{success}</div>}

        {/* ---- LOGIN FORM ---- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                required
                placeholder={role === 'dispatcher' ? 'e.g. gn-dispatcher' : 'e.g. gn-101'}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Signing in…</> : 'Sign In'}
            </button>
            <p className="demo-hint" style={{ marginTop: '0.75rem' }}>
              Demo password for all accounts: <code>demo123</code>
            </p>
            {role === 'dispatcher' && (
              <p className="demo-hint">Dispatcher: <code>gn-dispatcher</code></p>
            )}
            {role === 'resident' && (
              <p className="demo-hint">Residents: <code>gn-101</code> to <code>gn-104</code></p>
            )}
          </form>
        )}

        {/* ---- REGISTER FORM ---- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Municipality</label>
              <select
                className="form-control"
                value={municipalityId}
                onChange={e => setMunicipalityId(e.target.value)}
                required
              >
                {municipalities.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Household ID</label>
              <input
                className="form-control"
                value={householdId}
                onChange={e => setHouseholdId(e.target.value.toUpperCase())}
                placeholder="e.g. GN-105"
                required
              />
            </div>
            <div className="form-group">
              <label>Activation Code (from municipality)</label>
              <input
                className="form-control"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DEMO105"
                required
              />
            </div>
            <div className="form-group">
              <label>Display Name (shown on leaderboard)</label>
              <input
                className="form-control"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="3-20 characters"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Activating…</> : 'Activate Account'}
            </button>
            <p className="demo-hint" style={{ marginTop: '0.75rem' }}>
              Try household <code>GN-105</code> to <code>GN-112</code> with codes <code>DEMO105</code>–<code>DEMO112</code>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
