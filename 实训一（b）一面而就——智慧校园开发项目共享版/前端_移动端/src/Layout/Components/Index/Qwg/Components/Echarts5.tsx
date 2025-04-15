import React, { useState } from 'react';
import '../css/index.css'
import { Button, Popover, Dialog, Toast } from 'antd-mobile'
import { Action } from 'antd-mobile/es/components/popover'
import dayjs from 'dayjs'

//1、下载依赖 ：  npm i xlsx file-saver    
//2、引入必要方法
import * as XLSX from 'xlsx'   //导出xlsx所需
import { saveAs } from 'file-saver'  //保存xlsx文件

const actions: Action[] = [
  { key: 'class', text: '班级' },
  { key: 'payment', text: '出勤率' }
]


const App: React.FC<{ selectDate:any,echarts5Data: any[] }> = ({ selectDate,echarts5Data }) => {
  // console.log(echarts5Data, '接收数据所选日期的教师班级出勤数据~~~~~')
  const [sortType, setSortType] = useState<'class' | 'payment'>('class')  //排序字段  默认按班级排序
  // console.log(echarts5Data);
  
  const sortedData = [...echarts5Data].sort((a, b) => {
    return sortType === 'class' 
      ? a.sortKey - b.sortKey 
      : b.attendanceRate - a.attendanceRate
  })
// 计算汇总值
const totalValue = (field: keyof typeof sortedData[0]) => 
  sortedData.reduce((sum, item) => sum + (item[field] || 0), 0)

  const onAction = (action: Action) => {
    setSortType(action.key as 'class' | 'payment')
  }


  const DownloadFile = () => {
    Dialog.confirm({
      content: '确定导出数据吗？',
      onConfirm: async () => {
        const exportData = [
          ['统计日期', dayjs().format('YYYY-MM-DD'), '', '导出时间', dayjs().format('YYYY-MM-DD HH:mm:ss')],
          ['班级', '导员', '应到人数', '实到人数', '出勤率', '病假', '事假', '旷课'],
          ...sortedData.map(item => [
            item.className,
            item.teacher,
            item.total,
            item.present,
            `${item.attendanceRate.toFixed(1)}%`,
            item.sick,
            item.leave,
            item.absent
          ]),
          [
            '全校汇总',
            '-',
            totalValue('total'),
            totalValue('present'),
            `${((totalValue('present') / totalValue('total')) * 100).toFixed(1)}%`,
            totalValue('sick'),
            totalValue('leave'),
            totalValue('absent')
          ]
        ]
        // 生成工作簿
        const ws = XLSX.utils.aoa_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, `出勤统计`)
        // 导出文件
        const blob = new Blob(
          [XLSX.write(wb, { type: 'array', bookType: 'xlsx' })],
          { type: 'application/octet-stream' }
        )
        saveAs(blob, `出勤统计_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`)

        await new Promise(resolve => setTimeout(resolve, 2500))
        Toast.show({
          content: '导出成功',
          duration: 2000,
        })
      }
    })


  }

  return (
    <div className="rounded-lg pt-4 pb-4 m-4 mb-40 echarts_bgc">
      <div className="flex items-center justify-between mb-4 pl-2 pr-2">
        <h2 className="text-base font-medium">班级出勤率一览表</h2>

        <div>
          <Popover.Menu
            actions={actions}
            placement='bottom-start'
            onAction={onAction}
            trigger='click'
          >
            <Button color='primary' fill='outline' size='mini'>排序</Button>
          </Popover.Menu>

          <button onClick={() => { DownloadFile() }} className="ml-3 rounded-[4px] !rounded-button bg-blue-500 text-white px-3 py-1">
            导出
          </button>
        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2 px-2 text-left">班级</th>
              <th className="py-2 px-2 text-center">教师</th>
              <th className="py-2 px-2 text-center">出勤</th>
              <th className="py-2 px-2 text-center">病假</th>
              <th className="py-2 px-2 text-center">事假</th>
              <th className="py-2 px-2 text-center">旷课</th>
              <th className="py-2 px-2 text-center">出勤率</th>
            </tr>
          </thead>
          <tbody className="text-sm">

            {
              sortedData.map((item, index) => {
                return (
                  <tr className={`border-b ${index % 2 === 0 ? 'Echarts5_layout' : ''}`} key={index}>
                    <td className="py-2 px-2 ">{item.className}</td>
                    <td className="py-2 px-2 ">{item.teacher}</td>
                    <td className="py-2 px-2 text-center">{item.present}</td>
                    <td className="py-2 px-2 text-center">{item.sick}</td>
                    <td className="py-2 px-2 text-center">{item.leave}</td>
                    <td className="py-2 px-2 text-center">{item.absent}</td>
                    <td className={`py-2 px-2 text-center ${item.attendanceRate < 70 ? 'text-red-500' :
                      item.attendanceRate >= 90 ? 'text-green-500' :
                        'text-yellow-500'
                      }`}>
                      {item.attendanceRate.toFixed(1)}%
                    </td>
                  </tr>

                )
              })
            }
            {
              sortedData.length == 0 && <div className='Ecahrts5_noneDate'>今日未上传数据</div>
            }



          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;

