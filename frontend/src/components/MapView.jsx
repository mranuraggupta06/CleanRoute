import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix standard marker icons for Leaflet bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapView = forwardRef(function MapView({ className = 'map-container', onMapClick }, ref) {
  const containerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupsRef = useRef({
    bins: null,
    pings: null,
    routes: null,
    trucks: null,
    radius: null,
  })

  useEffect(() => {
    if (mapInstanceRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([28.4725, 77.4889], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    layerGroupsRef.current.radius = L.layerGroup().addTo(map)
    layerGroupsRef.current.bins = L.layerGroup().addTo(map)
    layerGroupsRef.current.routes = L.layerGroup().addTo(map)
    layerGroupsRef.current.pings = L.layerGroup().addTo(map)
    layerGroupsRef.current.trucks = L.layerGroup().addTo(map)

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng)
      })
    }

    mapInstanceRef.current = map

    // Resize invalidate after mount
    setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    getLayers: () => layerGroupsRef.current,
    setView: (latlng, zoom) => {
      if (mapInstanceRef.current) mapInstanceRef.current.setView(latlng, zoom)
    },
    fitBounds: (bounds, options) => {
      if (mapInstanceRef.current && bounds && bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, options || { padding: [40, 40] })
      }
    },
    invalidateSize: () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
    },
  }))

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />
})

export default MapView

export function createDivIcon(html, size = [26, 26]) {
  return L.divIcon({
    className: '',
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  })
}
