// npm install react-markdown   处理ai回复markdown文本
import React, { useState, useRef, useEffect } from 'react'
import './Aichat.css'
import { ConfigProvider, theme, App, Flex, Button, Spin, Badge, Space } from 'antd';
import { Welcome, Sender, Bubble, Attachments, Prompts } from '@ant-design/x';
import { UserOutlined, HistoryOutlined, PaperClipOutlined, CloudUploadOutlined, FireOutlined, ReadOutlined } from '@ant-design/icons';
import AIChatComponent from './Ai_utils/AIChatComponent';
import axios from 'axios';
import { formatAttendanceDataForAI } from './Ai_utils/formatAttendanceData'
import dayjs from 'dayjs'
import { DatePicker, Popup } from 'antd-mobile';
import AiheadimgSrc from '/imgs/login/app2.png'
import { Select } from 'antd';
import ReactMarkdown from 'react-markdown'

// ai和用户的头像样式
const fooAvatar = {
    color: '#333',
    backgroundColor: '#fff', // 修改为纯白色背景
}
const barAvatar = {
    color: '#fff',
    backgroundColor: '#87d068',
}

// 时间格式化函数
const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date(timestamp));
}
// ai加载文字时的等待动画
const TypingIndicator = () => (
    <Bubble
        placement="start"
        content={
            <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        }
        avatar={{
            icon: <img src={AiheadimgSrc} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />,
            style: fooAvatar
        }}
    />
)

// 获取日期字符串 "YYYY年M月D日 星期X"  用于ai日期播报 欢迎语
const getFormattedDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    }).replace(/\s+/g, '')
}
// 获取时段问候语（包含凌晨判断）
const getTimeGreeting = (timestamp) => {
    const hours = new Date(timestamp).getHours()
    if (hours >= 5 && hours < 8) return '清晨'
    if (hours >= 8 && hours < 11) return '上午'
    if (hours >= 11 && hours < 13) return '中午'
    if (hours >= 13 && hours < 18) return '下午'
    if (hours >= 18 && hours < 23) return '晚上'
    return '凌晨'
}

// Do you want? 提示项
const placeholderPromptsItems = [
    {
        key: '1',
        label: '热门问题',
        icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
        children: [
            {
                key: '1-1',
                description: `今天全校的出勤率怎么样？`,
            },
            {
                key: '1-2',
                description: `哪个学院的出勤率最低？`,
            },
            {
                key: '1-3',
                description: `今天有多少人请假？`,
            },
        ],
    },
];

