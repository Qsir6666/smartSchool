import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './css/Kqtjdetail1.css'
import axios from 'axios'
import dayjs from 'dayjs'
import { format } from 'date-fns'
import * as echarts from 'echarts'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { svgList } from '../../../../../public/svgList/index.tsx' //导入svg
import { DatetimePicker, Toast } from 'react-vant'
import { ArrowLeft, ArrowDown } from '@react-vant/icons'

import { Dialog } from 'antd-mobile'


const App: React.FC = () => {
  const location = useLocation()
  const [selectDate, setSelectDate] = useState(location.state?.selectDate)
  // console.log(selectDate, '选择日期')

  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [selectedGrade, setSelectedGrade] = useState('全部学院')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isToday, setIsToday] = useState(true) //表示是否是今天
  const [dateStr, setDateStr] = useState(() => { return format(new Date(), 'yyyy-MM-dd') }) //选择的考勤日期（字符串形式）

  // const grades = ['全部年组', '一年组', '二年组', '三年组', '四年组', '五年组', '六年组']
  const grades = ['全部学院', '人工智能学院', '云计算学院', '大数据学院', '数智传媒学院', '鸿蒙生态开发学院', '元宇宙学院']
  const [classGroupData, setClassGroupData] = useState([])

  const totalStudents = classGroupData.reduce((acc, curr) => acc + curr.total, 0)
  const totalPresent = classGroupData.reduce((acc, curr) => acc + curr.present, 0)
  const attendanceRate = totalStudents > 0
    ? ((totalPresent / totalStudents) * 100).toFixed(1)
    : '0.0'

  const getMsgByDate = () => {
    const localDateStr = dayjs(selectDate).format('YYYY-MM-DD')
    axios.post('http://localhost:3000/QWG/getGroupMsgByDate', {
      date: localDateStr
    }).then(res => {
      if (res.data.code === 200) {
        setClassGroupData(res.data.data)
        console.log(res.data.data)

      }
    })

  }
  useEffect(() => {
    getMsgByDate()
  }, [selectDate])

  // 在日期kqDate和所选班级改变时校验
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    setIsToday((dateStr === todayStr))
  }, [dateStr])

  // 👇👇👇点击导出数据触发导出xlsx表到桌面：  
  // 1. 安装依赖（使用行业标准库）
  // npm install xlsx file - saver
  // 2. 在组件中添加导出逻辑
  // import * as XLSX from 'xlsx'
  // import { saveAs } from 'file-saver'
  // 3、触发方法
  const exportToExcel = () => {
    if (!isToday) {
      Toast.info({
        message: `只能导出今日出勤数据`,
        duration: 1000
      })
      return
    }


    Dialog.confirm({
      content: '确定导出数据吗？',
      onConfirm: async () => {

        // 准备数据
        const data = [
          ['统计周期', dayjs(selectDate).format('YYYY-MM-DD'), '', '导出时间', dayjs().format('YYYY-MM-DD HH:mm:ss')],
          ['学院名称', '应到人数', '实到人数', '出勤率', '病假', '事假', '旷课'],
          ...classGroupData.map(item => [
            item.name,
            item.total,
            item.present,
            `${((item.present / item.total) * 100).toFixed(1)}%`,
            item.cate2,
            item.cate3,
            item.cate4
          ]),
          // 增加总统计行
          ['全校汇总',
            classGroupData.reduce((sum, d) => sum + d.total, 0),
            classGroupData.reduce((sum, d) => sum + d.present, 0),
            `${((classGroupData.reduce((s, d) => s + d.present, 0) /
              classGroupData.reduce((s, d) => s + d.total, 0)) * 100).toFixed(1)}%`,
            classGroupData.reduce((s, d) => s + d.cate2, 0),
            classGroupData.reduce((s, d) => s + d.cate3, 0),
            classGroupData.reduce((s, d) => s + d.cate4, 0)
          ]
        ]
        // 创建工作簿
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(data)

        // 设置单元格样式
        ws['!cols'] = [
          { wch: 20 }, // 第一列宽度
          { wch: 10 },
          { wch: 10 },
          { wch: 12 },
          { wch: 8 },
          { wch: 8 },
          { wch: 8 }
        ]
        // 合并表头单元格
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // 合并周期单元格
          { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }  // 合并导出时间单元格
        ]
        XLSX.utils.book_append_sheet(wb, ws, "考勤报表")
        // 导出文件
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        saveAs(new Blob([wbout], { type: "application/octet-stream" }),
          `学院考勤统计_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`)
        await new Promise(resolve => setTimeout(resolve, 1500))

        Toast.info({
          message: `导出成功！`,
          duration: 2000,
        })
      }
    })

  }


  const handleRefresh = async () => {
    try {
      setClassGroupData([])

      Toast.loading({
        message: 'Loading...',
        forbidClick: true,
        duration: 0,
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      await getMsgByDate()
      Toast.info({
        message: '数据刷新完成',
        duration: 1000,
      })
    } catch (err) {
      Toast.fail({
        message: '数据刷新失败',
        duration: 1000,
      })
    }
  }

  useEffect(() => {
    if (viewMode === 'chart') {
      const chartDom = document.getElementById('attendanceChart')
      if (chartDom) {
        const myChart = echarts.init(chartDom)
        const option = {
          animation: false,
          tooltip: {
            trigger: 'axis',
          },
          xAxis: {
            type: 'category',
            data: classGroupData.map(c => c.name),
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            max: 100,
            name: '出勤率(%)'
          },
          series: [{
            data: classGroupData.map(c => ((c.present / c.total) * 100).toFixed(1)),
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              color: '#4F46E5'
            }
          }]
        }
        myChart.setOption(option)
      }
    }
  }, [viewMode])
  return (
    <div id="tailwind-scope">
      <div className="min-h-screen bg-gray-50">

        <div className="min-h-screen bg-gray-50">
          {/* 顶部标题区域 */}
          <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
            <div className="flex items-center justify-between px-4 h-14">
              <h1 className="text-lg font-medium Kqtj_topicon">
                <ArrowLeft onClick={() => { window.history.back() }} />
                <span>学院横向对比</span>
              </h1>
              <button className="!rounded-button p-2 text-gray-600 hover:bg-gray-100">
                <i className="fas fa-calendar text-lg">
                  <DatetimePicker
                    popup={{
                      round: true,
                    }}
                    type='date'
                    title='选择日期'
                    minDate={new Date(2025, 0, 1)}
                    maxDate={new Date()}
                    value={selectDate}
                    onConfirm={(date) => {
                      setSelectDate(date)
                      setDateStr(format(date, 'yyyy-MM-dd'))
                    }}
                  >
                    {(val, _, actions) => {
                      return (
                        <span onClick={() => actions.open()}>
                          {svgList.kqtj_detail1_1}
                        </span>
                      )
                    }}
                  </DatetimePicker>

                </i>
              </button>
            </div>
          </div>

          <div className="pt-14 pb-20">
            {/* 数据概览区域 */}
            <div className="bg-white p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-3xl font-semibold text-indigo-600">{attendanceRate}%</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {
                      isToday ? '今日总出勤率' : `${dateStr}出勤率`
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium">
                    {totalPresent}/{totalStudents}
                  </div>
                  <div className="text-sm text-green-500 flex items-center justify-end mt-1">
                    <i className="fas fa-arrow-up mr-1"></i>
                    <span>1.2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 筛选区域 */}
            <div className="px-4 mb-4">
              <div className="relative">
                <button
                  className="!rounded-button w-full p-3 bg-white border border-gray-200 text-left flex justify-between items-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>{selectedGrade}</span>
                  <i className={`fas fa-chevron-down text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}><ArrowDown /></i>
                </button>
                {dropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {grades.map((grade, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none whitespace-nowrap first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => {
                          setSelectedGrade(grade === '全部年组' ? '全部年组' : grade)
                          setDropdownOpen(false)
                        }}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* 视图切换 */}
            <div className="px-4 mb-4">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  className={`!rounded-button px-4 py-2 ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  列表视图
                </button>
                <button
                  className={`!rounded-button px-4 py-2 ${viewMode === 'chart' ? 'bg-white shadow' : ''}`}
                  onClick={() => setViewMode('chart')}
                >
                  图表视图
                </button>
              </div>
            </div>

            {/* 班级列表/图表区域 */}
            <div className="px-4">
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {classGroupData
                    .filter(classInfo => selectedGrade === '全部学院' || classInfo.name.startsWith(selectedGrade))
                    .map((classInfo, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-medium">{classInfo.name}</div>
                          <div className="text-lg font-semibold text-indigo-600">
                            {((classInfo.present / classInfo.total) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <div>应到/实到：{classInfo.total}/{classInfo.present}</div>
                          <div className="flex space-x-4">
                            <span>病假：{classInfo.cate2}</span>
                            <span>事假：{classInfo.cate3}</span>
                            <span>旷课：{classInfo.cate4}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4">
                  <div id="attendanceChart" style={{ height: '400px' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-between space-x-4">
              <button className="!rounded-button flex-1 bg-white border border-gray-200 py-2 flex items-center justify-center">
                <span onClick={handleRefresh}>
                  刷新数据
                </span>
              </button>
              <button className="!rounded-button flex-1 bg-white border border-gray-200 py-2 flex items-center justify-center">
                <span>
                  异常考勤
                </span>
              </button>
              <button className="!rounded-button flex-1 bg-indigo-600 text-white py-2 flex items-center justify-center">
                <span onClick={exportToExcel}>
                  导出数据
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

