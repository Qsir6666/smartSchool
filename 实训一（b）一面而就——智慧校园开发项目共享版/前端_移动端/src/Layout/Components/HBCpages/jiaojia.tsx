import React, { useEffect, useState } from "react";
import './hbc.css';
import XiaLie from './component/xialie';
import Zukuai from './component/zukuai';
import './mocks/index';
import axios from "axios";
import { FloatingBubble } from 'antd-mobile';
import { AddCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from "react-router-dom";
import styles from './css/common.module.css';

interface LeaveRequest {
    id: string;
    name: string;
    stated: boolean; // 审批状态: true-已审批, false-未审批
    shen: boolean; // 审批结果: true-通过, false-驳回
    now: string; // 开始时间
    datetime: string; // 结束时间
}

const App: React.FC = () => {
    const navigate = useNavigate();
    const [listjiao, setListjiao] = useState<LeaveRequest[]>([]);
    
    const getlistjiao = () => {
        axios.get('/hbc/qing').then(res => {
            setListjiao(res.data.data);
        }).catch(err => {
            console.log(err);
        });
    };
    
    useEffect(() => {
        getlistjiao();
    }, []);
    
    return (
        <div className={styles['page-container']}>
            <div className={styles.header}>
                <Zukuai title="教师考勤" area="/layout"></Zukuai>
            </div>
            
            <div className={styles.content}>
                <div className={styles.card}>
                    <h3 className={styles.title}>请假记录</h3>
                    
                    {listjiao.length > 0 ? (
                        listjiao.map((item, index) => (
                            <div key={index} className={styles['list-item']} style={{ marginBottom: '15px' }}>
                                <div className={styles['list-content']}>
                                    <p className={styles.subtitle}>请假人: 老师-{item.name}</p>
                                    <p className={styles.text}>
                                        请假类型: 
                                        <span className={item.stated ? styles['text-success'] : styles['text-warning']}>
                                            {item.stated ? "病假" : "事假"}
                                        </span>
                                    </p>
                                    <p className={styles.text}>开始时间: {item.now}</p>
                                    <p className={styles.text}>结束时间: {item.datetime}</p>
                                </div>
                                
                                <div className={`
                                    ${styles['status-circle']} 
                                    ${item.stated && item.shen ? styles['status-success'] : ''}
                                    ${item.stated && !item.shen ? styles['status-danger'] : ''}
                                    ${!item.stated ? styles['status-warning'] : ''}
                                `}>
                                    {item.stated ? (item.shen ? "审批通过" : "审批驳回") : "待审批"}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
                            暂无请假记录
                        </div>
                    )}
                </div>
                
                <div className={styles.card}>
                    <h3 className={styles.title}>请假须知</h3>
                    <p className={styles.text}>1. 请假申请应提前1个工作日提交</p>
                    <p className={styles.text}>2. 请假3天以内由部门主管审批</p>
                    <p className={styles.text}>3. 请假3天以上需由学校领导审批</p>
                    <p className={styles.text}>4. 病假须附医院证明</p>
                </div>
            </div>
            
            <div 
                className={styles['floating-button']}
                onClick={() => navigate('/jia')}
            >
                <AddCircleOutline fontSize={28} />
            </div>
            
            <XiaLie></XiaLie>
        </div>
    );
};

export default App;
