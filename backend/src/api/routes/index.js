import { Router } from 'express';

import healthRouter from './system.routes.js';
import whatsappRouter from './whatsapp.routes.js';
import empresasRouter from './empresas.routes.js';

const router = Router();

router.use('/system', healthRouter);
router.use('/whatsapp', whatsappRouter);
router.use('/empresas', empresasRouter);

export default router;
