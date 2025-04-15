import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts'
import '../css/index.css'

const Echarts3: React.FC = ({ statsData }) => {
  const pieChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current);
      const pieOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)', // 鼠标悬停提示框的格式
        },
        legend: {
          bottom: '0',
          left: 'center',
          textStyle: {
            color: '#666', // 图例文字颜色
            fontSize: 12, // 图例文字大小
          },
        },
        series: [
          {
            name: '出勤情况',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333', // 高亮时文字颜色
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: statsData.present, name: '正常出勤' },
              { value: statsData.cate2, name: '病假' },
              { value: statsData.cate3, name: '事假' },
              { value: statsData.cate4, name: '旷课' }
            ],
            color: ['#67C23A', '#909399', '#E6A23C', '#F56C6C'], // 自定义颜色
          },
        ],
      }
      pieChart.setOption(pieOption);
    }
  }, [])

  return (
    <div className="rounded-lg p-4 m-4 echarts_bgc">
      <h2 className="text-base font-medium">当日总体出勤概览</h2>
      <div ref={pieChartRef} className="w-full h-64"></div>
    </div>
  )
}

export default Echarts3