import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import chuli from '../css/chuli.module.css'
import { Check, CheckClose } from '@nutui/icons-react'
// import { NavBar } from '@nutui/nutui-react'
// import { ArrowLeft } from '@nutui/icons-react'
// import { Button } from '@nutui/nutui-react'
import axios from 'axios'

interface StatusConfig {
  backgroundColor: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  action: {
    text: string;
    onClick: () => void;
    color: string;
  };
}

const BASE_URL = 'http://127.0.0.1:3000';

const Chuli: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [formData, setFormData] = useState({
    responsiblePerson: '',
    deadline: '',
    ccPerson: '',
    handlingOpinion: ''
  });

  const handleSubmit = async () => {
    try {
      // 表单验证
      if (!formData.responsiblePerson) {
        alert('请输入负责人');
        return;
      }
      if (!formData.deadline) {
        alert('请选择截止日期');
        return;
      }
      
      // 更新隐患状态为处理中（状态2）
      const data = {
        state: '2', // 更新为处理中状态
        responsiblePerson: formData.responsiblePerson,
        deadline: formData.deadline,
        ccPerson: formData.ccPerson,
        handleSuggestion: formData.handlingOpinion
      };
      
      console.log('提交隐患处理信息:', {
        id: state._id,
        ...data
      });
      
      // 调用API更新隐患状态
      const response = await axios.put(`${BASE_URL}/hidden-trouble/${state._id}`, data);
      
      if (response.data.success) {
        alert('隐患已安排处理人员，状态更新为"处理中"');
        // 跳转到对应的隐患列表页面
        nav('/Check');
      } else {
        throw new Error(response.data.message || '处理失败');
      }
    } catch (error) {
      console.error('处理隐患失败:', error);
      alert('处理失败，请重试: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const statusConfigs: Record<string, StatusConfig> = {
    '1': {
      backgroundColor: '#ff4d4f',
      icon: <CheckClose width={50} height={50} style={{ color: 'white' }} />,
      title: '未处理',
      message: '当前隐患仍未处理',
      action: {
        text: '点击查看详情',
        onClick: () => nav('/Detail', { state }),
        color: '#ff4d4f'
      }
    },
    '2': {
      backgroundColor: '#ff7a45',
      icon: <CheckClose width={50} height={50} style={{ color: 'white' }} />,
      title: '正在处理',
      message: '当前隐患正在处理',
      action: {
        text: '点击查看详情',
        onClick: () => nav('/Detail', { state }),
        color: '#ff7a45'
      }
    },
    '3': {
      backgroundColor: '#52c41a',
      icon: <Check width={50} height={50} style={{ color: 'white' }} />,
      title: '已检查',
      message: '当前隐患已检查',
      action: {
        text: '点击查看详情',
        onClick: () => nav('/Detail', { state }),
        color: '#52c41a'
      }
    }
  }

  const currentConfig = statusConfigs[state?.state]

  if (!currentConfig) return null

  return (
    <div className={chuli.container}>
      <div className={chuli.body}>
        <div 
          className={chuli.box} 
          style={{
            backgroundColor: currentConfig.backgroundColor,
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {currentConfig.icon}
        </div>
        <h3 className={chuli.hear}>{currentConfig.title}</h3>
        <span className={chuli.hearTow}>
          {currentConfig.message}
          <span 
            onClick={currentConfig.action.onClick} 
            style={{ 
              color: currentConfig.action.color,
              marginLeft: '4px',
              cursor: 'pointer'
            }}
          >
            {currentConfig.action.text}
          </span>
        </span>
      </div>
    </div>
  )
}

export default Chuli
