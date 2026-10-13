import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dispatcher from './pages/Dispatcher'
import Resident from './pages/Resident'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dispatcher" element={<Dispatcher />} />
      <Route path="/resident" element={<Resident />} />
    </Routes>
  </BrowserRouter>
)
