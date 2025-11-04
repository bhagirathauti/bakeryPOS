import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ShopOwnerDashboard from './components/ShopOwnerDashboard'
import CashierDashboard from './components/CashierDashboard'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try { localStorage.setItem('theme', theme) } catch (e) {}
  }, [theme])

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  // Authentication state (persisted to localStorage)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [showAuth, setShowAuth] = useState(false)

  function handleAuth(u) {
    setUser(u)
    try { localStorage.setItem('user', JSON.stringify(u)) } catch (e) {}
    setShowAuth(false)
  }

  function handleLogout() {
    setUser(null)
    try { localStorage.removeItem('user') } catch (e) {}
  }

  // Tab system for dashboards
  const [activeTab, setActiveTab] = useState(() => {
    if (user && user.role === 'admin') return 'users';
    if (user && user.role === 'shop_owner') return 'profile';
    if (user && user.role === 'cashier') return 'checkout';
    return 'users';
  });

  // Reset activeTab when user changes (role switch/login/logout)
  useEffect(() => {
    if (user && user.role === 'admin') setActiveTab('users');
    else if (user && user.role === 'shop_owner') setActiveTab('profile');
    else if (user && user.role === 'cashier') setActiveTab('checkout');
    else setActiveTab('users');
  }, [user]);

  const dashboardTabs = {
    admin: [
      { key: 'users', label: 'Users' },
      { key: 'settings', label: 'Settings' }
    ],
    cashier: [
      { key: 'checkout', label: 'Checkout' },
      { key: 'orders', label: 'Orders' }
    ],
    shop_owner: [
      { key: 'profile', label: 'Shop Profile' },
      { key: 'sales', label: 'Sales' },
      { key: 'cashiers', label: 'Cashiers' },
      { key: 'products', label: 'Products' },
      { key: 'landing', label: 'Shop Landing Page' }
    ]
  };

  function renderTabs(role) {
    const tabs = dashboardTabs[role] || [];
    return (
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === tab.key ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Only show header for public pages */}
      {/* Show global header only when not rendering full-page Landing/Login */}
      {!user && showAuth && (
        <Header theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} onGetStarted={() => setShowAuth(true)} />
      )}

      {/* Floating theme toggle and logout for dashboards */}
      {user && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center px-3 py-2 border rounded-md bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-100 border-gray-200 dark:border-slate-700 shadow"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md shadow"
          >
            Logout
          </button>
        </div>
      )}

      {!user && showAuth ? (
        <Login onAuth={handleAuth} />
      ) : (
        <>
          {!user ? (
            // Full-page Landing when logged out and not showing auth
            <Landing theme={theme} toggleTheme={toggleTheme} onGetStarted={() => setShowAuth(true)} />
          ) : (
            <>
              <main className="max-w-6xl mx-auto px-6 py-12">
                {renderTabs(user.role)}
                {user.role === 'admin' ? (
                  <AdminDashboard user={user} activeTab={activeTab} />
                ) : user.role === 'cashier' ? (
                  <CashierDashboard user={user} activeTab={activeTab} />
                ) : (
                  <ShopOwnerDashboard user={user} activeTab={activeTab} />
                )}
              </main>
            </>
          )}
        </>
      )}
    </div>
  )
}


