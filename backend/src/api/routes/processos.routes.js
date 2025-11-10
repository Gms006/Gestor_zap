// backend/src/api/routes/processos.routes.js
import { Router } from 'express';
import { getResumo, list, detail } from '../../controllers/processos.controller.js';

const router = Router();

router.get('/resumo', getResumo);
router.get('/', list);
router.get('/:id', detail);

export default router;
