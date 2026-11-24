import { useMemo, useState } from 'react'
import { generateSales } from './data'
import type { Category } from './data'
import './index.css'

const ALL_SALES = generateSales(90)
const CATEGORIES: ('All' | Category)[] = ['All', 'Mains', 'Starters', 'Desserts', 'Drinks']
const RANGES = [7, 30, 90]
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type SortKey = 'item' | 'qty' | 'revenue'

function BarChart({ data, label }: { data: { x: string; y: number }[]; label: string }) {
  const w = 640
  const h = 220
  const pad = 28
  const max = Math.max(1, ...data.map((d) => d.y))
  const bw = (w - pad * 2) / data.length
  const step = Math.ceil(data.length / 8)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="chart">
      {data.map((d, i) => {
        const bh = (d.y / max) * (h - pad * 2)
        return (
          <g key={d.x}>
            <rect x={pad + i * bw + 1} y={h - pad - bh} width={Math.max(1, bw - 2)} height={bh} rx="2">
              <title>{`${d.x}: ${money(d.y)}`}</title>
            </rect>
            {i % step === 0 && (
              <text x={pad + i * bw + bw / 2} y={h - 8} textAnchor="middle">
                {d.x.length > 5 ? d.x.slice(5) : d.x}
              </text>
            )}
          </g>
        )
      })}
      <line x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} />
    </svg>
  )
}

export default function App() {
  const [range, setRange] = useState(30)
  const [category, setCategory] = useState<'All' | Category>('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [asc, setAsc] = useState(false)

  const sales = useMemo(() => {
    const dates = [...new Set(ALL_SALES.map((s) => s.date))].sort().slice(-range)
    const from = dates[0]
    return ALL_SALES.filter((s) => s.date >= from && (category === 'All' || s.category === category))
  }, [range, category])

  const stats = useMemo(() => {
    const revenue = sales.reduce((a, s) => a + s.total, 0)
    const orders = sales.length
    const byDay = new Map<string, number>()
    const byHour = new Map<number, number>()
    const byItem = new Map<string, { item: string; qty: number; revenue: number }>()
    for (const s of sales) {
      byDay.set(s.date, (byDay.get(s.date) ?? 0) + s.total)
      byHour.set(s.hour, (byHour.get(s.hour) ?? 0) + s.total)
      const row = byItem.get(s.item) ?? { item: s.item, qty: 0, revenue: 0 }
      row.qty += s.qty
      row.revenue += s.total
      byItem.set(s.item, row)
    }
    const daily = [...byDay].sort().map(([x, y]) => ({ x, y }))
    const hourly = [...byHour].sort((a, b) => a[0] - b[0]).map(([h, y]) => ({ x: `${h}:00`, y }))
    return { revenue, orders, avg: orders ? revenue / orders : 0, daily, hourly, items: [...byItem.values()] }
  }, [sales])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = stats.items.filter((r) => r.item.toLowerCase().includes(q))
    list.sort((a, b) => {
      const r = sortKey === 'item' ? a.item.localeCompare(b.item) : a[sortKey] - b[sortKey]
      return asc ? r : -r
    })
    return list
  }, [stats.items, search, sortKey, asc])

  const sortBy = (k: SortKey) => {
    if (k === sortKey) setAsc(!asc)
    else {
      setSortKey(k)
      setAsc(k === 'item')
    }
  }
  const arrow = (k: SortKey) => (k === sortKey ? (asc ? ' ▲' : ' ▼') : '')

  return (
    <main>
      <header>
        <div>
          <h1>Restaurant Sales Dashboard</h1>
          <p className="muted">Sample data (generated, not real sales). Built with React and TypeScript.</p>
        </div>
        <div className="controls">
          <div className="seg" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button key={r} className={r === range ? 'on' : ''} onClick={() => setRange(r)}>
                {r} days
              </button>
            ))}
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value as 'All' | Category)} aria-label="Category">
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </header>

      <section className="kpis">
        <div className="card"><span>Revenue</span><strong>{money(stats.revenue)}</strong></div>
        <div className="card"><span>Orders</span><strong>{stats.orders.toLocaleString()}</strong></div>
        <div className="card"><span>Average order</span><strong>{money(stats.avg)}</strong></div>
        <div className="card"><span>Best seller</span><strong>{[...stats.items].sort((a, b) => b.qty - a.qty)[0]?.item ?? '-'}</strong></div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Revenue by day</h2>
          <BarChart data={stats.daily} label="Revenue by day" />
        </div>
        <div className="card">
          <h2>Revenue by hour</h2>
          <BarChart data={stats.hourly} label="Revenue by hour" />
        </div>
      </section>

      <section className="card">
        <div className="row">
          <h2>Menu items</h2>
          <input placeholder="Search items" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search items" />
        </div>
        <table>
          <thead>
            <tr>
              <th onClick={() => sortBy('item')}>Item{arrow('item')}</th>
              <th className="num" onClick={() => sortBy('qty')}>Sold{arrow('qty')}</th>
              <th className="num" onClick={() => sortBy('revenue')}>Revenue{arrow('revenue')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td className="num">{r.qty}</td>
                <td className="num">{money(r.revenue)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="muted">No items match.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
