//////////////////////////////////////////////////////////////
//  👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
//  班级考勤页面
//  author: 齐wg
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Style from './css/Qwg.module.css'
import Bjkq_Studentlist from './Components/Bjkq_Studentlist.tsx' //引入子组件
import { format } from 'date-fns'
import axios from 'axios'
import { NavBar, Search, Toast, DatetimePicker, Popover } from 'react-vant'
import { WeappNav } from '@react-vant/icons'
import { Picker } from 'antd-mobile'
import { svgList } from '../../../../../public/svgList/index.tsx' //导入svg

interface PopoverOption {
    text: string;
    icon?: React.ReactNode;
}
interface PayloadType {
    _id: string | number | any;
    name?: string;
    classid: string | number | any;
    attendance: {
        cate: string;
    }[]
}

// picker所需数据
// const basicColumns = [
//     [
//         { label: '一年级', value: '1' },
//         { label: '二年级', value: '2' },
//         { label: '三年级', value: '3' },
//         { label: '四年级', value: '4' },
//         { label: '五年级', value: '5' },
//         { label: '六年级', value: '6' },
//     ],
//     [
//         { label: '（1）班', value: '1' },
//         { label: '（2）班', value: '2' },
//         { label: '（3）班', value: '3' },
//     ],
// ]
const basicColumns = [
    [
        { label: '人工智能学院', value: '1' },
        { label: '云计算学院', value: '2' },
        { label: '大数据学院', value: '3' },
        { label: '数智传媒学院', value: '4' },
        { label: '鸿蒙生态开发学院', value: '5' },
        { label: '元宇宙学院', value: '6' },
    ],
    [
        { label: '2501A', value: '1' },
        { label: '2501B', value: '2' },
        { label: '2501C', value: '3' },
    ],
]
// Popover气泡弹出框所需数据
const iconActions = [
    { text: '考勤统计', icon: svgList.Bjkq_1 },
    { text: '请假管理', icon: svgList.Bjkq_2 },
    { text: '快速选择', icon: svgList.Bjkq_3 }
]

