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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.perPage, 10) || 10, 1), 100);
    const search = (req.query.q || '').trim();

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
      order: [['razao', 'ASC']],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    return res.json({
      data: rows.map((row) => row.toJSON()),
      page,
      perPage,
      total: count,
    });
  } catch (error) {
    logger.error('Failed to list empresas', { error: error.message });
    return next(error);
  }
});

export default router;
