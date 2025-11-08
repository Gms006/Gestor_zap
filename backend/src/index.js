import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { initDatabase, getDatabase } from './database/connection.js';
import logger from './utils/logger.utils.js';
import errorMiddleware from './api/middlewares/error.middleware.js';
import loggerMiddleware from './api/middlewares/logger.middleware.js';
import router from './api/routes/index.js';
import registerSocketEvents from './websocket/socket.handler.js';
import whatsappConfig from './config/whatsapp.config.js';
import { sendWhatsAppMessage } from './services/whatsapp.service.js';
import { isNumberAuthorized } from './utils/authorized-numbers.utils.js';
import { emitAlert, logSystemEvent } from './utils/system-events.utils.js';
import { setSocketServer } from './websocket/io.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
});

registerSocketEvents(io);
setSocketServer(io);

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
app.get(whatsappConfig.webhookPath, (req, res) => {
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && verifyToken === whatsappConfig.verifyToken) {
    logger.info('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }

  logger.warn('WhatsApp webhook verification failed', { mode, verifyToken });
  return res.status(403).json({ error: 'Verification failed' });
});

app.post(whatsappConfig.webhookPath, async (req, res) => {
  try {
    const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];

      for (const change of changes) {
        const messages = Array.isArray(change?.value?.messages)
          ? change.value.messages
          : [];

        for (const message of messages) {
          const from = message?.from || message?.wa_id;
          const text = message?.text?.body || '';
          const timestamp = message?.timestamp
            ? new Date(Number(message.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          if (!from || !text) {
            continue;
          }

          if (!isNumberAuthorized(from)) {
            logger.warn('Blocked unauthorized incoming WhatsApp message', { from });
            continue;
          }

          io.emit('chat:incoming', { from, text, ts: timestamp });

          const trimmed = text.trim();
          if (!trimmed.startsWith('/')) {
            continue;
          }

          const command = trimmed.split(/\s+/)[0].toLowerCase();
          const params = trimmed.split(/\s+/).slice(1);

          let responseMessage = '';

          if (command === '/ping') {
            responseMessage = 'pong ✅';
          } else if (command === '/help' || command === '/ajuda') {
            responseMessage =
              '📋 Comandos disponíveis:\n/ping – teste de conectividade\n/help – mostra esta ajuda\n/empresas count – total de empresas sincronizadas';
          } else if (command === '/empresas' && params[0]?.toLowerCase() === 'count') {
            const db = getDatabase();
            const total = await db.models.Empresa.count();
            responseMessage = `🏢 Total de empresas cadastradas: ${total}`;
          } else {
            responseMessage = '❓ Comando não reconhecido. Envie /help para ver as opções.';
          }

          try {
            await sendWhatsAppMessage({ to: from, type: 'text', text: responseMessage });
          } catch (error) {
            logger.error('Failed to send WhatsApp command response', {
              to: from,
              error: error.message,
            });
          }
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    logger.error('Failed to process WhatsApp webhook', { error: error.message });
    await logSystemEvent({
      level: 'error',
      category: 'whatsapp',
      message: 'Erro ao processar webhook do WhatsApp',
      details: { error: error.message },
    });
    emitAlert({
      source: 'whatsapp',
      message: 'Falha ao processar evento do WhatsApp',
      details: { error: error.message },
    });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

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
