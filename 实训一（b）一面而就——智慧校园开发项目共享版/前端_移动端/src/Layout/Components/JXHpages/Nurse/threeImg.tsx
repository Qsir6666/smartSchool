import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { NavBar } from 'antd-mobile'
import style from './nurse.module.css'
import { Image } from 'antd';
// import type { NurseData } from '@/types/nurse' // 根据实际路径调整

export default function ThreeImg() {
	const navigate = useNavigate()
	const location = useLocation()
	const data = location.state?.data


	useEffect(() => {
		console.log('Received Data:', data)
	}, [data])

	return (
		<div>
			<div className={style.title} onClick={() => navigate('/nurses')}>
				<NavBar back="">护学岗</NavBar>
			</div>
			<div className={style.imgone}>
				<div>填报日期</div>
				<div>{data?.date.split('T')[0]}</div>
			</div>
			<div className={style.imgone}>
				<div>护导情况</div>
				<div className={data?.status ==='normal' ? style.imgonetrue : style.imgonefalse}>{data?.status ==='normal' ? '正常' : '异常'}</div>
			</div>
			<div className={style.imgtwo}>
				<div>护导总结</div>
				<div>{data?.summary}</div>
			</div>


			{
				data.images.map((item, index) => {
					return (
						<div key={index} className={style.imgthree}>
							<Image
								src={item}
							/>
						</div>
					)
				})
			}




		</div>
	)
}
