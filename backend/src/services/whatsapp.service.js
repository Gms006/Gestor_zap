import axios from 'axios';
import whatsappConfig from '../config/whatsapp.config.js';
import logger from '../utils/logger.utils.js';

const baseURL = 'https://graph.facebook.com/v17.0';

export async function sendWhatsAppMessage({ to, type = 'text', text }) {
  if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
    logger.warn('WhatsApp credentials not configured');
    return;
  }

  const url = `${baseURL}/${whatsappConfig.phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type,
    text: { body: text },
  };

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${whatsappConfig.accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export function verifyToken(token) {
  return token === whatsappConfig.verifyToken;
}
