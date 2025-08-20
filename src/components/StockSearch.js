import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Plus, Star, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import stockAPI from '../services/stockAPI';
import AnalystRatings from './AnalystRatings';
import './Components.css';

const TIMEFRAMES = ['1W', '1M', '3M', '6M', '1Y'];

const StockSearch = ({ onAddToPortfolio, onAddToWatchlist, portfolio, watchlist }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState(10);
  const [popularStocks, setPopularStocks] = useState([]);
  const [popularTab, setPopularTab] = useState('All'); // All | Gainers | Losers

  // Enhancements
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [recent, setRecent] = useState([]);
  const [timeframe, setTimeframe] = useState('1M');
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Load popular stocks & recent searches on mount
  useEffect(() => {
    loadPopularStocks();
    try {
      const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      setRecent(Array.isArray(saved) ? saved.slice(0, 8) : []);
    } catch (_) {}
  }, []);

  const loadPopularStocks = async () => {
    try {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA'];
      const quotes = await stockAPI.getMultipleQuotes(symbols);
      // Fetch 1M historical data to estimate 1-day volatility (σ)
      const histories = await Promise.all(symbols.map(s => stockAPI.getHistoricalData(s, '1M').catch(() => [])));
      const withSigma = quotes.map((q, idx) => {
        const hist = histories[idx] || [];
        const prices = hist.map(h => h.price).filter(p => typeof p === 'number' && isFinite(p));
        // Compute daily returns
        const rets = [];
        for (let i = 1; i < prices.length; i++) {
          const prev = prices[i - 1];
          const curr = prices[i];
          if (prev > 0 && isFinite(curr)) {
            rets.push((curr - prev) / prev);
          }
        }
        // Use last 20 returns if available
        const recent = rets.slice(-20);
        let sigma1d = null;
        if (recent.length >= 5) {
          const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
          const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (recent.length - 1);
          sigma1d = Math.sqrt(variance); // as fraction, e.g., 0.02 = 2%
        }
        return { ...q, sigma1d };
      });
      setPopularStocks(withSigma);
      // Auto-select first stock on landing if nothing selected yet
      if (!selectedStock && symbols.length > 0) {
        handleStockSelect(symbols[0]);
      }
    } catch (error) {
      console.error('Failed to load popular stocks:', error);
    }
  };

  // Debounced suggestions while typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setHighlightIndex(-1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await stockAPI.searchStocks(searchQuery.trim());
        setSuggestions(results.slice(0, 15));
        setHighlightIndex(-1);
      } catch (e) {
        // silent fail for suggestions
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const persistRecent = (symbol, name) => {
    const entry = { symbol, name };
    const next = [entry, ...recent.filter(r => r.symbol !== symbol)].slice(0, 8);
    setRecent(next);
    try { localStorage.setItem('recent_searches', JSON.stringify(next)); } catch (_) {}
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await stockAPI.searchStocks(searchQuery.trim());
      setSearchResults(results);
      setSuggestions([]);
      setHighlightIndex(-1);
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorical = async (symbol, tf) => {
    const map = { '1W': '1W', '1M': '1M', '3M': '3M', '6M': '6M', '1Y': '1Y' };
    return stockAPI.getHistoricalData(symbol, map[tf] || '1M');
  };

  const handleStockSelect = async (symbol, name) => {
    setLoading(true);
    try {
      const [quote, historical] = await Promise.all([
        stockAPI.getStockQuote(symbol),
        fetchHistorical(symbol, timeframe)
      ]);
      setSelectedStock(symbol);
      setStockData(quote);
      setHistoricalData(historical);
      if (name) persistRecent(symbol, name);
    } catch (error) {
      toast.error('Failed to load stock data');
      console.error('Stock data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTimeframe = async (tf) => {
    if (!selectedStock) return;
    setTimeframe(tf);
    try {
      const historical = await fetchHistorical(selectedStock, tf);
      setHistoricalData(historical);
    } catch (e) {}
  };

  const handleAddToPortfolio = async () => {
    if (!selectedStock || shares <= 0) {
      toast.error('Please select a stock and enter valid shares');
      return;
    }
    try {
      await onAddToPortfolio(selectedStock, shares);
      toast.success(`Added ${shares} shares of ${selectedStock} to portfolio`);
    } catch (error) {
      toast.error('Failed to add to portfolio');
    }
  };

  const handleAddToWatchlist = () => {
    if (!selectedStock) {
      toast.error('Please select a stock first');
      return;
    }
    onAddToWatchlist(selectedStock);
    toast.success(`Added ${selectedStock} to watchlist`);
  };

  const isInPortfolio = (symbol) => portfolio.some(stock => stock.symbol === symbol);
  const isInWatchlist = (symbol) => watchlist.includes(symbol);

  const onKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      const s = suggestions[highlightIndex];
      setSearchQuery(`${s.symbol}`);
      setSuggestions([]);
      handleStockSelect(s.symbol, s.name);
    }
  };

  return (
    <div className="stock-search">
      {/* Search Section */}
      <div className="search-section">
        <div className="search-header">
          <h2>Stock Search</h2>
          <p>Search and analyze stocks to add to your portfolio</p>
        </div>
        
        <div className="search-bar">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search stocks by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onKeyDown}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button 
              onClick={handleSearch} 
              disabled={loading}
              className="search-button"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="autocomplete">
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.symbol}-${idx}`}
                  className={`autocomplete-item ${idx === highlightIndex ? 'active' : ''}`}
                  onMouseDown={() => handleStockSelect(s.symbol, s.name)}
                >
                  <span className="mono bold">{s.symbol}</span>
                  <span className="muted">{s.name}</span>
                  <span className="muted">{s.type} • {s.region}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent searches */}
        {recent.length > 0 && (
          <div className="recent-row">
            <span className="muted">Recent:</span>
            <div className="recent-chips">
              {recent.map((r) => (
                <button key={r.symbol} className="chip" onClick={() => handleStockSelect(r.symbol, r.name)}>
                  {r.symbol}
                </button>
              ))}
            </div>
            <button className="chip clear" onClick={() => { setRecent([]); localStorage.removeItem('recent_searches'); }}>Clear</button>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results</h3>
            <div className="results-grid">
              {searchResults.map((stock) => (
                <div 
                  key={stock.symbol} 
                  className="result-item"
                  onClick={() => handleStockSelect(stock.symbol, stock.name)}
                >
                  <div className="result-info">
                    <span className="result-symbol">{stock.symbol}</span>
                    <span className="result-name">{stock.name}</span>
                    <span className="result-type">{stock.type} • {stock.region}</span>
                  </div>
                  <div className="result-status">
                    {isInPortfolio(stock.symbol) && <span className="status-badge portfolio">In Portfolio</span>}
                    {isInWatchlist(stock.symbol) && <span className="status-badge watchlist">Watching</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Stocks */}
      <div className="popular-stocks">
        <div className="popular-header-row">
          <h3>Popular Stocks</h3>
          <div className="subtabs">
            {['All', 'Gainers', 'Losers'].map(tab => (
              <button
                key={tab}
                className={`chip subtab ${popularTab === tab ? 'active' : ''}`}
                onClick={() => setPopularTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="popular-table">
          <div className="popular-table-header">
            <span>Symbol</span>
            <span>Price</span>
            <span>Change %</span>
            <span>Change</span>
            <span>Volume</span>
            <span>Open</span>
            <span>High</span>
            <span>Low</span>
            <span>Prev Close</span>
            <span>1D ±1σ</span>
            <span>1W ±1σ</span>
            <span>1M ±1σ</span>
            <span>Status</span>
          </div>
          {(popularTab === 'All' ? popularStocks : popularStocks.filter(s => popularTab === 'Gainers' ? s.changePercent >= 0 : s.changePercent < 0)).map((stock) => {
            const low = Number(stock.low ?? 0);
            const high = Number(stock.high ?? 0);
            const price = Number(stock.price ?? 0);
            const denom = (high - low);
            // ±1σ price ranges from previous close using daily sigma
            const pc = Number(stock.previousClose ?? 0);
            const sigma = (typeof stock.sigma1d === 'number' && isFinite(stock.sigma1d)) ? stock.sigma1d : null;
            let range1D = null, range1W = null, range1M = null;
            if (sigma !== null && pc > 0) {
              const band1D = pc * sigma; // 1 day
              const band1W = pc * sigma * Math.sqrt(5); // approx 5 trading days
              const band1M = pc * sigma * Math.sqrt(21); // approx 21 trading days
              range1D = `$${(pc - band1D).toFixed(2)} - $${(pc + band1D).toFixed(2)}`;
              range1W = `$${(pc - band1W).toFixed(2)} - $${(pc + band1W).toFixed(2)}`;
              range1M = `$${(pc - band1M).toFixed(2)} - $${(pc + band1M).toFixed(2)}`;
            }
            return (
              <div 
                key={stock.symbol}
                className={`popular-table-row ${selectedStock === stock.symbol ? 'active' : ''}`}
                onClick={() => handleStockSelect(stock.symbol)}
              >
                <span className="popular-cell symbol">{stock.symbol}</span>
                <span className="popular-cell price">${price.toFixed(2)}</span>
                <span className={`popular-cell changePct ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
                <span className={`popular-cell changeAmt ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                </span>
                <span className="popular-cell volume">{(stock.volume || 0).toLocaleString()}</span>
                <span className="popular-cell open">${(stock.open ?? 0).toFixed(2)}</span>
                <span className="popular-cell high">${(stock.high ?? 0).toFixed(2)}</span>
                <span className="popular-cell low">${(stock.low ?? 0).toFixed(2)}</span>
                <span className="popular-cell prevClose">${(stock.previousClose ?? 0).toFixed(2)}</span>
                <span className="popular-cell range1d">{range1D ?? '-'}</span>
                <span className="popular-cell range1w">{range1W ?? '-'}</span>
                <span className="popular-cell range1m">{range1M ?? '-'}</span>
                <span className="popular-cell status">{stock.isFallback ? 'Demo' : '-'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Details */}
      {selectedStock && stockData && (
        <div className="stock-details">
          <div className="details-header">
            <div className="stock-info">
              <h2>{selectedStock}</h2>
              <div className="stock-metrics">
                <span className="current-price">${stockData.price.toFixed(2)}</span>
                <span className={`price-change ${stockData.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {stockData.changePercent >= 0 ? '+' : ''}{stockData.change.toFixed(2)} 
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
              {stockData.isFallback && (
                <div className="fallback-notice">
                  <span>⚠️ Using demo data - API unavailable</span>
                </div>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                onClick={handleAddToWatchlist}
                disabled={isInWatchlist(selectedStock)}
                className="btn-secondary"
              >
                <Star size={16} />
                {isInWatchlist(selectedStock) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>

          {/* Timeframe toggle */}
          <div className="timeframe-tabs">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                className={`chip ${tf === timeframe ? 'active' : ''}`}
                onClick={() => handleChangeTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Stock Metrics removed per request; keep only chart below */}
          {/* Price Chart */}
          <div className="price-chart">
            <div className="price-chart-header">
              <h3>Price Chart</h3>
              <span className="muted">{timeframe}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  minTickGap={20}
                  tickFormatter={(value) => {
                    const d = new Date(value);
                    return isNaN(d) ? value : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                  }}
                />
                <YAxis 
                  domain={[
                    (dataMin) => (typeof dataMin === 'number' ? dataMin - 5 : dataMin),
                    (dataMax) => (typeof dataMax === 'number' ? dataMax + 5 : dataMax)
                  ]}
                  tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return isNaN(d) ? `Date: ${label}` : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#5f01d1" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Analyst Recommendations */}
          <div className="analyst-section">
            <div className="price-chart-header" style={{ marginTop: 12 }}>
              <h3>Analyst Recommendations</h3>
              <span className="muted">Mock demo data</span>
            </div>
            <AnalystRatings symbol={selectedStock} />
          </div>

          {/* Add to Portfolio */}
          <div className="add-to-portfolio">
            <h3>Add to Portfolio</h3>
            <div className="portfolio-form">
              <div className="form-group">
                <label>Number of Shares</label>
                <input
                  type="number"
                  min="1"
                  value={shares}
                  onChange={(e) => setShares(parseInt(e.target.value) || 1)}
                  className="shares-input"
                />
              </div>
              <div className="form-group">
                <label>Total Cost</label>
                <span className="total-cost">
                  ${(stockData.price * shares).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button 
                onClick={handleAddToPortfolio}
                disabled={loading}
                className="btn add-btn"
              >
                <Plus size={16} />
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
