import React from "react";
import './hbc.css'
import { CalendarPickerView } from 'antd-mobile'
import { useNavigate } from "react-router-dom";
const App: React.FC = () => {
    const navigate=useNavigate()
  const dian = (value: Date | null) => {   
    if (!value) return;
    const year=value.getFullYear()
    const month=String(value.getMonth()+1).padStart(2,'0')
    const day=String(value.getDate()).padStart(2,'0')
    const shi=`${year}-${month}-${day}`
    navigate('/qingdeng',{state:{time:shi}})
    console.log(shi)
  }

  return (
    <>
      <CalendarPickerView onChange={dian} /> 
    </>
  )
}

export default App