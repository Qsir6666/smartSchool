
export const User = {
	username: '1',
	password: '1',
	name: '1',
	img: '1',
	school: '1',
	power: '1',
	_id: '1',
	...(JSON.parse(localStorage.getItem('jdata') || '{}')) // 合并 localStorage 数据
  };
  