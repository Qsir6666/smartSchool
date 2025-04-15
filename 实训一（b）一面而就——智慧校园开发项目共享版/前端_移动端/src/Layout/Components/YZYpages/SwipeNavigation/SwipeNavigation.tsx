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


