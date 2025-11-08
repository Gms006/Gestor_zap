const acessoriasBaseUrl = process.env.ACESSORIAS_API_URL || 'https://api.acessorias.com';

const defaultHeaders = () => ({
  Authorization: `Bearer ${process.env.ACESSORIAS_API_TOKEN || ''}`,
});

export default {
  baseURL: acessoriasBaseUrl,
  timeout: Number(process.env.ACESSORIAS_API_TIMEOUT || 30_000),
  headers: defaultHeaders,
};
