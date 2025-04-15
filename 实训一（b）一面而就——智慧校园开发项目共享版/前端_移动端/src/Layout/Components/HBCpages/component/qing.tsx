import React, { useEffect, useState } from "react";
import { Picker, Button, Space } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';
import '../hbc.css';
type PickerColumn = {
  label: string;
  value: string;
};

// 添加属性接口
interface RenderChildrenProps {
  onSelectCollege?: (college: string) => void;
}

function RenderChildrenDemo({ onSelectCollege }: RenderChildrenProps) {
  const [value, setValue] = useState<string[]>(['0']);
  const [basic] = useState<PickerColumn[][]>([ [
      { label: "全部学院", value: "0" },
      { label: "人工智能学院", value: "1" },
      { label: "云计算学院", value: "2" },
      { label: "大数据学院", value: "3" },
      { label: "数智传媒学院", value: "4" },
      { label: "鸿蒙生态开发学院", value: "5" },
      { label: "元宇宙学院", value: "6" }
    ],])
  useEffect(() => {
    // console.log('当前选择值:', value);
    // 选中的学院标签
    const collegeLabel = basic[0].find(item => item.value === value[0])?.label || '';
    // 如果有回调函数，则传递所选学院
    if (onSelectCollege) {
      onSelectCollege(collegeLabel);
    }
  }, [value, basic, onSelectCollege]);
  
  return (
    <Picker
      columns={basic}
      value={value}
      onSelect={(val, extend) => {
        // console.log("正在选择中的值:", val,extend); // 实时记录正在选择的值
      }}
      onConfirm={(val)=>{
        setValue(val as string[])
      }}
    >
      {(items, { open }) => (
        <Space align="center">
          {items[0]?.label || "全部学院"}
          <Button onClick={open}><DownOutline /></Button>
        </Space>
      )}
    </Picker>
  );}

// 添加属性接口
interface QingProps {
  onSelectCollege?: (college: string) => void;
}

const App: React.FC<QingProps> = ({ onSelectCollege }) => {
  return (
    <div className="navtil">
      <div><RenderChildrenDemo onSelectCollege={onSelectCollege} /></div>
      <div>日历</div>
    </div>
  );
};

export default App;