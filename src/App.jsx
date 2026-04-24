import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import RegisterProduct from './pages/RegisterProduct'
import ScanProduct from './pages/ScanProduct'
import ProductDetail from './pages/ProductDetail'
import MyProducts from './pages/MyProducts'

function Layout({ children }) {
  const location = useLocation()
  return (
    <>
      <Navbar />
      <div key={location.pathname} className="page-fade-in">
        {children}
      </div>
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home"        element={<Layout><Home /></Layout>} />
      <Route path="/register"    element={<Layout><RegisterProduct /></Layout>} />
      <Route path="/scan"        element={<Layout><ScanProduct /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/my-products" element={<Layout><MyProducts /></Layout>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
