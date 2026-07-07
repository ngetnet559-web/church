import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome</h2>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Sunday School Management System — manage classes, students, attendance,
        and more in one place.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Sign in to get started
      </Link>
    </section>
  )
}

export default Home
