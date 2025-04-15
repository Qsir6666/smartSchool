import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'; // 替换为实际的 DeepSeek API URL

const deepseekApi = {
  // 示例：获取某个资源
  getResource: async (resourceId) => {
    try {
      const response = await axios.get(`${DEEPSEEK_API_URL}/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  },

  // 示例：创建某个资源
  createResource: async (resourceData) => {
    try {
      const response = await axios.post(`${DEEPSEEK_API_URL}/resources`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  // 其他 API 调用...
};

export default deepseekApi;
