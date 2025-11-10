'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const TABS = [
  { key: 'SN_MENSAL', label: 'Simples Nacional — Mensal' },
  { key: 'LP_SERVICOS', label: 'Lucro Presumido — Serviços' },
  { key: 'LP_CIS', label: 'Lucro Presumido — Comércio/Ind/Serv' },
  { key: 'LR_CI', label: 'Lucro Real — Com. & Ind.' },
  { key: 'LR_SERVICOS', label: 'Lucro Real — Serviços' },
  { key: 'CONT_ANUAL', label: 'Contabilidade Anual 2025' },
  { key: 'OUTROS', label: 'Outros' },
];

export default function ProcessTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get('tab') || 'SN_MENSAL';

  const handleClick = (key) => {
    const qs = new URLSearchParams(params.toString());
    qs.set('tab', key);
    const query = qs.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map((tabItem) => {
        const isActive = tab === tabItem.key;
        return (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => handleClick(tabItem.key)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              isActive
                ? 'bg-slate-200 text-slate-900 border-slate-200'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            aria-pressed={isActive}
          >
            {tabItem.label}
          </button>
        );
      })}
    </div>
  );
}
