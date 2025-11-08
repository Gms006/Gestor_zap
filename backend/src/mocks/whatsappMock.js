import { Router } from 'express';

const messages = [];

const router = Router();

router.get('/api/whatsapp/status', (req, res) => {
  const now = new Date().toISOString();
  return res.json({
    connected: true,
    instance: 'mock-instance',
    mock: true,
    last_sync: now,
  });
});

router.post('/api/whatsapp/send', (req, res) => {
  const { to, text, mediaUrl = null } = req.body || {};

  if (!to || !text) {
    return res.status(400).json({ error: 'Campos "to" e "text" são obrigatórios no mock.' });
  }

  const createdAt = new Date().toISOString();
  const id = `mock-${String(messages.length + 1).padStart(6, '0')}`;

  const record = {
    id,
    to,
    text,
    mediaUrl,
    created_at: createdAt,
  };

  messages.push(record);

  return res.json({
    ok: true,
    id,
    echo: { to, text, mediaUrl },
    created_at: createdAt,
  });
});

router.get('/api/whatsapp/messages', (req, res) => {
  return res.json({
    mock: true,
    total: messages.length,
    messages,
  });
});

router.get('/api/whatsapp/qr', (req, res) => {
  return res.json({
    qr: 'MOCK-QR-NOT-REQUIRED',
    expires_in: 300,
    mock: true,
  });
});

export default router;
