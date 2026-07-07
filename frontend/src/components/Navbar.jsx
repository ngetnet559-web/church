import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function Navbar() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
          Sunday School Management
        </Link>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
