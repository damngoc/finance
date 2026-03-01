import React from 'react'
import { ChartDataPoint } from '@/shared/types'

interface MiniChartProps {
  data: ChartDataPoint[]
  color?: string
}

const MiniChart: React.FC<MiniChartProps> = ({ data, color = '#6366f1' }) => {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const H = 80
  const W = 100
  const pad = 4

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((d.value - min) / (max - min || 1)) * (H - pad * 2)
    return `${x},${y}`
  })

  const areaPoints = [
    `${pad},${H - pad}`,
    ...points,
    `${W - pad},${H - pad}`,
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MiniChart
