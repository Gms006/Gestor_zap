import { Router } from 'express';
import whatsappConfig from '../../config/whatsapp.config.js';
import { sendWhatsAppMessage } from '../../services/whatsapp.service.js';
import { isAuthorizationEnabled, isNumberAuthorized, normalizePhone } from '../../utils/authorized-numbers.utils.js';
import logger from '../../utils/logger.utils.js';

const router = Router();

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateE164(number) {
  return /^\+?[1-9]\d{7,14}$/.test(number);
}

function ensureAuthorized(req, res, next) {
  try {
    if (!isAuthorizationEnabled()) {
      return next();
    }

    const to = normalizePhone(req.body?.to);
    if (!isNumberAuthorized(to)) {
      logger.warn('Attempt to send WhatsApp message to unauthorized number', { to });
      return next(createHttpError(403, 'Número não autorizado para envio.'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

router.post('/send', ensureAuthorized, async (req, res, next) => {
  try {
    const { to, text } = req.body || {};

    if (!to || !text) {
      throw createHttpError(400, 'Parâmetros "to" e "text" são obrigatórios.');
    }

    if (!validateE164(to)) {
      throw createHttpError(400, 'Número de destino deve estar no formato E.164.');
    }

    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      throw createHttpError(400, 'Credenciais do WhatsApp não configuradas.');
    }

    const result = await sendWhatsAppMessage({ to, type: 'text', text });

    return res.json({ status: 'sent', id: result?.id || null });
  } catch (error) {
    return next(error);
  }
});

export default router;
