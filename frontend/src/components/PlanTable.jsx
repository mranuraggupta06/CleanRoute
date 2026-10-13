import React from 'react'

export default function PlanTable({ plan, selected, onSelect }) {
  if (!plan) return null

  const {
    baseline,
    results = [],
    bestIndex,
    truckKmh,
    minutesPerStop,
    totalBins,
    selectedBins,
    reportStops,
    threshold,
  } = plan

  const allRows = [
    { key: 'baseline', data: baseline, isBaseline: true },
    ...results.map((r, i) => ({ key: i, data: r, isBaseline: false, isBest: i === bestIndex })),
  ]

  const maxKm = Math.max(
    baseline?.distanceKm || 1,
    ...results.map((r) => r.distanceKm || 1)
  )

  function hours(d, stops) {
    return (d.distanceKm / truckKmh) + (stops * minutesPerStop / 60)
  }

  function fmtHours(h) {
    const totalMin = Math.round(h * 60)
    const hoursPart = Math.floor(totalMin / 60)
    const minPart = totalMin % 60
    return `${hoursPart}h ${minPart}m`
  }

  const stopsBefore = totalBins + reportStops
  const stopsAfter = selectedBins + reportStops

  const selectedData =
    selected === 'baseline'
      ? baseline
      : selected !== null && results[selected]
      ? results[selected]
      : bestIndex >= 0
      ? results[bestIndex]
      : baseline

  return (
    <div>
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.82rem', color: '#5a6e74', marginBottom: '0.4rem' }}>
          Filters applied: Only collecting bins at least <strong>{threshold}% full</strong> +{' '}
          <strong>{reportStops} verified citizen reports</strong>.
        </div>
        <div style={{ fontSize: '0.78rem', color: '#0e7c86', fontWeight: 600 }}>
          💡 Click any option below to view its truck routes on the map!
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {allRows.map((row) => {
          const d = row.data
          if (!d) return null
          const isSelected = selected === row.key
          const widthPct = Math.min(100, Math.max(10, (d.distanceKm / maxKm) * 100)).toFixed(1)

          return (
            <div
              key={String(row.key)}
              className={`plan-card ${isSelected ? 'selected' : ''} ${row.isBest ? 'best' : ''}`}
              onClick={() => onSelect(row.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(row.key)}
              style={{
                position: 'relative',
                borderWidth: isSelected ? '2.5px' : '1.5px',
                boxShadow: isSelected ? '0 3px 12px rgba(14,124,134,0.18)' : 'none',
              }}
            >
              <div className="plan-header">
                <div>
                  <div className="plan-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{d.friendlyName || d.name}</span>
                    {row.isBest && <span className="best-tag">⭐ Shortest Route</span>}
                    {row.isBaseline && <span className="baseline-tag">Old Routine</span>}
                  </div>
                  {d.description && (
                    <div style={{ fontSize: '0.8rem', color: '#5a6e74', marginTop: '0.2rem' }}>
                      {d.description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                  <div className="plan-km">{d.distanceKm.toFixed(1)} km</div>
                  {d.savingPercent != null && !row.isBaseline && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: d.savingPercent >= 0 ? '#2e7d32' : '#cf4b35',
                      }}
                    >
                      {d.savingPercent >= 0 ? `-${d.savingPercent.toFixed(0)}% distance` : `+${Math.abs(d.savingPercent).toFixed(0)}% distance`}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Distance Bar */}
              <div className="plan-bar" style={{ marginTop: '0.6rem' }}>
                <div
                  className="plan-bar-fill"
                  style={{
                    width: `${widthPct}%`,
                    background: row.isBaseline ? '#8fa3a8' : row.isBest ? '#4d8b2f' : '#0e7c86',
                  }}
                />
              </div>

              <div className="plan-meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span>
                  🚛 <strong>{d.vehicles}</strong> truck{d.vehicles !== 1 ? 's' : ''} needed
                </span>
                <span>
                  ⚡ Calculated in {d.timeMs >= 1 ? `${d.timeMs.toFixed(1)} ms` : '< 1 ms'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Before vs After comparison summary */}
      {selectedData && (
        <div style={{ marginTop: '1.25rem', background: '#f8faf9', padding: '1rem', borderRadius: '10px', border: '1px solid #d1dde0' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#1b2b34', fontSize: '0.95rem' }}>
            📊 Plan Comparison: Old Routine vs. Selected ({selectedData.friendlyName || selectedData.name})
          </h4>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Metric</th>
                <th>Old Routine (Every Bin)</th>
                <th>Selected Plan</th>
                <th>Benefit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Stops to Visit</td>
                <td>{stopsBefore}</td>
                <td className={stopsAfter < stopsBefore ? 'good' : ''}>{stopsAfter}</td>
                <td className="good">
                  {stopsBefore - stopsAfter > 0 ? `Skipped ${stopsBefore - stopsAfter} empty bins` : 'All visited'}
                </td>
              </tr>
              <tr>
                <td>Total Driving Distance</td>
                <td>{baseline.distanceKm.toFixed(1)} km</td>
                <td className={selectedData.distanceKm < baseline.distanceKm ? 'good' : ''}>
                  {selectedData.distanceKm.toFixed(1)} km
                </td>
                <td className={selectedData.distanceKm < baseline.distanceKm ? 'good' : ''}>
                  {baseline.distanceKm > selectedData.distanceKm
                    ? `${(baseline.distanceKm - selectedData.distanceKm).toFixed(1)} km saved`
                    : 'Same'}
                </td>
              </tr>
              <tr>
                <td>Trucks Required</td>
                <td>{baseline.vehicles}</td>
                <td className={selectedData.vehicles <= baseline.vehicles ? 'good' : ''}>
                  {selectedData.vehicles}
                </td>
                <td className={selectedData.vehicles < baseline.vehicles ? 'good' : ''}>
                  {baseline.vehicles > selectedData.vehicles
                    ? `${baseline.vehicles - selectedData.vehicles} fewer truck(s)`
                    : 'Within fleet'}
                </td>
              </tr>
              <tr>
                <td>Est. Shift Duration</td>
                <td>{fmtHours(hours(baseline, stopsBefore))}</td>
                <td className={hours(selectedData, stopsAfter) < hours(baseline, stopsBefore) ? 'good' : ''}>
                  {fmtHours(hours(selectedData, stopsAfter))}
                </td>
                <td className="good">
                  {hours(baseline, stopsBefore) > hours(selectedData, stopsAfter)
                    ? `${fmtHours(hours(baseline, stopsBefore) - hours(selectedData, stopsAfter))} saved`
                    : 'Standard'}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '0.74rem', color: '#5a6e74', marginTop: '0.5rem' }}>
            * Driving speed: {truckKmh} km/h · Loading stop time: {minutesPerStop} minutes per location.
          </div>
        </div>
      )}
    </div>
  )
}
