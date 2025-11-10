// backend/src/config/acessorias.config.js
const baseURL =
  process.env.ACESSORIAS_BASE_URL ||
  process.env.ACESSORIAS_API_URL ||
  'https://api.acessorias.com';

function buildHeaders() {
  const headers = {
    Authorization: `Bearer ${process.env.ACESSORIAS_API_TOKEN || ''}`,
  };
  const org = (process.env.ACESSORIAS_ORG_ID || '').trim();
  if (org) headers['X-Organization-Id'] = org; // opcional
  return headers;
}

export default {
  baseURL,
  timeout: Number(process.env.ACESSORIAS_API_TIMEOUT || 30_000),
  headers: buildHeaders,
};
