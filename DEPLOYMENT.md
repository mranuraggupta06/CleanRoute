# 🚀 CleanRoute — 100% Free Cloud Deployment Guide

CleanRoute is built as two decoupled modern services:
1. **Frontend:** React + Vite SPA (Deployed for free on **Vercel**)
2. **Backend:** Java Spring Boot REST API (Deployed for free on **Render.com**, **Railway**, or **Koyeb**)

---

## 🟢 Part 1: Deploy Backend to Render (100% Free)

Render provides a completely free Docker and Web Service tier.

### Option A: 1-Click Blueprint (Recommended)
1. Push your CleanRoute code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CleanRoute"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cleanroute.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) (free account).
3. Click **New** → **Blueprint**.
4. Connect your GitHub repository.
5. Render detects `render.yaml` automatically and configures the service!
6. Click **Apply**.
7. Once deployed, Render gives you a public URL (e.g. `https://cleanroute-backend.onrender.com`).

### Option B: Manual Web Service on Render
1. In Render Dashboard, click **New** → **Web Service**.
2. Connect your repository.
3. Settings:
   - **Name:** `cleanroute-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `PORT`: `8080`
   - `FRONTEND_URL`: `https://your-cleanroute.vercel.app` (or `*`)
5. Click **Deploy Web Service**.

> **Note on Render Free Tier:** Render spins down free containers when inactive. The first request after idle takes ~30 seconds to wake up.

---

## ▲ Part 2: Deploy Frontend to Vercel (100% Free)

Vercel is the fastest and easiest platform for React/Vite web apps.

1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New…** → **Project**.
3. Import your GitHub repository (`cleanroute`).
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables**:
   - Add `VITE_API_BASE` with the value of your Render backend URL:
     ```
     VITE_API_BASE=https://cleanroute-backend.onrender.com
     ```
     *(Do not include a trailing slash)*
6. Click **Deploy**!
7. Within ~30 seconds, Vercel gives you your live website URL (e.g. `https://cleanroute.vercel.app`).

---

## 💻 Part 3: Running Locally on Windows

CleanRoute comes pre-configured with local launcher scripts:

1. **Start the Backend:**
   - Double-click `run-backend.bat`
   - Runs the Spring Boot API on `http://localhost:8080`
2. **Start the Frontend:**
   - Double-click `run-frontend.bat`
   - Opens the React app on `http://localhost:5173`
   - Vite automatically proxies `/api` calls to `http://localhost:8080`.

---

## 🔑 Demo Login Credentials

Demo password for all accounts: **`demo123`**

| Role | Username | Description |
|---|---|---|
| **Municipality Staff** | `gn-dispatcher` | Full access to route optimizer, bin fill simulator, report verification |
| **Resident 1** | `gn-101` | Active household with 35 points, report history, live truck tracking |
| **Resident 2** | `gn-102` | Active household with 20 points |
| **Resident (Try Activation)** | `GN-105` to `GN-112` | Unactivated demo households. Use activation codes `DEMO105` to `DEMO112` |
| **Second Municipality** | `noida-dispatcher` / `noida-201` | Demonstrates complete multi-tenant municipality data separation |
