//////////////////////////////////////////////////////////////
//  👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
//  考勤统计页面
//  对应路由：/kqtj
//  from: q
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { svgList } from '../../../../../public/svgList/index.tsx' //导入svg
import dayjs from 'dayjs'
import Style from './css/Kqtj.module.css'
import axios from 'axios'

import { FloatingBubble, Popup, DatePicker } from 'antd-mobile'
import { NavBar, Toast, Popover } from 'react-vant'
import { NotesO } from '@react-vant/icons';

import img1 from '../../../../../public/imgs/bangong1.png'

import Echarts1 from './Components/Echarts1.jsx'          //子组件-顶部Echarts1柱状图
import MiniTime from './Components/kqtj_time/Index.tsx'   //子组件-迷你日历
import MiniClock from './Components/kqtj_time/Clock.jsx'  //子组件-迷你时钟
import Aichat from './Components/Ai/Aichat.jsx'           //Ai子组件
// import AttendanceTrendChart from './Components/Echarts2.tsx';  //echarts2子组件
import Echarts3 from './Components/Echarts3.tsx';         //echarts3子组件  环形图
import Echarts4 from './Components/Echarts4.tsx';         //echarts4子组件  
import Echarts5 from './Components/Echarts5.tsx';         //echarts5子组件 

interface FiveDayData {
  date: string
  data: {
    present: number
    sick: number
    leave: number
    absent: number
  }
}
interface ClassAttendanceData {
  teacher: string
  className: string
  present: number
  sick: number
  leave: number
  absent: number
  attendanceRate: number
}


const popupActions = [{ text: '按日查看', icon: svgList.kqtj_2 }, { text: '月度报表', icon: svgList.kqtj_3 }]

