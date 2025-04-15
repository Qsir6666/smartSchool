import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 创建 axios 实例
// AxiosInstance 是 axios 实例的类型所有 axios 的请求方法（如 get、post、put、delete 等
const instance: AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:3000/',
    timeout: 10000, 

});

// 请求拦截器
//AxiosRequestConfig 是请求配置的类型，用于定义发送请求时的配置选项
//包含了请求的 URL、方法、请求头、参数、超时时间等配置
instance.interceptors.request.use(
    (config) => {
        // 在发送请求之前做一些处理
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 对请求错误做一些处理
        return Promise.reject(error);

    }
);
// 向应拦截器
//AxiosResponse 是响应数据的类型，表示 axios 请求返回的响应对象。
//它包含了服务器返回的数据、状态码、状态信息、响应头等
instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 对响应数据做一些处理
      return response.data; // 只返回实际数据
    },
    (error) => {
      // 对响应错误做一些处理
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('未授权，请重新登录');
            break;
          case 404:
            console.error('请求的资源不存在');
            break;
          case 500:
            console.error('服务器内部错误');
            break;
          default:
            console.error('请求失败', error.message);
        }
      }
      return Promise.reject(error);
    }
  );

  export default instance;

