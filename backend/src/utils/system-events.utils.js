import logger from './logger.utils.js';
import { getDatabase } from '../database/connection.js';
import { getSocketServer } from '../websocket/io.js';

export async function logSystemEvent({ level = 'info', category, message, details }) {
  try {
    const db = getDatabase();
    const { SystemLog } = db.models || {};
    if (!SystemLog) {
      return;
    }

    await SystemLog.create({
      nivel: level,
      categoria: category,
      mensagem: message,
      detalhes: details ? JSON.stringify(details).slice(0, 65000) : null,
    });
  } catch (error) {
    logger.error('Failed to write system log', { error: error.message });
  }
}

export function emitAlert({ level = 'error', source, message, details }) {
  try {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.emit('alerts:new', {
      level,
      source,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to emit alert', { error: error.message });
  }
}
