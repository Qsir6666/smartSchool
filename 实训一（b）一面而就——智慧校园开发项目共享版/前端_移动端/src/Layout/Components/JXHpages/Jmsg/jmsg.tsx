import React, { useEffect, useState } from 'react';
import style from '../Nurse/nurse.module.css';
import { NavBar } from 'react-vant'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Jmsg() {
	// const navigate = useNavigate();
	const [list, setList] = useState<Array<any>>([]);

	// 上传的信息
	const getjaddlist = async () => {
		try {
			const res = await axios.get('http://localhost:3000/JXH/jaddlist');
			// console.log(res.data.data);

			const newList = res.data.data.filter((item: any) =>
				item.num === '1' || item.num === '2' || item.num === '3'
			);
			setList(newList); // 使用函数式更新
			// setList(res.data.data); // 使用函数式更新
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
			>
				<NavBar
					title='护学岗'
					onClickLeft={() => {window.history.back()}}
					fixed
					placeholder
					/>
			</div>
			{list.length > 0 ? (
				list.map((item: any) => {
					return (
						<div key={item._id} className={style.jmsgbox}>
							<div><span style={{ color: 'red' }}>【隐患】</span>隐患任务提醒</div>
							<div>隐患 : {item.summary}</div>
							<div>  
								<div>
									{item.num === '1' && <div style={{backgroundColor:'rgb(255,204,102)',transform:'rotate(-35deg)'}}>待审核</div>}  
									{item.num === '2' && <div style={{backgroundColor:'rgb(255,102,0)',transform:'rotate(-35deg)'}}>待处理</div>}    
									{item.num === '3' && <div style={{backgroundColor:'rgb(102,153,204)',transform:'rotate(-35deg)'}}>待验收</div>} 
								</div>
								<div>{item.date.split('T')[0]}</div>  
							</div>
						</div>
					);
				})
			) : (
				<div className={style.jmsgbox} style={{ textAlign: 'center', padding: '20px' }}>
					<div style={{ fontSize: '18px', color: 'green', marginBottom: '10px' }}>暂无隐患</div>
					<div>所有隐患已被排查处理</div>
				</div>
			)}
		</div>
	);
}