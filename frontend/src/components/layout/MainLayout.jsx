import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar.jsx'

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
