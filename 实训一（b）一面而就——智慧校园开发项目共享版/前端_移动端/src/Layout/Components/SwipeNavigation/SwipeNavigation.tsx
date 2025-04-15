// 👇👇👇👇👇👇👇👇👇👇👇👇👇
// nav页面滑动屏幕实现跳转路由组件


import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SwipeNavigation: React.FC = () => {
	const navigate = useNavigate();
	let startTouch = 0; // 记录开始触摸的位置

	const handleTouchStart = (e: TouchEvent) => {
		startTouch = e.touches[0].clientX; // 记录触摸开始的位置
	};

	const handleTouchEnd = (e: TouchEvent) => {
		const touchEnd = e.changedTouches[0].clientX; // 记录触摸结束的位置
		if (startTouch - touchEnd > 50) { // 左滑，向前进
			if (window.location.pathname.split('/')[2] === undefined) {
				navigate('/layout/msg');
			} else if (window.location.pathname.split('/')[2] === 'msg') {
				navigate('/layout/mine');
			}
		} else if (touchEnd - startTouch > 50) { // 右滑，向后退
			if (window.location.pathname.split('/')[2] === 'mine') {
				navigate('/layout/msg');
			} else if (window.location.pathname.split('/')[2] === 'msg') {
				navigate('/layout');
			}
		}
	};

	useEffect(() => {
		document.addEventListener('touchstart', handleTouchStart);
		document.addEventListener('touchend', handleTouchEnd);

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, []);

	return null;
};

export default SwipeNavigation;


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const SwipeNavigation: React.FC = () => {
// 	const navigate = useNavigate();
// 	const [startTouch, setStartTouch] = useState(0); /// 记录开始触摸的位置

// 	const handleTouchStart = (e: React.TouchEvent) => { /// 触摸开始
// 		const touchStart = e.touches[0].clientX; /// 记录触摸开始的位置
// 		setStartTouch(touchStart); /// 设置开始触摸的位置
// 	};

// 	const handleTouchEnd = (e: React.TouchEvent) => { /// 触摸结束
// 		const touchEnd = e.changedTouches[0].clientX; /// 记录触摸结束的位置
// 		if (startTouch - touchEnd > 50) { // 左滑，向前进
// 			// console.log(location.pathname.split('/')[2], '111111111');
// 			if (location.pathname.split('/')[2] === undefined) {
// 				navigate('/layout/msg');
// 			} else if (location.pathname.split('/')[2] === 'msg') {
// 				navigate('/layout/mine');
// 			} else {
// 				return;
// 			}
// 		} else if (touchEnd - startTouch > 50) { // 右滑，向后退
// 			// console.log(location.pathname.split('/')[2]);
// 			if (location.pathname.split('/')[2] === 'mine') {
// 				navigate('/layout/msg');
// 			} else if (location.pathname.split('/')[2] === 'msg') {
// 				navigate('/layout');
// 			} else {
// 				return;
// 			}
// 		}
// 	};

// 	useEffect(() => {
// 		document.addEventListener('touchstart', handleTouchStart);  // 不要管
// 		document.addEventListener('touchend', handleTouchEnd); // 不要管

// 		return () => {
// 			document.removeEventListener('touchstart', handleTouchStart); // 不要管
// 			document.removeEventListener('touchend', handleTouchEnd); // 不要管
// 		};
// 	}, [startTouch]);

// 	return null;
// };

// export default SwipeNavigation;



