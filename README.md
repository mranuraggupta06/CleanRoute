# 🌿 CleanRoute — Smart Waste Route Optimizer & Citizen Portal

> Rebuilt from the ground up as a production-grade full-stack web application: **React (Vite) Frontend** + **Java (Spring Boot) Backend**, designed for **100% free deployment** on **Vercel** and **Render.com**.

---

## 🎯 What is CleanRoute?

Municipal garbage collection typically wastes thousands of litres of fuel driving to empty bins every day. CleanRoute transforms this routine:

1. **Municipality Staff** monitor bins in real-time. Instead of visiting every bin, the system runs mathematical routing heuristics to only visit bins that are full (≥ 70%) plus verified citizen reports.
2. **Citizens / Residents** track today's garbage truck moving live towards their street with dynamic ETA, pin accumulating waste on an interactive map with photos, and earn points on a community leaderboard.

---

## 🧠 The 4 Optimization Algorithms (Explained in Plain English)

The problem being solved is the **Capacitated Vehicle Routing Problem (CVRP)**: serving multiple waste spots starting and ending at a central depot without exceeding each truck's weight limit.

Instead of confusing academic names, CleanRoute presents them in intuitive terms:

| Option | Academic Name | User-Friendly Name | How It Works & When to Use |
|---|---|---|---|
| **Baseline** | Standard Greedy | **"Visit Every Bin" (Current Habit)** | Sends trucks to every single bin in town regardless of whether it is full or empty. This is the traditional routine used for before/after comparison. |
| **Option 1** | Nearest Neighbour | **"Quick & Direct"** | Trucks drive to the nearest overflowing bin one-by-one until full. Extremely fast to calculate, but can leave occasional zig-zag paths. |
| **Option 2** | Nearest Neighbour + 2-opt | **"Quick & Cleaned"** | Takes closest bins first, then automatically untangles crossing paths so trucks never drive in loops or double back on the same road. |
| **Option 3** | Clarke-Wright Savings | **"Smart Cluster Merger"** | Calculates fuel savings for pairing bins together into logical neighbourhood clusters rather than isolated stops. |
| **Option 4** | Clarke-Wright + 2-opt | **"Optimal Eco-Route ⭐" *(Recommended)*** | Combines cluster pairing with loop-untangling. **Achieves the shortest total driving distance, lowest fuel use, and fewest trucks needed.** |

---

## 🌟 Key Features

### 🏢 Municipality Control Room (`/dispatcher`)
- **Live Interactive Map:** Displays all bins colored by real-time fill level (🔴 High ≥70%, 🟡 Medium ≥40%, 🟢 Low <40%), depot location, and citizen reports.
- **Route Optimizer:**
  - Dynamic threshold slider (e.g. 50% to 90%).
  - Fleet size and truck capacity controls.
  - One-click simulation of IoT bin fill sensors.
  - Before vs. After comparison table (stops skipped, km saved, trucks needed, shift time saved).
  - One-click **"Send Routes to Trucks & Citizens"** to publish the plan.
- **Citizen Report Verification:**
  - Review submitted waste photos, locations, and descriptions.
  - **Verify:** Adds the spot as a stop in the next collection plan and awards reward points to the citizen.
  - **Mark Collected:** Confirms genuine pickup.
  - **Nothing Found:** Issues a strike for false reports and revokes points.
- **Household Management:**
  - Register new properties by ward and generate official one-time activation codes.
- **Leaderboard:**
  - Resident point rankings and ward-by-ward performance metrics.

---

### 🏠 Resident / Citizen Portal (`/resident`)
- **Live Truck Tracker:**
  - Automatically identifies which truck serves the resident's home.
  - Displays dynamic status: *"Truck 2 arrives in ~14 mins (10:45 AM). Please keep waste outside your gate."*
  - Watch trucks move along the streets in real-time at 30 km/h simulation.
- **Waste Reporting:**
  - **Tap anywhere on the map** or click **"Report at My GPS Location"**.
  - Form with waste category, amount estimation, and camera photo capture.
  - Automatic JPEG compression & resize in browser (<600 KB).
  - Anti-spam protections: max 3 reports/day, duplicate spots (<40m) automatically merged into community endorsements (+2 pts).
- **Gamification & Rewards:**
  - Earn +5 to +30 points based on waste size verified.
  - Household strike counter (3 confirmed false reports pauses reporting).
  - Ward ranking and community leaderboard.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 + Vite
  - React Router DOM 6
  - Leaflet 1.9 (interactive maps with custom styled div markers, polylines, and circles)
  - Pure, modern, responsive CSS design
- **Backend:**
  - Java 17+ (Spring Boot 3.2)
  - Spring Security (stateless JWT authentication with salted PBKDF2 hashing)
  - H2 Database + OpenCSV
  - Haversine spherical distance calculation
  - Custom CVRP Heuristic Solvers (Nearest Neighbour, Clarke-Wright, 2-opt)
- **Deployment:**
  - Frontend: **Vercel** (Free tier, SPA routing via `vercel.json`)
  - Backend: **Render.com** (Free tier, Multi-stage `Dockerfile` and `render.yaml`)

---

## 🚀 Quick Start (Local Run)

1. **Start Backend (Port 8080):**
   ```bash
   run-backend.bat
   ```
2. **Start Frontend (Port 5173):**
   ```bash
   run-frontend.bat
   ```
3. Open `http://localhost:5173` in your browser.

---

## ☁️ Free Cloud Deployment

Refer to [DEPLOYMENT.md](file:///C:/Users/User%203/.gemini/antigravity/scratch/cleanroute/DEPLOYMENT.md) for step-by-step instructions on deploying the frontend to **Vercel** and the backend to **Render.com** at zero cost.

---

## 🔐 Demo Accounts (Password for all: `demo123`)

- **Municipality Staff:** `gn-dispatcher`
- **Residents:** `gn-101`, `gn-102`, `gn-103`, `gn-104`
- **Activation Demo:** Household IDs `GN-105` to `GN-112` with activation codes `DEMO105` to `DEMO112`.
- **Data Isolation Demo:** `noida-dispatcher`, `noida-201`
