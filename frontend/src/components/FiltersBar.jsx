'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FiltersBar() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') || 'PENDENTE';
  const perPage = params.get('perPage') || '20';
  const tab = params.get('tab') || 'SN_MENSAL';

  const updateQuery = (key, value) => {
    const qs = new URLSearchParams(params.toString());
    qs.set(key, value);
    const query = qs.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  };

  return (
    <div className="flex gap-3 items-end flex-wrap">
      <div className="flex flex-col">
        <label className="text-xs text-slate-400" htmlFor="status-filter">
          Status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(event) => updateQuery('status', event.target.value)}
          className="bg-slate-900/40 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
        >
          <option value="PENDENTE">Pendentes</option>
          <option value="CONCLUIDO">Concluídos</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-slate-400" htmlFor="per-page-filter">
          Itens por página
        </label>
        <select
          id="per-page-filter"
          value={perPage}
          onChange={(event) => updateQuery('perPage', event.target.value)}
          className="bg-slate-900/40 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div className="ml-auto text-xs text-slate-500">
        Aba:{' '}
        <span className="font-mono text-slate-300">{tab}</span>
      </div>
    </div>
  );
}
