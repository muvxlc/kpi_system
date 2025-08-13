"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Chart({ title, children, className }: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
}

export function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  // ตรวจสอบข้อมูลก่อนใช้งาน
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <span className="text-sm text-muted-foreground">ไม่มีข้อมูล</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full">
              <div
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3b82f6',
                  minHeight: '4px'
                }}
              />
              {showValues && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                  {item.value}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center leading-tight">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: { label: string; value: number }[]
  height?: number
  showGrid?: boolean
}

export function LineChart({ data, height = 200, showGrid = true }: LineChartProps) {
  // ตรวจสอบข้อมูลก่อนใช้งาน
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <span className="text-sm text-muted-foreground">ไม่มีข้อมูล</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue
  
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50
  }))
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')
  
  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {showGrid && (
          <g className="text-muted-foreground">
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}
          </g>
        )}
        
        <path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          className="transition-all duration-300"
        />
        
        {points.map((point, index) => (
          <circle
            key={index}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="4"
            fill="#3b82f6"
            className="transition-all duration-300 hover:r-6"
          />
        ))}
      </svg>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        {data.map((item, index) => (
          <div key={index} className="text-center flex-1">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

interface PieChartProps {
  data: { label: string; value: number; color?: string }[]
  size?: number
  showLabels?: boolean
}

export function PieChart({ data, size = 200, showLabels = true }: PieChartProps) {
  // ตรวจสอบข้อมูลก่อนใช้งาน
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm text-muted-foreground">ไม่มีข้อมูล</span>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    return {
      pathData,
      color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
      percentage: ((item.value / total) * 100).toFixed(1),
      label: item.label
    }
  })
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-4">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathData}
            fill={segment.color}
            className="transition-all duration-300 hover:opacity-80"
          />
        ))}
      </svg>
      
      {showLabels && (
        <div className="space-y-2 w-full">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm">{segment.label}</span>
              </div>
              <span className="text-sm font-medium">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
