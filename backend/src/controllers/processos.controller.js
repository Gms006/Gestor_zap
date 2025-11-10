import { listProcessos, getProcesso } from '../services/acessoriasClient.js';
import { toDate, nowTz, daysBetween, percentile } from '../utils/dates.js';

export const TIPOS_MAP = {
  'Simples Nacional — Mensal': 'SN_MENSAL',
  'Lucro Presumido - Serviços': 'LP_SERVICOS',
  'Lucro Presumido - Comércio, Industria e Serviços': 'LP_CIS',
  'Lucro Real - Comércio e Industria': 'LR_CI',
  'Lucro Real - Serviços': 'LR_SERVICOS',
  'Contabilidade Anual 2025': 'CONT_ANUAL',
};

export const TIPOS_ENUM = Array.from(
  new Set([...Object.values(TIPOS_MAP), 'OUTROS']),
);

function normTipo(label) {
  return TIPOS_MAP[label] || 'OUTROS';
}

export function maskCnpj(cnpj) {
  if (!cnpj) return '';
  const digits = String(cnpj).replace(/\D/g, '').padStart(14, '0').slice(-14);
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function normalizeProcesso(raw = {}) {
  const inicio = toDate(raw.data_inicio || raw.inicio);
  const fim = toDate(raw.data_conclusao || raw.fim || raw.dataFim);
  const percentual = Number.isFinite(raw.percentual_conclusao)
    ? raw.percentual_conclusao
    : Number.isFinite(raw.percentual)
    ? raw.percentual
    : Number.isFinite(raw.andamento)
    ? raw.andamento
    : null;
  const statusFromPct = percentual === 100;
  const statusFromText = String(raw.status || raw.situacao || '')
    .toLowerCase()
    .includes('conclu');
  const status = statusFromPct || statusFromText ? 'CONCLUIDO' : 'PENDENTE';

  const eventosOrig = Array.isArray(raw.eventos)
    ? raw.eventos
    : Array.isArray(raw.andamentos)
    ? raw.andamentos
    : [];
  const eventos = eventosOrig
    .map((evt) => ({
      etapa: evt.etapa || evt.nome || evt.descricao || '',
      inicio: toDate(evt.inicio || evt.data_inicio || evt.dataInicio),
      fim: toDate(evt.fim || evt.data_fim || evt.dataFim),
    }))
    .sort((a, b) => {
      const ai = a.inicio ? a.inicio.getTime() : 0;
      const bi = b.inicio ? b.inicio.getTime() : 0;
      return ai - bi;
    });

  const lastEnd = eventos
    .map((e) => e.fim)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0] || null;

  const now = nowTz();
  const diasPendRaw = daysBetween(lastEnd || inicio, now);
  const diasPendentes = status === 'PENDENTE' ? Math.max(0, diasPendRaw ?? 0) : 0;
  const diasTotaisRaw =
    status === 'CONCLUIDO' ? daysBetween(inicio, fim) : daysBetween(inicio, now);
  const diasTotais = diasTotaisRaw ?? null;

  const pct = (() => {
    if (Number.isFinite(percentual)) {
      return Math.max(0, Math.min(100, Math.round(percentual)));
    }
    return status === 'CONCLUIDO' ? 100 : 0;
  })();

  return {
    id: String(raw.id || raw.processo_id || raw.codigo || ''),
    tipo: normTipo(raw.tipo_matriz || raw.tipo || raw.nome_matriz),
    status,
    pct,
    inicio,
    fim,
    diasPendentes,
    diasTotais,
    etapaAtual: raw.etapa_atual || raw.tarefa_atual || raw.etapa || null,
    empresa: {
      nome: raw.empresa_nome || raw.empresa || raw.cliente || '',
      cnpjMasked: maskCnpj(raw.cnpj || raw.empresa_cnpj || raw.documento || ''),
    },
    eventos,
  };
}

export function aggregateResumo(items = []) {
  const totals = { total: 0, concluidos: 0, pendentes: 0 };
  const porTipo = Object.fromEntries(
    TIPOS_ENUM.map((tipo) => [tipo, { total: 0, concluidos: 0, pendentes: 0 }]),
  );

  for (const proc of items) {
    totals.total += 1;
    if (proc.status === 'CONCLUIDO') totals.concluidos += 1;
    else totals.pendentes += 1;

    if (!porTipo[proc.tipo]) {
      porTipo[proc.tipo] = { total: 0, concluidos: 0, pendentes: 0 };
    }

    porTipo[proc.tipo].total += 1;
    if (proc.status === 'CONCLUIDO') porTipo[proc.tipo].concluidos += 1;
    else porTipo[proc.tipo].pendentes += 1;
  }

  const percentis = {};
  for (const tipo of Object.keys(porTipo)) {
    const diasTotais = items
      .filter((p) => p.tipo === tipo && p.status === 'CONCLUIDO')
      .map((p) => p.diasTotais)
      .filter((n) => Number.isFinite(n));
    percentis[tipo] = {
      p50: percentile(diasTotais, 50),
      p90: percentile(diasTotais, 90),
    };
  }

  return { totals, porTipo, percentis };
}

function extractItemsPayload(data) {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.Processos)) return data.Processos;
  if (Array.isArray(data)) return data;
  return [];
}

export async function getResumo(req, res, next) {
  try {
    const perPage = Math.max(1, Number.parseInt(req.query.perPage ?? '20', 10) || 20);
    const maxPages = Math.max(1, Number.parseInt(req.query.maxPages ?? '30', 10) || 30);

    const all = [];
    let page = 1;
    let pagesProcessed = 0;
    while (page <= maxPages) {
      const remote = await listProcessos({ page, perPage });
      const rows = extractItemsPayload(remote);
      if (!rows.length) break;
      rows.forEach((row) => all.push(normalizeProcesso(row)));
      pagesProcessed += 1;
      if (rows.length < perPage) break;
      page += 1;
    }

    const resumo = aggregateResumo(all);
    const meta = {
      paginasPercorridas: pagesProcessed,
      pageSize: perPage,
      updatedAt: nowTz().toISOString(),
    };

    return res.json({ data: resumo, meta });
  } catch (error) {
    return next(error);
  }
}

export async function list(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page ?? '1', 10) || 1);
    const perPage = Math.max(1, Number.parseInt(req.query.perPage ?? '20', 10) || 20);
    const status = req.query.status ? String(req.query.status).toUpperCase() : null;
    const tipo = req.query.tipo || null;

    const remote = await listProcessos({ page, perPage, tipo });
    const rows = extractItemsPayload(remote)
      .map((row) => normalizeProcesso(row))
      .filter((proc) => (status ? proc.status === status : true));

    const pagination = {
      page,
      perPage,
      total: remote?.pagination?.total ?? remote?.total ?? null,
      totalPages: remote?.pagination?.totalPages ?? null,
    };

    return res.json({ items: rows, pagination });
  } catch (error) {
    return next(error);
  }
}

export async function detail(req, res, next) {
  try {
    const { id } = req.params;
    const raw = await getProcesso(id);
    const item = normalizeProcesso(raw);
    return res.json({ item });
  } catch (error) {
    return next(error);
  }
}

export default { getResumo, list, detail, normalizeProcesso, aggregateResumo };