const Kqtj: React.FC = () => {
  const navigate = useNavigate()
  const [selectDate, setSelectDate] = useState<Date>(new Date())  //所选日期

  const [mock, setMock] = useState<String>('day')  //分类： day || week
  const [statsData, setStatsData] = useState({
    total: 0,
    present: 0,    // 实出勤 => total - (病假+事假+旷课)
    cate2: 0,      // 病假
    cate3: 0,      // 事假
    cate4: 0       // 旷课
  }) //后端返回所选日期的出勤数据
  const [isDataLoaded, setIsDataLoaded] = useState(false)  //加载状态 解决echarts数据无法实时更新问题
  const [visible, setVisible] = useState(false)   //展开ai对话框
  const [fiveDayData, setFiveDayData] = useState<FiveDayData[] | null>(null) //存储五天的数据状态
  const [echarts5Data, setEcharts5Data] = useState<ClassAttendanceData[] | null>(null) //所选日期教师对应班级的数据
  const [SelectDataVisible, setSelectDataVisible] = useState(false)
  // 添加日期格式化函数
  const formatDisplayDate = (date: Date) => {
    return dayjs(date).isSame(dayjs(), 'day')
      ? "今日"
      : dayjs(date).format("MM月DD日")
  }

  // 触发右上角筛选
  const select = (option: PopoverOption) => {
    if (option.text === '按日查看') {
      setMock('day')
      Toast.info('按日期查看')


    }
    if (option.text === '月度报表') {
      setMock('week')
      Toast.info('按月份查看')
    }
  }

  // 计算出勤率
  const chuqinRate = (((statsData.present) / statsData.total) * 100).toFixed(1)

  // 按日期获取数据
  const fetchStatsData = async () => {
    try {
      setIsDataLoaded(false) // 请求开始时重置状态

      const localDateStr = dayjs(selectDate).format('YYYY-MM-DD')
      // console.log(localDateStr, '日期字符串')

      const { data } = await axios.post('http://localhost:3000/QWG/getStatsData', {
        dateStr: localDateStr,
        mode: mock
      })
      const { total, attendance } = data.data
      const present = total - (attendance.cate2 + attendance.cate3 + attendance.cate4)

      setStatsData({
        total,
        present,
        cate2: attendance.cate2,
        cate3: attendance.cate3,
        cate4: attendance.cate4
      })
      setIsDataLoaded(true) // 数据加载完成
    } catch (err) {
      Toast.fail('数据加载失败')
      setIsDataLoaded(true) // 数据加载完成
    }
  }


  // 获取五日数据
  const fetchFiveDayData = async () => {
    try {
      const { data } = await axios.post('http://localhost:3000/QWG/getFiveDayAttendance', {
        dateStr: dayjs(selectDate).format('YYYY-MM-DD'),
        mode: mock
      })
      if (data.code === 200) {
        setFiveDayData(data.data)
      }
    } catch (err) {
      Toast.fail('五日趋势数据获取失败')
    }
  }

  const fetchEcharts5Data = async () => {
    try {
      const localDateStr = dayjs(selectDate).format('YYYY-MM-DD')
      const { data } = await axios.post('http://localhost:3000/QWG/getEcharts5Data', {
        dateStr: localDateStr
      })

      if (data.code === 200) {
        setEcharts5Data(data.data)
      } else {
        setEcharts5Data(null)
        Toast.fail('班级数据获取失败')
      }
    } catch (err) {
      Toast.fail('网络请求异常')
      setEcharts5Data(null)
    }
  }
  // useEffect(() => {
  //   fetchEcharts5Data()
  // }, [selectDate])

  // 监听选择变化
  useEffect(() => {
    fetchStatsData()
    fetchFiveDayData() //获取五天出勤数据
    fetchEcharts5Data()  //获取所选日期教师对应班级的出勤数据
  }, [selectDate, mock]) // 响应日期切换和模式切换

  useEffect(() => {
    Toast.info(`${formatDisplayDate(selectDate)}出勤数据`)
  }, [selectDate])

  // 跳转至按照班级展示考勤（detail1）页面
  const goKqtj_detail1 = () => {
    navigate('/kqtj_detail1', { state: { selectDate: selectDate } })
  }

  const goKqtj_detail2 = () => {
    navigate('/kqtj_detail2', { state: { selectDate: selectDate } })
  }

  const goKqtj_detail3 = () => {
    navigate('/kqtj_detail3', { state: { selectDate: selectDate } })
  }

  return (
    <div className='kqtjpage'>
      {/* navbar模块 */}
      <div>
        <NavBar
          placeholder={true}
          className={Style.kqth_navbar}
          border={true}
          fixed={true}
          title={
            <span onClick={() => setSelectDataVisible(true)} className={Style.navtitle}>{formatDisplayDate(selectDate)}出勤报表</span>
          }
          onClickLeft={() => { window.history.back() }}
          rightText={
            <Popover
              placement="bottom-end"
              actions={popupActions}
              teleport={() => document.body}
              duration={50}
              // overlay={true}
              onSelect={select}
              reference={
                <span style={{ display: 'inline-block' }}>{svgList.kqtj_1}</span>
              }
            />
          }
        />
      </div>
      {/* 迷你日历、时钟模块 */}
      <div className={Style.kqth_top}>
        <div className={Style.kqth_top_item1}>
          <MiniTime setSelectDate={setSelectDate}></MiniTime>
        </div>
        <div className={Style.kqth_top_item2}>
          <MiniClock></MiniClock>
        </div>
      </div>

      {/* 弹出式日期选择器 */}
      <DatePicker
        title="选择日期"
        visible={SelectDataVisible}
        onClose={() => setSelectDataVisible(false)}
        max={new Date()}
        value={selectDate}
        onConfirm={date => {
          setSelectDate(date)
          setSelectDataVisible(false)
        }}
        style={{
          '--adm-font-size-main': '14px',
          '--adm-color-text': 'rgba(0,0,0,0.8)'
        }}
      />

      {/* 中部，出勤数据展示及按需展示模块 */}
      <div className={Style.kqth_model1}>
        <div className={Style.kqth_model1_layout}>

          <div className={Style.kqth_model1_top}>
            {/* 出勤率 */}
            <p>
              <span>按 <b>{mock === 'day' ? '日期' : '月份'}</b> 查看，{formatDisplayDate(selectDate)}出勤率：</span>
              <span style={{ color: Number(chuqinRate) > 70 ? 'green' : 'red' }}>{chuqinRate}%</span>
            </p>
          </div>

          <div className={Style.kqth_model1_num}>
            <div className={Style.kqth_model1_item}>
              <div className={Style.cate1}>{statsData.total}</div>
              <div>应出勤数</div>
            </div>
            <div className={Style.kqth_model1_item}>
              <div className={Style.cate2}>{statsData.present}</div>
              <div>实出勤数</div>
            </div>
            <div className={Style.kqth_model1_item}>
              <div className={Style.cate3}>{statsData.cate2 + statsData.cate3}</div>
              <div>事假人数</div>
            </div>
            <div className={Style.kqth_model1_item}>
              <div className={Style.cate4}>{statsData.cate4}</div>
              <div>旷课人数</div>
            </div>
          </div>
          {/* 引入echarts图表1 展示出勤缺勤情况*/}
          <div>
            {isDataLoaded && <Echarts1 statsData={statsData} />}
          </div>
          <div className={Style.kqth_model1_layout_bottom}>
            <NotesO />
            <span>{formatDisplayDate(selectDate)}</span>
          </div>
        </div>


        {/* 按需选择展示数据的方式 */}
        <div className={Style.kqth_model1_select}>

          <div onClick={goKqtj_detail1} className={Style.kqth_model1_select_left}>
            <div className={Style.kqth_model1_select_left_title}>
              <p>班级出勤统计</p>
              <p>
                点击进入
                {svgList.kqtj_detail1_2}
              </p>
            </div>
            <span className={Style.kqth_model1_select_left_img}>
              <img src={img1} alt="" />
            </span>
          </div>


          <div className={Style.kqth_model1_select_right}>
            <div onClick={goKqtj_detail2} className={Style.kqth_model1_select_right_item}>
              <span>
                {svgList.kqtj_detail1_3}
                学院横向对比
              </span>
            </div>
            <div onClick={goKqtj_detail3} className={Style.kqth_model1_select_right_item}>
              <span>
                {svgList.kqtj_detail1_4}
                异常学生统计
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部echarts数据展示 */}

      {/* <div className="mt-6">
        <AttendanceTrendChart
          days={14}
          height={400}
          themeColor="#FF6B6B"
          className="custom-chart-container"
          apiUrl="/api/custom-trend-endpoint"
        />
      </div> */}

      {/* 三个Echarts图表展示数据： */}
      <div className={Style.echarts_model}>
        {/* {isDataLoaded && statsData && <Echarts3 statsData={statsData} />} */}
        {isDataLoaded && statsData.total > 0 ? (
          <Echarts3 statsData={statsData} />
        ) : (
          <div className="empty-placeholder">暂无出勤数据</div>
        )}
      
      
      </div>

      <div className={Style.echarts_model}>
        {isDataLoaded && fiveDayData && <Echarts4 fiveDayData={fiveDayData} />}
      </div>
      <div className={Style.echarts_model}>
        {isDataLoaded && echarts5Data && <Echarts5 selectDate={selectDate} echarts5Data={echarts5Data} />}
      </div>


      {/* AI浮动图标  */}
      <FloatingBubble
        axis='xy'
        magnetic='x'
        style={{
          '--initial-position-bottom': '100px',
          '--initial-position-right': '-23px',
          '--edge-distance': '0',
        }}
      >
        <span onClick={() => { setVisible(true) }}>
          {svgList.kqtj_4}
        </span>
      </FloatingBubble>
      {/* 点击ai图标，弹出对话框： */}
      <Popup
        visible={visible}
        showCloseButton
        onClose={() => {
          setVisible(false)
        }}
        onMaskClick={() => {
          setVisible(false)
        }}>
        <div style={{ height: '93vh', overflowY: 'scroll', 'zIndex': '9999' }}>
          <Aichat></Aichat>
        </div>
      </Popup>
    </div>
  )
}

export default Kqtj
