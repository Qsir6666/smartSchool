// 1、下载  npm i react-clock     
import { useEffect, useState } from 'react';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import './Calendar.css'

const Time = () => {
    const [value, setValue] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setValue(new Date()), 1000);
    
        return () => {
          clearInterval(interval);
        };
      }, []);
  return (
    <div>
      <Clock
        className='ClockLayout'
        renderNumbers={true}
        value={value}
      />
    </div>
  )
}

export default Time
