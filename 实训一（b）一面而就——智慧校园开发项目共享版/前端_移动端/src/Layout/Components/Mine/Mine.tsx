import React, { useState, useEffect } from "react";
import style from './mine.module.css'
import { images } from '../../../Imgs/jxh_imgs/imgage'
import SwipeNavigation from "../SwipeNavigation/SwipeNavigation";
import { useNavigate } from "react-router-dom";
import { Dialog,Toast, Loading  } from 'react-vant'

const App: React.FC = () => {
    const navigate = useNavigate()
    const [dialogVisible, setDialogVisible] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [userInfo, setUserInfo] = useState({
        name: '',
        jobposition: ''
    })

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userMsg') || '{}')
        setUserInfo({
            name: userData.name || '',
            jobposition: userData.jobposition || ''
        })
    }, [])

    const handleLogout = () => {
        setIsProcessing(true)
        new Promise(resolve => {
            setTimeout(() => {
                localStorage.removeItem('userMsg')
                localStorage.removeItem('token')
                Toast.success('退出成功！')
                resolve(true)
            }, 1500)
        }).finally(() => {
            setIsProcessing(false)
            setDialogVisible(false)
            navigate('/login')
        })
    }

    


    return (
        <div>
            <SwipeNavigation />
            <div className={style.header}></div>
            <div className={style.content}>
                <div><img src="/imgs/login/app2.png" alt="" /></div>
                <div>
                    <p>名称：{userInfo.name}</p>
                    <p>职位: {userInfo.jobposition}</p>
                </div>
            </div>
            <div className={style.hrefs}>
                <div className={style.hrefs_context}>
                    <div>{images.men}</div>
                    <div className={style.hrefs_text}>
                        <div>通讯录</div>
                        <div>⟩</div>
                    </div>
                </div>
                <div className={style.hrefs_context}>
                    <div>{images.suo}</div>
                    <div className={style.hrefs_text}>
                        <div>修改密码</div>
                        <div>⟩</div>
                    </div>
                </div>
                <div className={style.hrefs_context}>
                    <div>{images.i}</div>
                    <div className={style.hrefs_text}>
                        <div>关于</div>
                        <div>⟩</div>
                    </div>
                </div>
            </div>
            <div className={style.exit} onClick={() => setDialogVisible(true)}>退出当前帐号</div>
        
            <Dialog
                visible={dialogVisible}
                message="确定要退出登录吗？"
                showCancelButton
                onCancel={() => !isProcessing && setDialogVisible(false)}
                onConfirm={handleLogout}
                confirmButtonText={isProcessing ? 
                    <div className={style.loadingWrapper}>
                    <Loading 
                      type="spinner" 
                      color="#3f45ff"
                      size='18px' 
                      className={style.loadingIcon}
                    />
                    <span >正在退出...</span>
                  </div>
                    :
                     '确定'
                    }
            />
        
        </div>
    )
}
export default App;