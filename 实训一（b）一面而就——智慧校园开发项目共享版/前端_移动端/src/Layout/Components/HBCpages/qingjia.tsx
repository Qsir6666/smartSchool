import React, { useEffect, useState } from "react";
import ZuKuai from './component/zukuai'
import Qing from './component/qing'
import axios from "axios";
import './mocks/index'
import { Avatar, List, Button } from 'antd-mobile'
import { useNavigate } from "react-router-dom";

// 定义请假项目的类型接口
interface QingJiaItem {
    id: number;
    name: string;
    zhaopian: string;
    xueyuan: string;
    nianji: string;
    status: boolean;
    action: boolean;
    datatime?: string;
}

const App: React.FC = () => {
    const navigate = useNavigate()
    const [listJia, setlistJia] = useState<QingJiaItem[]>([])
    // 添加筛选后的列表状态
    const [filteredList, setFilteredList] = useState<QingJiaItem[]>([])
    // 默认选中"全部学院"
    const [selectedCollege, setSelectedCollege] = useState<string>("全部学院")

    const getlistJia = () => {
        axios({
            method: 'get', url: '/hbc/jia'
        }).then((res) => {
            // console.log(res.data.data, '123')
            const data = res.data.data as QingJiaItem[]
            setlistJia(data)
            // 初始化筛选后的列表为所有数据
            filterByCollege(data, selectedCollege)
        })
    }

    useEffect(() => {
        getlistJia()
    }, [])

    // 根据学院筛选数据
    const filterByCollege = (data: QingJiaItem[], college: string) => {
        if (!college || college === "全部学院") {
            setFilteredList(data)
        } else {
            const filtered = data.filter(item => item.xueyuan === college)
            setFilteredList(filtered)
        }
    }

    // 学院选择变化的回调函数
    const handleCollegeSelect = (college: string) => {
        // console.log('选择的学院:', college)
        setSelectedCollege(college)
        filterByCollege(listJia, college)
    }

    const tiao = (eve: QingJiaItem) => {
        navigate('/xiang', { state: { item: eve } })
    }

    return (
        <div>
            <ZuKuai title='请假管理' area="/layout"></ZuKuai>
            <hr /> <br />
            <Qing onSelectCollege={handleCollegeSelect}></Qing>
            <div 
            style={{ 
                width: "90%", 
                marginLeft: "5%",
                paddingBottom:"50px"
             }}
            >
                {filteredList.length > 0 ? (
                    filteredList.map((item) => {
                        return (
                            <div key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                <List>
                                    <List.Item
                                        prefix={<Avatar src={item.zhaopian} />}
                                        description={`${item.xueyuan}`}>

                                        <span onClick={() => tiao(item)}>{item.name}&nbsp;</span>
                                        {item.nianji}
                                        {item.status ? <span style={{ color: "blue" }}>病假</span> :
                                            <span style={{ color: "red" }}>事假</span>}
                                    </List.Item>
                                </List>
                                {item.action ? <span style={{ color: "blue" }}>未确认离校</span> :
                                    <span style={{ color: "red" }}>已确认离校</span>}
                            </div>
                        )
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        暂无该学院的请假记录
                    </div>
                )}
            </div>
            <Button block color='primary' size='middle' className="deng"
                onClick={() => navigate('/qingdeng')}
                >
                请假登记
            </Button>
        </div>
    )
}
export default App; 