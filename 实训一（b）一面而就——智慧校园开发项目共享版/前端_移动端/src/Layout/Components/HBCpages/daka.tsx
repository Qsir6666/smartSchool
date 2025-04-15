import React, { useEffect, useState } from "react";
import './hbc.css';
import XiaLie from './component/xialie';
import Zukuai from './component/zukuai';
import styles from './css/common.module.css';

const App: React.FC = () => {
    const [daka, setDaka] = useState(false);
    const [time, setTime] = useState(new Date());
    
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    
    // 格式化日期时间
    const formattedTime = `${year}-${month < 10 ? '0'+month : month}-${day < 10 ? '0'+day : day} ${hours < 10 ? '0'+hours : hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`;

    useEffect(() => {
        const inter = setInterval(() => {
            setTime(new Date());
        }, 1000);
        
        return () => {
            clearInterval(inter);
        };
    }, []);
    
    const handlePunch = () => {
        if (!daka) {
            setDaka(true);
            // 打卡成功提示或其他操作可以在这里添加
        }
    };
    
    return (
        <div className={styles['page-container']}>
            <div className={styles.header}>
                <Zukuai title="教师考勤" area="/layout"></Zukuai>
            </div>
            
            <div className={styles.content}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '30px 16px', marginTop: '80px' }}>
                    <div className={`
                        ${styles['status-circle']} 
                        ${daka ? styles['status-success'] : styles['status-info']}
                    `} 
                    style={{ 
                        width: '140px', 
                        height: '140px', 
                        fontSize: '20px',
                        margin: '0 auto 30px',
                        cursor: 'pointer'
                    }}
                    onClick={handlePunch}>
                        {daka ? "打卡成功" : "上班打卡"}
                    </div>
                    
                    <p className={styles.subtitle} style={{ marginTop: '20px' }}>
                        当前时间
                    </p>
                    <p className={styles.title} style={{ fontSize: '22px', margin: '10px 0' }}>
                        {formattedTime}
                    </p>
                    
                    {daka && (
                        <div className={styles['text-success']} style={{ marginTop: '15px', fontSize: '16px', fontWeight: '500' }}>
                            今日打卡已完成，祝您工作愉快！
                        </div>
                    )}
                </div>
                
                <div className={styles.card} style={{ marginTop: '40px' }}>
                    <h3 className={styles.title}>打卡规则</h3>
                    <p className={styles.text}>1. 上班时间：周一至周五 08:30-17:30</p>
                    <p className={styles.text}>2. 迟到规则：08:30 后打卡视为迟到</p>
                    <p className={styles.text}>3. 早退规则：17:30 前打卡视为早退</p>
                    <p className={styles.text}>4. 缺卡说明：忘记打卡需提交书面申请</p>
                </div>
            </div>
            
            <XiaLie></XiaLie>
        </div>
    );
};

export default App;
