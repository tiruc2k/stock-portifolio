import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MarketOverview = ({ marketData }) => {
  // Mock sector performance data
  const sectorData = [
    { sector: 'Technology', performance: 2.4, color: '#667eea' },
    { sector: 'Healthcare', performance: 1.8, color: '#764ba2' },
    { sector: 'Finance', performance: -0.5, color: '#f093fb' },
    { sector: 'Energy', performance: -1.2, color: '#f5576c' },
    { sector: 'Consumer', performance: 0.8, color: '#4facfe' },
    { sector: 'Industrial', performance: 1.1, color: '#00f2fe' },
    { sector: 'Materials', performance: -0.3, color: '#ffeaa7' },
    { sector: 'Utilities', performance: 0.4, color: '#fd79a8' }
  ];

  // Mock market breadth data
  const breadthData = [
    { metric: 'Advancing', value: 1847, color: '#10b981' },
    { metric: 'Declining', value: 1253, color: '#ef4444' },
    { metric: 'Unchanged', value: 156, color: '#6b7280' }
  ];

  // Mock volatility data
  const volatilityData = [
    { date: 'Mon', vix: 18.5 },
    { date: 'Tue', vix: 19.2 },
    { date: 'Wed', vix: 17.8 },
    { date: 'Thu', vix: 16.9 },
    { date: 'Fri', vix: 18.1 }
  ];

  // Mock economic indicators
  const economicIndicators = [
    { name: 'GDP Growth', value: '2.1%', trend: 'positive' },
    { name: 'Unemployment', value: '3.7%', trend: 'negative' },
    { name: 'Inflation (CPI)', value: '3.2%', trend: 'neutral' },
    { name: 'Fed Funds Rate', value: '5.25%', trend: 'neutral' },
    { name: '10Y Treasury', value: '4.35%', trend: 'positive' },
    { name: 'Dollar Index', value: '103.45', trend: 'positive' }
  ];

  // Mock market movers
  const topGainers = [
    { symbol: 'NVDA', change: 8.5, price: 456.78 },
    { symbol: 'TSLA', change: 6.2, price: 245.67 },
    { symbol: 'AMD', change: 4.8, price: 112.34 }
  ];

  const topLosers = [
    { symbol: 'META', change: -3.2, price: 298.45 },
    { symbol: 'NFLX', change: -2.8, price: 445.67 },
    { symbol: 'PYPL', change: -2.1, price: 67.89 }
  ];

  return (
    <div className="market-overview">
      {/* Market Indices Summary */}
      <div className="grid grid-3 mb-6">
        <div className="card">
          <div className="index-summary">
            <h3>S&P 500</h3>
            <div className="index-price">{marketData.sp500.value.toFixed(2)}</div>
            <div className={`index-change ${marketData.sp500.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.sp500.change >= 0 ? '+' : ''}{marketData.sp500.change.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="card">
          <div className="index-summary">
            <h3>NASDAQ</h3>
            <div className="index-price">{marketData.nasdaq.value.toFixed(2)}</div>
            <div className={`index-change ${marketData.nasdaq.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.nasdaq.change >= 0 ? '+' : ''}{marketData.nasdaq.change.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="card">
          <div className="index-summary">
            <h3>Dow Jones</h3>
            <div className="index-price">{marketData.dow.value.toFixed(2)}</div>
            <div className={`index-change ${marketData.dow.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.dow.change >= 0 ? '+' : ''}{marketData.dow.change.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Sector Performance and Market Breadth */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h3 className="mb-4">Sector Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="sector" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
              <Bar dataKey="performance" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4">Market Breadth</h3>
          <div className="breadth-container">
            <div className="breadth-chart">
              {breadthData.map((item, index) => (
                <div key={index} className="breadth-item">
                  <div className="breadth-bar" style={{ 
                    width: `${(item.value / 3256) * 100}%`, 
                    backgroundColor: item.color 
                  }}></div>
                  <div className="breadth-label">
                    <span>{item.metric}</span>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="breadth-summary">
              <div className="breadth-ratio">
                <span>Advance/Decline Ratio</span>
                <span className="positive">1.47</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volatility and Economic Indicators */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h3 className="mb-4">Market Volatility (VIX)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volatilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'VIX']} />
              <Line type="monotone" dataKey="vix" stroke="#f5576c" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4">Economic Indicators</h3>
          <div className="economic-indicators">
            {economicIndicators.map((indicator, index) => (
              <div key={index} className="indicator-item">
                <span className="indicator-name">{indicator.name}</span>
                <div className="indicator-data">
                  <span className="indicator-value">{indicator.value}</span>
                  <span className={`indicator-trend ${indicator.trend}`}>
                    {indicator.trend === 'positive' ? '↗️' : indicator.trend === 'negative' ? '↘️' : '➡️'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Movers */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="mb-4">Top Gainers</h3>
          <div className="movers-list">
            {topGainers.map((stock, index) => (
              <div key={index} className="mover-item">
                <span className="mover-symbol">{stock.symbol}</span>
                <div className="mover-data">
                  <span className="mover-price">${stock.price.toFixed(2)}</span>
                  <span className="mover-change positive">+{stock.change.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Top Losers</h3>
          <div className="movers-list">
            {topLosers.map((stock, index) => (
              <div key={index} className="mover-item">
                <span className="mover-symbol">{stock.symbol}</span>
                <div className="mover-data">
                  <span className="mover-price">${stock.price.toFixed(2)}</span>
                  <span className="mover-change negative">{stock.change.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
