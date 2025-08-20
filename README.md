# 💎 Portfolio Pro - React Edition

A complete, professional stock portfolio management application built with React.js. Features real-time market data simulation, interactive charts, portfolio tracking, and comprehensive market analysis.

## ✨ Features

### 📊 Dashboard
- Portfolio overview with total value, gains/losses, and performance metrics
- Interactive charts showing portfolio performance and allocation
- Market indices tracking (S&P 500, NASDAQ, Dow Jones)
- Top holdings display with real-time updates
- Watchlist monitoring
- Market news feed with sentiment indicators

### 🔍 Stock Search
- Search functionality for major stocks (AAPL, MSFT, GOOGL, TSLA, AMZN, NVDA)
- Detailed stock information including price, volume, market cap, P/E ratio
- Interactive 30-day price charts
- Add stocks to portfolio with custom share count and average price
- Watchlist management
- Popular stocks quick access

### 💼 Portfolio Management
- Complete holdings table with real-time calculations
- Portfolio allocation pie chart
- Performance analysis by individual stocks
- Add/remove holdings functionality
- Diversification insights and recommendations
- Top performers tracking

### 📈 Market Overview
- Real-time market indices with percentage changes
- Sector performance analysis with interactive charts
- Market breadth indicators (advancing vs declining stocks)
- Volatility tracking (VIX simulation)
- Economic indicators dashboard
- Top gainers and losers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/tirupathi/stock-portifolio
   ```

2. **Start the application**
   ```bash
   python3 start_react.py --restart --port 3000
   ```
   
   Or manually:
   ```bash
   npm install
   npm start
   ```

3. **Access the application**
   - Open your browser to `http://localhost:3000`
   - The app will automatically reload when you make changes

## 🛠 Tech Stack

- **Frontend**: React 18.2.0 with modern hooks
- **Charts**: Recharts for interactive visualizations
- **Styling**: Custom CSS with glass morphism effects
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Data**: Simulated real-time market data (no external APIs required)

## 📱 Responsive Design

- Fully responsive layout for desktop, tablet, and mobile
- Optimized navigation for touch devices
- Adaptive charts and tables
- Mobile-first CSS approach

## 🎨 UI/UX Features

- **Glass Morphism Design**: Modern, translucent interface elements
- **Gradient Backgrounds**: Professional purple-blue gradient theme
- **Smooth Animations**: Fade-in effects and hover transitions
- **Color-Coded Data**: Green for gains, red for losses, intuitive indicators
- **Interactive Elements**: Hover effects, clickable components
- **Professional Typography**: Clean, readable font hierarchy

## 📊 Data & Functionality

### Mock Data Includes:
- **6 Major Stocks**: AAPL, MSFT, GOOGL, TSLA, AMZN, NVDA
- **Market Indices**: S&P 500, NASDAQ, Dow Jones with live updates
- **Sector Performance**: 8 major sectors with performance tracking
- **Economic Indicators**: GDP, unemployment, inflation, interest rates
- **Market News**: Simulated news feed with sentiment analysis

### Real-time Updates:
- Market data updates every 30 seconds
- Portfolio values recalculate automatically
- Charts and metrics refresh in real-time
- No external API dependencies

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── Dashboard.js          # Main dashboard component
│   ├── StockSearch.js        # Stock search and details
│   ├── Portfolio.js          # Portfolio management
│   ├── MarketOverview.js     # Market analysis
│   ├── Dashboard.css         # Dashboard styles
│   └── Components.css        # Shared component styles
├── App.js                    # Main app component
├── App.css                   # App-level styles
├── index.js                  # React entry point
└── index.css                 # Global styles
```

### Key Components:
- **App.js**: Main application with state management and navigation
- **Dashboard.js**: Portfolio overview and market summary
- **StockSearch.js**: Stock lookup and analysis tools
- **Portfolio.js**: Holdings management and performance tracking
- **MarketOverview.js**: Comprehensive market analysis

## 🎯 Usage Guide

### Adding Stocks to Portfolio:
1. Go to "Stock Search" tab
2. Search for a stock symbol (e.g., AAPL)
3. Review stock details and charts
4. Enter number of shares and average price
5. Click "Add to Portfolio"

### Managing Watchlist:
1. Search for any stock
2. Click "Add to Watchlist"
3. View watchlist on Dashboard
4. Monitor price changes in real-time

### Viewing Performance:
1. Go to "Portfolio" tab
2. See detailed holdings table
3. Review allocation charts
4. Check top performers
5. Analyze diversification metrics

## 🚀 Performance

- **Fast Loading**: Optimized React components
- **Smooth Animations**: 60fps transitions
- **Efficient Updates**: Smart re-rendering
- **Responsive Charts**: Hardware-accelerated graphics
- **Memory Efficient**: Proper cleanup and optimization

## 🔒 No External Dependencies

- **Self-Contained**: All data is simulated locally
- **No API Keys Required**: Works offline
- **Privacy Focused**: No data sent to external servers
- **Instant Setup**: No configuration needed

## 📈 Future Enhancements

- Real API integration (Yahoo Finance, Alpha Vantage)
- User authentication and data persistence
- Advanced charting with technical indicators
- Portfolio comparison and benchmarking
- Export functionality for reports
- Mobile app version

## 🐛 Troubleshooting

### Common Issues:

**App won't start:**
- Ensure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check port 3000 is available

**Charts not displaying:**
- Refresh the browser
- Check browser console for errors
- Ensure JavaScript is enabled

**Styling issues:**
- Clear browser cache
- Check CSS imports in components
- Verify all style files are present

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a complete, self-contained portfolio management application. Feel free to extend it with additional features or integrate real market data APIs.

---

**Built with ❤️ using React.js**

*Professional portfolio management made simple and beautiful.*
