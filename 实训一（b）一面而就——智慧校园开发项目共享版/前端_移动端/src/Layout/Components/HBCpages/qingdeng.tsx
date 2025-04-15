import React, { useState, useEffect } from "react"
import ZuKuai from '../HBCpages/component/zukuai'
import { useNavigate, useLocation } from "react-router-dom"
import { Button, Input } from 'antd-mobile'
import './hbc.css'
import { CapsuleTabs } from 'antd-mobile'
import { Picker, Toast } from 'antd-mobile'

type PickerColumn = {
  label: string;
  value: string;
};

function BasicDemo({ value, onChange }: { 
  value: string | null; 
  onChange: (val: string | null) => void 
}) {
  const [visible, setVisible] = useState(false)
  const [mvalue,setmvalue]=useState<string>('')
  const [bingzheng] = useState<PickerColumn[][]>([[ //  静态数据改用const
    { label: "发烧", value: '1' },
    { label: "感冒", value: '2' },
    { label: "咳嗽", value: '3' },
  ]])

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        {mvalue || '请选择病症'}
        
      </Button>
      <Picker
        columns={bingzheng}
        visible={visible}
        onClose={() => setVisible(false)}
        onSelect={(val, extend) => {
            console.log("正在选择中的值:", val,extend.items); // 实时记录正在选择的值
          }}
        onConfirm={(val,extend)=>{
            // setmvalue(val)
            console.log(Number(val),extend.items[0].label);
           setmvalue(extend.items[0].label)
           
        }} //  传递选中值
      />
    </>
  )
}

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 状态管理
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [fantime, setfantime] = useState('')
  const [isBing, setIsBing] = useState(false)
  const [bingXian, setBingXian] = useState<string | null>(null)

  //  正确使用副作用钩子
  useEffect(() => {
    const initTime = location.state?.time || ''
    setfantime(initTime)
  }, [location.state])

  // 提交处理
  const handleSubmit = () => {
    if (!name || !content) {
      Toast.show('请填写完整信息') // 添加校验
      return
    }
    
    const formData = {
      name,
      type: isBing ? '病假' : '事假',
      illness: isBing ? bingXian : null, // 动态包含病症字段
      backTime: fantime,
      content
    }
    
    console.log('提交数据:', formData)
    navigate('/qingjia', { state: formData }) //  传递数据
  }

  return (
    <>
      <ZuKuai title='请假登记' area="/qingjia" />
      
      <div className="deng-main">
        {/* 请假人 */}
        <div className="main-lie">
          <div className="label">请假人</div>
          <Input
            placeholder='请输入姓名'
            value={name}
            onChange={setName}
          />
        </div>

        {/* 请假类型 */}
        <div className="main-lie" style={{ alignItems: 'center' }}>
          <div className="label">请假类型</div>
          <CapsuleTabs 
            onChange={() => setIsBing(!isBing)}
            defaultActiveKey='fruits'>
            <CapsuleTabs.Tab title='事假' key='fruits' />
            <CapsuleTabs.Tab title='病假' key='vegetables' />
          </CapsuleTabs>
        </div>

        {/* 病假时显示的病症选择 */}
        <div 
          className="main-lie" 
          style={{ display: isBing ? 'flex' : 'none' }} // 条件渲染修正
        >
          <div className="label">请假病症</div>
          <BasicDemo 
            value={bingXian}
            onChange={setBingXian} //  状态联动
          />
        </div>

        {/* 请假返校时间 */}
        <br/>
        <div className="main-lie">
          <div className="label">请假返校时间</div>
          <Input
            placeholder='请选择日期'
            value={fantime} 
            onClick={() => navigate('/rili')}
           // 禁止直接输入
          />
        </div>

        {/* 请假说明 */}
        <div className="main-lie">
          <div className="label">请假说明</div>
          <Input
            placeholder='请输入详细情况'
            value={content}
            onChange={setContent}
          />
        </div>
      </div>

      <Button 
        block 
        color='primary' 
        className="deng"
        onClick={handleSubmit} >
        保存
      </Button>
    </>
  )
}

export default App
