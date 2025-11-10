// backend/src/api/routes/processos.routes.js
import { Router } from 'express';
import { resumirProcessos } from '../../services/processos.service.js';
import logger from '../../utils/logger.utils.js';

const router = Router();

/**
 * GET /api/processos/resumo
 * Query:
 *   - maxPages (opcional, default 50)  -> quantas páginas remotas varrer
 */
router.get('/resumo', async (req, res, next) => {
  try {
    const maxPages = Math.max(1, Math.min(200, parseInt(req.query.maxPages || '50', 10)));
    const resumo = await resumirProcessos({ maxPages });

    // header útil para UI
    res.set('X-Processed-Pages', String(resumo.remote.paginasPercorridas));

    return res.json({
      data: resumo,        // { totals, porTipo, remote, updatedAt }
      items: resumo,       // alias
      pagination: null,    // não se aplica (é um agregado)
    });
  } catch (error) {
    logger.error('Erro em /api/processos/resumo', { error: error?.message });
    return next(error);
  }
});

export default router;
