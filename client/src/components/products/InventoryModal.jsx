import React, { useEffect, useState } from 'react'
import axios from '../../utils/axios'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function InventoryModal({ product, onClose }) {
  const [fullData, setFullData] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rangeDays, setRangeDays] = useState(7) // 7, 30, 365
  const [chartHeight, setChartHeight] = useState(Math.max(220, Math.floor(window.innerHeight * 0.45)))

  useEffect(() => {
    if (!product) return
    // adjust chart height when modal opens / product changes
    const calc = () => setChartHeight(Math.max(220, Math.min(720, Math.floor(window.innerHeight * 0.45))))
    calc()
    window.addEventListener('resize', calc)
    async function fetchHistory() {
      setLoading(true)
      setError('')
      try {
        const API_BASE = 'http://localhost:4000'
        // Expecting backend route: GET /api/products/:id/inventory
        const res = await axios.get(`${API_BASE}/api/products/${product.id}/inventory`)
        // res.data expected: [{ date: '2025-11-01', stock: 12 }, ...]
        const fetched = Array.isArray(res.data) ? res.data : []
        // Normalize entries: ensure date is ISO string and add a short label for X axis
        const normalized = fetched
          .map((row) => {
            // server may send { date, stock } where date is ISO or createdAt
            const dateISO = row.date ? new Date(row.date).toISOString() : new Date().toISOString()
            return {
              ...row,
              date: dateISO,
              dateLabel: new Date(dateISO).toLocaleDateString(),
              stock: typeof row.stock === 'number' ? row.stock : Number(row.resultingStock || row.stock || 0),
            }
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))

        // If backend returns no history but we have a current stock value, show a single-point fallback
        if (normalized.length === 0 && (product.stock !== undefined && product.stock !== null)) {
          const nowISO = new Date().toISOString()
          const fallback = [{ date: nowISO, dateLabel: new Date(nowISO).toLocaleDateString(), stock: product.stock }]
          setFullData(fallback)
          setData(fallback)
        } else {
          setFullData(normalized)
          // apply initial range filter
          setData(normalized.filter(d => new Date(d.date) >= new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)))
        }
      } catch (err) {
        console.error('Inventory fetch error', err)
        setError('Could not load inventory history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
    return () => window.removeEventListener('resize', calc)
  }, [product])

  if (!product) return null

  // Recompute displayed data when fullData or rangeDays change
  useEffect(() => {
    if (!fullData || fullData.length === 0) return
    const since = new Date()
    since.setDate(since.getDate() - rangeDays)
    let filtered = fullData.filter(d => new Date(d.date) >= since)

    // If too many points, aggregate by day to keep chart readable
    if (filtered.length > 200 || rangeDays >= 365) {
      // group by YYYY-MM-DD and take the last entry for the day
      const map = new Map()
      for (const row of filtered) {
        const day = new Date(row.date).toISOString().slice(0, 10)
        const existing = map.get(day)
        if (!existing || new Date(row.date) > new Date(existing.date)) {
          map.set(day, { date: row.date, dateLabel: new Date(row.date).toLocaleDateString(), stock: row.stock, delta: row.delta, reason: row.reason })
        }
      }
      filtered = Array.from(map.values()).sort((a,b) => new Date(a.date) - new Date(b.date))
    }

    setData(filtered)
  }, [fullData, rangeDays])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory History</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{product.productName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-center py-8">Loading inventory history...</div>}
          {error && <div className="text-center text-sm text-red-600">{error}</div>}
          {!loading && !error && (!data || data.length === 0) && (
            <div className="text-center text-sm text-gray-600">No inventory history available for this product.</div>
          )}

          {!loading && data && data.length > 0 && (
            <>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setRangeDays(7)} className={`px-3 py-1 rounded ${rangeDays === 7 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>1W</button>
                <button onClick={() => setRangeDays(30)} className={`px-3 py-1 rounded ${rangeDays === 30 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>1M</button>
                <button onClick={() => setRangeDays(365)} className={`px-3 py-1 rounded ${rangeDays === 365 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>1Y</button>
                <div className="ml-auto text-sm text-gray-500">Showing {data.length} points</div>
              </div>

              <div style={{ width: '100%', height: chartHeight, paddingBottom: 6 }}>
                <ResponsiveContainer>
                  <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="#64748b"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      interval={Math.max(0, Math.floor(data.length / 10))}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(value) => [value, 'Stock']} labelFormatter={(label) => `Date: ${label}`} />
                    <Line type="monotone" dataKey="stock" stroke="#f59e0b" strokeWidth={2} name="Stock" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
