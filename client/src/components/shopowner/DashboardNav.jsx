import React from 'react'

export default function DashboardNav({ current, setCurrent, locked }) {
  const items = [
    { key: 'profile', label: 'Shop Profile' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'customers', label: 'Customers' },
    { key: 'cashiers', label: 'Cashiers' },
    { key: 'sales', label: 'Sales' },
    { key: 'landing', label: 'Shop Landing Page' },
  ]

  return (
    <nav className="flex gap-2 bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => { if (!locked || item.key === 'profile') setCurrent(item.key) }}
          className={`px-3 py-2 rounded-md text-sm font-medium ${current === item.key ? 'bg-amber-500 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-slate-700'}`}
          title={locked && item.key !== 'profile' ? 'Complete shop profile to unlock' : item.label}
        >
          {item.label}{' '}
          {locked && item.key !== 'profile' ? <span className="ml-2 text-xs text-gray-400">🔒</span> : null}
        </button>
      ))}
    </nav>
  )
}
