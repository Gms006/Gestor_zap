import axios from 'axios';
import acessoriasConfig from '../config/acessorias.config.js';

const api = axios.create({
  baseURL: acessoriasConfig.baseURL,
  timeout: acessoriasConfig.timeout,
});

api.interceptors.request.use((config) => {
  const headers = acessoriasConfig.headers();
  config.headers = { ...config.headers, ...headers };
  return config;
});

export default api;
