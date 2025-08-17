import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ portfolio, marketData, watchlist }) => {
  // Calculate portfolio metrics
  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.currentPrice), 0);
  const totalCost = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = ((totalGainLoss / totalCost) * 100);

  // Mock performance data
  const performanceData = [
    { date: '1M', value: totalValue * 0.95 },
    { date: '2M', value: totalValue * 0.92 },
    { date: '3M', value: totalValue * 0.98 },
    { date: '4M', value: totalValue * 1.02 },
    { date: '5M', value: totalValue * 0.97 },
    { date: '6M', value: totalValue }
  ];

  // Portfolio allocation data
  const allocationData = portfolio.map(stock => ({
    name: stock.symbol,
    value: stock.shares * stock.currentPrice,
    percentage: ((stock.shares * stock.currentPrice) / totalValue * 100).toFixed(1)
  }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Mock news data
  const news = [
    { title: 'Market Rally Continues as Tech Stocks Surge', time: '2 hours ago', sentiment: 'positive' },
    { title: 'Federal Reserve Maintains Interest Rates', time: '4 hours ago', sentiment: 'neutral' },
    { title: 'Apple Reports Strong Q4 Earnings', time: '6 hours ago', sentiment: 'positive' },
    { title: 'Oil Prices Decline Amid Supply Concerns', time: '8 hours ago', sentiment: 'negative' }
  ];

  // Mock watchlist data with prices
  const watchlistData = [
    { symbol: 'TSLA', price: 245.67, change: 2.34 },
    { symbol: 'AMZN', price: 142.83, change: -1.45 },
    { symbol: 'NVDA', price: 456.78, change: 5.67 }
  ];

  return (
    <div className="dashboard">
      {/* Portfolio Summary */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h2 className="mb-4">Portfolio Overview</h2>
          <div className="portfolio-metrics">
            <div className="metric">
              <span className="metric-label">Total Value</span>
              <span className="metric-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Gain/Loss</span>
              <span className={`metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Holdings</span>
              <span className="metric-value">{portfolio.length} stocks</span>
            </div>
            <div className="metric">
              <span className="metric-label">Cash Available</span>
              <span className="metric-value">$12,450.00</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Market Indices</h2>
          <div className="market-indices">
            <div className="index-item">
              <span className="index-name">S&P 500</span>
              <div className="index-data">
                <span className="index-value">{marketData.sp500.value.toFixed(2)}</span>
                <span className={`index-change ${marketData.sp500.change >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.sp500.change >= 0 ? '+' : ''}{marketData.sp500.change.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="index-item">
              <span className="index-name">NASDAQ</span>
              <div className="index-data">
                <span className="index-value">{marketData.nasdaq.value.toFixed(2)}</span>
                <span className={`index-change ${marketData.nasdaq.change >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.nasdaq.change >= 0 ? '+' : ''}{marketData.nasdaq.change.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="index-item">
              <span className="index-name">Dow Jones</span>
              <div className="index-data">
                <span className="index-value">{marketData.dow.value.toFixed(2)}</span>
                <span className={`index-change ${marketData.dow.change >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.dow.change >= 0 ? '+' : ''}{marketData.dow.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h2 className="mb-4">Portfolio Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
              <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="mb-4">Portfolio Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Heat Map moved to Market Overview */}
      {/* Holdings and Watchlist */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <h2 className="mb-4">Top Holdings</h2>
          <div className="holdings-list">
            {portfolio.map(stock => {
              const value = stock.shares * stock.currentPrice;
              const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.shares;
              const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
              
              return (
                <div key={stock.symbol} className="holding-item">
                  <div className="holding-info">
                    <span className="holding-symbol">{stock.symbol}</span>
                    <span className="holding-shares">{stock.shares} shares</span>
                  </div>
                  <div className="holding-values">
                    <span className="holding-value">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={`holding-change ${gainLoss >= 0 ? 'positive' : 'negative'}`}>
                      {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toFixed(2)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4">Watchlist</h2>
          <div className="watchlist">
            {watchlistData.map(stock => (
              <div key={stock.symbol} className="watchlist-item">
                <span className="watchlist-symbol">{stock.symbol}</span>
                <div className="watchlist-data">
                  <span className="watchlist-price">${stock.price.toFixed(2)}</span>
                  <span className={`watchlist-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market News */}
      <div className="card">
        <h2 className="mb-4">Market News</h2>
        <div className="news-list">
          {news.map((item, index) => (
            <div key={index} className="news-item">
              <div className="news-content">
                <h3 className="news-title">{item.title}</h3>
                <span className="news-time">{item.time}</span>
              </div>
              <span className={`news-sentiment ${item.sentiment}`}>
                {item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
