// backend/src/api/routes/empresas.routes.js
import { Router } from 'express';
import { Op } from 'sequelize';
import { getDatabase } from '../../database/connection.js';
import { syncEmpresas } from '../../services/sync.service.js';
import logger from '../../utils/logger.utils.js';

const router = Router();

function parseBoolean(value) {
  if (value === undefined) return false;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function toInt(value, def, { min = 1, max = 1000 } = {}) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

const ALLOWED_ORDER = new Set([
  'razao', 'fantasia', 'identificador', 'cidade', 'uf', 'createdAt', 'updatedAt',
]);

router.post('/sync', async (req, res, next) => {
  try {
    const full = parseBoolean(req.query.full);
    const summary = await syncEmpresas({ full });
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1, { min: 1, max: 100000 });
    const perPage = toInt(req.query.perPage, 10, { min: 1, max: 100 });
    const search = String(req.query.q || '').trim();
    const order = String(req.query.order || 'razao').trim();
    const dir = String(req.query.dir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderField = ALLOWED_ORDER.has(order) ? order : 'razao';

    const db = getDatabase();
    const { Empresa } = db.models;

    const where = {};
    if (search) {
      where[Op.or] = [
        { identificador: { [Op.like]: `%${search}%` } },
        { razao: { [Op.like]: `%${search}%` } },
        { fantasia: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Empresa.findAndCountAll({
      where,
      order: [[orderField, dir]],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const data = rows.map((r) => r.toJSON());
    const totalPages = Math.max(1, Math.ceil((count || 0) / perPage));
    res.set('X-Total-Count', String(count || 0));

    return res.json({
      data,
      items: data,
      pagination: { page, perPage, total: count || 0, totalPages },
    });
  } catch (error) {
    logger.error('Failed to list empresas', { error: error?.message });
    return next(error);
  }
});

export default router;
