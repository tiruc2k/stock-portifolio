import React from 'react';
import './Components.css';

const mockRatings = [
  { date: '2025-08-18', symbol: 'AAPL', firm: 'Goldman Sachs', action: 'Upgrade', from: 'Neutral', to: 'Buy', pt: 260 },
  { date: '2025-08-18', symbol: 'MSFT', firm: 'Morgan Stanley', action: 'Reiterate', from: 'Overweight', to: 'Overweight', pt: 500 },
  { date: '2025-08-19', symbol: 'NVDA', firm: 'UBS', action: 'Upgrade', from: 'Neutral', to: 'Buy', pt: 1400 },
  { date: '2025-08-20', symbol: 'AMZN', firm: 'Barclays', action: 'Downgrade', from: 'Overweight', to: 'Equal Weight', pt: 210 },
  { date: '2025-08-21', symbol: 'TSLA', firm: 'JPMorgan', action: 'Downgrade', from: 'Neutral', to: 'Underweight', pt: 160 },
];

export default function AnalystRatings({ symbol, portfolio = [] }) {
  const holdingSet = new Set((portfolio || []).map(p => p.symbol));
  const popularSet = new Set(['AAPL','MSFT','GOOGL','NVDA','AMZN','TSLA','META','NFLX']);

  const filtered = symbol ? mockRatings.filter(r => r.symbol === symbol) : mockRatings;
  const isDetail = Boolean(symbol);

  const holdingsRows = filtered.filter(r => holdingSet.has(r.symbol));
  const popularRows = filtered.filter(r => !holdingSet.has(r.symbol) && popularSet.has(r.symbol));
  const restRows = filtered.filter(r => !holdingSet.has(r.symbol) && !popularSet.has(r.symbol));

  const Table = ({ rows }) => (
    <div className="table">
      <div className="table-head six">
        <span>Date</span>
        <span>Ticker</span>
        <span>Firm</span>
        <span>Action</span>
        <span>From ➜ To</span>
        <span>Price Target</span>
      </div>
      {rows.length === 0 && (
        <div className="table-row">
          <span className="muted" style={{ gridColumn: '1 / -1' }}>No items</span>
        </div>
      )}
      {rows.map((r, idx) => (
        <div key={idx} className={`table-row six action-${r.action.toLowerCase()}`}>
          <span className="mono">{new Date(r.date).toLocaleDateString()}</span>
          <span className="mono bold">{r.symbol}</span>
          <span>{r.firm}</span>
          <span className={`badge ${r.action.toLowerCase()}`}>{r.action}</span>
          <span>{r.from} ➜ {r.to}</span>
          <span className="mono">${r.pt}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="section">
      {!isDetail && (
        <div className="section-header">
          <h2>⭐ Analyst Ratiing</h2>
          <span className="muted">Mock data for demo</span>
          <div className="section-right">Dow Jones</div>
        </div>
      )}
 
      {isDetail ? (
        <div className="card glass">
          <div className="card-header"><h3>Ratings</h3></div>
          <Table rows={filtered} />
        </div>
      ) : (
        <>
          <div className="grid two">
            <div className="card glass">
              <div className="card-header">
                <h3>Holdings</h3>
              </div>
              <Table rows={holdingsRows} />
            </div>
            <div className="card glass">
              <div className="card-header">
                <h3>Popular</h3>
              </div>
              <Table rows={popularRows} />
            </div>
          </div>
 
          <div className="card glass" style={{ marginTop: 12 }}>
            <div className="card-header">
              <h3>Other</h3>
            </div>
            <Table rows={restRows} />
          </div>
        </>
      )}
    </div>
  );
}
