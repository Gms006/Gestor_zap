import logger from '../../utils/logger.utils.js';

export default function errorMiddleware(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
