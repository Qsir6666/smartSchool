import request from './request';

const userService = {
  // 获取隐患列表
  hiddenUsers: () => {
    return request({
      url: '/api/hidden/list',
      method: 'GET'
    });
  },

  // 添加隐患报告
  addHidden: (data: any) => {
    return request({
      url: '/api/hidden/add',
      method: 'POST',
      data
    });
  },

  // 更新隐患状态
  updateHiddenState: (id: string, state: number) => {
    return request({
      url: `/api/hidden/update/${id}`,
      method: 'PUT',
      data: { state }
    });
  }
};

export default userService; 