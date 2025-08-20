import React from 'react';
import './Components.css';
import './Dashboard.css';

const mockNews = [
  {
    title: 'Fed Chair hints at data-dependent path into year-end',
    time: '5m ago',
    sentiment: '',
    source: 'Bloomberg',
    url: '#',
    symbols: [] // macro
  },
  {
    title: 'Tech leads market higher as AI names extend gains',
    time: '24m ago',
    sentiment: '',
    source: 'Reuters',
    url: '#',
    symbols: ['AAPL','MSFT','NVDA','GOOGL','META']
  },
  {
    title: 'Crude slips on supply concerns; energy stocks mixed',
    time: '1h ago',
    sentiment: '',
    source: 'WSJ',
    url: '#',
    symbols: ['XOM','CVX']
  },
  {
    title: 'Dollar strengthens; Treasury yields edge up ahead of CPI',
    time: '2h ago',
    sentiment: '',
    source: 'CNBC',
    url: '#',
    symbols: [] // macro
  }
];

export default function News({ portfolio = [], watchlist = [] }) {
  const holdingSet = new Set((portfolio || []).map(p => p.symbol));
  const popularSet = new Set(['AAPL','MSFT','GOOGL','NVDA','AMZN','TSLA','META','NFLX','XOM','CVX']);

  const matchesHoldings = (item) => item.symbols?.some(s => holdingSet.has(s));
  const matchesPopular = (item) => item.symbols?.some(s => popularSet.has(s));

  const holdingsNews = mockNews.filter(n => matchesHoldings(n));
  const popularNews = mockNews.filter(n => !matchesHoldings(n) && matchesPopular(n));
  const restNews = mockNews.filter(n => !matchesHoldings(n) && !matchesPopular(n));

  const List = ({ items }) => (
    <div className="news-list">
      {items.length === 0 && (
        <div className="empty muted" style={{ padding: '8px 12px' }}>No items</div>
      )}
      {items.map((n, i) => (
        <a key={i} className="news-item" href={n.url} target="_blank" rel="noreferrer">
          <div className="news-content">
            <h4 className="news-title">{n.title}</h4>
            <div className="news-time">{n.source} • {n.time}</div>
          </div>
          <div className="news-sentiment" aria-label="sentiment">{n.sentiment}</div>
        </a>
      ))}
    </div>
  );

  return (
    <div className="section">
      <div className="section-header">
        <h2>📰 Market News</h2>
        <span className="muted">Live feed TBD • Mock for demo</span>
      </div>

      <div className="grid two">
        <div className="card glass">
          <div className="card-header">
            <h3>Holdings</h3>
           
          </div>
          <List items={holdingsNews} />
        </div>
        <div className="card glass">
          <div className="card-header">
            <h3>Popular</h3>      
          </div>
          <List items={popularNews} />
        </div>
      </div>

      <div className="card glass" style={{ marginTop: 12 }}>
        <div className="card-header">
          <h3>Other</h3>
        </div>
        <List items={restNews} />
      </div>
    </div>
  );
}
