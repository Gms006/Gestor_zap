'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton({ className = '' }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => start(() => router.refresh())}
      className={
        'px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 ' +
        'text-sm font-medium ' +
        (pending ? 'opacity-60 cursor-wait ' : '') +
        className
      }
      disabled={pending}
      title="Recarregar agora"
    >
      {pending ? 'Atualizando…' : 'Atualizar'}
    </button>
  );
}
