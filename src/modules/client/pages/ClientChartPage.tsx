import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  ColorType,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  UTCTimestamp,
} from 'lightweight-charts'

// ─── Types ────────────────────────────────────────────────────────
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
type ChartType = 'candle' | 'line'

interface TickerInfo {
  symbol: string        // display: BTC/USDT
  binanceSymbol: string // Binance API: BTCUSDT
  basePrice: number
}

interface LiveTicker {
  price: number
  change: number
  changePct: number
  high: number
  low: number
  volume: number
}

// ─── Binance WS intervals mapping ────────────────────────────────
const TF_TO_BINANCE: Record<TimeFrame, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m',
  '1h': '1h', '4h': '4h', '1d': '1d',
}

// ─── Symbols ──────────────────────────────────────────────────────
const SYMBOLS: TickerInfo[] = [
  { symbol: 'BTC/USDT', binanceSymbol: 'BTCUSDT', basePrice: 67000 },
  { symbol: 'ETH/USDT', binanceSymbol: 'ETHUSDT', basePrice: 3500  },
  { symbol: 'BNB/USDT', binanceSymbol: 'BNBUSDT', basePrice: 410   },
  { symbol: 'SOL/USDT', binanceSymbol: 'SOLUSDT', basePrice: 178   },
]

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d']

// ─── Chart theme ──────────────────────────────────────────────────
const T = {
  bg:       '#0f1117',
  grid:     '#1a1d27',
  border:   '#252836',
  text:     '#9ca3af',
  up:       '#26a69a',
  down:     '#ef5350',
  line:     '#6366f1',
  cross:    '#3d4259',
}

// ─── Formatters ───────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
const fmtVol = (n: number) =>
  n >= 1e9 ? (n/1e9).toFixed(2)+'B' : n >= 1e6 ? (n/1e6).toFixed(2)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : n.toString()

// ─── Fetch historical klines from Binance REST ────────────────────
async function fetchKlines(binanceSymbol: string, interval: string, limit = 200): Promise<CandlestickData[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Binance API error')
  const raw: number[][] = await res.json()
  return raw.map(k => ({
    time: Math.floor(k[0] / 1000) as UTCTimestamp,
    open:  parseFloat(k[1] as unknown as string),
    high:  parseFloat(k[2] as unknown as string),
    low:   parseFloat(k[3] as unknown as string),
    close: parseFloat(k[4] as unknown as string),
  }))
}

// ─── Fetch 24h ticker from Binance ───────────────────────────────
async function fetch24hTicker(binanceSymbol: string): Promise<LiveTicker> {
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Ticker error')
  const d = await res.json()
  return {
    price:     parseFloat(d.lastPrice),
    change:    parseFloat(d.priceChange),
    changePct: parseFloat(d.priceChangePercent),
    high:      parseFloat(d.highPrice),
    low:       parseFloat(d.lowPrice),
    volume:    parseFloat(d.quoteVolume),
  }
}

