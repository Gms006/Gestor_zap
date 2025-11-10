// backend/src/services/processos.service.js
// Resumo de processos Acessórias por situação e por tipo.
// Robusto a variações de campos: monta um "textoIndex" com todos os campos textuais.

import api from './acessorias.service.js';
import logger from '../utils/logger.utils.js';

const REMOTE_PAGE_SIZE = 20;

// ------------------------- Normalização -------------------------
function norm(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sem acentos
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Junta todos os valores string (shallow + alguns campos conhecidos aninhados) para formar um índice textual
function buildTextoIndex(obj) {
  const parts = [];

  const pushIf = (v) => {
    if (v == null) return;
    if (typeof v === 'string' && v.trim()) parts.push(v);
    else if (typeof v === 'number') parts.push(String(v));
  };

  // nível 0
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string' || typeof v === 'number') pushIf(v);
    // nível 1 para objetos comuns (ex.: {Departamento:{Nome:'...'}})
    else if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const kk of Object.keys(v)) {
        const vv = v[kk];
        if (typeof vv === 'string' || typeof vv === 'number') pushIf(vv);
      }
    }
  }

  return parts.join(' | ');
}

function classificarTipoPorTexto(textoIndex) {
  const s = norm(textoIndex);

  const tests = [
    [/simples\s*nacional[^a-z]*mensal/, 'Simples Nacional — Mensal'],
    [/lucro\s*presumido[^a-z]*servic/, 'Lucro Presumido - Serviços'],
    [/lucro\s*presumido.*comercio.*industria.*servic/, 'Lucro Presumido - Comércio, Industria e Serviços'],
    [/lucro\s*real.*comercio.*industria/, 'Lucro Real - Comércio e Industria'],
    [/lucro\s*real.*servic/, 'Lucro Real - Serviços'],
    [/contabilidade.*anual.*2025/, 'Contabilidade Anual 2025'],
  ];

  for (const [rx, label] of tests) {
    if (rx.test(s)) return label;
  }
  return 'Outros';
}

function isConcluidoPorTexto(textoIndex) {
  const s = norm(textoIndex);

  // textual
  if (/\bconclu/.test(s)) return true;

  // 100% como string (100,00%  |  100%  |  100.00 %)
  if (/\b100\s*[,\.]?\d*\s*%/.test(s)) return true;

  // números soltos "100" associados a andamento/percentual
  if (/(percentual|andamento|progresso|progreso|progress|avanco)[^a-z0-9]{0,10}100\b/.test(s)) {
    return true;
  }

  return false;
}

// ------------------------- Consulta remota -------------------------
async function fetchRemotePage(page) {
  // Tenta com 'Pagina' (documentado) e aceita 'Page' se o backend aceitar ambos
  const params = { Pagina: page };

  const { data, headers } = await api.get('/processes/ListAll', { params });

  // Normaliza formas comuns de envelope
  //  - { Processos: [] }
  //  - { data: [] }
  //  - []
  let arr = [];
  if (Array.isArray(data?.Processos)) arr = data.Processos;
  else if (Array.isArray(data?.data)) arr = data.data;
  else if (Array.isArray(data)) arr = data;
  else if (Array.isArray(data?.items)) arr = data.items;

  // Log seguro: só chaves para depuração (não loga conteúdo)
  if (arr.length) {
    try {
      const keys = Object.keys(arr[0]).slice(0, 15);
      logger.debug?.('Acessórias ListAll: amostra de chaves', keys);
    } catch {}
  }

  // Tenta inferir pageSize pelo header se existir, senão assume o padrão
  const pageSize = Number(headers?.['x-page-size']) || REMOTE_PAGE_SIZE;

  return { arr, pageSize };
}

// ------------------------- Serviço principal -------------------------
export async function resumirProcessos({ maxPages = 50 } = {}) {
  // Tabela alvo (ordem fixa) pedida por você
  const tipos = [
    'Simples Nacional — Mensal',
    'Lucro Presumido - Serviços',
    'Lucro Presumido - Comércio, Industria e Serviços',
    'Lucro Real - Comércio e Industria',
    'Lucro Real - Serviços',
    'Contabilidade Anual 2025',
    'Outros',
  ];

  const resumoPorTipo = Object.fromEntries(
    tipos.map((t) => [t, { total: 0, concluidos: 0, pendentes: 0 }]),
  );

  let total = 0;
  let concluidos = 0;
  let pendentes = 0;

  let paginasPercorridas = 0;
  let pageSizeUsado = REMOTE_PAGE_SIZE;

  try {
    for (let page = 1; page <= maxPages; page++) {
      const { arr, pageSize } = await fetchRemotePage(page);
      paginasPercorridas = page;
      if (page === 1) pageSizeUsado = pageSize;

      if (!arr.length) break;

      for (const p of arr) {
        const textoIndex = buildTextoIndex(p);
        const tipo = classificarTipoPorTexto(textoIndex);
        const done = isConcluidoPorTexto(textoIndex);

        total += 1;
        resumoPorTipo[tipo].total += 1;

        if (done) {
          concluidos += 1;
          resumoPorTipo[tipo].concluidos += 1;
        } else {
          pendentes += 1;
          resumoPorTipo[tipo].pendentes += 1;
        }
      }

      // heurística de parada
      if (arr.length < pageSize) break;
    }

    return {
      totals: { total, concluidos, pendentes },
      porTipo: resumoPorTipo,
      remote: { paginasPercorridas, pageSize: pageSizeUsado },
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('Erro ao resumir processos da Acessórias', {
      msg: err?.message,
      status: err?.response?.status,
    });
    const e = new Error('Falha ao consultar processos na API Acessórias');
    e.status = err?.response?.status || 502;
    throw e;
  }
}
