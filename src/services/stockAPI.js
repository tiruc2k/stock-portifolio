// Stock API Service for real-time data
const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'J7270QVT64H7QKQW';
const BASE_URL = 'https://www.alphavantage.co/query';

// Alternative free APIs as fallbacks
const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY || 'd2fp7opr01qkv5ne8hi0d2fp7opr01qkv5ne8hig';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class StockAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Check if cached data is still valid
  isCacheValid(symbol) {
    const cached = this.cache.get(symbol);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  getCachedData(symbol) {
    return this.cache.get(symbol)?.data;
  }

  // Cache data
  setCachedData(symbol, data) {
    this.cache.set(symbol, {
      data,
      timestamp: Date.now()
    });
  }

  // Alpha Vantage API - Get real-time quote
  async getQuoteAlphaVantage(symbol) {
    try {
      const response = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        throw new Error('API limit reached or invalid symbol');
      }

      const quote = data['Global Quote'];
      if (!quote) throw new Error('No data available');

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      };
    } catch (error) {
      console.error(`Alpha Vantage API error for ${symbol}:`, error);
      throw error;
    }
  }

  // Finnhub API - Alternative source
  async getQuoteFinnhub(symbol) {
    try {
      const response = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        symbol: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: 0, // Not provided by this endpoint
        previousClose: data.pc,
        open: data.o,
        high: data.h,
        low: data.l
      };
    } catch (error) {
      console.error(`Finnhub API error for ${symbol}:`, error);
      throw error;
    }
  }

  // Yahoo Finance Alternative (via proxy)
  async getQuoteYahoo(symbol) {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
      );
      const data = await response.json();

      if (data.chart.error) {
        throw new Error(data.chart.error.description);
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        symbol: meta.symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume,
        previousClose: meta.previousClose,
        open: quote.open[quote.open.length - 1],
        high: meta.regularMarketDayHigh,
        low: meta.regularMarketDayLow
      };
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error);
      throw error;
    }
  }

  // Main method to get stock quote with fallbacks
  async getStockQuote(symbol, options = {}) {
    const { noCache = false } = options;
    // Check cache first
    if (!noCache && this.isCacheValid(symbol)) {
      return this.getCachedData(symbol);
    }

    // Prefer Finnhub first (more CORS friendly), then Yahoo, then Alpha Vantage
    const apis = [
      () => this.getQuoteFinnhub(symbol),
      () => this.getQuoteYahoo(symbol),
      () => this.getQuoteAlphaVantage(symbol)
    ];

    for (const apiCall of apis) {
      try {
        const data = await apiCall();
        this.setCachedData(symbol, data);
        return data;
      } catch (error) {
        console.warn(`API call failed, trying next...`);
        continue;
      }
    }

    // If all APIs fail, return mock data as fallback
    console.warn(`All APIs failed for ${symbol}, using fallback data`);
    return this.getFallbackData(symbol);
  }

  // Get multiple stock quotes
  async getMultipleQuotes(symbols) {
    const promises = symbols.map(symbol => 
      this.getStockQuote(symbol).catch(error => ({
        symbol,
        error: error.message,
        ...this.getFallbackData(symbol)
      }))
    );

    return Promise.all(promises);
  }

  // Get historical data for charts
  async getHistoricalData(symbol, period = '1M') {
    try {
      // Normalize common periods to Yahoo ranges/intervals
      const normalizePeriod = (p) => {
        const v = String(p || '').toLowerCase();
        // Default
        let range = '1mo';
        let interval = '1d';
        if (v === '1w' || v === '1wk' || v === 'week') { range = '5d'; interval = '1d'; }
        else if (v === '1m' || v === '1mo' || v === '1month') { range = '1mo'; interval = '1d'; }
        else if (v === '3m' || v === '3mo') { range = '3mo'; interval = '1d'; }
        else if (v === '6m' || v === '6mo') { range = '6mo'; interval = '1d'; }
        else if (v === '1y' || v === '12m' || v === '1yr') { range = '1y'; interval = '1d'; }
        else if (v === 'ytd') { range = 'ytd'; interval = '1d'; }
        else if (v === '3y' || v === '3yr') { range = '3y'; interval = '1wk'; }
        else if (v === '5y' || v === '5yr') { range = '5y'; interval = '1mo'; }
        else if (v === '10y' || v === '10yr') { range = '10y'; interval = '1mo'; }
        return { range, interval };
      };
      const { range, interval } = normalizePeriod(period);
      const bust = Date.now();

      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}&_=${bust}`
      );
      const data = await response.json();

      if (data.chart?.error) {
        throw new Error(data.chart.error.description);
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;

      let series = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toLocaleDateString(),
        price: prices[index] || 0
      })).filter(item => item.price > 0);

      // Append today's live price if API data hasn't included today yet
      try {
        const today = new Date().toLocaleDateString();
        if (!series.length || series[series.length - 1].date !== today) {
          const live = await this.getStockQuote(symbol, { noCache: true });
          if (live && typeof live.price === 'number' && isFinite(live.price)) {
            series = [...series, { date: today, price: live.price }];
          }
        }
      } catch (_) {}

      return series;

    } catch (error) {
      console.warn(`Yahoo historical failed for ${symbol} (${period}). Trying Finnhub...`, error);
      // Finnhub fallback: /stock/candle with resolution and from/to
      try {
        const now = Math.floor(Date.now() / 1000);
        const to = now;
        const lower = String(period || '').toLowerCase();
        const computeFromAndRes = (p) => {
          let from = to - 30 * 24 * 3600; // default 30d
          let resolution = 'D';
          if (p === '1w' || p === '1wk' || p === 'week') { from = to - 7 * 24 * 3600; resolution = 'D'; }
          else if (p === '1m' || p === '1mo' || p === '1month') { from = to - 30 * 24 * 3600; resolution = 'D'; }
          else if (p === '3m' || p === '3mo') { from = to - 90 * 24 * 3600; resolution = 'D'; }
          else if (p === '6m' || p === '6mo') { from = to - 180 * 24 * 3600; resolution = 'D'; }
          else if (p === '1y' || p === '12m' || p === '1yr') { from = to - 365 * 24 * 3600; resolution = 'D'; }
          else if (p === 'ytd') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime() / 1000;
            from = Math.floor(startOfYear);
            resolution = 'D';
          }
          else if (p === '3y' || p === '3yr') { from = to - 3 * 365 * 24 * 3600; resolution = 'W'; }
          else if (p === '5y' || p === '5yr') { from = to - 5 * 365 * 24 * 3600; resolution = 'M'; }
          else if (p === '10y' || p === '10yr') { from = to - 10 * 365 * 24 * 3600; resolution = 'M'; }
          return { from, resolution };
        };
        const { from, resolution } = computeFromAndRes(lower);
        const bust2 = Date.now();

        const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}&_=${bust2}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.s !== 'ok' || !Array.isArray(json.t) || !Array.isArray(json.c)) {
          throw new Error(`Finnhub candle error: ${json.s || 'unknown'}`);
        }
        let series = json.t.map((ts, i) => ({
          date: new Date(ts * 1000).toLocaleDateString(),
          price: json.c[i] ?? 0
        })).filter(pt => pt.price > 0);
        // Append live price if today's candle is missing
        try {
          const today = new Date().toLocaleDateString();
          if (!series.length || series[series.length - 1].date !== today) {
            const live = await this.getStockQuote(symbol, { noCache: true });
            if (live && typeof live.price === 'number' && isFinite(live.price)) {
              series = [...series, { date: today, price: live.price }];
            }
          }
        } catch (_) {}
        return series;
      } catch (fhErr) {
        console.warn(`Finnhub historical failed for ${symbol}. Trying Alpha Vantage...`, fhErr);
        // Alpha Vantage fallback: TIME_SERIES_DAILY_ADJUSTED (compact)
        try {
          const bust3 = Date.now();
          const resp = await fetch(`${BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}&outputsize=compact&_=${bust3}`);
          const av = await resp.json();
          const series = av['Time Series (Daily)'];
          if (!series) throw new Error('Alpha Vantage historical unavailable');
          const entries = Object.entries(series)
            .map(([date, vals]) => ({ date, price: parseFloat(vals['5. adjusted close']) }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          // Trim to requested window approximately
          const lower = String(period || '').toLowerCase();
          const trimByDays = (days) => entries.slice(-days);
          let trimmed = entries;
          if (lower === '1w' || lower === '1wk' || lower === 'week') trimmed = trimByDays(7);
          else if (lower === '1m' || lower === '1mo' || lower === '1month') trimmed = trimByDays(30);
          else if (lower === '3m' || lower === '3mo') trimmed = trimByDays(90);
          else if (lower === '6m' || lower === '6mo') trimmed = trimByDays(180);
          else if (lower === '1y' || lower === '12m' || lower === '1yr') trimmed = trimByDays(365);
          else if (lower === 'ytd') {
            const y = new Date().getFullYear();
            trimmed = entries.filter(e => new Date(e.date).getFullYear() === y);
          }
          else if (lower === '3y' || lower === '3yr') trimmed = trimByDays(3 * 365);
          else if (lower === '5y' || lower === '5yr') trimmed = trimByDays(5 * 365);
          else if (lower === '10y' || lower === '10yr') trimmed = trimByDays(10 * 365);
          let series3 = trimmed.map(e => ({ date: new Date(e.date).toLocaleDateString(), price: e.price })).filter(e => e.price > 0);
          // Append live price if today's point missing
          try {
            const today = new Date().toLocaleDateString();
            if (!series3.length || series3[series3.length - 1].date !== today) {
              const live = await this.getStockQuote(symbol, { noCache: true });
              if (live && typeof live.price === 'number' && isFinite(live.price)) {
                series3 = [...series3, { date: today, price: live.price }];
              }
            }
          } catch (_) {}
          return series3;
        } catch (avErr) {
          console.error(`Historical data error for ${symbol} after Alpha Vantage fallback:`, avErr);
          return this.getFallbackHistoricalData(symbol);
        }
      }
    }
  }

  // Get market indices
  async getMarketIndices() {
    // Use liquid ETF proxies for reliability: SPY (S&P 500), QQQ (Nasdaq 100), DIA (Dow Jones)
    const indices = [
      { symbol: 'SPY', name: 'S&P 500' },
      { symbol: 'QQQ', name: 'NASDAQ' },
      { symbol: 'DIA', name: 'Dow Jones' }
    ];

    const promises = indices.map(async (index) => {
      try {
        const data = await this.getStockQuote(index.symbol, { noCache: true });
        return {
          name: index.name,
          value: data.price,
          change: data.changePercent
        };
      } catch (error) {
        return {
          name: index.name,
          value: this.getFallbackIndexData(index.name).value,
          change: this.getFallbackIndexData(index.name).change
        };
      }
    });

    return Promise.all(promises);
  }

  // ---- News ----
  async getGeneralNews(limit = 30) {
    try {
      const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('News fetch failed');
      return data
        .filter(n => n.headline && n.url)
        .slice(0, limit)
        .map(n => ({
          id: n.id,
          title: n.headline,
          source: n.source,
          url: n.url,
          datetime: n.datetime ? n.datetime * 1000 : Date.now(),
          image: n.image || '',
          summary: n.summary || '',
          related: n.related || ''
        }));
    } catch (e) {
      console.error('General news error:', e);
      return [];
    }
  }

  async getCompanyNews(symbol, fromDate, toDate, limit = 20) {
    try {
      const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Company news fetch failed');
      return data
        .filter(n => n.headline && n.url)
        .slice(0, limit)
        .map(n => ({
          id: n.id,
          title: n.headline,
          source: n.source,
          url: n.url,
          datetime: n.datetime ? n.datetime * 1000 : Date.now(),
          image: n.image || '',
          summary: n.summary || '',
          symbol
        }));
    } catch (e) {
      console.error(`Company news error for ${symbol}:`, e);
      return [];
    }
  }

  // Fallback data when APIs fail
  getFallbackData(symbol) {
    const fallbackPrices = {
      'AAPL': { price: 175.43, change: 1.23 },
      'MSFT': { price: 338.11, change: -0.87 },
      'GOOGL': { price: 125.37, change: 2.15 },
      'TSLA': { price: 245.67, change: -3.21 },
      'AMZN': { price: 142.83, change: 0.95 },
      'NVDA': { price: 456.78, change: 4.32 }
    };

    const base = fallbackPrices[symbol] || { price: 100, change: 0 };
    
    return {
      symbol,
      price: base.price,
      change: base.change,
      changePercent: (base.change / base.price) * 100,
      volume: 1000000,
      previousClose: base.price - base.change,
      open: base.price - (base.change * 0.5),
      high: base.price + Math.abs(base.change),
      low: base.price - Math.abs(base.change),
      isFallback: true
    };
  }

  getFallbackHistoricalData(symbol) {
    const basePrice = this.getFallbackData(symbol).price;
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      data.push({
        date: date.toLocaleDateString(),
        price: basePrice * (1 + variation)
      });
    }
    
    return data;
  }

  getFallbackIndexData(name) {
    const indices = {
      'S&P 500': { value: 4567.89, change: 0.75 },
      'NASDAQ': { value: 14234.56, change: -0.23 },
      'Dow Jones': { value: 34567.12, change: 0.45 }
    };
    
    return indices[name] || { value: 1000, change: 0 };
  }

  // Search for stocks
  async searchStocks(query) {
    try {
      const response = await fetch(
        `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
      );
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error('Search failed');
      }

      return data['bestMatches']?.slice(0, 25).map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region']
      })) || [];
      
    } catch (error) {
      console.error('Stock search error:', error);
      // Return popular stocks as fallback
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States' },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'Equity', region: 'United States' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' }
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
}

export default new StockAPI();
