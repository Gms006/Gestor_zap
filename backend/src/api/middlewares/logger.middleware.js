import logger from '../../utils/logger.utils.js';

export default function loggerMiddleware(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    logger.info('HTTP request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
    });
  });

  next();
}
