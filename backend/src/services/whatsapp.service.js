import axios from 'axios';
import whatsappConfig from '../config/whatsapp.config.js';
import logger from '../utils/logger.utils.js';
import { emitAlert, logSystemEvent } from '../utils/system-events.utils.js';

const baseURL = 'https://graph.facebook.com/v17.0';

export async function sendWhatsAppMessage({ to, type = 'text', text }) {
  if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
    logger.warn('WhatsApp credentials not configured');
    const error = new Error('WhatsApp credentials not configured');
    error.status = 500;
    throw error;
  }

  const url = `${baseURL}/${whatsappConfig.phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type,
    text: { body: text },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const messageId = response?.data?.messages?.[0]?.id || null;
    logger.info('WhatsApp message sent', { to, messageId });

    return { id: messageId };
  } catch (error) {
    const status = error?.response?.status;
    const details = {
      status,
      to,
      error: error?.response?.data || error.message,
    };

    logger.error('WhatsApp API call failed', details);
    await logSystemEvent({
      level: 'error',
      category: 'whatsapp',
      message: 'Erro ao enviar mensagem via WhatsApp Cloud API',
      details,
    });

    if (status && status >= 400) {
      emitAlert({
        source: 'whatsapp',
        message: `Falha ao enviar mensagem pelo WhatsApp (status ${status})`,
        details,
      });
    }

    const httpError = new Error('WhatsApp API error');
    httpError.status = status || 502;
    throw httpError;
  }
}

export function verifyToken(token) {
  return token === whatsappConfig.verifyToken;
}
