import React, { useState } from 'react'
import { api, imageToJpegBase64, SIZES, KINDS } from '../api/client'

export default function ReportModal({ latlng, onClose, onSuccess, existingNearby }) {
  const [kind, setKind] = useState('Household garbage')
  const [size, setSize] = useState('medium')
  const [note, setNote] = useState('')
  const [photoBase64, setPhotoBase64] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setError('')
    try {
      const result = await imageToJpegBase64(file)
      setPhotoBase64(result.base64)
      setPreviewUrl(result.preview)
    } catch (err) {
      setError(err.message || 'Could not process photo.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!photoBase64) {
      setError('A photo of the waste is mandatory to submit a report.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/api/pings', {
        lat: latlng.lat,
        lng: latlng.lng,
        size,
        kind,
        note,
        photo: photoBase64,
      })
      onSuccess(res)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>📍</span> Report Waste Spot
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.5rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#5a6e74', marginBottom: '0.75rem' }}>
          Location: {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
        </div>

        {existingNearby && (
          <div className="message message-warn" style={{ fontSize: '0.82rem' }}>
            A neighbour recently reported this spot! Submitting will add your confirmation and earn you supporter points.
          </div>
        )}

        {error && <div className="message message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type of Waste</label>
            <select className="form-control" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Amount</label>
            <select className="form-control" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Small bag (~10 kg) · Earn +5 pts</option>
              <option value="medium">Medium pile (~40 kg) · Earn +10 pts</option>
              <option value="large">Large pile (~150 kg) · Earn +20 pts</option>
              <option value="massive">Massive pile (~400 kg) · Earn +30 pts</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location Notes (optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Behind the green gate, near tree"
              maxLength={140}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Photo of Waste (Required)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="form-control"
              onChange={handleFileChange}
              required
            />
            <div style={{ fontSize: '0.75rem', color: '#5a6e74', marginTop: '0.25rem' }}>
              Take a photo or choose from gallery. Resized automatically (JPEG).
            </div>
          </div>

          {previewUrl && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Upload preview"
                style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #d1dde0' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={submitting || !photoBase64}
            >
              {submitting ? <><span className="spinner" /> Sending…</> : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
