import React, { useState } from 'react'

export default function Signup({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password || password !== confirm) {
      setError('Please fill all fields correctly.')
      return
    }
    const API_BASE = window.__API_BASE__ || 'http://localhost:4000'
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'server_error')
      onAuth && onAuth(data)
    } catch (e) {
      setError(e.message || 'Server error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-amber-500 mb-4">
                <span className="text-white font-bold text-xl">SS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create your account</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start your free trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email Address</label>
                <input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" required className="block w-full rounded-md border border-gray-300 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Password</label>
                <div className="relative">
                  <input id="password" value={password} onChange={e => setPassword(e.target.value)} type={show ? 'text' : 'password'} required className="block w-full rounded-md border border-gray-300 dark:border-slate-700 px-4 py-3 pr-12 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent transition-all" placeholder="Create a password" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors" aria-label={show ? 'Hide password' : 'Show password'}>{show ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Confirm Password</label>
                <input id="confirm" value={confirm} onChange={e => setConfirm(e.target.value)} type={show ? 'text' : 'password'} required className="block w-full rounded-md border border-gray-300 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent transition-all" placeholder="Confirm your password" />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 sm:p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="w-full px-4 py-3 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all shadow-sm hover:shadow-md">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} SaleSync. All rights reserved.</div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <a href="#privacy" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:underline transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:underline transition-colors">Terms of Service</a>
              <a href="#support" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:underline transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
            <p className="text-center text-xs text-gray-500 dark:text-gray-500">POS · Inventory · Billing — Simplifying bakery sales management</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


