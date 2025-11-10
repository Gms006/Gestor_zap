import { apiGet } from './api';

export async function getResumoProcessos(options = {}) {
  const { query, init } = options;
  return apiGet('/api/processos/resumo', { query, init });
}

export async function listProcessos({ page = 1, perPage = 20, status, tipo } = {}) {
  return apiGet('/api/processos', {
    query: { page, perPage, status, tipo },
  });
}

export async function getProcesso(id, options = {}) {
  if (!id) throw new Error('ID é obrigatório');
  return apiGet(`/api/processos/${id}`, { init: options.init });
}

export async function fetchResumoProcessos(options = {}) {
  const payload = await getResumoProcessos({
    query: options.query,
    init: options.signal ? { signal: options.signal } : options.init,
  });
  return payload?.data || payload;
}
