'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEmpresas, postEmpresasSync } from '../../services/api';
import useWebSocket from '../../hooks/useWebSocket';

const perPageOptions = [10, 20, 50];

function formatStatus(ativa) {
  return ativa ? 'Ativa' : 'Inativa';
}

export default function EmpresasPage() {
  const defaultPerPage = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || 10);
  const [empresas, setEmpresas] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(
    perPageOptions.includes(defaultPerPage) ? defaultPerPage : 10
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [lastAlert, setLastAlert] = useState(null);

  const { connected, lastEvent } = useWebSocket();

  const totalPages = useMemo(() => {
    return total > 0 ? Math.ceil(total / perPage) : 1;
  }, [total, perPage]);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmpresas({ page, perPage, q: query });
      setEmpresas(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError('Não foi possível carregar a lista de empresas.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, query]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  useEffect(() => {
    if (!lastEvent) {
      return;
    }

    if (lastEvent.type === 'alerts:new') {
      setLastAlert(lastEvent.payload);
      return;
    }

    if (!['sync:start', 'sync:progress', 'sync:end'].includes(lastEvent.type)) {
      return;
    }

    if (lastEvent.payload?.entity !== 'empresas') {
      return;
    }

    if (lastEvent.type === 'sync:start') {
      setSyncing(true);
      setSyncMessage('Sincronização de empresas iniciada...');
    }

    if (lastEvent.type === 'sync:progress') {
      const { processed, total: totalItems } = lastEvent.payload || {};
      setSyncMessage(
        `Sincronizando empresas (${processed || 0}${
          totalItems ? ` de ${totalItems}` : ''
        })`
      );
    }

    if (lastEvent.type === 'sync:end') {
      const { status, inserted, updated, errors } = lastEvent.payload || {};

      if (status === 'error') {
        setSyncMessage('Sincronização falhou. Verifique os alertas recentes.');
      } else {
        setSyncMessage(
          `Sincronização finalizada (${inserted || 0} novas, ${updated || 0} atualizadas, ${
            errors || 0
          } erros)`
        );
      }

      setSyncing(false);
      fetchEmpresas();
    }
  }, [lastEvent, fetchEmpresas]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  const handleChangePerPage = (event) => {
    const value = Number(event.target.value);
    setPerPage(value);
    setPage(1);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage('Disparando sincronização...');
      await postEmpresasSync({ full: false });
    } catch (err) {
      setSyncing(false);
      setSyncMessage('Falha ao iniciar sincronização.');
    }
  };

  const handleFullSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage('Disparando sincronização completa...');
      await postEmpresasSync({ full: true });
    } catch (err) {
      setSyncing(false);
      setSyncMessage('Falha ao iniciar sincronização completa.');
    }
  };

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-slate-400">
              Consulte empresas sincronizadas com a API Acessórias e acompanhe a situação em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              Socket {connected ? 'conectado' : 'desconectado'}
            </span>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-200"
            >
              Sincronizar
            </button>
            <button
              type="button"
              onClick={handleFullSync}
              disabled={syncing}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-800/60"
            >
              Sync completa
            </button>
          </div>
        </header>

        {lastAlert ? (
          <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">Alerta do sistema</p>
            <p className="mt-1 text-amber-100">{lastAlert?.message || 'Notificação recebida.'}</p>
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Total de empresas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">{total}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Página atual</p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">
              {page} <span className="text-base text-slate-400">/ {totalPages}</span>
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Status da sincronização</p>
            <p className="mt-2 text-sm text-slate-200">{syncMessage || 'Aguardando próxima execução.'}</p>
          </article>
        </section>

        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por razão social, fantasia ou CNPJ"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Buscar
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <label htmlFor="per-page">Itens por página</label>
            <select
              id="per-page"
              value={perPage}
              onChange={handleChangePerPage}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-100"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </form>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Identificador</th>
                  <th className="px-4 py-3">Razão Social</th>
                  <th className="px-4 py-3">Fantasia</th>
                  <th className="px-4 py-3">Regime</th>
                  <th className="px-4 py-3">Cidade/UF</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Carregando empresas...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-rose-300">
                      {error}
                    </td>
                  </tr>
                ) : empresas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Nenhuma empresa encontrada.
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.identificador} className="hover:bg-slate-900/70">
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{empresa.identificador}</td>
                      <td className="px-4 py-3 text-slate-100">{empresa.razao}</td>
                      <td className="px-4 py-3 text-slate-300">{empresa.fantasia || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{empresa.regimeNome || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {empresa.cidade || '—'}{empresa.uf ? `/${empresa.uf}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            empresa.ativa
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {formatStatus(empresa.ativa)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>
            Exibindo {(empresas.length && (page - 1) * perPage + 1) || 0} -{' '}
            {(page - 1) * perPage + empresas.length} de {total}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => canGoPrev && setPage((value) => Math.max(value - 1, 1))}
              disabled={!canGoPrev}
              className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => canGoNext && setPage((value) => value + 1)}
              disabled={!canGoNext}
              className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
