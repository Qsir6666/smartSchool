//echarts表 每天出勤人数、缺勤人数

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const SimpleChart = ({ statsData }) => {
  // 1. 创建容器引用
  const chartRef = useRef(null);
  
  useEffect(() => {
    // 2. 确保 DOM 已加载
    if (chartRef.current) {
      // 3. 初始化图表实例
      const chart = echarts.init(chartRef.current);

      // 4. 定义图表配置
      const option = {
        xAxis: {
          type: 'value',
          max: statsData.total,
          axisLabel: {
            formatter: '{value}'
          },
          axisLine: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed', // x轴设置为虚线
              color: '#c0bfbf'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: ['出勤人数', '缺勤人数'],
          axisLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#333'
          }  //设置字体样式
        },
        grid: {
          left: '20%', // 为Y轴标签留出空间
          right: '8%',
          top:"5%",
          bottom:"25%",
        },
        series: [{
          data: [
            {
              value: statsData.present,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 1, 0,
                  [
                    { offset: 0, color: '#7DCFD8' },
                    { offset: 0.3, color: '#88DBBE' },
                    { offset: 0.6, color: '#BDDA94' },
                    { offset: 1, color: '#dbd071' }
                  ]
                ),
                borderRadius: [0, 10, 10, 0]  // 为数据条右侧添加圆角
              }
            },
            {
              value: statsData.cate2 + statsData.cate3 + statsData.cate4 , // 缺勤数值
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 1, 0,
                  [{ offset: 0, color: '#C8D6F1' }, { offset: 1, color: '#fc2a31' }]
                ),
                borderRadius : [0, 10, 10, 0]  // 为数据条右侧添加圆角
              }
            }
          ],
          type: 'bar',
          label: {
            show: true,
            position: 'right',
            formatter: '{@value}',
            fontSize: 12,
            fontWeight: 'bold'
            
          },
          barWidth: '55%'
        }],
        tooltip: {
          trigger: 'axis',
          formatter: '{b0}: {c0}人'
        }
      };

      // 5. 应用配置
      chart.setOption(option);

      // 6. 窗口调整时自适应
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      // 7. 组件卸载时清理
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose(); // 销毁图表实例
      };
    }
  }, []); // 空依赖数组表示仅在挂载时运行

  // 8. 渲染容器（必须指定宽高）
  return (
    <div ref={chartRef} style={{ width: '100%', height: '110px' }} />
  );
};

export default SimpleChart;