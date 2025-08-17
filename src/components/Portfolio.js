import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import './Components.css';

const Portfolio = ({ portfolio, setPortfolio }) => {
  // Calculate portfolio metrics
  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.currentPrice), 0);
  const totalCost = portfolio.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? ((totalGainLoss / totalCost) * 100) : 0;

  // Portfolio allocation data for pie chart
  const allocationData = portfolio.map(stock => ({
    name: stock.symbol,
    value: stock.shares * stock.currentPrice,
    percentage: totalValue > 0 ? ((stock.shares * stock.currentPrice) / totalValue * 100).toFixed(1) : 0
  }));

  // Performance data for bar chart
  const performanceData = portfolio.map(stock => {
    const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.shares;
    const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
    return {
      symbol: stock.symbol,
      gainLoss: gainLoss,
      gainLossPercent: gainLossPercent
    };
  });

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  const removeFromPortfolio = (symbol) => {
    setPortfolio(prev => prev.filter(stock => stock.symbol !== symbol));
    toast.success(`Removed ${symbol} from portfolio`);
  };

  const getDiversificationInsight = () => {
    if (portfolio.length === 0) return "No holdings to analyze";
    if (portfolio.length === 1) return "Consider diversifying across multiple stocks";
    if (portfolio.length < 5) return "Good start! Consider adding more stocks for better diversification";
    return "Well diversified portfolio across multiple holdings";
  };

  const getTopPerformer = () => {
    if (portfolio.length === 0) return null;
    return portfolio.reduce((best, current) => {
      const currentGain = ((current.currentPrice - current.avgPrice) / current.avgPrice) * 100;
      const bestGain = ((best.currentPrice - best.avgPrice) / best.avgPrice) * 100;
      return currentGain > bestGain ? current : best;
    });
  };

  const topPerformer = getTopPerformer();

  return (
    <div className="portfolio-container">
      {/* Portfolio Summary */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <h2>Portfolio Summary</h2>
          <div className="summary-metrics">
            <div className="metric-item">
              <span className="metric-label">Total Value</span>
              <span className="metric-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Cost</span>
              <span className="metric-value">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Gain/Loss</span>
              <span className={`metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Holdings</span>
              <span className="metric-value">{portfolio.length} stocks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {portfolio.length > 0 && (
        <div className="portfolio-charts">
          <div className="chart-container">
            <h3>Portfolio Allocation</h3>
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

          <div className="chart-container">
            <h3>Performance by Stock</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Gain/Loss %']} />
                <Bar dataKey="gainLossPercent" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="holdings-section">
        <h3>Holdings</h3>
        {portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <p>No holdings in your portfolio yet.</p>
            <p>Use the Stock Search tab to add stocks to your portfolio.</p>
          </div>
        ) : (
          <div className="holdings-table">
            <div className="table-header">
              <span>Symbol</span>
              <span>Shares</span>
              <span>Avg Price</span>
              <span>Current Price</span>
              <span>Market Value</span>
              <span>Gain/Loss</span>
              <span>Action</span>
            </div>
            {portfolio.map(stock => {
              const marketValue = stock.shares * stock.currentPrice;
              const totalCost = stock.shares * stock.avgPrice;
              const gainLoss = marketValue - totalCost;
              const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

              return (
                <div key={stock.symbol} className="table-row">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span>{stock.shares}</span>
                  <span>${stock.avgPrice.toFixed(2)}</span>
                  <span>${stock.currentPrice.toFixed(2)}</span>
                  <span>${marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className={gainLoss >= 0 ? 'positive' : 'negative'}>
                    ${Math.abs(gainLoss).toFixed(2)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                  </span>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromPortfolio(stock.symbol)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portfolio Insights */}
      {portfolio.length > 0 && (
        <div className="portfolio-insights">
          <h3>Portfolio Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Diversification</h4>
              <p>{getDiversificationInsight()}</p>
            </div>
            {topPerformer && (
              <div className="insight-card">
                <h4>Top Performer</h4>
                <p>
                  {topPerformer.symbol} is your best performing stock with a 
                  {(((topPerformer.currentPrice - topPerformer.avgPrice) / topPerformer.avgPrice) * 100).toFixed(2)}% gain.
                </p>
              </div>
            )}
            <div className="insight-card">
              <h4>Risk Level</h4>
              <p>
                {portfolio.length < 3 ? 'High Risk - Consider more diversification' :
                 portfolio.length < 6 ? 'Medium Risk - Good diversification' :
                 'Low Risk - Well diversified portfolio'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
