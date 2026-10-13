import React from 'react'

export default function Leaderboard({ data, myUsername }) {
  if (!data) return <p style={{ color: '#5a6e74', fontSize: '0.9rem' }}>Loading leaderboard…</p>

  const { residents = [], wards = [] } = data

  function rankBadge(rank) {
    if (rank === 1) return 'rank-badge gold'
    if (rank === 2) return 'rank-badge silver'
    if (rank === 3) return 'rank-badge bronze'
    return 'rank-badge'
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🏆</span> Top Residents
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#5a6e74', marginBottom: '0.75rem' }}>
          Points are awarded when waste reports are verified by municipal inspectors.
        </p>

        {residents.length === 0 ? (
          <p style={{ color: '#5a6e74', fontSize: '0.85rem' }}>No points earned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {residents.map((r) => {
              const isMe = r.username === myUsername
              return (
                <div
                  key={r.username}
                  className="leaderboard-item"
                  style={{
                    background: isMe ? '#f0f9fa' : '#fff',
                    border: isMe ? '1.5px solid #0e7c86' : '1px solid #edf1f2',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                  }}
                >
                  <div className={rankBadge(r.rank)}>#{r.rank}</div>
                  <div style={{ flex: 1 }}>
                    <div className="lb-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{r.nickname}</span>
                      {isMe && <span className="chip chip-verified" style={{ fontSize: '0.65rem' }}>You</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#5a6e74' }}>
                      {r.ward} · {r.genuine} collected
                    </div>
                  </div>
                  <div className="lb-pts">{r.points} pts</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {wards.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🏘️</span> Ward Rankings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {wards.map((w, idx) => (
              <div
                key={w.ward}
                className="leaderboard-item"
                style={{
                  background: '#fff',
                  border: '1px solid #edf1f2',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                }}
              >
                <div className={rankBadge(idx + 1)}>#{idx + 1}</div>
                <div className="lb-name">{w.ward}</div>
                <div className="lb-pts">{w.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
