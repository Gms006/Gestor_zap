import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export function getEmpresas({ page = 1, perPage = 10, q = '' } = {}) {
  return api
    .get('/empresas', {
      params: { page, perPage, q },
    })
    .then((response) => response.data);
}

export function postEmpresasSync({ full = false } = {}) {
  return api
    .post('/empresas/sync', null, {
      params: { full },
    })
    .then((response) => response.data);
}

export default api;
