import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data for demo purposes (since yahoo-finance2 might have rate limits)
const mockData = {
  nasdaq: {
    symbol: '^IXIC',
    price: 18245.67,
    change: 125.43,
    changePercent: 0.69,
    ma50: 17890.23,
    ma200: 16745.89,
    rsi: 65.4,
    pe: 28.7
  },
  vix: {
    price: 18.45,
    change: -1.23,
    changePercent: -6.25
  },
  treasury: {
    yield: 4.25,
    change: 0.05
  },
  gdpGrowth: 2.8,
  semiconductorIndex: 145.67,
  cloudComputingGrowth: 12.5,
  historicalData: [
    { date: '2024-01', price: 15000 },
    { date: '2024-02', price: 15500 },
    { date: '2024-03', price: 16000 },
    { date: '2024-04', price: 15800 },
    { date: '2024-05', price: 16200 },
    { date: '2024-06', price: 16800 },
    { date: '2024-07', price: 17200 },
    { date: '2024-08', price: 17000 },
    { date: '2024-09', price: 17500 },
    { date: '2024-10', price: 17800 },
    { date: '2024-11', price: 18100 },
    { date: '2024-12', price: 18245 }
  ]
};

const MetricCard = ({ title, value, change, changePercent, tooltip, status }) => {
  const isPositive = change >= 0;
  const statusColor = status === 'bullish' ? 'text-green-600' : status === 'bearish' ? 'text-red-600' : 'text-yellow-600';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow relative group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black text-white text-xs rounded p-2 absolute top-2 right-2 w-64 z-10">
            {tooltip}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className={`text-2xl font-bold ${statusColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(change).toFixed(2)}</span>
            {changePercent && (
              <span className="ml-1">({changePercent.toFixed(2)}%)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RSIGauge = ({ value }) => {
  const getColor = (rsi) => {
    if (rsi >= 70) return '#ef4444'; // Overbought - Red
    if (rsi <= 30) return '#22c55e'; // Oversold - Green
    return '#f59e0b'; // Neutral - Yellow
  };

  const data = {
    labels: ['RSI', 'Remaining'],
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [getColor(value), '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: getColor(value) }}>
            {value.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">RSI</div>
        </div>
      </div>
    </div>
  );
};

const TrendChart = ({ data, title }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Nasdaq Index',
        data: data.map(d => d.price),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    },
  };

  return <Line data={chartData} options={options} />;
};

const TradingSignal = ({ signals }) => {
  const overallSignal = signals.bullish > signals.bearish ? 'BUY' : signals.bearish > signals.bullish ? 'SELL' : 'HOLD';
  const signalColor = overallSignal === 'BUY' ? 'bg-green-500' : overallSignal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500';
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-center">Trading Signal</h3>
      <div className={`${signalColor} text-white text-2xl font-bold py-4 px-6 rounded-lg text-center mb-4`}>
        {overallSignal}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Bullish Indicators:</span>
          <span className="font-semibold text-green-600">{signals.bullish}</span>
        </div>
        <div className="flex justify-between">
          <span>Bearish Indicators:</span>
          <span className="font-semibold text-red-600">{signals.bearish}</span>
        </div>
        <div className="flex justify-between">
          <span>Neutral Indicators:</span>
          <span className="font-semibold text-yellow-600">{signals.neutral}</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [marketData, setMarketData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate trading signals based on indicators
  const calculateTradingSignals = (data) => {
    let bullish = 0, bearish = 0, neutral = 0;
    
    // Nasdaq above MA200
    if (data.nasdaq.price > data.nasdaq.ma200) bullish++; else bearish++;
    
    // RSI analysis
    if (data.nasdaq.rsi < 30) bullish++; // Oversold = buying opportunity
    else if (data.nasdaq.rsi > 70) bearish++; // Overbought = selling signal
    else neutral++;
    
    // VIX analysis (low VIX = bullish, high VIX = bearish)
    if (data.vix.price < 20) bullish++; else bearish++;
    
    // GDP Growth
    if (data.gdpGrowth > 2.5) bullish++; else bearish++;
    
    // Interest rates (low rates = bullish)
    if (data.treasury.yield < 4.5) bullish++; else bearish++;
    
    return { bullish, bearish, neutral };
  };

  const fetchRealTimeData = async () => {
    setLoading(true);
    try {
      // Note: In a real implementation, you would fetch from yahoo-finance2
      // For demo purposes, we'll simulate data updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate small price movements
      const priceChange = (Math.random() - 0.5) * 50;
      setMarketData(prev => ({
        ...prev,
        nasdaq: {
          ...prev.nasdaq,
          price: prev.nasdaq.price + priceChange,
          change: priceChange,
          changePercent: (priceChange / prev.nasdaq.price) * 100
        }
      }));
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tradingSignals = calculateTradingSignals(marketData);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📈 Nasdaq Trading Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchRealTimeData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? '🔄 Updating...' : '🔄 Refresh'}
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Nasdaq Composite"
            value={marketData.nasdaq.price.toFixed(2)}
            change={marketData.nasdaq.change}
            changePercent={marketData.nasdaq.changePercent}
            tooltip="The Nasdaq Composite Index tracks the performance of all stocks listed on the Nasdaq exchange. A rising index suggests overall market strength."
            status={marketData.nasdaq.change >= 0 ? 'bullish' : 'bearish'}
          />
          
          <MetricCard
            title="200-Day MA"
            value={marketData.nasdaq.ma200.toFixed(2)}
            tooltip="The 200-day moving average is a key long-term trend indicator. When price is above MA200, it suggests a bullish trend."
            status={marketData.nasdaq.price > marketData.nasdaq.ma200 ? 'bullish' : 'bearish'}
          />
          
          <MetricCard
            title="P/E Ratio"
            value={marketData.nasdaq.pe.toFixed(1)}
            tooltip="Price-to-Earnings ratio indicates if the market is overvalued (high P/E) or undervalued (low P/E). Historical average is around 25."
            status={marketData.nasdaq.pe > 30 ? 'bearish' : marketData.nasdaq.pe < 20 ? 'bullish' : 'neutral'}
          />
          
          <MetricCard
            title="VIX (Fear Index)"
            value={marketData.vix.price.toFixed(2)}
            change={marketData.vix.change}
            changePercent={marketData.vix.changePercent}
            tooltip="VIX measures market volatility and fear. Low VIX (<20) suggests complacency, high VIX (>30) suggests fear and potential buying opportunities."
            status={marketData.vix.price < 20 ? 'bullish' : marketData.vix.price > 30 ? 'neutral' : 'bearish'}
          />
        </div>

        {/* Charts and Advanced Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <TrendChart data={marketData.historicalData} title="Nasdaq 12-Month Trend" />
          </div>
          
          {/* RSI Gauge */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">RSI Indicator</h3>
            <RSIGauge value={marketData.nasdaq.rsi} />
            <div className="mt-4 text-center text-sm text-gray-600">
              <div className="space-y-1">
                <div>🔴 &gt;70: Overbought</div>
                <div>🟡 30-70: Neutral</div>
                <div>🟢 &lt;30: Oversold</div>
              </div>
            </div>
          </div>
        </div>

        {/* Economic Indicators and Trading Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MetricCard
            title="10-Year Treasury"
            value={`${marketData.treasury.yield.toFixed(2)}%`}
            change={marketData.treasury.change}
            tooltip="The 10-year Treasury yield reflects interest rates. Lower rates are generally bullish for stocks as they make equities more attractive."
            status={marketData.treasury.yield < 4.5 ? 'bullish' : 'bearish'}
          />
          
          <MetricCard
            title="GDP Growth"
            value={`${marketData.gdpGrowth.toFixed(1)}%`}
            tooltip="GDP growth rate indicates economic health. Growth above 2.5% is generally positive for stock markets."
            status={marketData.gdpGrowth > 2.5 ? 'bullish' : 'bearish'}
          />
          
          <MetricCard
            title="Semiconductor Index"
            value={marketData.semiconductorIndex.toFixed(2)}
            tooltip="Semiconductor performance is a leading indicator for tech stocks, which heavily influence the Nasdaq."
            status="neutral"
          />
          
          <TradingSignal signals={tradingSignals} />
        </div>

        {/* Educational Footer */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">📚 How to Use This Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Bullish Signals:</h4>
              <ul className="space-y-1">
                <li>• Nasdaq above 200-day MA</li>
                <li>• RSI below 30 (oversold)</li>
                <li>• VIX below 20 (low fear)</li>
                <li>• GDP growth above 2.5%</li>
                <li>• Low interest rates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Bearish Signals:</h4>
              <ul className="space-y-1">
                <li>• Nasdaq below 200-day MA</li>
                <li>• RSI above 70 (overbought)</li>
                <li>• High P/E ratios (>30)</li>
                <li>• Rising interest rates</li>
                <li>• Economic slowdown indicators</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;