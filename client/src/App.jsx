import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ShopOwnerDashboard from './pages/dashboards/ShopOwnerDashboard'
import CashierDashboard from './pages/dashboards/CashierDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

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
      { key: 'landing', label: 'Shop Landing Page' },
      { key: 'orders', label: 'Orders' }

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
  const dashboardTitles = {
    admin: 'Admin Dashboard',
    cashier: 'Cashier Dashboard',
    shop_owner: 'Shop Owner Dashboard'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Only show header for public pages */}
      {!user && <Header theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} onGetStarted={() => setShowAuth(true)} />}

      {/* Dashboard Navbar */}
      {user && (
        <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Dashboard Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{dashboardTitles[user.role]}</h1>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {dashboardTabs[user.role]?.map(tab => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Theme Toggle and Logout */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg shadow-md transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
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
      <main className={user ? '' : 'max-w-6xl mx-auto px-6 py-12'}>
        {!user ? (
          <>
            {!showAuth && <Hero />}
            {!showAuth && <Features />}
            {showAuth ? <Login onAuth={handleAuth} /> : <Contact />}
          </>
        ) : (
          <>
            {user.role === 'admin' ? (
              <AdminDashboard user={user} activeTab={activeTab} />
            ) : user.role === 'cashier' ? (
              <CashierDashboard user={user} activeTab={activeTab} />
            ) : (
              <ShopOwnerDashboard user={user} activeTab={activeTab} />
            )}
          </>
        )}
      </main>

      {!user && <Footer />}
    </div>
  )
}


