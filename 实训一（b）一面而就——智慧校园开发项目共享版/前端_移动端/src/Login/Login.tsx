import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import './css/login.css'


const App: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"phone" | "password">("password");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);

  // 手机号校验函数
  const isValidPhone = (phone: string) => {
    const pattern = /^(13\d|14[579]|15[0-3,5-9]|16[5-7]|17[0-8]|18\d|19[1-9])\d{8}$/
    return pattern.test(phone)
  }
  // 验证码校验函数
  const isValidCode = (code: string) => /^\d{6}$/.test(code)

  // 登录功能
  const doLogin = () => {
    if (activeTab == 'password') {
      // 账号密码登录逻辑
      const trimmedUsername = username.trim()
      const trimmedPassword = password.trim()
      if (!trimmedUsername || !trimmedPassword) {
        Toast.show({
          content: '请输入用户名和密码'
        })
        return
      }
      const userMsg = { username: username, password: password }
      axios.post('http://localhost:3000/QWG/getLogin', userMsg).then(res => {
        if (res.data.code === 200) {
          Toast.show({
            icon: 'loading',
            content: '登录中…',
            afterClose: () => {
              localStorage.setItem('userMsg', JSON.stringify(res.data.data))
              localStorage.setItem('token', JSON.stringify(res.data.token))
              navigate('/layout')
              Toast.show({
                content: `登录成功! 欢迎${res.data.data.jobposition == '保安' ? res.data.data.jobposition : ''}${res.data.data.name}`,
              })
            },
          })
        } else {
          Toast.show({
            icon: 'loading',
            content: '登录中…',
            afterClose: () => {
              Toast.show({
                content:
                  <div style={{ textAlign: 'center' }}>
                    登录失败！
                    <br />
                    请检查用户名密码是否正确
                  </div>
              })
            },
          })
        }
      })

    } else {
      // 手机号登录逻辑
      if (!phone) {
        Toast.show({ content: '请输入手机号', duration: 1200 })
        return
      }
      if (!isValidPhone(phone)) {
        Toast.show({ content: '手机号格式不正确', duration: 1200 })
        return
      }
      if (!code) {
        Toast.show({ content: '请输入验证码', duration: 1200 })
        return
      }
      if (!isValidCode(code)) {
        Toast.show({ content: '验证码应为6位数字', duration: 1200 })
        return
      }
      // 发送登录请求
      axios.post('http://localhost:3000/QWG/phoneLogin', { phone, code }).then(res => {
        if (res.data.code === 200) {
          Toast.show({
            icon: 'loading',
            content: '登录中…',
            afterClose: () => {
              localStorage.setItem('userMsg', JSON.stringify(res.data.data))
              localStorage.setItem('token', res.data.token)
              navigate('/layout')
              Toast.show({
                content: `登录成功! 欢迎${res.data.data.jobposition == '保安' ? res.data.data.jobposition : ''}${res.data.data.name}`,
              })
            },
          })
        } else {
          Toast.show({
            icon: 'loading',
            content: '登录中…',
            afterClose: () => {
              Toast.show({
                content: res.data.msg || '登录失败，请重试'
              })
            },
          })
        }
      }).catch(() => {
        Toast.show('网络请求失败，请稍后重试')
      })

    }
  }

  // 手机号登录获取验证码
  const handleGetCode = () => {
    if (countdown > 0) return
    if (!phone) {
      Toast.show({
        content: '请输入手机号',
        duration: 1200
      })
      return
    }
    if (!isValidPhone(phone) || phone.length !== 11) {
      Toast.show({
        content: '手机号格式不正确',
        duration: 1200
      })
      return
    }
    // 👇审核通过，发送验证码
    axios.post('http://localhost:3000/QWG/getcode', { phone }).then(res => {
      if (res.data.code === 200) {
        Toast.show({
          content: '验证码已发送',
          duration: 2000
        })
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    })
  }



  // 跳转人脸登录页面
  const goFace = () => {
    navigate('/face')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 loginPage_backgroundcolor">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="h-14 flex items-center justify-center text-lg font-medium">
          振涛教育线上管理平台
        </div>
      </div>
      {/* 主内容区 */}
      <div className="pt-20 px-6 flex flex-col items-center">
        <div className="mb-6 text-center">
          {/* <img
            src="/imgs/login/app.png"
            alt="智慧校园"
            className="w-24 h-24 mx-auto mb-4 rounded-full"
          /> */}
           <img
            src="/imgs/login/app.png"
            alt="智慧校园"
            className="loginPage_headimg"
          />
          <h2 className="text-2xl font-medium text-gray-800">
            欢迎登录智慧校园
          </h2>
        </div>
        {/* 登录方式切换 */}
        <div className="flex border-b border-gray-200 mb-4 relative">
          <div
            className={`flex-1 pb-3 text-center mx-6 cursor-pointer transition-colors duration-150 ${activeTab === "password"
              ? "text-blue-500"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("password")}
          >
            账号密码登录
          </div>
          <div
            className={`flex-1 pb-3 text-center mx-6 cursor-pointer transition-colors duration-150 ${activeTab === "phone"
              ? "text-blue-500"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab("phone")}
          >
            手机快捷登录
          </div>
          {/* 底部蓝色线条 */}
          <div
            className={`absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-150 ease-in-out ${activeTab === "password"
              ? "left-[25%] w-1/3 -translate-x-1/2"
              : "left-[75%] w-1/3 -translate-x-1/2"
              }`}
          />
        </div>
        {/* 表单区域 */}
        <div className="space-y-5 w-full max-w-md">
          {activeTab === "password" ? (
            <>
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入账号"
                  onChange={(e) => { setUsername(e.target.value) }}
                  value={username}
                />
                <i className="fas fa-user absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入密码"
                  onChange={(e) => { setPassword(e.target.value) }}
                  value={password}
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOutline fontSize={16}/> : <EyeInvisibleOutline fontSize={16}/>}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={11}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
                <i className="fas fa-mobile-alt absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg text-sm ${countdown > 0
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-50 text-blue-500"
                    }`}
                  onClick={handleGetCode}
                >
                  {countdown > 0 ? `${countdown}s 后重试` : "获取验证码"}
                </button>
              </div>
            </>
          )}
          <button onClick={() => { doLogin() }} className="w-full h-12 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors !rounded-button">
            {
              activeTab == 'password' ?
                '立即登录' : '立即登录'
            }
          </button>
        </div>

        {/* 其他登录方式 */}
        <div className="mt-3 flex justify-center">
          <div className="text-center cursor-pointer">
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-colors mx-auto">
              <svg onClick={goFace} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9571" width="52" height="52"><path d="M0 512c0 282.763636 229.236364 512 512 512s512-229.236364 512-512S794.763636 0 512 0 0 229.236364 0 512z" fill="#F9F9F9" p-id="9572"></path><path d="M519.098182 345.204364c55.412364 0 100.352 44.311273 100.352 98.978909s-44.916364 98.978909-100.375273 98.978909c-55.412364 0-100.352-44.311273-100.352-98.978909s44.916364-98.978909 100.375273-98.978909z m0 27.927272c-40.098909 0-72.448 31.883636-72.448 71.051637 0 39.144727 32.349091 71.051636 72.424727 71.051636 40.098909 0 72.448-31.883636 72.448-71.051636 0-39.144727-32.349091-71.051636-72.424727-71.051637z" fill="#5693FF" p-id="9573"></path><path d="M523.636364 516.538182c81.570909 0 147.781818 65.28 147.781818 145.92 0 12.520727-1.605818 24.855273-4.724364 36.770909l-2.071273 7.074909-26.600727-8.471273c3.607273-11.357091 5.469091-23.226182 5.469091-35.374545 0-65.117091-53.620364-117.992727-119.854545-117.992727-66.234182 0-119.854545 52.875636-119.854546 117.992727 0 9.704727 1.186909 19.269818 3.514182 28.509091l1.954909 6.865454-26.600727 8.471273a144.197818 144.197818 0 0 1-6.795637-43.845818c0-80.64 66.210909-145.92 147.781819-145.92zM791.272727 610.257455a17.454545 17.454545 0 0 1 17.291637 15.080727l0.162909 2.373818v74.356364c0 80.290909-23.389091 105.518545-101.143273 106.612363l-79.872 0.046546a17.454545 17.454545 0 0 1-2.373818-34.746182l2.373818-0.162909h79.197091l9.309091-0.186182 4.305454-0.186182 7.982546-0.512c34.048-2.955636 43.147636-14.522182 44.939636-52.293818l0.279273-8.843636c0.046545-1.536 0.069818-3.118545 0.069818-4.747637l0.023273-79.336727a17.454545 17.454545 0 0 1 17.454545-17.454545z m-535.272727 0a17.454545 17.454545 0 0 1 17.291636 15.080727l0.162909 2.373818v79.197091l0.186182 9.309091 0.186182 4.305454 0.512 7.982546c2.955636 34.048 14.522182 43.147636 52.293818 44.939636l8.843637 0.279273c1.536 0.046545 3.118545 0.069818 4.747636 0.069818l79.336727 0.023273a17.454545 17.454545 0 0 1 2.373818 34.746182l-2.373818 0.162909h-74.356363c-80.290909 0-105.518545-23.389091-106.612364-101.143273l-0.046545-5.515636v-74.356364a17.454545 17.454545 0 0 1 17.454545-17.454545zM702.068364 238.545455c80.290909 0 105.518545 23.389091 106.612363 101.143272l0.046546 79.872a17.454545 17.454545 0 0 1-34.746182 2.373818l-0.162909-2.373818v-79.197091l-0.186182-9.309091a282.461091 282.461091 0 0 0-0.186182-4.305454l-0.512-7.982546c-2.955636-34.048-14.522182-43.147636-52.293818-44.939636l-8.843636-0.279273a451.956364 451.956364 0 0 0-4.747637-0.069818l-101.632-0.023273a17.454545 17.454545 0 0 1-2.373818-34.746181l2.373818-0.162909h96.651637z m-260.189091 0a17.454545 17.454545 0 0 1 2.327272 34.746181l-2.327272 0.162909h-101.515637l-9.309091 0.186182-4.305454 0.186182-7.982546 0.512c-34.048 2.955636-43.147636 14.522182-44.939636 52.293818l-0.279273 8.843637a451.956364 451.956364 0 0 0-0.069818 4.747636l-0.023273 79.336727a17.454545 17.454545 0 0 1-34.746181 2.373818l-0.162909-2.373818v-74.356363c0-80.290909 23.389091-105.518545 101.143272-106.612364l5.515637-0.046545h96.651636z" fill="#5693FF" p-id="9574"></path></svg>
            </div>
            <span className="text-sm text-gray-500">人脸识别登录</span>
          </div>
        </div>
        {/* 隐私政策 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          登录即代表您已同意
          <a href="#" className="text-blue-500">
            服务协议
          </a>
          和
          <a href="#" className="text-blue-500">
            隐私政策
          </a>
        </div>
      </div>
    </div>
  );
};
export default App;
