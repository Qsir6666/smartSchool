import React, { useState } from "react";
import "./hbc.css";
import Zukuai from './component/zukuai';
import { Picker, Button, Toast } from 'antd-mobile';
import { useNavigate } from "react-router-dom";
import CameraAuth from './component/zhaopian';
import './mocks/index';
import axios from 'axios';
import styles from './css/common.module.css';

interface LeaveData {
  type: string;
  time: string;
  description: string;
  image: string;
}

const App: React.FC = () => {
    const [leaveData, setLeaveData] = useState<LeaveData>({
        type: '',
        time: '',
        description: '',
        image: ''
    });
    
    // 请假类型选项
    const [basicColumns] = useState([
        [
            { label: '事假', value: '事假' },
            { label: '年假', value: '年假' },
            { label: '病假', value: '病假' },
        ]
    ]);
    
    // 请假时间选项
    const [basicTime] = useState([
        [
            { label: '2025-03月-17日', value: '2025-03月-17日' },
            { label: '2025-03月-18日', value: '2025-03月-18日' },
            { label: '2025-03月-19日', value: '2025-03月-19日' }
        ],
        [
            { label: '00时', value: '00时' },
            { label: '06时', value: '06时' },
            { label: '12时', value: '12时' },
        ]
    ]);
    
    const [capturedImage, setCapturedImage] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const navigate = useNavigate();

    // 图片上传到服务器
    const uploadToServer = async (base64Data: string) => {
        setStatus('loading');
        try {
            await axios({
                method: 'post',
                url: "/api/upload",
                data: JSON.stringify({ image: base64Data }),
                headers: { 'Content-Type': 'application/json' }
            });
            setStatus('success');
            setLeaveData(prev => ({ ...prev, image: base64Data }));
        } catch (error) {
            setStatus('error');
            console.error('上传失败:', error);
        }
    };

    // 处理请假表单提交
    const handleSubmit = () => {
        // 表单验证
        if (!leaveData.type) {
            Toast.show('请选择请假类型');
            return;
        }
        if (!leaveData.time) {
            Toast.show('请选择请假时间');
            return;
        }
        if (!leaveData.description) {
            Toast.show('请填写请假说明');
            return;
        }
        if (!capturedImage) {
            Toast.show('请上传请假证明');
            return;
        }
        
        // 提交成功，返回列表页
        Toast.show('请假申请提交成功');
        navigate('/jiaoqing');
    };

    return (
        <div className={styles['page-container']}>
            <div className={styles.header}>
                <Zukuai title="教师考勤" area="/jiaoqing" />
            </div>
            
            <div className={styles.content}>
                <div className={styles['form-container']}>
                    <h3 className={styles.title}>请假申请</h3>
                    
                    <div className={styles['form-item']}>
                        <div className={styles['form-label']}>请假类型:</div>
                        <div className={styles['form-value']}>
                            <Button
                                className={styles['form-button']}
                                onClick={async () => {
                                    const value = await Picker.prompt({
                                        columns: basicColumns,
                                    });
                                    if (value) {
                                        Toast.show(`已选择 ${value}`);
                                        setLeaveData(prev => ({ ...prev, type: value as string }));
                                    }
                                }}
                            >
                                {leaveData.type ? leaveData.type : "请选择"}
                            </Button>
                        </div>
                    </div>
                    
                    <div className={styles['form-item']}>
                        <div className={styles['form-label']}>请假时间:</div>
                        <div className={styles['form-value']}>
                            <Button
                                className={styles['form-button']}
                                onClick={async () => {
                                    const value = await Picker.prompt({
                                        columns: basicTime,
                                    });
                                    if (value && Array.isArray(value)) {
                                        // 使用显式的类型断言，先转为unknown，再转为string
                                        const timeValues = value.map(item => String(item));
                                        const timeStr = timeValues.join('-');
                                        Toast.show(`已选择 ${timeStr}`);
                                        setLeaveData(prev => ({ ...prev, time: timeStr }));
                                    }
                                }}
                            >
                                {leaveData.time ? leaveData.time : "请选择"}
                            </Button>
                        </div>
                    </div>
                    
                    <div className={styles['form-item']}>
                        <div className={styles['form-label']}>请假说明:</div>
                        <div className={styles['form-value']}>
                            <input
                                type="text"
                                className={styles['form-input']}
                                placeholder="请输入请假说明"
                                value={leaveData.description}
                                onChange={(e) => setLeaveData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    
                    <div className={styles['form-item']}>
                        <div className={styles['form-label']}>请假证明:</div>
                        <div className={styles['form-value']}>
                            <div className={styles['auth-container']}>
                                {!capturedImage ? (
                                    <CameraAuth onCapture={(img) => setCapturedImage(img)} />
                                ) : (
                                    <div>
                                        <img
                                            src={capturedImage}
                                            alt="认证照片"
                                            className={styles['preview-image']}
                                        />
                                        <div className={styles['action-buttons']}>
                                            <button
                                                className={styles['action-button']}
                                                onClick={() => setCapturedImage('')}
                                            >
                                                重新拍摄
                                            </button>
                                            <button
                                                className={`${styles['action-button']} ${styles['action-button-primary']}`}
                                                onClick={() => uploadToServer(capturedImage)}
                                                disabled={status === 'loading'}
                                            >
                                                {status === 'loading' ? '认证中...' : '提交验证'}
                                            </button>
                                        </div>
                                        
                                        {status === 'error' && (
                                            <div className={`${styles['status-text']} ${styles['error-text']}`}>
                                                认证失败，请重新尝试
                                            </div>
                                        )}
                                        
                                        {status === 'success' && (
                                            <div className={`${styles['status-text']} ${styles['success-text']}`}>
                                                认证通过
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <Button
                    block
                    color="primary"
                    size="large"
                    className={styles['submit-button']}
                    onClick={handleSubmit}
                >
                    提交申请
                </Button>
            </div>
        </div>
    );
};

export default App;