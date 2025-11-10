import RefreshButton from '@/components/RefreshButton';
import { fetchResumoProcessos } from '@/services/processos';

export const dynamic = 'force-dynamic';

function fmt(n) {
  return new Intl.NumberFormat('pt-BR').format(n ?? 0);
}
function percent(part, total) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1).replace('.', ',')}%`;
}

const ORDEM_TIPOS = [
  'Simples Nacional — Mensal',
  'Lucro Presumido - Serviços',
  'Lucro Presumido - Comércio, Industria e Serviços',
  'Lucro Real - Comércio e Industria',
  'Lucro Real - Serviços',
  'Contabilidade Anual 2025',
  'Outros'
];

export default async function ProcessosPage() {
  let data;
  try {
    data = await fetchResumoProcessos();
  } catch (e) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-slate-100 mb-4">Processos</h1>
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          Falha ao carregar o resumo de processos.<br />
          <span className="text-red-200/80 text-sm">{String(e?.message || e)}</span>
          <div className="mt-4">
            <RefreshButton />
          </div>
        </div>
      </div>
    );
  }

  const { totals, porTipo, remote, updatedAt } = data || {};
  const total = totals?.total ?? 0;
  const concluidos = totals?.concluidos ?? 0;
  const pendentes = totals?.pendentes ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-100">Processos</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total de processos" value={fmt(total)} />
        <KpiCard title="Concluídos" value={fmt(concluidos)} subtitle={percent(concluidos, total)} />
        <KpiCard title="Pendentes" value={fmt(pendentes)} subtitle={percent(pendentes, total)} />
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/60 text-slate-200 font-medium">
          Situação por tipo de processo
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60 text-slate-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Concluídos</th>
                <th className="text-right px-4 py-3 font-medium">Pendentes</th>
                <th className="text-right px-4 py-3 font-medium">% Concluído</th>
              </tr>
            </thead>
            <tbody>
              {ORDEM_TIPOS.map((tipo, i) => {
                const row = porTipo?.[tipo] || { total: 0, concluidos: 0, pendentes: 0 };
                return (
                  <tr key={tipo} className={i % 2 ? 'bg-slate-900/30' : ''}>
                    <td className="px-4 py-3 text-slate-200">{tipo}</td>
                    <td className="px-4 py-3 text-right text-slate-100">{fmt(row.total)}</td>
                    <td className="px-4 py-3 text-right text-emerald-300">{fmt(row.concluidos)}</td>
                    <td className="px-4 py-3 text-right text-amber-300">{fmt(row.pendentes)}</td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {percent(row.concluidos, row.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-700/60 text-xs text-slate-400 flex flex-wrap gap-4">
          <div>
            Atualizado em:{' '}
            <span className="text-slate-300">
              {updatedAt ? new Date(updatedAt).toLocaleString('pt-BR') : '—'}
            </span>
          </div>
          <div>
            Páginas processadas:{' '}
            <span className="text-slate-300">{remote?.paginasPercorridas ?? '—'}</span>
          </div>
          <div>
            Itens por página (API):{' '}
            <span className="text-slate-300">{remote?.pageSize ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-100">{value}</div>
      {subtitle ? <div className="mt-1 text-slate-400 text-sm">{subtitle}</div> : null}
    </div>
  );
}
