import axios from 'axios';

const baseURL = process.env.ACESSORIAS_API_URL || 'https://api.acessorias.com';
const token = process.env.ACESSORIAS_API_TOKEN;
const timeout = Number(process.env.ACESSORIAS_API_TIMEOUT || 30000);

const http = axios.create({
  baseURL,
  timeout,
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

export async function listCompaniesPage(pagina = 1) {
  const url = `/companies/ListAll?Pagina=${pagina}`;
  const { data } = await http.get(url);

  if (process.env.ACESSORIAS_DEBUG && Array.isArray(data) && data[0]) {
    // eslint-disable-next-line no-console
    console.log('[Acessorias:first]', data[0]);
  }

  return Array.isArray(data) ? data : [];
}

export default {
  listCompaniesPage,
};
