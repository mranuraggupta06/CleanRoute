import React, { useState, useEffect } from 'react'
import { photoUrl } from '../api/client'

export default function PhotoViewer({ pingId, alt = 'Waste report photo' }) {
  const [src, setSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    let blobUrl = null

    setLoading(true)
    setError(false)

    photoUrl(pingId)
      .then((url) => {
        if (!active) return
        if (url) {
          blobUrl = url
          setSrc(url)
        } else {
          setError(true)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [pingId])

  if (loading) {
    return (
      <div style={{ height: 100, width: 140, background: '#f4f7f4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 16, height: 16 }} />
      </div>
    )
  }

  if (error || !src) {
    return <p style={{ fontSize: '0.78rem', color: '#5a6e74', fontStyle: 'italic' }}>No photo available</p>
  }

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" title="Click to view full image">
      <img
        src={src}
        alt={alt}
        className="report-photo"
        style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
      />
    </a>
  )
}
