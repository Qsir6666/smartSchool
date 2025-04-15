import React, { useState, useEffect } from 'react';
import style from '../Nurse/nurse.module.css'
import styles from './safe.module.css'
import { NavBar } from 'antd-mobile'   
import { useNavigate } from 'react-router-dom';
import Safewrap from '../Wrap/wrap.tsx'
import axios from 'axios';
import 'animate.css';
import { Sticky } from 'react-vant';

const Safe: React.FC = () => {
	const navigate = useNavigate();
	const [num, setNum] = useState<number>(1)
	const [list, setList] = useState<Array<any>>([]);

	// 上传的信息
	const getjaddlist = async () => {
		try {
			const res = await axios.get('http://localhost:3000/JXH/jaddlist');
			setList(res.data.data);
			// console.log(res.data.data,'1');
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		getjaddlist();
		// console.log(list.map((item: any) => item.name));
	}, [])  

	return (
		<div className="animate__animated animate__fadeInUp">
			<div className={style.boxssafe}>
				<Sticky>
					<div title='返回按钮显示文字' className={style.title} onClick={() => { navigate('/layout') }}>
						<NavBar back=''  >
							隐患代办
						</NavBar>
					</div>
				</Sticky>

				<div className={styles.title}>
					<div className={num === 1 ? styles.onclick : styles.click} onClick={() => { setNum(1) }}>待审核</div>
					<div className={num === 2 ? styles.onclick : styles.click} onClick={() => { setNum(2) }}>待处理</div>
					<div className={num === 3 ? styles.onclick : styles.click} onClick={() => { setNum(3) }}>待验收</div>
				</div>


				<div style={num === 1 ? { display: 'block' } : { display: 'none' }}>
					{
						list.map((item: any) => {
							return (
								<div key={item._id} className={styles.box}>
									{/* {item.status == 'normal'?'1' :'2'} */}
									{item.num === '1' ? <Safewrap onSuccess={getjaddlist} audit="待审核" colors='#ffcc66' name={item.name} school={item.school} 
									img='/imgs/login/app2.png'
									date={item.date.split('T')[0]} images={item.images} num={item.num} _id={item._id} /> : ''}

								</div>
							)
						})
					}
				</div>

				<div style={num === 2 ? { display: 'block' } : { display: 'none' }}>
					{/* <Safewrap audit="待处理"  colors='#ff6600'/> */}
					{
						list.map((item: any) => {
							return (
								<div key={item._id} className={styles.box}>
									{item.num === '2' ? <Safewrap onSuccess={getjaddlist} audit="待处理" colors='#ff6600' name={item.name} school={item.school} 
									// img={item.img} 
									img='/imgs/login/app2.png' 
									date={item.date.split('T')[0]} images={item.images} num={item.num} _id={item._id} /> : ''}

								</div>
							)
						})
					}
				</div>

				<div style={num === 3 ? { display: 'block' } : { display: 'none' }}>
					{/* <Safewrap audit="待验收"  colors='#6699cc'/> */}
					{
						list.map((item: any) => {
							return (
								<div key={item._id} className={styles.box}>
									{item.num === '3' ? <Safewrap onSuccess={getjaddlist} audit="待验收" colors='#6699cc' name={item.name} school={item.school}
									 img='/imgs/login/app2.png'
									  date={item.date.split('T')[0]} images={item.images} num={item.num} _id={item._id} /> : ''}

								</div>
							)
						})
					}
				</div>
			</div>
		</div>

	)
};

export default Safe;