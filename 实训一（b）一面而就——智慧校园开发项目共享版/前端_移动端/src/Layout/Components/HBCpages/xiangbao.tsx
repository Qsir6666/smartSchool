import React, { useEffect, useState } from "react";
import './hbc.css';
import { useNavigate, useLocation } from "react-router-dom";
import Zukuai from './component/zukuai';
import { TextArea, Button, Toast } from 'antd-mobile';
import styles from './css/report.module.css';

// 定义报表项目的接口
interface BaoBiaoItem {
    id?: string;
    main?: string;
    content?: string;
    content2?: string;
    content3?: string;
    now?: string;
    datetime?: string;
    status?: boolean;
}

const App: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isXiu, setIsXiu] = useState(true);
    const [listb, setListb] = useState<BaoBiaoItem>({});
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (location.state) {
            setIsXiu(location.state.isBao);
            setListb(location.state.item || {});
        }
    }, [location.state]);

    const handleSubmit = () => {
        // 简单验证
        if (isXiu) {
            if (!listb.content?.trim() || !listb.content2?.trim() || !listb.content3?.trim()) {
                Toast.show({
                    icon: 'fail',
                    content: '请填写所有必填项'
                });
                return;
            }
            
            setSubmitLoading(true);
            // 模拟提交请求
            setTimeout(() => {
                Toast.show({
                    content: '提交成功'
                });
                setSubmitLoading(false);
                navigate('/bao');
            }, 1000);
        } else {
            navigate('/bao');
        }
    };

    return (
        <div className={styles['report-container']}>
            <div className={styles['report-header']}>
                <Zukuai title="报表填报" area="/bao"></Zukuai>
            </div>
            
            <div className={styles['detail-container']}>
                <div className={styles['detail-title']}>
                    主题: {listb.content || '未知主题'}
                </div>
                
                <div className={styles['form-section']}>
                    <div className={styles['form-label']}>
                        填报指标1:
                        {!isXiu && listb.content ? <span className={styles['filled-tag']}>已填</span> : null}
                    </div>
                    <TextArea
                        placeholder="请输入内容"
                        value={listb.content || ''}
                        onChange={val => {
                            setListb(prev => ({
                                ...prev,
                                content: val
                            }));
                        }}
                        className={styles['form-input']}
                        disabled={!isXiu}
                    />
                </div>
                
                <div className={styles['form-section']}>
                    <div className={styles['form-label']}>
                        填报指标2:
                        {!isXiu && listb.content2 ? <span className={styles['filled-tag']}>已填</span> : null}
                    </div>
                    <TextArea
                        placeholder="请输入内容"
                        value={listb.content2 || ''}
                        onChange={val => {
                            setListb(prev => ({
                                ...prev,
                                content2: val
                            }));
                        }}
                        className={styles['form-input']}
                        disabled={!isXiu}
                    />
                </div>
                
                <div className={styles['form-section']}>
                    <div className={styles['form-label']}>
                        填报指标3:
                        {!isXiu && listb.content3 ? <span className={styles['filled-tag']}>已填</span> : null}
                    </div>
                    <TextArea
                        placeholder="请输入内容"
                        value={listb.content3 || ''}
                        onChange={val => {
                            setListb(prev => ({
                                ...prev,
                                content3: val
                            }));
                        }}
                        className={styles['form-input']}
                        disabled={!isXiu}
                    />
                </div>
                
                <Button
                    block
                    color="primary"
                    size="large"
                    loading={submitLoading}
                    className={styles['submit-button']}
                    onClick={handleSubmit}
                >
                    {isXiu ? "确认填报" : "返回"}
                </Button>
            </div>
        </div>
    );
};

export default App;