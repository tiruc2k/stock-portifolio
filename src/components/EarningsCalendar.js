import React, { useMemo, useState } from 'react';
import './Components.css';

const mockEarnings = [
  { date: '2025-08-18', symbol: 'AAPL', company: 'Apple Inc.', estEPS: 1.42, lastEPS: 1.35, time: 'After Market' },
  { date: '2025-08-18', symbol: 'MSFT', company: 'Microsoft Corp.', estEPS: 2.65, lastEPS: 2.51, time: 'After Market' },
  { date: '2025-08-19', symbol: 'NVDA', company: 'NVIDIA Corp.', estEPS: 3.12, lastEPS: 2.98, time: 'After Market' },
  { date: '2025-08-20', symbol: 'AMZN', company: 'Amazon.com Inc.', estEPS: 0.78, lastEPS: 0.72, time: 'After Market' },
  { date: '2025-08-21', symbol: 'TSLA', company: 'Tesla Inc.', estEPS: 0.92, lastEPS: 0.85, time: 'After Market' },
];

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA'];

export default function EarningsCalendar({ holdingsSymbols = [] }) {
  const allRows = useMemo(() => {
    return [...mockEarnings].sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const dates = useMemo(() => Array.from(new Set(allRows.map(r => r.date))).sort(), [allRows]);
  const [selectedDate, setSelectedDate] = useState(dates[0] || null);
  const [view, setView] = useState('Day'); // Day | Week | Month

  // helpers
  const toYMD = (d) => d.toISOString().slice(0,10);
  const parseYMD = (s) => {
    const [y,m,dd] = s.split('-').map(Number);
    return new Date(y, m - 1, dd);
  };
  const startOfWeekMon = (d) => {
    const day = d.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
    const diff = (day === 0 ? -6 : 1 - day); // move to Monday
    const res = new Date(d);
    res.setDate(d.getDate() + diff);
    res.setHours(0,0,0,0);
    return res;
  };
  const endOfWeekMon = (d) => {
    const start = startOfWeekMon(d);
    const res = new Date(start);
    res.setDate(start.getDate() + 6);
    res.setHours(23,59,59,999);
    return res;
  };
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0,0,0,0);
  const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23,59,59,999);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (!selectedDate) return { rangeStart: null, rangeEnd: null };
    const anchor = parseYMD(selectedDate);
    if (view === 'Week') {
      return { rangeStart: startOfWeekMon(anchor), rangeEnd: endOfWeekMon(anchor) };
    } else if (view === 'Month') {
      return { rangeStart: startOfMonth(anchor), rangeEnd: endOfMonth(anchor) };
    }
    const start = new Date(anchor); start.setHours(0,0,0,0);
    const end = new Date(anchor); end.setHours(23,59,59,999);
    return { rangeStart: start, rangeEnd: end };
  }, [selectedDate, view]);

  const rows = useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    return allRows.filter(r => {
      const d = parseYMD(r.date);
      return d >= rangeStart && d <= rangeEnd;
    });
  }, [allRows, rangeStart, rangeEnd]);
  const holdingsSet = useMemo(() => new Set(holdingsSymbols), [holdingsSymbols]);
  const popularSet = useMemo(() => new Set(POPULAR), []);
  const holdingRows = useMemo(() => rows.filter(r => holdingsSet.has(r.symbol)), [rows, holdingsSet]);
  const popularRows = useMemo(() => rows.filter(r => popularSet.has(r.symbol)), [rows, popularSet]);

  return (
    <div className="section">
      <div className="section-header">
        <h2>📅 Earnings Calendar</h2>
        <span className="muted">Mock data for demo</span>
      </div>

      {/* Controls */}
      <div className="controls" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="muted" htmlFor="earn-date">Anchor Date</label>
          <select id="earn-date" value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value)}>
            {dates.map(d => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Day','Week','Month'].map(v => (
            <button
              key={v}
              className={`filter-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
              type="button"
            >{v}</button>
          ))}
        </div>
        {rangeStart && rangeEnd && (
          <span className="muted">Range: {rangeStart.toLocaleDateString()} — {rangeEnd.toLocaleDateString()}</span>
        )}
      </div>

      {/* Holdings Section */}
      <div className="card glass">
        <div className="card-header">
          <div className="title">Your Holdings — {rangeStart && rangeEnd ? `${rangeStart.toDateString()} — ${rangeEnd.toDateString()}` : ''}</div>
          <div className="tag">{holdingRows.length} {holdingRows.length === 1 ? 'company' : 'companies'}</div>
        </div>
        <div className="table">
          <div className="table-head six">
            <span>Date</span>
            <span>Ticker</span>
            <span>Company</span>
            <span>Est EPS</span>
            <span>Last EPS</span>
            <span>Time</span>
          </div>
          {holdingRows.length === 0 && (
            <div className="table-row"><span className="muted" style={{ gridColumn: '1 / -1' }}>No holdings reporting on this range</span></div>
          )}
          {holdingRows.map((e, idx) => (
            <div key={`hold-${e.symbol}-${idx}`} className="table-row six">
              <span className="mono">{new Date(e.date).toLocaleDateString()}</span>
              <span className="mono bold">{e.symbol}</span>
              <span>{e.company}</span>
              <span>{e.estEPS.toFixed(2)}</span>
              <span className="muted">{e.lastEPS.toFixed(2)}</span>
              <span>{e.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Stocks Section */}
      <div className="card glass" style={{ marginTop: 12 }}>
        <div className="card-header">
          <div className="title">Popular Stocks — {rangeStart && rangeEnd ? `${rangeStart.toDateString()} — ${rangeEnd.toDateString()}` : ''}</div>
          <div className="tag">{popularRows.length} {popularRows.length === 1 ? 'company' : 'companies'}</div>
        </div>
        <div className="table">
          <div className="table-head six">
            <span>Date</span>
            <span>Ticker</span>
            <span>Company</span>
            <span>Est EPS</span>
            <span>Last EPS</span>
            <span>Time</span>
          </div>
          {popularRows.length === 0 && (
            <div className="table-row"><span className="muted" style={{ gridColumn: '1 / -1' }}>No popular stocks reporting on this range</span></div>
          )}
          {popularRows.map((e, idx) => (
            <div key={`pop-${e.symbol}-${idx}`} className="table-row six">
              <span className="mono">{new Date(e.date).toLocaleDateString()}</span>
              <span className="mono bold">{e.symbol}</span>
              <span>{e.company}</span>
              <span>{e.estEPS.toFixed(2)}</span>
              <span className="muted">{e.lastEPS.toFixed(2)}</span>
              <span>{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
