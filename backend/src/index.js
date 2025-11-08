import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { initDatabase } from './database/connection.js';
import logger from './utils/logger.utils.js';
import errorMiddleware from './api/middlewares/error.middleware.js';
import loggerMiddleware from './api/middlewares/logger.middleware.js';
import router from './api/routes/index.js';
import registerSocketEvents from './websocket/socket.handler.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
});

registerSocketEvents(io);

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));
app.use(express.json({ limit: '5mb' }));
app.use(limiter);
app.use(loggerMiddleware);
app.use('/api', router);
app.use(errorMiddleware);

const port = Number(process.env.PORT || 3000);

async function bootstrap() {
  try {
    await initDatabase();
    server.listen(port, () => {
      logger.info(`Gestor Zap backend listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start backend', { error });
    process.exit(1);
  }
}

bootstrap();

export default app;
