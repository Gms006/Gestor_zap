const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') || 'http://localhost:3000';

export async function fetchResumoProcessos(options = {}) {
  const url = `${API_BASE}/api/processos/resumo`;
  const res = await fetch(url, {
    cache: 'no-store',
    signal: options.signal,
    headers: { Accept: 'application/json' }
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Falha ao buscar resumo de processos (${res.status}): ${txt}`);
  }

  const payload = await res.json();
  return payload?.data || payload;
}
