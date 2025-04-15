import React, { useEffect, useState } from "react";
import './hbc.css';
import XiaLie from './component/xialie';
import Zukuai from './component/zukuai';
import './mocks/index';
import axios from "axios";
import { Popup, Button } from 'antd-mobile';
import './hai.css';
import styles from './css/common.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ApprovalItem {
  id: string;
  name: string;
  stated: boolean; // 是否已审批
  shen: boolean; // 审批结果
  now: string; // 开始时间
  datetime: string; // 结束时间
  type?: string; // 请假类型
}

const App: React.FC = () => {
  const [shen, setShen] = useState(false);
  const [listjiao, setlistjiao] = useState<ApprovalItem[]>([]);
  const [visible1, setVisible1] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getlistjiao = () => {
    axios.get('/hbc/qing').then(res => {
      setlistjiao(res.data.data);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    getlistjiao();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 更新对话记录
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    const DEEPSEEK_API_KEY = 'sk-189faf2c421649a4a1a1abd21b703af2';

    try {
      // 调用Deepseek API
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: "deepseek-chat", // 指定对话模型
          messages: newMessages,
          temperature: 0.7, // 控制生成随机性
          max_tokens: 500 // 限制回答长度
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 追加AI响应
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.choices[0].message.content
        }
      ]);
    } catch (error) {
      console.error('请求失败:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '服务暂时不可用，请稍后再试' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['page-container']}>
      <div className={styles['header']}>
        <Zukuai title="审批" area="/layout"></Zukuai>
      </div>
      
      <div className={styles.content}>
        <div className={styles.tabs}>
          <div 
            className={`${styles['tab-item']} ${!shen ? styles['tab-active'] : ''}`}
            onClick={() => setShen(false)}
          >
            待审批
          </div>
          <div 
            className={`${styles['tab-item']} ${shen ? styles['tab-active'] : ''}`}
            onClick={() => setShen(true)}
          >
            已审批
          </div>
        </div>

        <div>
          {listjiao.filter(item => item.stated === shen).map((item, index) => (
            <div key={index} className={styles['list-item']}>
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
          ))}

          {listjiao.filter(item => item.stated === shen).length === 0 && (
            <div className={styles.card} style={{ textAlign: 'center', padding: '30px 0' }}>
              暂无{shen ? '已审批' : '待审批'}记录
            </div>
          )}
        </div>
      </div>

      <div 
        className={styles['floating-button']}
        onClick={() => setVisible1(true)}
      >
        问
      </div>

      <Popup
        visible={visible1}
        onMaskClick={() => setVisible1(false)}
        onClose={() => setVisible1(false)}
        bodyStyle={{ height: '80vh' }}
      >
        <div className={styles['chat-container']}>
          <div className={styles['chat-header']}>
            <h3>请假管理负责人: 张主任</h3>
          </div>
          
          <div className={styles['chat-messages']}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
                <span className={styles['role-tag']}>
                  {msg.role === 'user' ? '你' : '张主任'}
                </span>
                <p>{msg.content}</p>
              </div>
            ))}
            {isLoading && <div className={styles['loading-indicator']}>思考中...</div>}
          </div>

          <form onSubmit={handleSubmit} className={styles['chat-input']}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '发送中' : '发送'}
            </button>
          </form>
        </div>
      </Popup>

      <XiaLie></XiaLie>
    </div>
  );
};

export default App;