const Bjkq: React.FC = () => {
    const navigate = useNavigate()
    const [visible, setVisible] = useState<boolean>(false) //是否展示picker
    const [pickerValue, setPickerValue] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('pickerValue')
            return saved ? JSON.parse(saved) : ['1', '1']
        } catch {
            return ['1', '1']
        }
    })    //存储picker选择的班级
    const [searchVal, setSearchVal] = useState('')  //搜索关键字
    const [kqDate, setKqDate] = useState(new Date())  //选择的考勤日期（默认值为当天）
    const [dateStr, setDateStr] = useState(() => { return format(new Date(), 'yyyy-MM-dd') }) //选择的考勤日期（字符串形式）

    // 获取班级数据：
    const [classMsg, setclassMsg] = useState([]) //班级信息
    const [studentList, setStudentList] = useState([])  //当前班级的学生数据
    const [total, setTotal] = useState('00') //当前班级的学生总数
    const [kuangke, setKuangke] = useState(0) //当前班级学生的旷课总数
    const [qingjia, setQingjia] = useState(0) //当前班级学生的请假总数
    const [present, setPresent] = useState(0)  // 到校人数
    const [isToday, setIsToday] = useState(true) //表示是否是今天
    const [hasSubmitted, setHasSubmitted] = useState(false) //表示当天是否已上传过考勤
    const [showValidation, setShowValidation] = useState(false) //表示是否提示有未选择的学生

    // 刷新页面后不改变班级
    const getClassNameFromValues = (values: string[]) => {
        return basicColumns
            .map((column, index) =>
                column.find(item => item.value === values[index])?.label || ''
            )
            .join('')
    }
    const [bjvalue, setBjvalue] = useState(() =>
        getClassNameFromValues(pickerValue)
    )
    useEffect(() => {
        localStorage.setItem('pickerValue', JSON.stringify(pickerValue))
        setBjvalue(getClassNameFromValues(pickerValue))
        return () => {
            localStorage.removeItem('pickerValue') //切换路由,销毁pickerValue
        }
    }, [pickerValue])


    // 处理picker确认选择
    const handleConfirm = (values: string[]) => {
        setPickerValue(values)
        const selectedLabels = basicColumns.map((column, index) => {
            return column.find(item => item.value === values[index])?.label || ''
        })
        setBjvalue(`${selectedLabels[0]}${selectedLabels[1]}`)
        setVisible(false)
    }
    // 根据班级、日期及搜索关键字，获取学生列表
    const getstudentList = () => {
        axios.post('http://localhost:3000/QWG/getStudentsByClass', {
            pickerValue, searchVal, dateStr
        }).then(res => {
            if (res.data.code === 200) {
                const { classInfo, students, total, hasSubmitted: newHasSubmitted } = res.data.data
                setclassMsg(classInfo)
                setStudentList(students)
                setTotal(total)
                setHasSubmitted(newHasSubmitted)

                // 判断是否未提交考勤记录
                const isCurrentToday = dateStr === format(new Date(), 'yyyy-MM-dd')
                if (!isCurrentToday && !newHasSubmitted) {
                    Toast.info({
                        message: `该班级${dateStr}\n未提交考勤记录`,
                        duration: 1000
                    })
                }
            }
        })
    }
    //当班级和日期改变时，重新获取学生及其出勤状态
    useEffect(() => {
        getstudentList()
        setShowValidation(false)
    }, [pickerValue, dateStr])
    // console.log(studentList, '实时学生列表')

    // 添加搜索防抖
    useEffect(() => {
        const handler = setTimeout(() => {
            getstudentList()
        }, 500)
        return () => {
            clearTimeout(handler)
        }
    }, [searchVal])
    const onSearch = () => {
        console.log(searchVal)
    }


    // 监听studentList变化，计算旷课和请假人数
    useEffect(() => {
        if (!studentList.length) return;
        // 自动重新计算当前列表中的状态
        const newKuangke = studentList.filter(item => item.cate === '4').length
        const newQingjia = studentList.filter(item => ['2', '3'].includes(item.cate)).length
        const newPresent = studentList.filter(item => item.cate === '1').length
        setKuangke(newKuangke)
        setQingjia(newQingjia)
        setPresent(newPresent)
    }, [studentList])

    // 在日期kqDate和所选班级改变时校验
    useEffect(() => {
        const todayStr = format(new Date(), 'yyyy-MM-dd')
        setIsToday((dateStr === todayStr))
    }, [dateStr])

    // 发送考勤
    const sendKq = () => {
        // 校验逻辑👇👇👇
        if (!isToday) return Toast.info('不能修改历史考勤')
        if (!classMsg._id) return Toast.info('缺少班级信息') // 验证必须存在班级信息
        // 筛选出无状态的学生列表
        const invalidStudents = studentList.filter(item =>
            !item.cate || !['1', '2', '3', '4'].includes(item.cate.toString())
        )
        if (invalidStudents.length > 0) {
            setShowValidation(true)

            return Toast.fail({
                message: `${invalidStudents.length}名学生未完成考勤`,
                style: {
                    '--rv-toast-text-color': '#fff',
                    '--rv-toast-background-color': 'rgba(0, 0, 0, 0.7)'
                },
                duration: 1000,
                closeOnClick: true,
                onOpened: () => {
                    // 添加滚动定位逻辑 
                    const invalidItems = document.querySelectorAll('[data-invalid="true"]')

                    if (invalidItems.length > 0) {

                        const firstInvalid = invalidItems[0]
                        const navBar = document.querySelector('.rv-nav-bar')
                        const navHeight = navBar ? navBar.offsetHeight : 56

                        const elementTop = firstInvalid.getBoundingClientRect().top + window.scrollY
                        const targetPosition = elementTop - navHeight - 45

                        window.scrollTo({
                            top: Math.max(targetPosition, 0),
                            behavior: 'smooth'
                        })
                    }
                }
            })
        }
        setShowValidation(false)

        // 上传数据逻辑👇👇👇
        const payload: PayloadType[] = studentList.map(student => ({
            _id: student._id,  
            name: student.name,  
            classid: student.classid,  
            attendance: [{
                cate: student.cate.toString()
            }]
        }))
        // console.log(payload, 'payload');

        axios.post('http://localhost:3000/QWG/sendKq', {
            classId: classMsg._id,
            dateStr,
            studentsData: payload
        }).then(res => {
            if (res.data.code === 200) {
                Toast.success('上传成功！')
                getstudentList()
            }
        })
    }
    // 点击页面右上角三个点 触发方法
    const select = (option: PopoverOption) => {
        if (option.text === '快速选择') {
            if (!isToday) {
                Toast.info({
                    message: `历史记录不可更改状态！`,
                    duration: 1500
                })
                return
            }
            const newList = studentList.map(item => ({
                ...item as any,
                cate: '1'
            }))

            setStudentList(newList as any)
            Toast.info('快速选择为到校')
        }
        if (option.text === '考勤统计') {
            navigate('/kqtj')

        }
        if (option.text === '请假管理') {
            navigate('/qingjia')

        }
    }


    return (
        <div className={Style.BjkqPage}>
            {/* 顶部区域navbar + picker */}
            <Picker
                columns={basicColumns}
                value={pickerValue}
                visible={visible}
                onClose={() => setVisible(false)}
                onConfirm={handleConfirm as any}
            >
                {/* 子元素通过visible控制 */}
            </Picker>
            <NavBar
                border={true}
                fixed={true}
                placeholder={true}
                // 点击title标题 触发picker
                title={
                    <div className={Style.piker_title} onClick={() => setVisible(true)}>
                        <span>{bjvalue}</span>
                        {svgList.Bjkq_4}
                    </div>
                }
                onClickLeft={() => navigate('/layout')}
                rightText={
                    <Popover
                        placement="bottom-end"
                        actions={iconActions}
                        teleport={() => document.body}
                        duration={50}
                        // overlay={true}
                        onSelect={select}
                        reference={
                            <span style={{ display: 'inline-block' }}>
                                <WeappNav fontSize={22} />
                            </span>
                        }
                    />

                }
                onClickRight={() => { }}
            />

            {/* 搜索模块 */}
            <div className={Style.BjkqPage_search}>
                <Search className={Style.BjkqPage_search1} onSearch={onSearch} value={searchVal} onChange={setSearchVal} clearable placeholder="请输入搜索关键词" />
            </div>
            <div className={Style.BjkqPage_search_layout}></div>
            {/* 引入学生名单模块 */}
            <Bjkq_Studentlist
                studentList={studentList}
                classMsg={classMsg}
                isToday={isToday}
                dateStr={dateStr}
                hasSubmitted={hasSubmitted}
                onCateChange={async (id: string, newCate: string) => {
                    const newList = studentList.map(item =>
                        item._id === id ? { ...item as any, cate: newCate } : item
                    )
                    setStudentList(newList as any)
                }}
                showValidation={showValidation}
            ></Bjkq_Studentlist>

            {/* 底部上传考勤模块 */}
            <div className={Style.BjkqPage_footer}>
                <div className={Style.BjkqPage_footer_item}>
                    <div>
                        <DatetimePicker
                            popup={{
                                round: true,
                            }}
                            type='date'
                            title='选择日期'
                            minDate={new Date(2025, 0, 1)}
                            maxDate={new Date()}
                            value={kqDate}
                            onConfirm={(date) => {
                                setDateStr(format(date, 'yyyy-MM-dd')) //保持本地时间字符串传递
                                setKqDate(date)
                            }}
                        >
                            {(val, _, actions) => {
                                return (
                                    <span onClick={() => actions.open()} className={Style.BjkqPage_footer_item_date}>
                                        <span>{format(val, 'yyyy-MM-dd')}</span>
                                        {svgList.Bjkq_4}
                                    </span>
                                )
                            }}
                        </DatetimePicker>
                    </div>
                    <div className={Style.BjkqPage_footer_item_bottom}>
                        应到{total}人，
                        实到{hasSubmitted? Number(total) - Number(kuangke) - Number(qingjia) : present}人，
                        旷课{kuangke}人，
                        请假{qingjia}人
                        </div>
                </div>
                <div className={Style.BjkqPage_footer_button}>
                    {isToday && (
                        <button
                            onClick={sendKq}
                            disabled={!isToday}
                            style={{ backgroundColor: hasSubmitted ? '#F19548' : '#2196F3' }}
                        >
                            {hasSubmitted ? '修改考勤' : '上传考勤'}
                        </button>
                    )}
                </div>
            </div>
            <div className={Style.BjkqPage_footer_layout}></div>
        </div>
    )
}

export default Bjkq
