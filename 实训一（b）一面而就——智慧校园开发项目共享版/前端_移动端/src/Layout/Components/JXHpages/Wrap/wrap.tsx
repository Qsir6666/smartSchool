

import React, { useEffect, useState } from 'react';
import { Image } from 'antd';
import { Dialog, Toast } from 'antd-mobile';
import axios from 'axios';
import { User } from './user';

interface Iprops {
	audit: string; // 审核等状态
	colors: string;
	name: string;
	school: string;
	img: string;
	date: string;
	images: string[];
	num: string;
	_id: string;
}

export default function Safewrap(props: Iprops) {
	const [contents, setContents] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	//   const [code, setCode] = useState<string>('');

	const onConfirm = async () => {
		// console.log(props.num, ' 1 待审核 2 待处理 3 待验收'); // 1 待审核 2 待处理 3 待验收
		// console.log(User.power, ' 1 小保安 2 中保安 3 大保安'); // 1 小保安 2 中保安 3 大保安

		let newPower: string | number = '2';

		switch (props.num) {
			case '1':
				newPower = '2';
				break;
			case '2':
				if (User.power === 1) {
					setVisible(true);
					return;
				} else {
					newPower = '3';
				}
				break;
			case '3':
				if (User.power === 1 || User.power === 2) {
					setVisible(true);
					return;
				} else {
					newPower = '5';
				}
				break;
			default:
				console.log('Invalid num value');
				return;
		}

		try {
			const res = await axios.get(`http://localhost:3000/JXH/jupdate?_id=${props._id}&power=${newPower}`);
			//   console.log(res.data.code);

			//   console.log(res.data.data);
			// 刷新页面
			// window.location.reload();
			if (props.onSuccess) { 
				props.onSuccess()
			  }
			Toast.show({
				content: '审核成功',
			  })
		} catch (error) {
			console.log(error);
		}
	};

	//   useEffect(() => {
	// 	onConfirm();
	//   },[code])

	useEffect(() => {
		switch (props.num) {
			case '1':
				setContents('是否通过审核');
				break;
			case '2':
				setContents('是否通过处理');
				break;
			case '3':
				setContents('是否通过验收');
				break;
			default:
				setContents('');
		}
	}, [props.num]);

	const handleDialogClose = () => {
		setVisible(false); // 关闭对话框，将 visible 设置为 false
	};

	return (


		<div style={{ width: '90vw', margin: '2vh auto', backgroundColor: 'white', borderRadius: '10px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px #8f8989 dashed ' }}>
				<div style={{ width: '15vw' }}>
					<img style={{ width: '100%', borderRadius: '50%', margin: '2vh' }} src={props.img} alt="胖虎" />
				</div>
				<div style={{ marginLeft: '-20vw', marginTop: "4vh" }}>
					<p style={{ fontWeight: '600' }}>{props.name}</p>
					<p>{props.school}</p>
				</div>
				<div style={{ width: '16vw', margin: "2vh", backgroundColor: `${props.colors}`, borderRadius: "50%", textAlign: "center", lineHeight: '15vw', color: "white", transform: 'rotate(-35deg)' }}>
					<div onClick={() => Dialog.show({ content: contents, closeOnAction: true, actions: [[{ key: 'cancel', text: '取消' }, { key: 'true', text: '确定', bold: true, danger: true, onClick: () => onConfirm() }]] })}>
						{props.audit}
					</div>
				</div>
			</div>
			<div style={{ marginTop: '2vh' }}>
				<p style={{ marginLeft: '3vw', fontWeight: '600', color: 'rgb(143, 141, 141)' }}>上报时间</p>
				<p style={{ marginLeft: '3vw', fontWeight: '600', color: 'rgb(143, 141, 141)' }}>{props.date}</p>
				<div style={{ display: 'flex', marginTop: '2vh', paddingBottom: '2vh' }}>
					{props.images.map((item, index) => (
						<Image key={index} style={{ width: '100px', height: '100px', marginLeft: '3vw' }} src={item} alt="胖虎" />
					))}
				</div>
			</div>
			{visible && (
				<Dialog
					visible={visible}
					title="权限不足，请联系管理员"
					actions={[
						{ text: 'OK', key: 'ok', onClick: () => handleDialogClose() },
					]}
					onClose={handleDialogClose}
				>
					<div style={{ padding: '20px' }}>
						<p>权限不足，请联系管理员</p>
					</div>
				</Dialog>
			)}
		</div>
	);
}   