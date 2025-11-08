import { Router } from 'express';

import healthRouter from './system.routes.js';

const router = Router();

router.use('/system', healthRouter);

export default router;
