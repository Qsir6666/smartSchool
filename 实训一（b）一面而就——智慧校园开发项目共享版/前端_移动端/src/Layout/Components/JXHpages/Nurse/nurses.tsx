import React, { useState, useEffect } from 'react';
import style from './nurse.module.css'
import { Toast } from 'antd-mobile'
import { NavBar } from 'react-vant';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { images } from '../Img/imgage'
import 'animate.css';
import { User } from '../Wrap/user'


interface Position {
	coords: {
		latitude: number;
		longitude: number;
		accuracy?: number;
	};
	timestamp: number;
}

const Nurse: React.FC = () => {
	const navigate = useNavigate();
	const [tabNum, setTabNum] = useState<number>(1)
	// 定义一个数据
	interface Item {
		id: number,
		name: string
	}
	const data: Item[] = ([
		{ id: 1, name: '星期一' },
		{ id: 2, name: '星期二' },
		{ id: 3, name: '星期三' },
		{ id: 4, name: '星期四' },
		{ id: 5, name: '星期五' },
		{ id: 6, name: '星期六' },
		{ id: 7, name: '星期日' }
	])
	const [list, setList] = useState<Array<any>>([]);
	const [lists, setLists] = useState<Array<any>>([]);
	const [qiandao,setQiandao] = useState<Boolean>(false);


	const getLists = async () => {
		let res = await axios.get('http://localhost:3000/JXH/jsignin')
		// console.log(res.data.data);
		// setLists(res.data.data);
		setLists(res.data.data.filter((item: any) => item.name === User.name));
	}

	useEffect(() => {
		getLists();
		// console.log(User.name);

	}, [])


	const getjaddlist = async () => {
		try {
			const res = await axios.get('http://localhost:3000/JXH/jaddlist');
			setList(res.data.data);
			// console.log(res.data.data, '1');
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		// getList();
		getjaddlist();
	}, [])

	// 0000000000000000000000000000000

	const [position, setPosition] = useState<Position | null>(null);
	const [error, setError] = useState<string>("");
	const [isInTargetArea, setIsInTargetArea] = useState(false);

	// 错误码转换
	const getErrorMsg = (code: number): string => {
		switch (code) {
			case 1: return "用户拒绝了位置请求";
			case 2: return "无法获取位置信息";
			case 3: return "请求超时";
			default: return "未知错误";
		}
	};

	// 获取地理位置
	const getLocation = () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(pos: GeolocationPosition) => {
					const { latitude, longitude, accuracy } = pos.coords;
					setPosition({
						coords: { latitude, longitude, accuracy },
						timestamp: pos.timestamp
					});
				},
				(err: GeolocationPositionError) => {
					setError(`获取位置失败: ${getErrorMsg(err.code)}`);
				}
			);
		} else {
			setError("浏览器不支持地理位置定位");
		}
	};

	useEffect(() => {
		// console.log(isInTargetArea);

		getLocation();
		const watchId = navigator.geolocation.watchPosition(
			pos => {
				const { latitude, longitude } = pos.coords;
				const formattedLat = Number(latitude.toFixed(4));
				const formattedLng = Number(longitude.toFixed(4));

				setPosition({
					coords: { latitude, longitude },
					timestamp: pos.timestamp
				});

				setIsInTargetArea(
					// formattedLat === 35.6876 &&
					// formattedLng === 139.7031
					true
				);
			},
			err => setError(getErrorMsg(err.code))
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, []);

	const LocationInfo = () => {
		if (error) return <div className={style.error}>{error}</div>;
		if (!position) return <div>获取位置中...</div>;

		return (
			<div className={style.location}>
				<h3>当前位置：{isInTargetArea ? '✅ 已在目标区域' : '⚠️ 未在目标区域'}</h3>
				<p>纬度：{position.coords.latitude.toFixed(4)}</p>
				<p>经度：{position.coords.longitude.toFixed(4)}</p>
				{position.coords.accuracy &&
					<p>精确度：±{position.coords.accuracy.toFixed(1)}米</p>
				}
			</div>
		);
	};

	const handleSignin = async (_id: number) => {
		if (isInTargetArea) {
			if (lists[0].signed) {
				// console.log('请勿重复签到');
				// Toast.show({
				// 	content: '请勿重复签到',
				// })
				return;
			} else {
				let res = await axios.get(`http://localhost:3000/JXH/jsignintrue?_id=${_id}&signed=true`)
				if (res.data.code === 200) {
					// console.log('签到成功');
					// Toast.show({
					// 	content: '签到成功',
					// })
					getLists();
					getjaddlist();
				} else {
					// console.log('签到失败');
					Toast.show({
						content: '签到失败',
					})
				}
			}
		} else {
			Toast.show({
				content: '请在目标区域签到',
			})
		}
	}

	const handleQiandao = () => {
		if (position.coords.latitude.toFixed(4) == '') {
			// console.log('1234123123');		
			Toast.show('请在目标区域内打卡')		
		} else {
			// console.log('成功了');
			// alert('123')
			Toast.show('签到成功')		
			setQiandao(true)	
		}
	}

	return (
		// <div className="animate__animated animate__fadeInDownBig">
		<div className={style.boxs}>
			<div title='返回按钮显示文字' className={style.title}>
				<NavBar
					title="护学岗"
					onClickLeft={() => {window.history.back()}}
					fixed
					placeholder
				/>
			</div>

			<div style={{ display: tabNum === 1 ? 'block' : 'none' }} className={style.tabOne}>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<p></p>
				<div onClick={() => handleQiandao()}>
					{/* {
						lists.map((item, index) => {
							return (
								<div key={index} onClick={() => handleSignin(item._id)}>
									{item.signed ? '签到成功' : '请签到'}
								</div>
							)
						})
					} */}
					{qiandao  ?'签到成功':'请签到'}
				</div>  

				{/* 显示位置信息 */}
				<div className={style.locationContainer}>
					<LocationInfo />
				</div>
			</div>

			<div style={{ display: tabNum === 2 ? 'block' : 'none' }}>
				<div className={style.tabTwo}>暂无数据</div>
			</div>

			<div style={{ display: tabNum === 3 ? 'block' : 'none' }}>
				{data.map((item, index) => {
					return (
						<div key={index} className={style.tabThree}>
							<div className={style.week}>{item.name}</div>
							<div className={style.weeks}>
								<div>08:00-22:00</div>
								<div>护导点1</div>
								<div className={style.weekThree}>护导人</div>
							</div>
							<div className={style.weeks}>
								<div>08:00-22:00</div>
								<div>护导点2</div>
								<div className={style.weekThree}>护导人</div>
							</div>
							<div className={style.weeks}>
								<div>08:00-22:00</div>
								<div>护导点3</div>
								<div className={style.weekThree}>护导人</div>
							</div>
						</div>
					)
				})}
			</div>

			<div style={{ display: tabNum === 4 ? 'block' : 'none' }}>
				{list.map((item, index) => {
					return (
						<div key={index} className={style.tabFour}>
							<div>{item.date.split('T')[0]}</div>
							<div>
								<div>上报人 : {item.name}</div>
								<div className={item.status === 'normal' ? style.fontColorBlue : style.fontColorred} onClick={() => { navigate('/threeImg', { state: { data: item } }) }}>{item.status === 'normal' ? '正常' : '异常'}</div>
							</div>
						</div>
					)
				})}
				<div className={style.tabFourButtom} onClick={() => navigate('/addfault')}>
					{images.Jia}
				</div>
			</div>

			<div className={style.tabbar}>
				<div className={tabNum === 1 ? style.tabbars : ''} onClick={() => setTabNum(1)}>打卡</div>
				<div className={tabNum === 2 ? style.tabbars : ''} onClick={() => setTabNum(2)}>记录</div>
				<div className={tabNum === 3 ? style.tabbars : ''} onClick={() => setTabNum(3)}>排班</div>
				<div className={tabNum === 4 ? style.tabbars : ''} onClick={() => setTabNum(4)}>日报</div>
			</div>
		</div>
		// </div>
	)
};

export default Nurse;