import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import RegisterProduct from './pages/RegisterProduct'
import ScanProduct from './pages/ScanProduct'
import ProductDetail from './pages/ProductDetail'
import MyProducts from './pages/MyProducts'

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/register" element={<><Navbar /><RegisterProduct /></>} />
        <Route path="/scan" element={<><Navbar /><ScanProduct /></>} />
        <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
        <Route path="/my-products" element={<><Navbar /><MyProducts /></>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App