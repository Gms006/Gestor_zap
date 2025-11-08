import Link from 'next/link';

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

export default function DashboardPage() {
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
