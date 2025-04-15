import React,{useState} from "react";
import './hbc.css'
import { CalendarPickerView } from 'antd-mobile'
import { useNavigate } from "react-router-dom";
const App: React.FC = () => {
    const navigate=useNavigate()
  // 错误1：参数需要类型声明（TypeScript 隐式 any 错误）
  const dian = (value: Date) => {   // ✅ 添加类型声明
    const year=value.getFullYear()
    const month=String(value.getMonth()+1).padStart(2,'0')
    const day=String(value.getDate()).padStart(2,'0')
    const shi=`${year}-${month}-${day}`
    navigate('/qingdeng',{state:{time:shi}})
    console.log(shi)
  }

  return (
    <>
      {/* 错误2：错误引用 undefined 的 sea */}
      {/* 修正为正确的回调参数传递 */}
      <CalendarPickerView onChange={(date: Date) => dian(date)} /> 
     
    </>
  )
}

export default App