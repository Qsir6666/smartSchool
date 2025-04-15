import React, { useEffect, useState } from 'react';
import style from './nurse.module.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../Wrap/user'
import { Toast } from 'antd-mobile'
import { NavBar } from 'react-vant';

const Nurse: React.FC = () => {
	const navigate = useNavigate();
	const [list, setList] = useState<Array<any>>([]);
	const userMsg = JSON.parse(localStorage.getItem('userMsg') || '{}')

	const getList = async () => {
		const res = await axios.get('http://localhost:3000/JXH/jsignin')
		// console.log(res.data.data);
		// 过滤掉可能存在的当前用户的记录，避免重复
		const filteredList = res.data.data.filter((item: {name: string}) => item.name !== userMsg.name);
		
		// 创建当前用户的签到记录
		const currentUserRecord = {
			_id: 'current-user-id', // 为当前用户创建一个固定ID
			name: userMsg.name || '当前用户',
			date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
			signed: false // 默认未签到
		};
		
		// 将当前用户记录添加到列表中
		setList([...filteredList, currentUserRecord]);
	}

	useEffect(() => {
		if (userMsg && userMsg.name) {
			getList();
		}
	}, [userMsg]); // 当userMsg变化时重新获取列表

	// 处理签到逻辑
	const handleSignin = async (name: string, id: string) => {
		if (User.name === name || userMsg.name === name) {
			// 如果是当前用户签到
			if (id === 'current-user-id') {
				// 更新本地状态
				setList(prevList => 
					prevList.map(item => 
						item._id === 'current-user-id' 
							? {...item, signed: true} 
							: item
					)
				);
				// Toast.show({
				// 	content: '签到成功！',
				// });
				
				navigate('/nurses');
			} else {
				// 如果是真实后端数据，调用API更新
				try {
					await axios.get(`http://localhost:3000/JXH/jsignintrue?_id=${id}&signed=true`);
					// 更新本地状态
					setList(prevList => 
						prevList.map(item => 
							item._id === id 
								? {...item, signed: true} 
								: item
						)
					);
					// Toast.show({
					// 	content: '签到成功！',
					// });
					// 延迟导航，让用户看到签到成功的提示
					setTimeout(() => {
						navigate('/nurses');
					}, 1500);
				} catch {
					// Toast.show({
					// 	content: '签到失败，请重试',
					// });
				}
			}
		} else {
			Toast.show({
				content: '你不是该用户，不能签到',
			});
		}
	}

	return (
		<div className={style.boxs}>
			<div title='返回按钮显示文字' className={style.title}>
				<NavBar
					title="护学岗"
					fixed
					placeholder
					onClickLeft={() => window.history.back()}
				/>
			</div>
			{list.length > 0 ? (
				list.map((item: {_id: string, name: string, date: string, signed: boolean}) => {
					// 高亮显示当前用户的记录
					const isCurrentUser = item._id === 'current-user-id' || item.name === userMsg.name;
					return (
						<div key={item._id || item.name} 
							className={`${style.content} ${isCurrentUser ? style.currentUserContent : ''}`}
							style={isCurrentUser ? { borderLeft: '4px solid #1989fa', background: '#f0f9ff' } : {}}>
							<div className={style.contentOne}>
								用户名称 : {item.name}
								{isCurrentUser && <span style={{ color: '#1989fa', marginLeft: '10px' }}>(当前用户)</span>}
							</div>
							<div className={style.contentTwo}>时间 : {item.date}</div>
							<div className={style.contentThree}>
								<div className={item.signed ? style.contentThree12 : style.contentThree1}>签到状态 : <span>{item.signed ? '已签到' : '未签到'}</span></div>
								<div 
									className={item.signed ? style.contentThree22 : style.contentThree2} 
									onClick={() => handleSignin(item.name, item._id)}>
									签到
								</div>
							</div>
						</div>
					)
				})
			) : (
				<div className={style.content} style={{ textAlign: 'center' }}>
					<div>暂无签到记录</div>
				</div>
			)}
			<div className={style.tabbar}>
				<div className={style.tabbarname}>
					号主 : {userMsg.name || '未登录'}
				</div>
			</div>
		</div>
	)
};

export default Nurse;    