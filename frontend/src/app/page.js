import Link from 'next/link';

import KpiCard from '@/components/KpiCard';
import ProcessTabs from '@/components/ProcessTabs';
import FiltersBar from '@/components/FiltersBar';
import ProcessTable from '@/components/ProcessTable';
import { getResumoProcessos, listProcessos } from '@/services/processos';

const sections = [
  { href: '/empresas', label: 'Empresas' },
  { href: '/entregas', label: 'Entregas' },
  { href: '/processos', label: 'Processos' },
  { href: '/faturamento', label: 'Faturamento' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/chat', label: 'Chatbot' },
  { href: '/api-explorer', label: 'Explorador de API' },
  { href: '/settings', label: 'Configurações' },
  { href: '/logs', label: 'Logs' },
];

function percent(part, total) {
  if (!total) return '0,0%';
  return `${((part / total) * 100).toFixed(1).replace('.', ',')}%`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0);
}

export default async function DashboardPage({ searchParams }) {
  const featureEnabled = !['0', 'false'].includes(
    String(process.env.FEATURE_PROCESSOS_HOME ?? '1').toLowerCase(),
  );

  if (!featureEnabled) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-6 space-y-10">
        <header className="space-y-3">
          <p className="uppercase tracking-widest text-emerald-400">Gestor Zap</p>
          <h1 className="text-4xl font-bold">Visão geral do escritório contábil</h1>
          <p className="text-slate-300">
            Conecte dados da API Acessórias e do WhatsApp Business para acompanhar entregas, processos e faturamento em tempo real.
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">Páginas planejadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-emerald-500/5 hover:border-emerald-400 transition"
                href={section.href}
              >
                <span className="text-emerald-400 block text-sm font-semibold uppercase tracking-wide">Em breve</span>
                <span className="mt-2 block text-2xl font-bold">{section.label}</span>
                <span className="mt-3 block text-sm text-slate-400">
                  Estrutura reservada para a funcionalidade descrita na especificação do projeto.
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="text-sm text-slate-500">
          Esta é apenas uma casca inicial. Construa os dashboards, gráficos, filtros e chatbot seguindo o detalhamento do prompt.
        </footer>
      </main>
    );
  }

  const tab = searchParams?.tab ?? 'SN_MENSAL';
  const status = (searchParams?.status ?? 'PENDENTE').toUpperCase();
  const perPage = Number.parseInt(searchParams?.perPage ?? '20', 10) || 20;

  let resumoResponse;
  let listResponse;
  try {
    [resumoResponse, listResponse] = await Promise.all([
      getResumoProcessos(),
      listProcessos({ page: 1, perPage, status, tipo: tab }),
    ]);
  } catch (error) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-100">Visão geral dos processos</h1>
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          Falha ao carregar os dados da API de processos.
          <div className="mt-2 text-sm text-red-100/80">{String(error?.message || error)}</div>
        </div>
      </div>
    );
  }

  const totals = resumoResponse?.data?.totals || { total: 0, concluidos: 0, pendentes: 0 };
  const meta = resumoResponse?.meta || {};
  const total = totals.total ?? 0;

  return (
    <div className="p-6 text-slate-200 space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-semibold">Visão geral dos processos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard title="Total de processos" value={formatNumber(total)} />
        <KpiCard
          title="Concluídos"
          value={formatNumber(totals.concluidos)}
          subtitle={percent(totals.concluidos ?? 0, total)}
        />
        <KpiCard
          title="Pendentes"
          value={formatNumber(totals.pendentes)}
          subtitle={percent(totals.pendentes ?? 0, total)}
        />
      </div>

      <ProcessTabs />
      <FiltersBar />

      <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/40">
        <div className="text-slate-300 text-sm mb-3">
          Empresas {status === 'PENDENTE' ? 'pendentes' : 'concluídas'} — Aba atual
        </div>
        <ProcessTable rows={listResponse?.items || []} />
      </div>

      <div className="text-xs text-slate-500 space-y-1">
        <div>
          Atualizado em:{' '}
          <span className="text-slate-300">
            {meta.updatedAt ? new Date(meta.updatedAt).toLocaleString('pt-BR') : '—'}
          </span>
        </div>
        <div>
          Páginas processadas:{' '}
          <span className="text-slate-300">{meta.paginasPercorridas ?? '—'}</span>
        </div>
        <div>
          Itens por página (API):{' '}
          <span className="text-slate-300">{meta.pageSize ?? perPage}</span>
        </div>
      </div>
    </div>
  );
}
