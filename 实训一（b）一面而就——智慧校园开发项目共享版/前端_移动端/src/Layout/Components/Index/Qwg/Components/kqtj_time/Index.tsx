import { useState, useMemo, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, isToday, eachDayOfInterval, isSameDay, getDay } from 'date-fns'
import { DatePicker } from 'antd-mobile'

import './Calendar.css'

interface CalendarDay {
  date: Date | null
  isCurrentMonth: boolean
}

const SmallCalendar = ({setSelectDate}) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [visible, setVisible] = useState(false)

  useEffect(()=>{
    setSelectDate(selectedDate)
  },[selectedDate])

  // 生成月份日期数据
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const startDay = getDay(monthStart)
    
    // 生成当前月所有日期
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // 补齐前导空白
    return [
      ...Array.from<CalendarDay>({ length: startDay }).fill({ 
         date: null, 
         isCurrentMonth: false 
      }),
      ...days.map(date => ({ 
        date, 
        isCurrentMonth: true 
      }))
    ]
  }, [selectedDate])



  // 将日期数组按周分组
  const weeks = useMemo(() => {
    return Array.from({ length: Math.ceil(monthDays.length / 7) }, (_, i) =>
      monthDays.slice(i * 7, (i + 1) * 7)
    )
  }, [monthDays])

  return (
    <div className="calendar-container">
      <div className="mini-calendar" onClick={() => setVisible(true)}>
        <div className="calendar-header">
          {format(selectedDate, 'yyyy/M')}
        </div>


        <div className="weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <span key={day} className="weekday">{day}</span>
          ))}
        </div>



        <div className="calendar-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`calendar-day ${
                    day.date && isSameDay(day.date, selectedDate) ? 'active' : ''
                  } ${day.date && isToday(day.date) ? 'today' : ''}`}
                >
                  {day.date ? format(day.date, 'd') : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 弹出式日期选择器 */}
      <DatePicker
        title="选择日期"
        visible={visible}
        onClose={() => setVisible(false)}
        max={new Date()}
        value={selectedDate}
        onConfirm={date => {
          setSelectedDate(date)
          setVisible(false)
        }}
        style={{
          '--adm-font-size-main': '14px',
          '--adm-color-text': 'rgba(0,0,0,0.8)'
        }}
      />
    </div>
  )
}

export default SmallCalendar
