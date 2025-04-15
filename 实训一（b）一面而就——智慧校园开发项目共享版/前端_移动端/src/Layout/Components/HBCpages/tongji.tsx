import React, { useEffect, useRef, useState } from "react";
import './hbc.css';
import XiaLie from './component/xialie';
import Zukuai from './component/zukuai';
import { Picker, Button, Toast } from 'antd-mobile';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './css/common.module.css';

interface StatItem {
  label: string;
  value: string | number;
}

interface EmployeeData {
  id: number;
  name: string;
  age: number;
}

const App: React.FC = () => {
    const [times, setTimes] = useState('');
    const [basicColumns, setBasicColumns] = useState([
        [
            { label: "2025年03月", value: "2025年03月" },
            { label: "2025年02月", value: "2025年02月" },
            { label: "2025年01月", value: "2025年01月" },
        ]
    ]);
    const [basic, setBasic] = useState('2025年03月');
    const chartRef = useRef<HTMLDivElement>(null);
    
    // 统计数据
    const statData: StatItem[] = [
        { label: "实际出勤天数", value: "23天" },
        { label: "迟到", value: "1次" },
        { label: "早退", value: "0次" },
        { label: "缺卡", value: "1次" },
        { label: "外勤", value: "0次" },
    ];
    
    // 员工数据
    const sampleData: EmployeeData[] = [
        { id: 1, name: '张建', age: 5 },
        { id: 2, name: '李军', age: 2 },
        { id: 3, name: '杨洋', age: 12 },
        { id: 4, name: '王府领', age: 8 },
        { id: 5, name: '李海望', age: 7 }
    ];
    
    useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            
            myChart.setOption({
                title: {
                    text: '员工出勤情况统计',
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'normal'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'category',
                    data: sampleData.map(item => item.name),
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '出勤天数'
                },
                series: [
                    {
                        data: sampleData.map(item => item.age),
                        type: 'bar',
                        showBackground: true,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#1677ff' },
                                { offset: 1, color: '#4096ff' }
                            ])
                        },
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        }
                    }
                ]
            });
            
            // 窗口大小变化时重新调整图表大小
            const handleResize = () => {
                myChart.resize();
            };
            
            window.addEventListener('resize', handleResize);
            
            // 销毁
            return () => {
                window.removeEventListener('resize', handleResize);
                if (myChart) {
                    myChart.dispose();
                }
            };
        }
    }, [sampleData]);
    
    const exportToExcel = () => {
        const result = window.confirm('是否要下载Excel文件?');
        if (!result) {
            return;
        }
        
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(sampleData);
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "员工数据");
        
        // 转换文件
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        
        // 保存文件
        saveAs(data, `员工出勤数据(${basic}).xlsx`);
        Toast.show('文件下载成功');
    };
    
    return (
        <div className={styles['page-container']}>
            <div className={styles.header}>
                <Zukuai title="统计" area="/layout"></Zukuai>
            </div>
            
            <div className={styles.content}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Button
                        style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            padding: '10px 20px',
                            borderRadius: '8px'
                        }}
                        onClick={async () => {
                            const value = await Picker.prompt({
                                columns: basicColumns,
                            });
                            Toast.show(`已选择 ${value}`);
                            setBasic(`${value}`);
                        }}
                    >
                        {basic}出勤情况
                    </Button>
                </div>
                
                <div className={styles.card}>
                    <h3 className={styles.title}>考勤统计</h3>
                    
                    {statData.map((item, index) => (
                        <div key={index} className={styles['stat-item']}>
                            <span className={styles['stat-label']}>{item.label}</span>
                            <span className={styles['stat-value']}>{item.value}</span>
                        </div>
                    ))}
                </div>
                
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className={styles.title} style={{ margin: 0 }}>员工出勤展示</h3>
                        <Button
                            color='success'
                            onClick={exportToExcel}
                            style={{ fontSize: '14px', borderRadius: '6px' }}
                        >
                            导出Excel
                        </Button>
                    </div>
                    
                    <div ref={chartRef} className={styles['chart-container']} style={{ height: '300px' }}></div>
                </div>
            </div>
            
            <XiaLie></XiaLie>
        </div>
    );
};

export default App;