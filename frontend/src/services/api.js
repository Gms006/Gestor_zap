const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const API_BASE = API_ORIGIN;

export async function apiGet(path, { query, init } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value != null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status}`);
  }

  return res.json();
}

export async function getEmpresas({ page = 1, perPage = 10, q = '' } = {}) {
  return apiGet('/api/empresas', { query: { page, perPage, q } });
}

export async function postEmpresasSync({ full = false } = {}) {
  const url = new URL(`${API_BASE}/api/empresas/sync`);
  if (full != null) {
    url.searchParams.set('full', full);
  }
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`POST ${url} -> ${res.status}`);
  }

  return res.json();
}
