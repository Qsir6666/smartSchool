import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import '../css/index.css'

const App: React.FC = ({ fiveDayData }) => {
  const lineChartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // console.log(fiveDayData, '近五日考勤数据趋势统计')

  // 处理日期格式的通用方法
  const formatDate = (dateString: string) => {
    const [, month, day] = dateString.split('-')
    return `${month}-${day}`
  }


  useEffect(() => {
    if (lineChartRef.current && fiveDayData?.length) {
      // 初始化图表
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(lineChartRef.current);
      }

      // 生成x轴数据
      const xAxisData = fiveDayData.map(item => formatDate(item.date))

      // 生成系列数据的通用方法
      const generateSeriesData = (key: string) =>
        fiveDayData.map(item => item[key])

      // const lineChart = echarts.init(lineChartRef.current);
      const lineOption = {
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        legend: {
          data: ['正常出勤', '病假', '事假', '旷课']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '正常出勤',
            type: 'line',
            data: generateSeriesData('present')
          },
          {
            name: '病假',
            type: 'line',
            data: generateSeriesData('sick')
          },
          {
            name: '事假',
            type: 'line',
            data: generateSeriesData('leave')
          },
          {
            name: '旷课',
            type: 'line',
            data: generateSeriesData('absent')
          }
        ]
      }
      chartInstance.current.setOption(lineOption)
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [fiveDayData])

  return (
    <div className="rounded-lg p-4 m-4 echarts_bgc">
      <h2 className="text-base font-medium mb-4">近五日考勤趋势分析</h2>
      <div ref={lineChartRef} className="w-full h-64"></div>
    </div>
  );
};

export default App;

