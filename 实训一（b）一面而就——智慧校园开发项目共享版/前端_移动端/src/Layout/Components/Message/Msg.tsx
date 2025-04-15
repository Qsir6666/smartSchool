import React, { useState, useRef, useEffect } from "react";
import SwipeNavigation from "../JXHpages/Wrap/swipeNavigation.tsx";
import style from './msg.module.css';
import { Button, Input } from 'antd-mobile';
import { MessageOutline } from 'antd-mobile-icons';
import AIChatComponent from './Ai_utils/AIChatComponent';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAiResponse = (response: string) => {
        setMessages(prev => [...prev, { type: 'ai', content: response }]);
        setIsProcessing(false);
    };

    const handleSend = () => {
        if (!inputValue.trim() || isProcessing) return;

        setIsProcessing(true);
        setMessages(prev => [...prev, { type: 'user', content: inputValue }]);
        
        // 调用AI处理组件
        const aiComponent = <AIChatComponent onResponse={handleAiResponse} />;
        aiComponent.props.onResponse && typeof aiComponent.props.onResponse === 'function' && 
        aiComponent.type({ onResponse: handleAiResponse }).props.children?.processMessage?.(inputValue);

        setInputValue('');
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1>AI 智慧助手</h1>
                <p>基于智慧校园的全局智能解决方案</p>
            </div>

            <div className={style.messageContainer}>
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={`${style.messageItem} ${message.type === 'user' ? style.userMessage : style.aiMessage}`}
                    >
                        <div className={style.messageContent}>
                            {message.type === 'ai' && (
                                <div className={style.aiAvatar}>
                                    <MessageOutline />
                                </div>
                            )}
                            <div className={style.messageText}>
                                {message.content.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={style.inputArea}>
                <Input
                    placeholder="请输入您的问题..."
                    value={inputValue}
                    onChange={val => setInputValue(val)}
                    onEnterPress={handleSend}
                    disabled={isProcessing}
                />
                <Button 
                    color='primary' 
                    onClick={handleSend}
                    loading={isProcessing}
                    disabled={isProcessing}
                >
                    发送
                </Button>
            </div>

            <SwipeNavigation />
        </div>
    );
};

export default App;
