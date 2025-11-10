export default function ProcessTable({ rows }) {
  if (!rows?.length) {
    return (
      <div className="text-slate-500 text-sm py-6">Nenhum processo encontrado.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-2">Empresa</th>
            <th>CNPJ</th>
            <th>Etapa atual</th>
            <th>Status</th>
            <th>Dias pendentes</th>
            <th>Dias totais</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-900/40">
              <td className="py-2 text-slate-100">{row.empresa?.nome || '—'}</td>
              <td className="font-mono text-slate-400">{row.empresa?.cnpjMasked || '—'}</td>
              <td className="text-slate-200">{row.etapaAtual || '—'}</td>
              <td className={row.status === 'PENDENTE' ? 'text-amber-400' : 'text-emerald-400'}>
                {row.status}
              </td>
              <td>{row.diasPendentes ?? '—'}</td>
              <td>{row.diasTotais ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
