import React, { useEffect, useState } from "react";
import Zukuai from './component/zukuai';
import './hbc.css';
import axios from "axios";
import './mocks/index';
import { useNavigate } from "react-router-dom";
import { Empty, Loading } from 'antd-mobile';
import styles from './css/report.module.css';

// 定义报表项目的接口
interface BaoBiaoItem {
    id: string;
    content: string;
    now: string;
    datetime: string;
    status: boolean; // true: 待填报, false: 已填报
}

const Baobiao: React.FC = () => {
    const navigate = useNavigate();
    const [isBao, setIsBao] = useState(true);
    const [listBao, setListBao] = useState<BaoBiaoItem[]>([]);
    const [loading, setLoading] = useState(true);

    const getlistBao = () => {
        setLoading(true);
        axios.get('/hbc/bao').then((res) => {
            setListBao(res.data.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        getlistBao();
    }, []);

    const filteredList = listBao.filter(item => item.status === isBao);

    return (
        <div className={styles['report-container']}>
            <div className={styles['report-header']}>
                <Zukuai title="报表" area="/layout"></Zukuai>
            </div>
            
            <div className={styles['report-content']}>
                <div className={styles['report-tabs']}>
                    <div 
                        className={`${styles['tab-item']} ${isBao ? styles['tab-active'] : ''}`} 
                        onClick={() => setIsBao(true)}
                    >
                        待填报
                    </div>
                    <div 
                        className={`${styles['tab-item']} ${!isBao ? styles['tab-active'] : ''}`} 
                        onClick={() => setIsBao(false)}
                    >
                        已填报
                    </div>
                </div>
                
                {loading ? (
                    <div className={styles['loading-container']}>
                        <Loading color='primary' />
                        <span className={styles['loading-text']}>加载中...</span>
                    </div>
                ) : (
                    <>
                        {filteredList.length > 0 ? (
                            <div className={styles['report-list']}>
                                {filteredList.map((item) => (
                                    <div key={item.id} className={styles['report-card']}>
                                        <div className={styles['report-title']}>
                                            {item.content}
                                        </div>
                                        
                                        <div className={styles['report-date']}>
                                            填报日期: {item.now} 至 {item.datetime}
                                        </div>
                                        
                                        <div className={styles['report-footer']}>
                                            <div className={styles['report-source']}>河北市教育局</div>
                                            <div className={styles['report-time']}>
                                                2022-02-12
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className={styles['action-button']} 
                                            onClick={() => navigate('/xibao', { state: { isBao: isBao, item: item } })}
                                        >
                                            {isBao ? "去填报" : "查看详情"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles['empty-state']}>
                                <Empty description={`暂无${isBao ? '待填报' : '已填报'}数据`} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Baobiao;