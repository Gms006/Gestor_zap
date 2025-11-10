import test from 'node:test';
import assert from 'node:assert/strict';

import { aggregateResumo } from '../controllers/processos.controller.js';
import { daysBetween, percentile } from '../utils/dates.js';

test('daysBetween basic', () => {
  assert.strictEqual(daysBetween('2025-01-01', '2025-01-02'), 1);
});

test('percentile p50/p90', () => {
  const xs = [1, 2, 3, 4, 5, 10];
  assert.strictEqual(percentile(xs, 50), 3.5);
  assert.strictEqual(percentile(xs, 90), 7.5);
});

test('aggregateResumo por tipo e status', () => {
  const items = [
    { tipo: 'SN_MENSAL', status: 'CONCLUIDO', diasTotais: 3 },
    { tipo: 'SN_MENSAL', status: 'PENDENTE', diasTotais: 5 },
    { tipo: 'LP_SERVICOS', status: 'CONCLUIDO', diasTotais: 7 },
  ];
  const r = aggregateResumo(items);
  assert.deepStrictEqual(r.totals, { total: 3, concluidos: 2, pendentes: 1 });
  assert.ok(r.porTipo['SN_MENSAL']);
  assert.ok(r.percentis['SN_MENSAL'].p50 != null);
});