// ─── Symbol tab ───────────────────────────────────────────────────
const SymbolTab: React.FC<{
  info: TickerInfo
  ticker?: LiveTicker
  active: boolean
  onClick: () => void
}> = ({ info, ticker, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl transition-all border ${
      active
        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
        : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    <span className="text-xs font-bold tracking-wide">{info.symbol.split('/')[0]}</span>
    <span className="text-[10px] text-gray-500">{info.symbol}</span>
    {ticker ? (
      <span className={`text-[10px] font-medium mt-0.5 ${ticker.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {ticker.changePct >= 0 ? '+' : ''}{ticker.changePct.toFixed(2)}%
      </span>
    ) : (
      <span className="text-[10px] text-gray-700 mt-0.5">—</span>
    )}
  </button>
)

// ─── Connection status dot ────────────────────────────────────────
const ConnDot: React.FC<{ connected: boolean }> = ({ connected }) => (
  <span className="relative flex h-2 w-2">
    {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
    <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
  </span>
)

// ─── Main Page ────────────────────────────────────────────────────
const ClientChartPage: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const candleSeriesRef   = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const lineSeriesRef     = useRef<ISeriesApi<'Line'> | null>(null)
  const wsRef             = useRef<WebSocket | null>(null)
  const resizeObsRef      = useRef<ResizeObserver | null>(null)
  const latestCandleRef   = useRef<CandlestickData | null>(null)

  const [selectedIdx, setSelectedIdx]     = useState(0)
  const [timeframe, setTimeframe]         = useState<TimeFrame>('5m')
  const [chartType, setChartType]         = useState<ChartType>('candle')
  const [candles, setCandles]             = useState<CandlestickData[]>([])
  const [tickers, setTickers]             = useState<Record<string, LiveTicker>>({})
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null)
  const [isLoading, setIsLoading]         = useState(true)
  const [wsConnected, setWsConnected]     = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [flashUp, setFlashUp]             = useState(false)
  const [flashDown, setFlashDown]         = useState(false)
  const [lastPrice, setLastPrice]         = useState<number | null>(null)

  const symbol = SYMBOLS[selectedIdx]
  const ticker = tickers[symbol.binanceSymbol]
  const displayCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null)
  const isUp = ticker ? ticker.changePct >= 0 : true

  // ── Fetch all tickers for tabs ──
  const fetchAllTickers = useCallback(async () => {
    try {
      const results = await Promise.all(SYMBOLS.map(s => fetch24hTicker(s.binanceSymbol)))
      const map: Record<string, LiveTicker> = {}
      SYMBOLS.forEach((s, i) => { map[s.binanceSymbol] = results[i] })
      setTickers(map)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchAllTickers()
    const t = setInterval(fetchAllTickers, 30_000)
    return () => clearInterval(t)
  }, [fetchAllTickers])

  // ── Load historical klines ──
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setHoveredCandle(null)
    try {
      const data = await fetchKlines(symbol.binanceSymbol, TF_TO_BINANCE[timeframe])
      setCandles(data)
      latestCandleRef.current = data[data.length - 1]
    } catch {
      setError('Không thể tải dữ liệu. Kiểm tra kết nối mạng.')
    } finally {
      setIsLoading(false)
    }
  }, [symbol.binanceSymbol, timeframe])

  useEffect(() => { loadHistory() }, [loadHistory])

  // ── WebSocket for live kline updates ──
  useEffect(() => {
    wsRef.current?.close()
    setWsConnected(false)

    const streamName = `${symbol.binanceSymbol.toLowerCase()}@kline_${TF_TO_BINANCE[timeframe]}`
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
    wsRef.current = ws

    ws.onopen = () => setWsConnected(true)
    ws.onclose = () => setWsConnected(false)
    ws.onerror = () => setWsConnected(false)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const k = msg.k
        if (!k) return

        const newCandle: CandlestickData = {
          time:  Math.floor(k.t / 1000) as UTCTimestamp,
          open:  parseFloat(k.o),
          high:  parseFloat(k.h),
          low:   parseFloat(k.l),
          close: parseFloat(k.c),
        }

        // Flash price direction
        const prevClose = latestCandleRef.current?.close
        if (prevClose !== undefined && newCandle.close !== prevClose) {
          if (newCandle.close > prevClose) { setFlashUp(true); setTimeout(() => setFlashUp(false), 400) }
          else { setFlashDown(true); setTimeout(() => setFlashDown(false), 400) }
        }

        setLastPrice(newCandle.close)
        latestCandleRef.current = newCandle

        // Update chart series
        if (candleSeriesRef.current) candleSeriesRef.current.update(newCandle)
        if (lineSeriesRef.current) lineSeriesRef.current.update({ time: newCandle.time, value: newCandle.close })

        // Update ticker price live
        setTickers(prev => {
          const t = prev[symbol.binanceSymbol]
          if (!t) return prev
          return { ...prev, [symbol.binanceSymbol]: { ...t, price: newCandle.close } }
        })
      } catch { /* ignore malformed messages */ }
    }

    return () => { ws.close() }
  }, [symbol.binanceSymbol, timeframe])

  // ── Build chart ──
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      lineSeriesRef.current = null
    }

    const container = chartContainerRef.current
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: T.bg },
        textColor: T.text,
        fontFamily: 'monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: T.grid },
        horzLines: { color: T.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: T.cross, style: 1, width: 1 },
        horzLine: { color: T.cross, style: 1, width: 1 },
      },
      rightPriceScale: { borderColor: T.border },
      timeScale: { borderColor: T.border, timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    })
    chartRef.current = chart

    // Candle series
    const cSeries = chart.addSeries(CandlestickSeries, {
      upColor: T.up, downColor: T.down,
      borderUpColor: T.up, borderDownColor: T.down,
      wickUpColor: T.up, wickDownColor: T.down,
    })
    cSeries.setData(candles)
    candleSeriesRef.current = cSeries

    // Line series (hidden if candle mode)
    const lSeries = chart.addSeries(LineSeries, {
      color: T.line, lineWidth: 2,
      crosshairMarkerVisible: true,
      priceLineColor: T.line,
    })
    lSeries.setData(candles.map(c => ({ time: c.time, value: c.close as number })))
    lineSeriesRef.current = lSeries

    // Toggle visibility by chart type
    cSeries.applyOptions({ visible: chartType === 'candle' })
    lSeries.applyOptions({ visible: chartType === 'line' })

    chart.timeScale().fitContent()

    // Crosshair hover
    chart.subscribeCrosshairMove(param => {
      if (!param.time) { setHoveredCandle(null); return }
      const data = param.seriesData.get(cSeries) as CandlestickData
      if (data) setHoveredCandle(data)
    })

    // Resize observer
    resizeObsRef.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      chart.resize(width, height)
    })
    resizeObsRef.current.observe(container)

    return () => {
      resizeObsRef.current?.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [candles])

  // Toggle visibility when chartType changes (without rebuilding chart)
  useEffect(() => {
    candleSeriesRef.current?.applyOptions({ visible: chartType === 'candle' })
    lineSeriesRef.current?.applyOptions({ visible: chartType === 'line' })
  }, [chartType])

  const livePrice = ticker?.price ?? lastPrice ?? displayCandle?.close ?? 0
  const priceDecimals = livePrice > 1000 ? 2 : livePrice > 10 ? 3 : 4

  return (
    <div className="flex flex-col -mx-4 -mt-5" style={{ height: 'calc(100dvh - 110px)' }}>

      {/* ── Symbol tabs ── */}
      <div className="bg-[#0f1117] border-b border-[#1a1d27] px-3 py-2 flex gap-1 overflow-x-auto">
        {SYMBOLS.map((s, i) => (
          <SymbolTab
            key={s.symbol}
            info={s}
            ticker={tickers[s.binanceSymbol]}
            active={selectedIdx === i}
            onClick={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      {/* ── Ticker header ── */}
      <div className="bg-[#0f1117] border-b border-[#1a1d27] px-4 py-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className={`text-white font-bold text-2xl font-mono transition-colors duration-150 ${
                  flashUp ? 'text-emerald-400' : flashDown ? 'text-red-400' : 'text-white'
                }`}
              >
                {fmt(livePrice, priceDecimals)}
              </span>
              {ticker && (
                <span className={`text-sm font-semibold ${ticker.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ticker.changePct >= 0 ? '▲' : '▼'} {ticker.changePct >= 0 ? '+' : ''}{fmt(ticker.change, priceDecimals)} ({ticker.changePct >= 0 ? '+' : ''}{ticker.changePct.toFixed(2)}%)
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{symbol.symbol} • {timeframe}</p>
          </div>

          {/* OHLC hover info */}
          {displayCandle && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-right flex-shrink-0">
              {([
                { label: 'O', value: displayCandle.open as number },
                { label: 'H', value: displayCandle.high as number },
                { label: 'C', value: displayCandle.close as number },
                { label: 'L', value: displayCandle.low as number },
              ] as const).map(item => (
                <div key={item.label} className="flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-600">{item.label}</span>
                  <span className={`text-xs font-mono font-medium ${
                    item.label === 'H' ? 'text-emerald-400' :
                    item.label === 'L' ? 'text-red-400' :
                    isUp ? 'text-emerald-300' : 'text-red-300'
                  }`}>{fmt(item.value, priceDecimals)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 24h stats */}
        {ticker && (
          <div className="flex gap-4 mt-2">
            {[
              { label: '24h Cao', value: fmt(ticker.high, priceDecimals), color: 'text-emerald-400' },
              { label: '24h Thấp', value: fmt(ticker.low, priceDecimals), color: 'text-red-400' },
              { label: 'KL 24h', value: fmtVol(ticker.volume), color: 'text-gray-300' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-gray-600 text-[10px]">{item.label}</p>
                <p className={`text-xs font-mono font-medium ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-[#0f1117] border-b border-[#1a1d27] px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-0.5 flex-wrap">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-gray-800 mx-1 flex-shrink-0" />
        <div className="flex gap-0.5 flex-shrink-0">
          {(['candle', 'line'] as ChartType[]).map(ct => (
            <button
              key={ct}
              onClick={() => setChartType(ct)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartType === ct ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {ct === 'candle' ? '📊 Nến' : '📈 Line'}
            </button>
          ))}
        </div>
        <button
          onClick={loadHistory}
          className="ml-auto text-gray-600 hover:text-gray-300 transition-colors text-base px-2 py-1 rounded-lg hover:bg-white/5 flex-shrink-0"
        >
          ↺
        </button>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 bg-[#0f1117] relative overflow-hidden">
        {(isLoading || error) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0f1117]">
            {error ? (
              <div className="text-center space-y-3">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={loadHistory}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-gray-600 text-xs">Đang tải dữ liệu...</p>
              </div>
            )}
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* ── Bottom status bar ── */}
      <div className="bg-[#0b0d14] border-t border-[#1a1d27] px-4 py-1.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ConnDot connected={wsConnected} />
          <span className="text-gray-600 text-[10px]">
            {wsConnected ? `Live • ${symbol.symbol}` : 'Đang kết nối...'}
          </span>
        </div>
        <span className="text-gray-700 text-[10px]">Binance • lightweight-charts</span>
      </div>
    </div>
  )
}

export default ClientChartPage