const Demo = () => {
    const [aiTyping, setAiTyping] = useState(false)  //ai是否正处于回复状态
    const messagesEndRef = useRef(null)  //发送消息时，页面滚动到绑定messagesEndRef的位置（底部）
    const { message: messageApi } = App.useApp()
    const aiRef = useRef(null); // 创建AI组件引用
    const [apiKey] = useState('sk-9fa6614e317e45f8ba4af602e764e8cd') // 存储密钥
    const [messages, setMessages] = useState([]) //存储聊天记录
    const [selectDate, setSelectDate] = useState(new Date())
    const [showHistory, setShowHistory] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [hasHistory, setHasHistory] = useState(true)
    const [datePickerVisible, setDatePickerVisible] = useState(false); // 添加控制日期选择器可见性的状态
    const [collegePickerVisible, setCollegePickerVisible] = useState(false); // 控制学院选择器的可见性
    const [selectedCollege, setSelectedCollege] = useState(null); // 存储所选学院

    // 添加学院列表常量
    const collegeList = [
        { label: '人工智能学院', value: '1' },
        { label: '云计算学院', value: '2' },
        { label: '大数据学院', value: '3' },
        { label: '数智传媒学院', value: '4' },
        { label: '鸿蒙生态开发学院', value: '5' },
        { label: '元宇宙学院', value: '6' }
    ];

    // 处理每日问候语
    useEffect(() => {
        axios.post('http://localhost:3000/QWG/checkGreeting').then(response => {
            if (!response.data.exists) {
                const greeting = `今天是${getFormattedDate(Date.now())}，${getTimeGreeting(Date.now())}好~`

                axios.post('http://localhost:3000/QWG/saveMessage', {
                    content: greeting,
                    isAI: true,
                    isGreeting: true,
                    timestamp: Date.now()
                }).then(res => {
                    setMessages(prev => [res.data.data, ...prev])
                })
            }
        })
    }, [])

    // 加载历史记录
    const loadHistory = async () => {
        if (loadingHistory || !hasHistory) return

        setLoadingHistory(true)
        try {
            const res = await axios.get('http://localhost:3000/QWG/getAihistory')
            if (res.data.code === 200) {
                const newMessages = res.data.data.reverse()
                if (newMessages.length === 0) {
                    setHasHistory(false)
                } else {
                    setMessages(prev => [...prev, ...newMessages])
                }
                setShowHistory(true)
            }
        } catch (error) {
            messageApi.error('加载历史记录失败')
        } finally {
            setLoadingHistory(false)
        }
    }

    // 处理消息提交
    const handleSubmit = async (text) => {
        if (!text?.trim()) return; // 检查 text 是否为空或仅包含空格
        
        try {
            // 创建并显示用户消息
            const userMessage = {
                _id: `local-${Date.now()}`,
                content: text,
                isAI: false,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMessage]);
            
            // 保存用户消息到后端
        axios.post('http://localhost:3000/QWG/saveMessage', {
            content: text,
            isAI: false
            }).catch(err => {
                console.error('保存用户消息失败:', err);
            });
            
            // 启动AI加载状态
            setAiTyping(true);
            
            // 获取考勤数据
            try {
                const currentDate = new Date();
                const res = await axios.post('http://localhost:3000/QWG/getGroupMsgByDate', {
                    date: dayjs(currentDate).format('YYYY-MM-DD')
                });
                
                if (res.data.code === 200) {
                    // 格式化考勤数据
                    const formattedData = formatAttendanceDataForAI(res.data.data, currentDate);
                    
                    // 构建包含考勤数据的提示
                    const promptWithData = `
                        我是一个考勤数据分析助手。请根据以下考勤数据，简要回答用户的问题：
                        ${formattedData}
                        
                        用户问题: ${text}
                        
                        要求：
                        1. 只回答与考勤数据相关的问题
                        2. 回答要简洁明了，不要超过200字
                        3. 如果问题与考勤无关，请礼貌说明只能回答考勤相关问题
                    `;
                    
                    // 触发AI分析
                    aiRef.current?.triggerRequest(promptWithData);
                } else {
                    // 数据获取失败时，仍然回答用户但说明数据获取有问题
                    const promptWithoutData = `
                        用户问题: ${text}
                        
                        我是考勤助手，很抱歉，我无法获取今日的考勤数据，请稍后再试。
                        如果您的问题与考勤无关，请说明我只能回答考勤相关的问题。
                    `;
                    aiRef.current?.triggerRequest(promptWithoutData);
                }
            } catch (error) {
                console.error('获取考勤数据错误:', error);
                // 错误时仍然回答用户
                const promptWithError = `
                    用户问题: ${text}
                    
                    我是考勤助手，很抱歉，获取考勤数据时发生错误，请稍后再试。
                    如果是紧急情况，请联系系统管理员。
                `;
                aiRef.current?.triggerRequest(promptWithError);
            }
        } catch (err) {
            messageApi.error('处理消息失败');
            console.error('消息处理错误:', err);
            setAiTyping(false);
        }
    };
    
    // 处理提示项点击
    const onPromptsItemClick = (info) => {
        // 确保 info.data.description 存在且不为空
        if (info?.data?.description) {
            const promptText = info.data.description;
            
            // 检查是否是考勤相关的特定问题
            if (promptText.includes('出勤率') || promptText.includes('请假')) {
                // 处理考勤数据请求
                handleAttendanceDataRequest(promptText);
            } else {
                // 常规问题直接提交
                handleSubmit(promptText);
            }
        }
    };

    // 处理考勤数据请求  ！！！！！！！！！！！
    const handleAttendanceDataRequest = async (userQuestion) => {
        try {
            // 创建用户消息对象
            const newUserMessage = {
                _id: `local-${Date.now()}`,
                content: userQuestion,
                isAI: false,
                timestamp: Date.now()
            };

            // 更新前端状态，显示用户问题
            setMessages(prev => [...prev, newUserMessage]);

            // 保存用户消息到后端
            axios.post('http://localhost:3000/QWG/saveMessage', {
                content: userQuestion,
                isAI: false
            }).catch(err => {
                console.error("保存用户消息失败:", err);
            });

            // 获取今日考勤数据
            const currentDate = new Date();
            const res = await axios.post('http://localhost:3000/QWG/getGroupMsgByDate', {
                date: dayjs(currentDate).format('YYYY-MM-DD')
            });

            if (res.data.code === 200) {
                // 格式化数据
                const formattedData = formatAttendanceDataForAI(res.data.data, currentDate);
                
                // 构建分析请求，根据不同问题调整分析重点
                let analysisPrompt = "";
                
                if (userQuestion.includes('出勤率')) {
                    analysisPrompt = `
                        我是一个考勤数据分析助手。请根据以下考勤数据，分析今天全校的出勤率情况：
                        ${formattedData}
                        
                        请用简洁的语言回答：
                        1. 今天全校的总体出勤率是多少？
                        2. 各学院出勤率如何？重点突出表现最好和最差的学院
                    `;
                } else if (userQuestion.includes('请假')) {
                    analysisPrompt = `
                        我是一个考勤数据分析助手。请根据以下考勤数据，分析今天全校的请假情况：
                        ${formattedData}
                        
                        请用简洁的语言回答：
                        1. 今天全校一共有多少人请假？占比多少？
                        2. 哪个学院的请假人数最多？
                    `;
                } else if (userQuestion.includes('学院') && userQuestion.includes('最低')) {
                    analysisPrompt = `
                        我是一个考勤数据分析助手。请根据以下考勤数据，分析今天出勤率最低的学院：
                        ${formattedData}
                        
                        请用简洁的语言回答：
                        1. 今天出勤率最低的学院是哪个？具体出勤率是多少？
                        2. 该学院出勤率低的主要原因是什么？
                        3. 建议采取什么措施提高该学院的出勤率？
                    `;
                } else {
                    // 默认分析
                    analysisPrompt = `
                        我是一个考勤数据分析助手。请根据以下考勤数据，回答用户的问题：
                        ${formattedData}
                        
                        用户问题: ${userQuestion}
                        请用简洁的语言回答上述问题。
                    `;
                }

                // 触发AI分析
                setAiTyping(true);
                aiRef.current?.triggerRequest(analysisPrompt);
            } else {
                // 处理数据获取失败情况
                messageApi.error('获取考勤数据失败');
                setAiTyping(false);
            }
        } catch (error) {
            messageApi.error('获取考勤数据失败');
            console.error('获取考勤数据错误:', error);
            setAiTyping(false);
        }
    };

    // 处理AI响应回调
    const handleAIResponse = (response, error) => {
        setAiTyping(false)
        axios.post('http://localhost:3000/QWG/saveMessage', {
            content: response,
            isAI: true
        }).then(res => {
            setMessages(prev => [...prev, res.data.data])
        })
        if (error) {
            messageApi.error(`AI服务错误: ${error}`)
            return;
        }
    }

    // 当message改变（发送消息）时，自动滚动到底部
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }
    useEffect(() => { scrollToBottom() }, [messages])

    // 处理日期选择确认
    const handleDateConfirm = (date) => {
        // 关闭日期选择器
        setDatePickerVisible(false);
        
        // 更新选择的日期
        setSelectDate(date);
        
        // 生成日期文本(2025年X月X日格式)
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateText = `${year}年${month}月${day}日`;
        
        // 执行分析流程
        handleAttendanceAnalysisWithDate(date, dateText);
    };
    
    // 分析指定日期的考勤数据
    const handleAttendanceAnalysisWithDate = async (date, dateText) => {
        try {
            // 获取考勤数据（使用传入的日期）
            const res = await axios.post('http://localhost:3000/QWG/getGroupMsgByDate', {
                date: dayjs(date).format('YYYY-MM-DD')
            });

            if (res.data.code === 200) {
                // 格式化数据
                const formattedData = formatAttendanceDataForAI(res.data.data, date);
                // console.log(formattedData,'发送给ai的消息');
                // 构建分析请求
                const analysisPrompt = `
                    我是一个考勤数据分析助手。请帮我分析以下考勤数据，并给出三百字专业见解：
                    ${formattedData}

                    请从以下几个方面进行分析：
                    1. 总体出勤情况评估
                    2. 异常情况识别（如果有）
                    3. 各学院出勤率比较
                `;
                // console.log(analysisPrompt,'12343');
                // return
                // 定义用户消息内容（包含日期）
                const userMessageContent = `深度分析${dateText}考勤`;

                // 创建用户消息对象
                const newUserMessage = {
                    _id: `local-${Date.now()}`,
                    content: userMessageContent,
                    isAI: false,
                    timestamp: Date.now()
                };

                // 更新前端状态
                setMessages(prev => [...prev, newUserMessage]);

                // 保存用户消息到后端
                axios.post('http://localhost:3000/QWG/saveMessage', {
                    content: userMessageContent,
                    isAI: false
                }).catch(err => {
                    console.error("保存用户分析请求失败:", err);
                });

                // 触发AI分析
                setAiTyping(true);
                aiRef.current?.triggerRequest(analysisPrompt);
            }
        } catch (error) {
            messageApi.error('获取考勤数据失败');
            console.error('获取考勤数据错误:', error);
        }
    };

    // 添加学院分析函数
    const handleCollegeAnalysis = async (college) => {
        try {
            // 创建用户消息对象
            const userMessageContent = `深度分析${college.label}考勤`;
            const newUserMessage = {
                _id: `local-${Date.now()}`,
                content: userMessageContent,
                isAI: false,
                timestamp: Date.now()
            };

            // 更新前端状态
            setMessages(prev => [...prev, newUserMessage]);

            // 保存用户消息到后端
            axios.post('http://localhost:3000/QWG/saveMessage', {
                content: userMessageContent,
                isAI: false
            }).catch(err => {
                console.error("保存用户分析请求失败:", err);
            });

            // 这里请求后端数据 - 目前使用与日期分析相同的接口，但将来应替换为学院专用接口
            // 假设后端有一个接口可以根据collegeId获取数据，或者使用现有接口过滤数据
            const res = await axios.post('http://localhost:3000/QWG/getGroupMsgByDate', {
                date: dayjs(new Date()).format('YYYY-MM-DD'),
                collegeId: college.value // 添加学院ID参数
            });

            if (res.data.code === 200) {
                // 处理并过滤数据，只保留所选学院的数据
                let collegeData = res.data.data;
                // 如果后端没有直接过滤，前端可以过滤数据
                if (collegeData.length > 1) {
                    collegeData = collegeData.filter(item => item.name === college.label);
                }
                
                // 格式化数据
                const formattedData = formatAttendanceDataForAI(collegeData, new Date());
                
                // 构建分析提示
                const analysisPrompt = `
                    我是一个考勤数据分析助手。请帮我分析以下${college.label}的考勤数据，并给出专业见解：
                    ${formattedData}

                    请分析：
                    1. ${college.label}整体出勤情况
                    2. 该学院各班级出勤率比较
    
                    注意：请使用专业语言，简洁地表达分析结果。
                `;
                
                // 触发AI分析
                setAiTyping(true);
                aiRef.current?.triggerRequest(analysisPrompt);
            } else {
                messageApi.error('获取考勤数据失败');
            }
        } catch (error) {
            messageApi.error('获取考勤数据失败');
            console.error('获取考勤数据错误:', error);
        }
    };

    // 添加处理学院选择的函数
    const handleCollegeSelect = (value, option) => {
        setSelectedCollege(option);
        setCollegePickerVisible(false);
        
        // 执行学院分析
        handleCollegeAnalysis(option);
    };

    // 定义底部对话框模块，接收 aiTyping 状态
    const DemoBottom = ({ onSubmit, aiTyping }) => {
        const [attachedFiles, setAttachedFiles] = useState([]);
        const [headerOpen, setHeaderOpen] = useState(false);

        // 处理文件上传
        const handleFileChange = (info) => {
            setAttachedFiles(info.fileList);
            // 这里可以添加文件上传逻辑
        };

        // 附件按钮节点
        const attachmentsNode = (
            <Badge dot={attachedFiles.length > 0 && !headerOpen}>
                <Button
                    type="text"
                    icon={<PaperClipOutlined />}
                    onClick={() => setHeaderOpen(!headerOpen)}
                    style={{ color: '#666' }}
                />
            </Badge>
        );

        return (
            <div>
                {/* 操作按钮区域 */}
                <div className="aichat-actions-container" 
                    style={{ 
                        width: '100%', 
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x',
                        position: 'relative'
                    }}
                >
                    <div className="aichat-actions"
                        style={{ 
                            display: 'inline-flex',
                            minWidth: 'max-content',
                        }}
                    >
                        <Button
                            type="primary"
                            onClick={() => setDatePickerVisible(true)}
                            className='aichat-actions-button1'
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderColor: 'transparent',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                fontWeight: 500,
                                marginRight: '8px'
                            }}
                        >
                            深读分析所选日期考勤
                        </Button>
                        
                        <Button
                            type="primary"
                            onClick={() => setCollegePickerVisible(true)}
                            className='aichat-actions-button1'
                            style={{
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                borderColor: 'transparent',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                fontWeight: 500,
                                marginRight: '8px'
                            }}
                        >
                            深读分析所选学院考勤
                        </Button>
                        
                        {!showHistory && hasHistory && (
                            <Button
                                icon={<HistoryOutlined />}
                                onClick={loadHistory}
                                loading={loadingHistory}
                                className='aichat-actions-button1'
                                style={{
                                    background: 'linear-gradient(135deg, #b6b9bc 0%, #78787a 100%)',
                                    borderColor: 'transparent',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    color: '#fff',
                                    fontWeight: 500,
                                    marginRight: '8px'
                                }}
                            >
                                {loadingHistory ? '加载中...' : '加载历史记录'}
                            </Button>
                        )}
                        {!hasHistory && (
                            <span style={{ 
                                color: '#999', 
                                fontSize: '12px', 
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                padding: '0 8px'
                            }}>
                                没有更多历史记录了
                            </span>
                        )}
                    </div>
                </div>

                {/* 日期选择器 */}
                <DatePicker
                    visible={datePickerVisible}
                    onClose={() => setDatePickerVisible(false)}
                    value={selectDate}
                    title="选择日期"
                    min={new Date(2025, 0, 1)} // 设置最小日期
                    max={new Date()} // 设置最大日期为当前日期
                    onConfirm={handleDateConfirm}
                />

                <Popup
                    visible={collegePickerVisible}
                    onClose={() => setCollegePickerVisible(false)}
                    bodyStyle={{
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        padding: '20px 12px',
                        paddingBottom: '40px'
                    }}
                    closeOnMaskClick={true}
                    className="college-picker-popup"
                >
                    <div style={{ padding: '10px' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '15px' 
                        }}>
                            <h4 style={{ margin: '0' }}>选择学院</h4>
                            <div 
                                onClick={() => setCollegePickerVisible(false)}
                                className="college-close-btn"
                                style={{ 
                                    width: '22px', 
                                    height: '22px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: '#999',
                                    borderRadius: '50%',
                                    backgroundColor: '#f5f5f5'
                                }}
                            >
                                ×
                            </div>
                        </div>
                        <Select
                            placeholder="请选择要分析的学院"
                            style={{ width: '100%' }}
                            options={collegeList}
                            onChange={handleCollegeSelect}
                        />
                    </div>
                </Popup>

                <Sender
                    placeholder="输入想问的问题吧~"
                    onSubmit={onSubmit}
                    loading={aiTyping}
                    readOnly={aiTyping}
                    allowSpeech
                    // 添加前缀按钮
                    prefix={
                        <Space size="small">
                            {attachmentsNode}
                        </Space>
                    }
                    // 添加附件面板
                    header={
                        <Sender.Header
                            title="附件"
                            open={headerOpen}
                            onOpenChange={setHeaderOpen}
                            styles={{
                                content: {
                                    padding: 8,
                                    maxHeight: '200px',
                                    overflow: 'auto'
                                }
                            }}
                        >
                            <Attachments
                                beforeUpload={() => false}
                                items={attachedFiles}
                                onChange={handleFileChange}
                                placeholder={(type) => ({
                                    icon: <CloudUploadOutlined />,
                                    title: type === 'drop' ? '拖拽文件至此' : '点击上传文件',
                                })}
                                listStyle={{
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))'
                                }}
                            />
                        </Sender.Header>
                    }
                />
            </div>
        )
    }

    return (
        <div className='Aichat'>
            {/* 隐藏的AI组件。引入到组件中并隐藏，绑定数据 */}
            <AIChatComponent ref={aiRef} apiKey={apiKey} onResponse={handleAIResponse} />

            {/* 标题 */}
            <div className='Aichat_title'>
                <p>考勤数据AI管家</p>
            </div>
            <div className='Aichat_title_model'></div>

            {/* 仅在消息列表为空时显示欢迎和提示 */}
            {messages.length === 0 && (
                <>
                    {/* 头部欢迎部分 (无标题) */}
                    <div className="aichat-header-welcome">
                <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
                    <Welcome
                        style={{
                            backgroundImage: 'linear-gradient(97deg,rgb(235, 247, 255) 0%,rgb(242, 236, 255) 100%)',
                                    borderRadius: '8px', // 圆角
                                    margin: "10px 10px 1px",
                            display: "flex",
                                    alignItems: "center", // 垂直居中
                            justifyContent: "space-between",
                                    height: "auto", // 自适应高度
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.06)' // 添加轻微阴影
                        }}
                                icon={(
                            <img
                                        src={AiheadimgSrc}
                                className="custom-icon"
                                alt="icon"
                                        style={{ 
                                            width: '50px', 
                                            height: '50px',
                                            minWidth: '50px',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            display: 'block'
                                        }}
                                    />
                                )}
                                title={(
                                    <div className="animated-title" style={{ fontSize: '16px', fontWeight: 600, marginLeft: '10px' }}>你好，我是你的考勤数据管家</div>
                                )}
                                description={(
                                    <div className='animated-description' style={{ fontSize: '13px', color: '#666', marginLeft: '10px' }}>
                                        专注考勤数据分析，支持异常预警、深度分析等功能，后续上线多维度数据看板
                            </div>
                                )}
                    />
                </ConfigProvider>
            </div>
                    
                    {/* Do you want? 提示模块 - 优化样式 */}
                    <div style={{ padding: '15px' }}>
                        <Prompts
                            title="您可以问我："
                            items={placeholderPromptsItems}
                            onItemClick={onPromptsItemClick}
                            styles={{
                                list: {
                                    width: '100%',
                                    gap: '8px',
                                },
                                item: {
                                    flex: 1,
                                    background: '#f9f9f9', // 浅灰色背景
                                    borderRadius: '6px', // 圆角
                                    padding: '8px 12px', // 内边距
                                    border: '1px solid #eee', // 添加边框
                                },
                                title: {
                                    fontSize: '14px', // 调整标题字号
                                    color: '#333', // 调整标题颜色
                                    marginBottom: '10px', // 增加标题下边距
                                }
                            }}
                        />
                    </div>
                </>
            )}


            {/* 对话区域 */}
            <div className='Aichat_talk'>
                {/* 1、对话框 */}
                <div className='Aichat_talk_model'>
                    <Flex gap="15px" vertical style={{ padding: '0 10px',paddingBottom:'100px' }}>  {/* 调整气泡间距和内边距 */}
                        {loadingHistory && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Spin tip="加载历史记录中..." size="small" />
                            </div>
                        )}
                        {messages.map(msg => (
                            <Bubble
                                key={msg._id}
                                variant={msg.isAI ? "filled" : "shadow"}
                                placement={msg.isAI ? "start" : "end"}
                                content={
                                    msg.isAI ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : msg.content
                                }
                                avatar={{
                                    icon: msg.isAI ?
                                        <img src={AiheadimgSrc} alt="AI" style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover',
                                            minWidth: '50px',
                                            borderRadius: '50%',
                                            display: 'block'
                                        }} />
                                        : <UserOutlined />,
                                    style: msg.isAI ? fooAvatar : barAvatar
                                }}
                                time={formatTimestamp(msg.timestamp)}
                            />
                        ))}
                        {aiTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </Flex>
                </div>

                {/* 2、底部输入框 */}
                <div className='Aichat_talk_bottom'>
                    <DemoBottom onSubmit={handleSubmit} aiTyping={aiTyping} />
                </div>
            </div>
        </div>
    )
}

export default Demo