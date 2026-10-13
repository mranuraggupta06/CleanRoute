// Central API helper
// In dev, Vite proxy forwards /api/* to localhost:8080
// In production, set VITE_API_BASE to your backend URL (e.g. https://cleanroute-api.onrender.com)

const BASE = import.meta.env.VITE_API_BASE || ''

function token() {
  return localStorage.getItem('cr_token')
}

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra }
  const t = token()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
}

export function saveToken(t) { localStorage.setItem('cr_token', t) }
export function clearToken() { localStorage.removeItem('cr_token') }

// Photo URL helper — sends Authorization header via blob trick
export async function photoUrl(id) {
  const res = await fetch(`${BASE}/api/photo/${id}`, {
    headers: { Authorization: `Bearer ${token()}` }
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// Compress and convert any image to JPEG base64 (max 600KB)
export function imageToJpegBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        const b64 = canvas.toDataURL('image/jpeg', 0.82).split(',')[1]
        resolve({ base64: b64, preview: canvas.toDataURL('image/jpeg', 0.6) })
      }
      img.onerror = () => reject(new Error('Could not read the image.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
}

export function timeAgo(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return Math.floor(sec / 60) + ' min ago'
  if (sec < 86400) return Math.floor(sec / 3600) + ' h ago'
  return Math.floor(sec / 86400) + ' d ago'
}

export function fmtClock(ms) {
  const d = new Date(ms)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

export const SIZES = {
  small:   { label: 'Small bag',    kg: 10,  points: 5  },
  medium:  { label: 'Medium pile',  kg: 40,  points: 10 },
  large:   { label: 'Large pile',   kg: 150, points: 20 },
  massive: { label: 'Massive pile', kg: 400, points: 30 },
}

export const KINDS = [
  'Household garbage', 'Overflowing bin', 'Garden waste',
  'Construction debris', 'Dead animal or hazardous', 'Other'
]

export const TRUCK_COLORS = ['#0e7c86','#7b4fb8','#d9731f','#b0366b','#4d8b2f','#8a6d1a']
