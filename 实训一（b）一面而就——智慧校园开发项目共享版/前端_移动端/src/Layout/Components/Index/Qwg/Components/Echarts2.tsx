// components/AttendanceTrendChart.tsx
import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import axios from 'axios'

interface TrendDataItem {
  date: string
  rate: number
  total: number
  normal: number
}

interface AttendanceTrendChartProps {
  /** 请求天数（默认7天） */
  days?: number
  /** 容器类名 */
  className?: string
  /** 图表高度（默认300px） */
  height?: number | string
  /** API接口地址 */
  apiUrl?: string
  themeColor?: string
}

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ 
  days = 7, 
  className, 
  height = 300, 
  apiUrl = 'http://localhost:3000/QWG/getAttendanceTrend',
  themeColor = '#1890ff'
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<TrendDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
    console.log(data,'13113');
    
  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await axios.post('http://localhost:3000/QWG/getAttendanceTrend', { days })
      
      if (res.data.code === 200) {
        // console.log(res.data.data);
        
        const formatted = res.data.data.map((d: any) => ({
          ...d,
          rate: parseFloat(d.rate)
        }))
        setData(formatted)
      }
    } catch (err) {
      setError('数据加载失败，请稍后重试')
      console.error('图表数据获取失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 初始化图表
  const initChart = () => {
    if (!chartRef.current || data.length === 0) return

    const chart = echarts.init(chartRef.current)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const { date, rate, normal, total } = params[0].data
          return `
            <div style="padding: 8px">
              <strong>${date}</strong><br/>
              出勤率：${rate}%<br/>
              正常人数：${normal}<br/>
              总考勤：${total}
            </div>
          `
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date.split('-').slice(1).join('/')),
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      series: [{
        data: data.map(d => d.rate),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: themeColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${themeColor}80` },
            { offset: 1, color: `${themeColor}05` }
          ])
        },
        itemStyle: { color: themeColor }
      }],
      grid: {
        left: '3%',
        right: '3%',
        bottom: '20%',
        containLabel: true
      }
    }

    chart.setOption(option)

    // 响应式调整
    const resizeHandler = () => chart.resize()
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      chart.dispose()
    }
  }

  useEffect(() => {
    fetchData()
  }, [days, apiUrl])

  useEffect(() => {
    const cleanup = initChart()
    return cleanup
  }, [data])

  return (
    <div className={className} style={{ position: 'relative', height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          {error}
        </div>
      )}

      <div 
        ref={chartRef} 
        style={{ width: '100%', height: '100%', minHeight: 300 }}
      />
    </div>
  )
}

export default AttendanceTrendChart
