import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AdminRoutes } from '@/modules/admin'
import { ClientRoutes } from '@/modules/client'
import HomePage from '@/modules/client/pages/HomePage'

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/admin/*" element={<AdminRoutes />} />
    <Route path="/app/*" element={<ClientRoutes />} />
    <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-gray-500">404 - Không tìm thấy trang</div>} />
  </Routes>
)

export default App
