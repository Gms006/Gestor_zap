const BASE = (process.env.ACESSORIAS_API_BASE || 'https://api.acessorias.com').replace(/\/$/, '');
const TOKEN = process.env.ACESSORIAS_API_TOKEN || '';

async function http(path, { method = 'GET', query, body } = {}) {
  const url = new URL(`${BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value != null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(`Acessorias HTTP ${res.status} on ${url}: ${text}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export async function listProcessos({ page = 1, perPage = 20, tipo } = {}) {
  return http('/v1/processos', { query: { page, perPage, tipo } });
}

export async function getProcesso(id) {
  if (!id) {
    throw new Error('ID do processo é obrigatório');
  }
  return http(`/v1/processos/${id}`);
}

export default { listProcessos, getProcesso };
