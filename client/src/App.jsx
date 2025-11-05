import React, { useEffect, useState } from 'react'
import Header from './components/Header'
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
    setShopProfileComplete(false) // Reset profile status on logout
    try { localStorage.removeItem('user') } catch (e) {}
  }

  // Tab system for dashboards
  const [activeTab, setActiveTab] = useState(() => {
    if (user && user.role === 'admin') return 'users';
    if (user && user.role === 'shop_owner') return 'profile'; // Start with profile to check completeness
    if (user && user.role === 'cashier') return 'checkout';
    return 'users';
  });

  const [shopProfileComplete, setShopProfileComplete] = useState(false);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

  // Reset activeTab when user changes (role switch/login/logout)
  useEffect(() => {
    if (user && user.role === 'admin') setActiveTab('users');
    else if (user && user.role === 'shop_owner') {
      // Check profile completeness first
      setActiveTab('profile');
      setHasAutoSwitched(false); // Reset auto-switch flag on login
    }
    else if (user && user.role === 'cashier') setActiveTab('checkout');
    else setActiveTab('users');
  }, [user]);

  // Handle tab change with profile check for shop owners
  const handleTabChange = (tabKey) => {
    if (user && user.role === 'shop_owner' && !shopProfileComplete && tabKey !== 'profile') {
      // Don't allow switching away from profile if incomplete
      return;
    }
    setActiveTab(tabKey);
  };

  // Auto-switch to sales tab when shop profile becomes complete (only once)
  useEffect(() => {
    if (user && user.role === 'shop_owner' && shopProfileComplete && !hasAutoSwitched && activeTab === 'profile') {
      setActiveTab('sales');
      setHasAutoSwitched(true);
    }
  }, [shopProfileComplete, user, activeTab, hasAutoSwitched]);

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
      { key: 'sales', label: 'Sales' },
      { key: 'cashiers', label: 'Cashiers' },
      { key: 'products', label: 'Products' },
      { key: 'orders', label: 'Orders' },
      { key: 'customers', label: 'Customers' },
      { key: 'profile', label: 'Shop Profile' },

    ]
  };

  const dashboardTitles = {
    admin: 'Admin Dashboard',
    cashier: 'Cashier Dashboard',
    shop_owner: 'Shop Owner Dashboard'
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

      {/* Sidebar Navigation for Dashboards */}
      {user && (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-xl">
            {/* Brand Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">SaleSync</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {dashboardTabs[user.role]?.map(tab => {
                  const isLocked = user.role === 'shop_owner' && !shopProfileComplete && tab.key !== 'profile';
                  const isActive = activeTab === tab.key;
                  
                  // Icon mapping for each tab
                  const iconMap = {
                    sales: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                    cashiers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
                    products: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
                    orders: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
                    customers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                    profile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
                    checkout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
                    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
                    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  };

                  return (
                    <button
                      key={tab.key}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-white shadow-md' 
                          : isLocked
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => handleTabChange(tab.key)}
                      disabled={isLocked}
                      title={isLocked ? 'Complete shop profile to unlock' : tab.label}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {iconMap[tab.key]}
                      </svg>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {isLocked && <span className="text-xs">🔒</span>}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg shadow-md transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-amber-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {!user && showAuth ? (
              <Login onAuth={handleAuth} onBackToLanding={() => setShowAuth(false)} />
            ) : (
              <>
                {!user ? (
                  <Landing theme={theme} toggleTheme={toggleTheme} onGetStarted={() => setShowAuth(true)} />
                ) : (
                  <>
                    {user.role === 'admin' ? (
                      <AdminDashboard user={user} activeTab={activeTab} />
                    ) : user.role === 'cashier' ? (
                      <CashierDashboard user={user} activeTab={activeTab} />
                    ) : (
                      <ShopOwnerDashboard 
                        user={user} 
                        activeTab={activeTab} 
                        onProfileStatusChange={setShopProfileComplete}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Content when not logged in */}
      {!user && (
        <>
          {showAuth ? (
            <Login onAuth={handleAuth} onBackToLanding={() => setShowAuth(false)} />
          ) : (
            <Landing theme={theme} toggleTheme={toggleTheme} onGetStarted={() => setShowAuth(true)} />
          )}
        </>
      )}
    </div>
  )
}


