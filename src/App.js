import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import StockSearch from './components/StockSearch';
import Portfolio from './components/Portfolio';
import MarketOverview from './components/MarketOverview';
import EarningsCalendar from './components/EarningsCalendar';
import EconomicCalendar from './components/EconomicCalendar';
import AnalystRatings from './components/AnalystRatings';
import News from './components/News';
import stockAPI from './services/stockAPI';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [marketData, setMarketData] = useState({
    sp500: { value: 0, change: 0 },
    nasdaq: { value: 0, change: 0 },
    dow: { value: 0, change: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // ETFs selection and history state
  const [selectedETF, setSelectedETF] = useState('SPY');
  const [etfHistory, setEtfHistory] = useState([]);
  const [etfLoading, setEtfLoading] = useState(false);
  const [etfRange, setEtfRange] = useState('10y'); // 'ytd' | '1y' | '3y' | '5y' | '10y'
  const [etfSector, setEtfSector] = useState('All'); // Sector filter
  const [etfQuote, setEtfQuote] = useState(null);
  // ETFs UI state
  const [sectorCollapsed, setSectorCollapsed] = useState({}); // { [sector]: boolean }
  const [etfExpenseSort, setEtfExpenseSort] = useState('none'); // 'none' | 'low' | 'high'

  // Mock popular ETFs data (expense ratios and top holdings)
  const popularETFs = [
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', expenseRatio: 0.0945, holdings: [ { symbol: 'AAPL', weight: 7.0 }, { symbol: 'MSFT', weight: 6.8 }, { symbol: 'NVDA', weight: 6.2 }, { symbol: 'AMZN', weight: 3.1 }, { symbol: 'META', weight: 2.3 } ] },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', expenseRatio: 0.03, holdings: [ { symbol: 'AAPL', weight: 7.0 }, { symbol: 'MSFT', weight: 6.8 }, { symbol: 'NVDA', weight: 6.2 }, { symbol: 'AMZN', weight: 3.1 }, { symbol: 'META', weight: 2.3 } ] },
    { ticker: 'IVV', name: 'iShares Core S&P 500 ETF', expenseRatio: 0.03, holdings: [ { symbol: 'AAPL', weight: 7.0 }, { symbol: 'MSFT', weight: 6.8 }, { symbol: 'NVDA', weight: 6.2 }, { symbol: 'AMZN', weight: 3.1 }, { symbol: 'META', weight: 2.3 } ] },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', expenseRatio: 0.20, holdings: [ { symbol: 'AAPL', weight: 9.0 }, { symbol: 'MSFT', weight: 11.0 }, { symbol: 'NVDA', weight: 7.5 }, { symbol: 'AMZN', weight: 6.5 }, { symbol: 'META', weight: 5.0 } ] },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', expenseRatio: 0.03, holdings: [ { symbol: 'AAPL', weight: 6.8 }, { symbol: 'MSFT', weight: 6.5 }, { symbol: 'NVDA', weight: 5.5 }, { symbol: 'AMZN', weight: 3.0 }, { symbol: 'META', weight: 2.0 } ] },
    { ticker: 'IWM', name: 'iShares Russell 2000 ETF', expenseRatio: 0.19, holdings: [ { symbol: 'SMID1', weight: 0.5 }, { symbol: 'SMID2', weight: 0.5 }, { symbol: 'SMID3', weight: 0.4 }, { symbol: 'SMID4', weight: 0.4 }, { symbol: 'SMID5', weight: 0.4 } ] },
    { ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', expenseRatio: 0.16, holdings: [ { symbol: 'UNH', weight: 9.0 }, { symbol: 'GS', weight: 7.0 }, { symbol: 'HD', weight: 6.0 }, { symbol: 'CAT', weight: 5.0 }, { symbol: 'MSFT', weight: 4.5 } ] },
    { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', expenseRatio: 0.32, holdings: [ { symbol: 'NESN.SW', weight: 2.0 }, { symbol: 'ASML.AS', weight: 2.0 }, { symbol: 'SAP.DE', weight: 1.5 }, { symbol: 'NOVN.SW', weight: 1.4 }, { symbol: 'AZN.L', weight: 1.4 } ] },
    { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF', expenseRatio: 0.70, holdings: [ { symbol: 'TSM', weight: 6.0 }, { symbol: 'TCEHY', weight: 4.0 }, { symbol: 'BABA', weight: 3.5 }, { symbol: 'RELIANCE.NS', weight: 1.5 }, { symbol: 'VALE', weight: 1.4 } ] },
    { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', expenseRatio: 0.05, holdings: [ { symbol: 'NESN.SW', weight: 1.8 }, { symbol: 'ASML.AS', weight: 1.8 }, { symbol: 'SAP.DE', weight: 1.3 }, { symbol: 'NOVN.SW', weight: 1.2 }, { symbol: 'AZN.L', weight: 1.2 } ] },
    { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', expenseRatio: 0.08, holdings: [ { symbol: 'TSM', weight: 6.0 }, { symbol: 'TCEHY', weight: 3.8 }, { symbol: 'BABA', weight: 3.3 }, { symbol: 'RELIANCE.NS', weight: 1.4 }, { symbol: 'MEITUAN', weight: 1.2 } ] },
    { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', expenseRatio: 0.03, holdings: [ { symbol: 'UST', weight: 40.0 }, { symbol: 'MBS', weight: 30.0 }, { symbol: 'IG Credit', weight: 25.0 }, { symbol: 'ABS', weight: 5.0 }, { symbol: 'CMBS', weight: 5.0 } ] },
    { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', expenseRatio: 0.15, holdings: [ { symbol: 'UST 20Y+', weight: 100.0 } ] },
    { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', expenseRatio: 0.14, holdings: [ { symbol: 'IG Credit', weight: 100.0 } ] },
    { ticker: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', expenseRatio: 0.49, holdings: [ { symbol: 'High Yield Credit', weight: 100.0 } ] },
    { ticker: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', expenseRatio: 0.06, holdings: [ { symbol: 'PFE', weight: 4.0 }, { symbol: 'AMGN', weight: 4.0 }, { symbol: 'KO', weight: 4.0 }, { symbol: 'PEP', weight: 4.0 }, { symbol: 'MRK', weight: 4.0 } ] },
    { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', expenseRatio: 0.06, holdings: [ { symbol: 'JNJ', weight: 3.0 }, { symbol: 'JPM', weight: 3.0 }, { symbol: 'XOM', weight: 2.5 }, { symbol: 'PG', weight: 2.5 }, { symbol: 'BAC', weight: 2.0 } ] },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', expenseRatio: 0.75, holdings: [ { symbol: 'TSLA', weight: 10.0 }, { symbol: 'ROKU', weight: 7.0 }, { symbol: 'COIN', weight: 6.0 }, { symbol: 'SQ', weight: 5.0 }, { symbol: 'ZM', weight: 4.0 } ] },
  ];

  // Sector ETFs (Select SPDR sector funds and more)
  const sectorETFs = [
    { ticker: 'XLK', name: 'Technology Select Sector SPDR Fund', sector: 'Technology', expenseRatio: 0.10, holdings: [ { symbol: 'MSFT', weight: 22.0 }, { symbol: 'AAPL', weight: 21.5 }, { symbol: 'NVDA', weight: 6.5 }, { symbol: 'AVGO', weight: 5.8 }, { symbol: 'CRM', weight: 3.5 } ] },
    { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund', sector: 'Financials', expenseRatio: 0.10, holdings: [ { symbol: 'BRK.B', weight: 13.0 }, { symbol: 'JPM', weight: 9.0 }, { symbol: 'V', weight: 8.0 }, { symbol: 'MA', weight: 7.0 }, { symbol: 'BAC', weight: 6.0 } ] },
    { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund', sector: 'Health Care', expenseRatio: 0.10, holdings: [ { symbol: 'LLY', weight: 11.0 }, { symbol: 'UNH', weight: 10.0 }, { symbol: 'JNJ', weight: 9.0 }, { symbol: 'MRK', weight: 7.0 }, { symbol: 'ABBV', weight: 6.0 } ] },
    { ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', sector: 'Energy', expenseRatio: 0.10, holdings: [ { symbol: 'XOM', weight: 23.0 }, { symbol: 'CVX', weight: 19.0 }, { symbol: 'COP', weight: 8.0 }, { symbol: 'EOG', weight: 4.0 }, { symbol: 'SLB', weight: 4.0 } ] },
    { ticker: 'XLI', name: 'Industrial Select Sector SPDR Fund', sector: 'Industrials', expenseRatio: 0.10, holdings: [ { symbol: 'HON', weight: 5.0 }, { symbol: 'UPS', weight: 4.0 }, { symbol: 'RTX', weight: 4.0 }, { symbol: 'BA', weight: 4.0 }, { symbol: 'CAT', weight: 3.5 } ] },
    { ticker: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', sector: 'Consumer Discretionary', expenseRatio: 0.10, holdings: [ { symbol: 'AMZN', weight: 23.0 }, { symbol: 'TSLA', weight: 18.0 }, { symbol: 'HD', weight: 7.0 }, { symbol: 'MCD', weight: 5.0 }, { symbol: 'NKE', weight: 3.0 } ] },
    { ticker: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', sector: 'Consumer Staples', expenseRatio: 0.10, holdings: [ { symbol: 'PG', weight: 12.0 }, { symbol: 'COST', weight: 10.0 }, { symbol: 'PEP', weight: 9.0 }, { symbol: 'KO', weight: 9.0 }, { symbol: 'WMT', weight: 7.0 } ] },
    { ticker: 'XLB', name: 'Materials Select Sector SPDR Fund', sector: 'Materials', expenseRatio: 0.10, holdings: [ { symbol: 'LIN', weight: 16.0 }, { symbol: 'APD', weight: 6.0 }, { symbol: 'SHW', weight: 5.0 }, { symbol: 'ECL', weight: 4.0 }, { symbol: 'FCX', weight: 4.0 } ] },
    { ticker: 'XLU', name: 'Utilities Select Sector SPDR Fund', sector: 'Utilities', expenseRatio: 0.10, holdings: [ { symbol: 'NEE', weight: 13.0 }, { symbol: 'DUK', weight: 7.0 }, { symbol: 'SO', weight: 7.0 }, { symbol: 'SRE', weight: 4.0 }, { symbol: 'AEP', weight: 4.0 } ] },
    { ticker: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', sector: 'Real Estate', expenseRatio: 0.10, holdings: [ { symbol: 'AMT', weight: 9.0 }, { symbol: 'PLD', weight: 8.0 }, { symbol: 'EQIX', weight: 7.0 }, { symbol: 'CCI', weight: 5.0 }, { symbol: 'DLR', weight: 4.0 } ] },
    { ticker: 'XLC', name: 'Communication Services Select Sector SPDR Fund', sector: 'Communication Services', expenseRatio: 0.10, holdings: [ { symbol: 'GOOGL', weight: 24.0 }, { symbol: 'META', weight: 22.0 }, { symbol: 'NFLX', weight: 4.0 }, { symbol: 'VZ', weight: 3.5 }, { symbol: 'TMUS', weight: 3.5 } ] },
  ];

  const sectorFilters = ['All','Broad Market','Technology','Financials','Health Care','Energy','Industrials','Consumer Discretionary','Consumer Staples','Materials','Utilities','Real Estate','Communication Services'];

  const combinedETFs = [...popularETFs.map(e => ({...e, sector: e.sector || 'Broad Market'})), ...sectorETFs];
  const displayedETFs = combinedETFs
    .filter(e => etfSector === 'All' ? true : e.sector === etfSector)
    .sort((a, b) => {
      if (etfExpenseSort === 'low') return a.expenseRatio - b.expenseRatio;
      if (etfExpenseSort === 'high') return b.expenseRatio - a.expenseRatio;
      return 0;
    });

  // Group displayed ETFs by sector for rendering
  const groupedBySector = displayedETFs.reduce((acc, etf) => {
    const key = etf.sector || 'Broad Market';
    if (!acc[key]) acc[key] = [];
    acc[key].push(etf);
    return acc;
  }, {});

  const sectorOrder = Object.keys(groupedBySector).sort();

  // Ensure an ETF is always selected: if current selection not in view, select first of displayed
  useEffect(() => {
    if (!displayedETFs || displayedETFs.length === 0) return;
    const exists = displayedETFs.some(e => e.ticker === selectedETF);
    if (!selectedETF || !exists) {
      setSelectedETF(displayedETFs[0].ticker);
    }
  }, [displayedETFs.length, etfSector, etfExpenseSort, selectedETF]);

  // Initialize app with real data
  useEffect(() => {
    initializeApp();
    
    // Update data every 1 minute
    const interval = setInterval(() => {
      updateMarketData();
      updatePortfolioData();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch history when ETF selection or range changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedETF) return;
      setEtfLoading(true);
      try {
        const data = await stockAPI.getHistoricalData(selectedETF, etfRange);
        setEtfHistory(data);
      } catch (e) {
        setEtfHistory([]);
      } finally {
        setEtfLoading(false);
      }
    };
    loadHistory();
  }, [selectedETF, etfRange]);

  // Fetch current quote for selected ETF
  useEffect(() => {
    let isMounted = true;
    const loadQuote = async () => {
      if (!selectedETF) return;
      try {
        const q = await stockAPI.getStockQuote(selectedETF);
        if (isMounted) setEtfQuote(q);
      } catch (e) {
        if (isMounted) setEtfQuote(null);
      }
    };
    loadQuote();
    return () => { isMounted = false; };
  }, [selectedETF]);

  // Update portfolio data when portfolio changes
  useEffect(() => {
    if (portfolio.length > 0) {
      updatePortfolioData();
    }
  }, [portfolio.length]);

  const initializeApp = async () => {
    setLoading(true);
    try {
      // Restore persisted ETF selections
      const savedETF = localStorage.getItem('selectedETF');
      if (savedETF) setSelectedETF(savedETF);
      const savedETFSector = localStorage.getItem('etfSector');
      if (savedETFSector) setEtfSector(savedETFSector);
      // Load initial market data
      await updateMarketData();
      
      // Load sample portfolio if none exists
      const savedPortfolio = localStorage.getItem('portfolio');
      if (savedPortfolio) {
        const parsedPortfolio = JSON.parse(savedPortfolio);
        setPortfolio(parsedPortfolio);
      } else {
        // Create sample portfolio with real data
        await createSamplePortfolio();
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSamplePortfolio = async () => {
    try {
      const sampleStocks = ['AAPL', 'MSFT', 'GOOGL'];
      const quotes = await stockAPI.getMultipleQuotes(sampleStocks);
      
      const samplePortfolio = quotes.map((quote, index) => ({
        symbol: quote.symbol,
        shares: [100, 50, 25][index], // Different share amounts
        avgPrice: quote.price * 0.9, // Simulate purchase at 10% lower price
        currentPrice: quote.price,
        addedDate: new Date().toISOString()
      }));
      
      setPortfolio(samplePortfolio);
      localStorage.setItem('portfolio', JSON.stringify(samplePortfolio));
    } catch (error) {
      console.error('Failed to create sample portfolio:', error);
    }
  };

  const updateMarketData = async () => {
    try {
      const indices = await stockAPI.getMarketIndices();
      
      const newMarketData = {
        sp500: { 
          value: indices.find(i => i.name === 'S&P 500')?.value || 0,
          change: indices.find(i => i.name === 'S&P 500')?.change || 0
        },
        nasdaq: { 
          value: indices.find(i => i.name === 'NASDAQ')?.value || 0,
          change: indices.find(i => i.name === 'NASDAQ')?.change || 0
        },
        dow: { 
          value: indices.find(i => i.name === 'Dow Jones')?.value || 0,
          change: indices.find(i => i.name === 'Dow Jones')?.change || 0
        }
      };
      
      setMarketData(newMarketData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update market data:', error);
    }
  };

  const updatePortfolioData = async () => {
    if (portfolio.length === 0) return;
    
    try {
      const symbols = portfolio.map(stock => stock.symbol);
      const quotes = await stockAPI.getMultipleQuotes(symbols);
      
      const updatedPortfolio = portfolio.map(stock => {
        const quote = quotes.find(q => q.symbol === stock.symbol);
        return {
          ...stock,
          currentPrice: quote ? quote.price : stock.currentPrice
        };
      });
      
      setPortfolio(updatedPortfolio);
      localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error('Failed to update portfolio data:', error);
    }
  };

  const addToPortfolio = async (symbol, shares = 10) => {
    try {
      const quote = await stockAPI.getStockQuote(symbol);
      
      const existingStock = portfolio.find(stock => stock.symbol === symbol);
      
      if (existingStock) {
        // Update existing holding
        const totalShares = existingStock.shares + shares;
        const totalCost = (existingStock.shares * existingStock.avgPrice) + (shares * quote.price);
        const newAvgPrice = totalCost / totalShares;
        
        const updatedPortfolio = portfolio.map(stock =>
          stock.symbol === symbol
            ? { ...stock, shares: totalShares, avgPrice: newAvgPrice, currentPrice: quote.price }
            : stock
        );
        
        setPortfolio(updatedPortfolio);
        localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
      } else {
        // Add new holding
        const newStock = {
          symbol,
          shares,
          avgPrice: quote.price,
          currentPrice: quote.price,
          addedDate: new Date().toISOString()
        };
        
        const updatedPortfolio = [...portfolio, newStock];
        setPortfolio(updatedPortfolio);
        localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
      }
    } catch (error) {
      console.error('Failed to add to portfolio:', error);
      throw error;
    }
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      const updatedWatchlist = [...watchlist, symbol];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    }
  };

  const removeFromWatchlist = (symbol) => {
    const updatedWatchlist = watchlist.filter(s => s !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  // Persist user selections for convenience
  useEffect(() => {
    if (selectedETF) localStorage.setItem('selectedETF', selectedETF);
  }, [selectedETF]);
  useEffect(() => {
    if (etfSector) localStorage.setItem('etfSector', etfSector);
  }, [etfSector]);

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Portfolio Pro</h2>
          <p>Fetching real-time market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster position="top-right" />
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Portfolio Pro</h1>
            <span className="tagline">Real-time Stock Portfolio Management</span>
          </div>
          <div className="market-ticker">
            <div className="ticker-item">
              <span className="ticker-label">S&P 500</span>
              <span className="ticker-value">{marketData.sp500.value.toFixed(2)}</span>
              <span className={`ticker-change ${marketData.sp500.change >= 0 ? 'positive' : 'negative'}`}>
                {marketData.sp500.change >= 0 ? '+' : ''}{marketData.sp500.change.toFixed(2)}%
              </span>
            </div>
            <div className="ticker-item">
              <span className="ticker-label">NASDAQ</span>
              <span className="ticker-value">{marketData.nasdaq.value.toFixed(2)}</span>
              <span className={`ticker-change ${marketData.nasdaq.change >= 0 ? 'positive' : 'negative'}`}>
                {marketData.nasdaq.change >= 0 ? '+' : ''}{marketData.nasdaq.change.toFixed(2)}%
              </span>
            </div>
            <div className="ticker-item">
              <span className="ticker-label">Dow Jones</span>
              <span className="ticker-value">{marketData.dow.value.toFixed(2)}</span>
              <span className={`ticker-change ${marketData.dow.change >= 0 ? 'positive' : 'negative'}`}>
                {marketData.dow.change >= 0 ? '+' : ''}{marketData.dow.change.toFixed(2)}%
              </span>
            </div>
            <div className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <div 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="tab-icon">📊</div>
              <div className="tab-content">
                <span className="tab-title">Dashboard</span>
                <span className="tab-subtitle">Overview & Analytics</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <div className="tab-icon">🔍</div>
              <div className="tab-content">
                <span className="tab-title">Stock Search</span>
                <span className="tab-subtitle">Find & Analyze Stocks</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <div className="tab-icon">💼</div>
              <div className="tab-content">
                <span className="tab-title">Portfolio</span>
                <span className="tab-subtitle">{portfolio.length} Holdings</span>
              </div>
              {portfolio.length > 0 && <div className="tab-badge">{portfolio.length}</div>}
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveTab('market')}
            >
              <div className="tab-icon">📈</div>
              <div className="tab-content">
                <span className="tab-title">Market Overview</span>
                <span className="tab-subtitle">Indices & Trends</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'etfs' ? 'active' : ''}`}
              onClick={() => setActiveTab('etfs')}
            >
              <div className="tab-icon">🧺</div>
              <div className="tab-content">
                <span className="tab-title">ETFs</span>
                <span className="tab-subtitle">Funds & Tracking</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <div className="tab-icon">📅</div>
              <div className="tab-content">
                <span className="tab-title">Earnings</span>
                <span className="tab-subtitle">Upcoming Reports</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'economic' ? 'active' : ''}`}
              onClick={() => setActiveTab('economic')}
            >
              <div className="tab-icon">🗓️</div>
              <div className="tab-content">
                <span className="tab-title">Economic</span>
                <span className="tab-subtitle">Macro Events</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'analyst' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyst')}
            >
              <div className="tab-icon">⭐</div>
              <div className="tab-content">
                <span className="tab-title">Analyst Rating</span>
                <span className="tab-subtitle">Upgrades/Downgrades</span>
              </div>
            </div>
            
            <div 
              className={`nav-tab ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <div className="tab-icon">📰</div>
              <div className="tab-content">
                <span className="tab-title">News</span>
                <span className="tab-subtitle">Market Headlines</span>
              </div>
            </div>
          </div>
          
          <div className="nav-indicator">
            {/* optional moving indicator; can be disabled if undesired for many tabs */}
          </div>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard 
            portfolio={portfolio} 
            marketData={marketData} 
            watchlist={watchlist}
            onRefresh={updateMarketData}
          />
        )}
        {activeTab === 'search' && (
          <StockSearch 
            onAddToPortfolio={addToPortfolio}
            onAddToWatchlist={addToWatchlist}
            portfolio={portfolio}
            watchlist={watchlist}
          />
        )}
        {activeTab === 'portfolio' && (
          <Portfolio 
            portfolio={portfolio} 
            setPortfolio={setPortfolio}
            onRefresh={updatePortfolioData}
          />
        )}
        {activeTab === 'market' && (
          <MarketOverview 
            marketData={marketData}
            onRefresh={updateMarketData}
          />
        )}
        {activeTab === 'etfs' && (
          <section className="etf-section">
            <div className="section-header">
              <h2>Popular ETFs</h2>
              <span className="section-subtitle">Select an ETF to view performance</span>
            </div>
            <div className="etf-filters">
              {sectorFilters.map(sf => (
                <button
                  key={sf}
                  className={`filter-btn ${etfSector === sf ? 'active' : ''}`}
                  onClick={() => setEtfSector(sf)}
                >
                  {sf}
                </button>
              ))}
              <div className="etf-quick-actions">
                <button
                  className={`filter-btn ${etfExpenseSort === 'low' ? 'active' : ''}`}
                  onClick={() => setEtfExpenseSort(etfExpenseSort === 'low' ? 'none' : 'low')}
                  title="Sort by lowest expense ratio"
                >
                  Lowest expense
                </button>
                <button
                  className={`filter-btn ${etfExpenseSort === 'high' ? 'active' : ''}`}
                  onClick={() => setEtfExpenseSort(etfExpenseSort === 'high' ? 'none' : 'high')}
                  title="Sort by highest expense ratio"
                >
                  Highest expense
                </button>
                <button
                  className="filter-btn"
                  onClick={() => {
                    const next = {};
                    sectorOrder.forEach(s => { next[s] = false; });
                    setSectorCollapsed(next);
                  }}
                  title="Expand all sectors"
                >
                  Expand All
                </button>
                <button
                  className="filter-btn"
                  onClick={() => {
                    const next = {};
                    sectorOrder.forEach(s => { next[s] = true; });
                    setSectorCollapsed(next);
                  }}
                  title="Collapse all sectors"
                >
                  Collapse All
                </button>
              </div>
            </div>
            <div className="etf-layout">
              <div className="etf-list">
                {sectorOrder.map(sector => (
                  <div key={sector} className="etf-sector-group">
                    <div
                      className="etf-sector-header"
                      onClick={() => setSectorCollapsed(prev => ({ ...prev, [sector]: !prev[sector] }))}
                    >
                      <span className="sector-name">{sector}</span>
                      <span className="sector-meta">{groupedBySector[sector].length} ETFs • {etfExpenseSort === 'low' ? 'Lowest expense' : etfExpenseSort === 'high' ? 'Highest expense' : 'Default order'}</span>
                      <span className="sector-toggle">{sectorCollapsed[sector] ? '▶' : '▼'}</span>
                    </div>
                    {!sectorCollapsed[sector] && (
                      <table className="etf-table">
                        <thead>
                          <tr>
                            <th style={{width:'90px'}}>Ticker</th>
                            <th>Name</th>
                            <th style={{textAlign:'right', width:'110px'}}>Expense</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedBySector[sector].map((etf) => (
                            <tr
                              key={etf.ticker}
                              className={`etf-table-row ${selectedETF === etf.ticker ? 'active' : ''}`}
                              onClick={() => setSelectedETF(etf.ticker)}
                              style={{cursor:'pointer'}}
                            >
                              <td className="etf-row-ticker">{etf.ticker}</td>
                              <td className="etf-row-name">{etf.name}</td>
                              <td className="etf-row-expense" style={{textAlign:'right'}}>{etf.expenseRatio.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
              <div className="etf-detail">
                {(() => {
                  const etf = [...combinedETFs].find(e => e.ticker === selectedETF);
                  if (!etf) return <div className="empty">Select an ETF</div>;
                  const computeMetrics = (series) => {
                    if (!series || series.length < 2) return { totalReturn: 0, cagr: 0 };
                    const first = series[0].price;
                    const last = series[series.length - 1].price;
                    const totalReturn = ((last / first) - 1) * 100;
                    const parse = (d) => new Date(d);
                    const years = Math.max(1/365, (parse(series[series.length - 1].date) - parse(series[0].date)) / (365.25 * 24 * 3600 * 1000));
                    const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;
                    return { totalReturn, cagr };
                  };
                  const { totalReturn, cagr } = computeMetrics(etfHistory);
                  return (
                    <div className="etf-detail-card">
                      <div className="etf-detail-header">
                        <div className="title">
                          <span className="ticker">{etf.ticker}</span>
                          <span className="name">{etf.name}</span>
                        </div>
                        <div className="meta">
                          {etfQuote && (
                            <span className="price">
                              ${etfQuote.price?.toFixed(2)}
                              <span className={`change ${etfQuote.change >= 0 ? 'positive' : 'negative'}`}> {etfQuote.change >= 0 ? '+' : ''}{etfQuote.change?.toFixed(2)} ({etfQuote.changePercent?.toFixed(2)}%)</span>
                            </span>
                          )}
                           <span className="label">Expense Ratio</span>
                           <span className="value">{etf.expenseRatio.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="etf-timeframes">
                        {['ytd','1y','3y','5y','10y'].map(tf => (
                          <button
                            key={tf}
                            className={`timeframe-btn ${etfRange === tf ? 'active' : ''}`}
                            onClick={() => setEtfRange(tf)}
                          >
                            {tf.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className="etf-chart">
                        {etfLoading ? (
                          <div className="chart-loading">Loading chart…</div>
                        ) : etfHistory.length === 0 ? (
                          <div className="chart-empty">No historical data available.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={etfHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                                domain={['auto', 'auto']} 
                                tick={{ fontSize: 12 }} 
                                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                              />
                              <Tooltip 
                                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Price']}
                                labelFormatter={(label) => {
                                  const d = new Date(label);
                                  return isNaN(d) ? `Date: ${label}` : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                                }}
                              />
                              <Line type="monotone" dataKey="price" stroke="#667eea" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <div className="etf-metrics">
                        <div className="metric">
                          <div className="label">Total Return</div>
                          <div className={`value ${totalReturn >= 0 ? 'positive' : 'negative'}`}>{totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%</div>
                        </div>
                        <div className="metric">
                          <div className="label">CAGR</div>
                          <div className={`value ${cagr >= 0 ? 'positive' : 'negative'}`}>{cagr >= 0 ? '+' : ''}{cagr.toFixed(2)}%</div>
                        </div>
                      </div>
                      <div className="etf-holdings">
                        <div className="holdings-title">Top Holdings</div>
                        <ul className="holdings-list">
                          {etf.holdings.map(h => (
                            <li key={h.symbol} className="holding-item">
                              <span className="holding-symbol">{h.symbol}</span>
                              <span className="holding-weight">{h.weight.toFixed(1)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        )}
        {activeTab === 'earnings' && (
          <EarningsCalendar />
        )}
        {activeTab === 'economic' && (
          <EconomicCalendar />
        )}
        {activeTab === 'analyst' && (
          <AnalystRatings portfolio={portfolio} />
        )}
        {activeTab === 'news' && (
          <News portfolio={portfolio} watchlist={watchlist} />
        )}
      </main>
    </div>
  );
}

export default App;
