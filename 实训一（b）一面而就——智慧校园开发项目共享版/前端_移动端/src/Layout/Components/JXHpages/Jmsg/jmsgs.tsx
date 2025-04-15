
import React, { useEffect, useState } from 'react';
import style from '../Nurse/nurse.module.css';
import { NavBar } from 'react-vant'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Jmsg() {
	const navigate = useNavigate();
	const [list, setList] = useState<Array<any>>([]);

	// 上传的信息
	const getjaddlist = async () => {
		try {
			const res = await axios.get('http://localhost:3000/JXH/jaddlist');
			// console.log(res.data.data);

			const newList = res.data.data.filter((item: any) =>
				item.num === '4' || item.num === '5' 
			);
			setList(newList); // 使用函数式更新
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getjaddlist();
	}, []);

	return (
		<div className={style.jmsgboxs}>
			<div
				title="返回按钮显示文字"
				className={style.title}
				onClick={() => { window.history.back() }}
			>
				<NavBar
					title='护学岗'
					onClickLeft={() => {window.history.back()}}
					fixed
					placeholder
					/>
			</div>
			{list.map((item: any) => {
				return (
					<div key={item._id} className={style.jmsgbox}>
						<div><span style={{ color: 'red' }}>【隐患】</span>隐患任务提醒</div>
						<div>隐患 : {item.summary}</div>
						<div>  
							<div>
								{item.num === '4' && <div style={{backgroundColor:'#0099ff',transform:'rotate(-35deg)'}}>正常</div>}  
								{item.num === '5' && <div style={{backgroundColor:'#cbcbcb',transform:'rotate(-35deg)'}}>已解决</div>}    
							</div>
							<div>{item.date.split('T')[0]}</div>  
						</div>
					</div>
				);
			})}
		</div>
	);
}