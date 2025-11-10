// backend/src/api/routes/index.js
import { Router } from 'express';

import healthRouter from './system.routes.js';
import whatsappRouter from './whatsapp.routes.js';
import empresasRouter from './empresas.routes.js';
import processosRouter from './processos.routes.js'; // ⬅ novo

const router = Router();

router.use('/system', healthRouter);
router.use('/whatsapp', whatsappRouter);
router.use('/empresas', empresasRouter);
router.use('/processos', processosRouter); // ⬅ novo

export default router;
