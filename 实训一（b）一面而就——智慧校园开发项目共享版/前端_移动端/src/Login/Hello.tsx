// 👇👇👇👇👇👇👇👇
//弃用页面 改为hello1
import React from 'react'
import { useNavigate } from 'react-router-dom'


const App: React.FC = () => {
  const navigate = useNavigate()
  const gologin = () =>{
    navigate('/login')
  }
  return (
    <div className="relative bg-white overflow-hidden">
      {/* 主体内容区域 */}
      <div className="flex flex-col items-center justify-center h-full px-10 pt-[44px]">
        {/* 插画区域 */}
        <div className="w-full aspect-[4/3] mb-8 mt-10">
          <img 
            src="/imgs/helloimg.jpg"
            alt="Welcome Illustration"
            className="w-full h-full object-contain"
          />
        </div>
        {/* 文字说明区域 */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-3">智慧校园</h2>
          <p className="text-sm text-gray-500">振涛教育校园安全防护系统</p>
        </div>
        {/* 按钮区域 */}
        <button 
          className="w-full max-w-[280px] h-[48px] bg-[#4080FF] text-white text-base font-medium !rounded-button flex items-center justify-center space-x-1 hover:bg-[#3672e6] transition-colors duration-300"
          onClick={() => gologin()}
        >
          <span>立即进入</span>
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>
      {/* 底部安全区域 */}
      <div className="h-[34px] w-full bg-white fixed bottom-0"></div>
    </div>
  );
};
export default App;

