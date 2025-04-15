import React, { useState, useEffect } from "react"
import ZuKuai from '../HBCpages/component/zukuai'
import { useNavigate, useLocation } from "react-router-dom"
import { Button, Input, Space } from 'antd-mobile'
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
  const [mvalue, setmvalue] = useState<string>('')
  const [bingzheng] = useState<PickerColumn[][]>([[
    { label: "发烧", value: '1' },
    { label: "感冒", value: '2' },
    { label: "咳嗽", value: '3' },
  ]])

  return (
    <Space block>
      <Button
        onClick={() => setVisible(true)}
        style={{ width: '100%' }}
      >
        {mvalue || '请选择病症'}
      </Button>
      <Picker
        columns={bingzheng}
        visible={visible}
        onClose={() => setVisible(false)}
        onSelect={(val) => {
          console.log("正在选择中的值:", val);
        }}
        onConfirm={(val, extend) => {
          if (extend?.items?.[0]?.label) {
            setmvalue(extend.items[0].label);
            onChange(extend.items[0].value);
          }
        }}
      />
    </Space>
  )
}

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [fantime, setfantime] = useState('')
  const [isBing, setIsBing] = useState(false)
  const [bingXian, setBingXian] = useState<string | null>(null)

  useEffect(() => {
    const initTime = location.state?.time || ''
    setfantime(initTime)
  }, [location.state])

  const handleSubmit = () => {
    if (!name) {
      Toast.show('请输入姓名')
      return
    }
    if (!fantime) {
      Toast.show('请选择返校时间')
      return
    }
    if (!content) {
      Toast.show('请输入请假说明')
      return
    }
    if (isBing && !bingXian) {
      Toast.show('请选择病症')
      return
    }

    const formData = {
      name,
      type: isBing ? '病假' : '事假',
      illness: isBing ? bingXian : null,
      backTime: fantime,
      content
    }

    console.log('提交数据:', formData)
    navigate('/qingjia', { state: formData })
  }

  return (
    <div className="qingdeng-container">
      <ZuKuai title='请假登记' area="/qingjia" />

      <div className="deng-main">
        <div className="form-item">
          <div className="label">请假人</div>
          <Input
            placeholder='请输入姓名'
            value={name}
            onChange={setName}
            clearable
          />
        </div>

        <div className="form-item">
          <div className="label">请假类型</div>
          <CapsuleTabs
            onChange={() => setIsBing(!isBing)}
            defaultActiveKey='fruits'
            style={{ '--active-line-color': '#1677ff' }}
          >
            <CapsuleTabs.Tab title='事假' key='fruits' />
            <CapsuleTabs.Tab title='病假' key='vegetables' />
          </CapsuleTabs>
        </div>

        {isBing && (
          <div className="form-item">
            <div className="label">请假病症</div>
            <BasicDemo
              value={bingXian}
              onChange={setBingXian}
            />
          </div>
        )}

        <div className="form-item">
          <div className="label">请假返校时间</div>
          <span onClick={() => {
            navigate('/rili')
          }}>
            <Input
              placeholder='请选择日期'
              value={fantime}
              readOnly
            />
          </span>

        </div>

        <div className="form-item">
          <div className="label">请假说明</div>
          <Input
            placeholder='请输入详细情况'
            value={content}
            onChange={setContent}
            clearable
          />
        </div>
      </div>

      <Button
        block
        color='primary'
        className="submit-btn"
        onClick={handleSubmit}
      >
        保存
      </Button>
    </div>
  )
}

export default App
