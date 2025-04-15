import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Swiper, Toast } from 'antd-mobile'
import './css/hello1.css'

const App: React.FC = () => {
    const navigate = useNavigate()
    const [current, setCurrent] = useState(0)
    const [showAnimation, setShowAnimation] = useState(false)
    const [gifPlayed, setGifPlayed] = useState(false)

    const slides = [
        {
            title: '欢迎使用智慧校园',
            description: '一站式办理各类校园事务',
            image: '/imgs/login/app.png'
        },
        {
            title: '产教融合型教育模式',
            // 添加新的描述内容
            description: '结合先进 AI 技术<br/>改变学子与家庭命运', 
            image: '/imgs/login/hello2.jpg',
            animatedTexts: [
                { text: '文化启迪智慧', position: 'left' },
                { text: '教育点亮人生', position: 'right' }
            ]
        },
        {
            title: '振涛教育',
            description: '开启您的智慧校园之旅',
            image: '/imgs/login/hello3.jpg'
        }
    ]

    useEffect(() => {
        if (current === 1) {
            setShowAnimation(true)
        } else {
            setShowAnimation(false)
        }
    }, [current])

    useEffect(() => {
        // 页面加载时重置GIF状态
        setGifPlayed(false)
    }, [])

    const handleImageLoad = () => {
        if (!gifPlayed) {
            setGifPlayed(true)
        }
    }

    const handleSwiperChange = (index: number) => {
        setCurrent(index)
    }

    const handleStart = () => {
        navigate('/login')
        Toast.show({
            content: '请先登录', 
            // duration: 1500
        })
    }

    return (
        <div className="welcome-container">
            <Swiper
                loop={false}
                onIndexChange={handleSwiperChange}
                indicator={(total, current) => (
                    <div className="custom-indicator">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={`indicator-dot ${current === index ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                )}
            >
                {slides.map((slide, index) => (
                    <Swiper.Item key={index}>
                        <div className={`slide-content ${index === 0 ? 'first-slide' : ''}`}>
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className={`slide-image ${index === 0 && !gifPlayed ? 'gif-once' : ''}`}
                                onLoad={index === 0 ? handleImageLoad : undefined}
                            />
                            <h2 className="slide-title">{slide.title}</h2>
                            <p className="slide-description" dangerouslySetInnerHTML={{ __html: slide.description }} />
                            {index === 1 && slide.animatedTexts && (
                                <div className="animated-texts-container">
                                    {slide.animatedTexts.map((item, i) => (
                                        <div
                                            key={i}
                                            className={`animated-text ${item.position} ${showAnimation ? 'show' : ''
                                                }`}
                                        >
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {index === slides.length - 1 && (
                                <Button
                                    color="primary"
                                    size="large"
                                    onClick={handleStart}
                                    className="start-button"
                                >
                                    立即进入
                                </Button>
                            )}
                        </div>
                    </Swiper.Item>
                ))}
            </Swiper>
        </div>
    )
}

export default App

