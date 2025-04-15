import React from 'react'
import Style from '../css/Qwg.module.css'
import { Selector } from 'react-vant'
import { Empty, WaterMark } from 'antd-mobile'


const Bjkq_Studentlist: React.FC = ({ studentList, onCateChange, classMsg, isToday, dateStr, hasSubmitted, showValidation }) => {
    // 学生状态数据
    const options = [{ label: '到校', value: '1' }, { label: '病假', value: '2' }, { label: '事假', value: '3' }, { label: '旷课', value: '4', }]

    return (
        <div>
            <div className={Style.BjkqPage_list}>
                {/* 教师信息 */}
                <div className={Style.BjkqPage_teacher}>
                    <div className={Style.BjkqPage_teacher_left}>
                        <span>
                            <svg width="16" height="16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2641"><path d="M64 320l448-192 448 192-448 192z" fill="#ffffff" p-id="2642"></path><path d="M832 374.4V576h64v-227.2z" fill="#ffffff" p-id="2643"></path><path d="M224 448v307.2l288 140.8 288-140.8V448l-288 128z" fill="#ffffff" p-id="2644"></path></svg>
                        </span>
                        <span>{classMsg.teacherName}</span>
                    </div>
                    <div>
                        <div>联系方式:{classMsg.phone}</div>
                    </div>
                </div>

                {
                    !isToday && !hasSubmitted ?
                    <Empty description='未上传考勤记录' />
                        :
                        studentList.length > 0 ? studentList.map((item, index) => {
                            return (
                                <div
                                    key={item._id}
                                    className={Style.BjkqPage_item}
                                    data-invalid={showValidation && (!item.cate || !['1', '2', '3', '4'].includes(item.cate))}
                                    style={{
                                        backgroundColor: (showValidation && (!item.cate || !['1', '2', '3', '4'].includes(item.cate)))
                                            ? 'rgba(255, 0, 0, 0.07)'
                                            : 'transparent',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                >
                                    <div className={Style.item_title}>
                                        <span className={!isToday ? Style.isNotTodayCssI : ''}>{item.name.charAt(item.name.length - 1)}</span>
                                        <span className={!isToday ? Style.isNotTodayCssT : ''}>{item.name}</span>
                                    </div>
                                    <div>
                                        <Selector
                                            disabled={!isToday}
                                            style={{
                                                '--rv-selector-padding': '5px 10px',
                                                '--rv-selector-margin': "0",
                                                "--rv-selector-border": "1px solid rgb(214, 214, 214)",
                                                "--rv-selector-checked-border": "1px solid rgb(214, 214, 214)",
                                                "--rv-selector-checked-color": "#00A8FF",
                                                "--rv-selector-text-color": "#00A8FF",
                                                "--rv-selector-checked-text-color": "white",
                                                "--rv-selector-color": "white",
                                                "fontSize": "12px",
                                                "--rv-selector-padding": "3px 10px"
                                            }}
                                            className={Style.BjkqPage_Selector}
                                            showCheckMark={false}
                                            options={options.map(opt => ({
                                                ...opt,
                                                disabled: !isToday
                                            }))}
                                            value={[item.cate]}
                                            onChange={(val) => {
                                                if (val.length > 0) {
                                                    onCateChange(
                                                        item._id, val[0]
                                                    )
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })
                            :
                            <div className={Style.BjkqPage_noSearch}>
                                <Empty description='未找到该同学' />
                            </div>
                }
                {!isToday && <WaterMark zIndex={0} content="历史记录，仅供查看" />}
            </div>



        </div>
    )
}

export default Bjkq_Studentlist
