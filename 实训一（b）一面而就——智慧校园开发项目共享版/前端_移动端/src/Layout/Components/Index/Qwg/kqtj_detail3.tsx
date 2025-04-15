
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import * as echarts from 'echarts';
import { format } from 'date-fns'

import { DatetimePicker, Popover } from 'react-vant'
import { ArrowLeft } from '@react-vant/icons'
import axios from 'axios'
import './css/Qwg.module.css'
import { svgList } from '../../../../../public/svgList/index.tsx' //导入svg

import { BackTop } from 'tdesign-mobile-react';


const actions = [{ text: '按班级展示' }, { text: '按状态展示' }]

function throttle(fn: Function, delay: number) {
    let lastCall = 0
    return (...args: any) => {
        const now = Date.now()
        if (now - lastCall >= delay) {
            fn(...args)
            lastCall = now
        }
    }
}

const App: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState()
    const [dateStr, setDateStr] = useState(() => { return format(new Date(), 'yyyy-MM-dd') }) //选择的考勤日期（字符串形式）
    const [stats, setStats] = useState({ cate2: 0, cate3: 0, cate4: 0 })
    const [errorList, setErrorList] = useState([])
    const [selectSort, setSelectSort] = useState(actions[0].text)  //按条件排序
    const [theme, setTheme] = useState({
        theme: 'round',
        text: '顶部',
    });
    const [isLoading, setIsLoading] = useState(false)

    const getErrorList = () => {
        setIsLoading(true)
        axios.post('http://localhost:3000/QWG/getAllErrorByDate', { dateStr }).then(res => {
            if (res.data.code === 200) {
                setErrorList(res.data.data)
                console.log(res.data.data, '输出所有的异常学生名单')
            }
        }).finally(() =>
            setIsLoading(false)
        )
    }

    // 年级顺序映射表
    const GRADE_MAP = {
        1: { label: '一年组', order: 0 },
        2: { label: '二年组', order: 1 },
        3: { label: '三年组', order: 2 },
        4: { label: '四年组', order: 3 },
        5: { label: '五年组', order: 4 },
        6: { label: '六年组', order: 5 }
    }

    // 数据转换方法
    const transformChartData = (errorList) => {
        // 初始化各类型的数据数组
        const cateData = {
            cate2: [0, 0, 0, 0, 0, 0], // 病假
            cate3: [0, 0, 0, 0, 0, 0], // 事假
            cate4: [0, 0, 0, 0, 0, 0]  // 旷课
        }
        // 填充真实数据
        errorList.forEach(gradeData => {
            const gradeInfo = GRADE_MAP[gradeData.grade]
            if (!gradeInfo) return

            // 统计各类型数量
            cateData.cate2[gradeInfo.order] = gradeData.students.filter(s => s.cate === '2').length
            cateData.cate3[gradeInfo.order] = gradeData.students.filter(s => s.cate === '3').length
            cateData.cate4[gradeInfo.order] = gradeData.students.filter(s => s.cate === '4').length
        })
        return cateData
    }

    useEffect(() => {
        getErrorList()
    }, [dateStr])
    // 计算异常学生总数
    useEffect(() => {
        if (errorList.length > 0) {
            const newStats = {
                cate2: errorList.reduce((sum, grade) =>
                    sum + grade.students.filter(item => item.cate === '2').length, 0),
                cate3: errorList.reduce((sum, grade) =>
                    sum + grade.students.filter(item => item.cate === '3').length, 0),
                cate4: errorList.reduce((sum, grade) =>
                    sum + grade.students.filter(item => item.cate === '4').length, 0)
            }
            setStats(newStats)
        }
    }, [errorList])

    // 触发右上角筛选
    const select = (option:any) => {
        // setSelectSort(option.text)
        // if (option.text === '按班级展示') {

        // }
        // if (option.text === '按状态展示') {

        // }
    }


    const formatClassName = (cls: string) => {
        return cls.replace(/(\d+)年(\d+)班/, (_, gradNum, classNum) => {
            const GRADES = ['一', '二', '三', '四', '五', '六']
            const CLASSES = ['一', '二', '三', '四', '五', '六']
            return `${GRADES[+gradNum - 1] || gradNum}年${CLASSES[+classNum - 1] || classNum}班`
        })
    }
    const [visibleCount, setVisibleCount] = useState(10)
    const [hasMore, setHasMore] = useState(true)
    const listRef = useRef<HTMLDivElement>(null)


    const sortedStudents = useMemo(() => {
        const all = errorList.flatMap(g => g.students);

        return selectSort === '按状态展示'
            ? [...all].sort((a, b) => {
                const statusOrder = { '2': 1, '3': 2, '4': 3 }; // 优化排序逻辑
                return statusOrder[a.cate] - statusOrder[b.cate] ||
                    a.class.localeCompare(b.class);
            })
            : all;
    }, [errorList, selectSort]); // 当数据源或排序方式改变时重新计算


    // 加载更多数据的处理逻辑
    const loadMore = useCallback(() => {
        const element = listRef.current;
        if (!element || isLoading) return; // 加载锁

        const { scrollTop, scrollHeight, clientHeight } = element;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;

        // 增加5px容差
        if (distanceToBottom <= 100 && hasMore) {
            setIsLoading(true);
            setVisibleCount(prev => {
                const next = prev + 10;
                setHasMore(next < sortedStudents.length);
                return next;
            });

            // 优化：使用动画帧等待渲染完成
            requestAnimationFrame(() => {
                setIsLoading(false);
                // 强制触发重检测
                element.scrollTop += 1;
                element.scrollTop -= 1;
            });
        }
    }, [hasMore, sortedStudents.length])

    // 渲染后检测
    useEffect(() => {
        if (listRef.current) {
            listRef.current.dispatchEvent(new Event('scroll'))
        }
    }, [visibleCount])

    // 重置加载状态
    useEffect(() => {
        setVisibleCount(10)
        setHasMore(true)
    }, [errorList, selectSort])

    const renderList = () => {
        const allStudents = errorList.flatMap(g => g.students);
        const sortedStudents = selectSort === '按状态展示'
            ? [...allStudents].sort((a, b) => {
                // 数值型状态排序
                const statusDiff = Number(a.cate) - Number(b.cate);
                if (statusDiff !== 0) return statusDiff;

                // 班级排序增强：提取年级和班级数值
                const getClassOrder = (cls: string) => {
                    const [_, grade, clsNum] = cls.match(/(\d+)年(\d+)班/) || [];
                    return (Number(grade) * 100) + Number(clsNum);
                }
                return getClassOrder(a.class) - getClassOrder(b.class);
            })
            : allStudents;

        const visibleStudents = sortedStudents.slice(0, visibleCount);

        return (
            <div
                ref={listRef}
                className="divide-y"
                onScroll={throttle(loadMore, 100)}
                style={{ padding: '0 16px' }}
            >
                {visibleStudents.map((student, index) => {
                    const status = () => {
                        switch (student.cate) {
                            case '2': return { label: '病假', className: 'bg-yellow-100 text-yellow-600' };
                            case '3': return { label: '事假', className: 'bg-green-100 text-green-600' };
                            case '4': return { label: '旷课', className: 'bg-red-100 text-red-600' };
                            default: return { label: '其他', className: 'bg-gray-100 text-gray-600' };
                        }
                    };

                    return (
                        <div
                            key={`${student._id}-${selectSort}-${index}`}
                            className="py-3"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-base">
                                        {student.name}
                                        <span className="ml-2 text-xs text-gray-400">
                                            ID:{student._id.slice(-4)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {formatClassName(student.class)}
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-sm ${status().className}`}>
                                    {status().label}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                状态：{student.status || '已记录'}
                            </div>
                        </div>
                    );
                })}

                {/* 加载状态提示 */}
                {hasMore ? (
                    <div className="py-4 text-center text-gray-400">
                        <span className="animate-pulse">加载更多数据...</span>
                    </div>
                ) : visibleStudents.length > 0 && (
                    <div className="py-4 text-center text-gray-400">没有更多数据了</div>
                )}
            </div>
        );
    };



    // 柱状图
    React.useEffect(() => {
        const chartDom = document.getElementById('attendanceChart');
        const myChart = echarts.init(chartDom);
        const chartData = transformChartData(errorList)
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['病假', '事假', '旷课'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                // data: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
                data: ['人工智能学院', '云计算学院', '大数据学院', '数智传媒学院', '鸿蒙生态开发学院', '元宇宙学院'],
                axisLabel: {          // 新增axisLabel配置
                    interval: 0,     // 强制显示所有标签
                    rotate: 30,      // 旋转45度
                    fontSize: 12,    // 可选：调整字体大小
                    margin: 10       // 可选：标签与轴线间距
                },
                axisTick: {
                    alignWithLabel: true  // 保证刻度线与标签对齐
                }
    
            }],
            yAxis: [{
                type: 'value',
                name: '人数'
            }],
            series: [
                {
                    name: '病假',
                    type: 'bar',
                    stack: 'total',
                    data: chartData.cate2,
                    itemStyle: {
                        color: '#FFC107'
                    }
                },
                {
                    name: '事假',
                    type: 'bar',
                    stack: 'total',
                    data: chartData.cate3,
                    itemStyle: {
                        color: '#4CAF50'
                    }
                },
                {
                    name: '旷课',
                    type: 'bar',
                    stack: 'total',
                    data: chartData.cate4,
                    itemStyle: {
                        color: '#F44336'
                    }
                }
            ]
        };
        myChart.setOption(option);

        return () => {
            myChart.dispose()
        };
    }, [errorList])
    // 环形图
    React.useEffect(() => {
        const pieChartDom = document.getElementById('attendancePieChart');
        const pieChart = echarts.init(pieChartDom);
        const pieOption = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                bottom: '0%',
                left: 'center'
            },
            series: [
                {
                    name: '考勤统计',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: stats.cate2, name: '病假', itemStyle: { color: '#FFC107' } },
                        { value: stats.cate3, name: '事假', itemStyle: { color: '#4CAF50' } },
                        { value: stats.cate4, name: '旷课', itemStyle: { color: '#F44336' } }
                    ]
                }
            ]
        };
        pieChart.setOption(pieOption)
        return () => {
            pieChart.dispose()
        }
    }, [stats])
    return (
        <div className="relative min-h-screen bg-gray-50"
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
            {/* 顶部导航栏 */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
                <div className="flex items-center justify-between px-4 h-14">
                    <h1 className="text-lg font-medium Kqtj_topicon">
                        <ArrowLeft onClick={() => { window.history.back() }} />
                        <span>异常学生统计</span>
                    </h1>
                    <div className="flex items-center">
                        <DatetimePicker
                            popup={{
                                round: true,
                            }}
                            type='date'
                            title='选择日期'
                            minDate={new Date(2025, 0, 1)}
                            maxDate={new Date()}
                            value={selectedDate}
                            onConfirm={(date) => {
                                setSelectedDate(date)
                                setDateStr(format(date, 'yyyy-MM-dd'))
                            }}
                        >
                            {(val, _, actions) => {
                                return (
                                    <span onClick={() => actions.open()}>{dateStr}</span>
                                )
                            }}

                        </DatetimePicker>
                    </div>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="pt-16 pb-16 px-4"
                ref={listRef}
                onScroll={throttle(loadMore, 200)}
                style={{ flex: 1, overflowY: 'auto', boxSizing: 'border-box', position: 'relative', marginTop: '56px', height: 'calc(100vh - 56px)' }}>
                {/* 数据概览卡片 */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm text-yellow-600">病假</div>
                        <div className="text-xl font-semibold text-yellow-700 mt-1">{stats.cate2}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm text-green-600">事假</div>
                        <div className="text-xl font-semibold text-green-700 mt-1">{stats.cate3}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-sm text-red-600">旷课</div>
                        <div className="text-xl font-semibold text-red-700 mt-1">{stats.cate4}</div>
                    </div>
                </div>

                {/* 图表区域 */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-base font-medium">考勤统计</div>
                    </div>
                    <div id="attendanceChart" style={{ width: '310px', height: '300px' }}></div>
                </div>

                {/* 详细列表 */}
                <div className="bg-white rounded-lg shadow-sm pt-4 px-4">
                    {/* 环形图 */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="text-base font-medium mb-4">考勤类型分布</div>
                        <div id="attendancePieChart" style={{ width: '310px', height: '260px' }}></div>
                    </div>
                    <div
                        style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}
                        className="text-base font-medium mb-4 mt-4">
                        <span>
                            异常考勤记录
                            <span style={{ fontSize: '12px', paddingLeft: "5px", color: "gray" }}>共{stats.cate2 + stats.cate3 + stats.cate4}条</span>
                        </span>
                        <Popover
                            placement="bottom-start"
                            actions={actions}
                            onSelect={select}
                            reference={
                                <div
                                    style={{
                                        backgroundColor: "whitesmoke",
                                        fontSize: "13px",
                                        padding: "3px 8px",
                                        borderRadius: "10px",
                                        display: 'flex',
                                        alignItems: "center"
                                    }}>
                                    {selectSort}
                                    {svgList.kqtj_detail3_1}
                                </div>
                            }
                        />
                    </div>

                    {renderList()}

                </div>
            </div>

            <BackTop text={theme.text} theme={theme.theme} container={() => listRef.current} target={() => listRef.current} />
        </div >
    );
};

export default App;

