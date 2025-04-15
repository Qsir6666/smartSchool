import React,{useEffect, useState} from "react";
import './hbc.css'
import { useNavigate,useLocation } from "react-router-dom";
import Zukuai from '../HBCpages/component/zukuai'
import { Button, Dialog, Toast } from 'antd-mobile'
import { DeleteOutline  } from 'antd-mobile-icons'
const App:React.FC=()=>{
    const navigate=useNavigate()
    const location=useLocation()
    const [listx,setlistx]=useState('')
    
    useEffect(()=>{
    
        setlistx(location.state.item)
    
    },[])
    return (<>
    <Zukuai title="请假详情" area="/qingjia"></Zukuai>
        <div style={{width:"80%",marginLeft:"10%"}}>
        <div style={{display:'flex',justifyContent:"space-between",alignItems:'center'}}>
            <div style={{display:"flex"}}>
                <img src={listx.zhaopian} alt="" style={{borderRadius:"20px"}}/>&nbsp;
                <div style={{fontSize:"18px"}}>
                {listx.name}<br/>
                {listx.nianji}年级
                </div>
            </div>
            <DeleteOutline fontSize={25} color="blue"
                onClick={() =>
                    Dialog.confirm({
                        content: '是否删除该纪录',
                        onConfirm: () => {
                        Toast.show({
                            icon: 'success',
                            content: '提交成功',
                            position: 'bottom',
                        }),navigate('/qingjia')
                        }   })
                    }/>
        </div>
        <div>
            <div className="xlie">
                <div>上报老师</div>
                张丽丽
            </div>
            <div className="xlie">
                <div>请假类型</div>
                {listx.status?"病假":"事假"}
            </div>
            <div className="xlie">
                <div>请假开始时间</div>
                {listx.now}
            </div>
            <div className="xlie">
                <div>请假结束时间</div>
                {listx.datatime}
            </div>
            <div className="xlie">
                <div>请假说明</div>
                {listx.content}
            </div>
        </div>
        </div>
      
    </>)
}
export default App