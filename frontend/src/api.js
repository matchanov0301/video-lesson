import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add a request interceptor to include Telegram InitData
api.interceptors.request.use((config) => {
  const initData = WebApp.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
