import React, { useState, useEffect } from "react";
import '../hbc.css';
import { Badge, TabBar, Button } from 'antd-mobile';
import { AppOutline, CalendarOutline, CheckOutline, UnorderedListOutline } from 'antd-mobile-icons';
import { useNavigate, useLocation } from "react-router-dom";
import styles from '../css/common.module.css';

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeKey, setActiveKey] = useState('/daka');
    
    // 导航项配置
    const tabs = [
        {
            key: '/daka',
            title: '打卡',
            icon: <CheckOutline />,
        },
        {
            key: '/jiaoqing',
            title: '请假',
            icon: <CalendarOutline />,
        },
        {
            key: '/shenpi',
            title: '审批',
            icon: <AppOutline />,
        },
        {
            key: '/tongji',
            title: '统计',
            icon: <UnorderedListOutline />,
        },
    ];
    
    // 根据当前路径更新活动项
    useEffect(() => {
        const pathname = location.pathname;
        // 找到匹配的导航项
        const matchedTab = tabs.find(tab => pathname.includes(tab.key));
        if (matchedTab) {
            setActiveKey(matchedTab.key);
        }
    }, [location.pathname]);
    
    const handleTabChange = (key: string) => {
        navigate(key);
        setActiveKey(key);
    };
    
    return (
        <div className={styles['nav-container']}>
            <TabBar activeKey={activeKey} onChange={handleTabChange}>
                {tabs.map(item => (
                    <TabBar.Item 
                        key={item.key}
                        icon={item.icon}
                        title={item.title}
                    />
                ))}
            </TabBar>
        </div>
    );
};

export default App;
