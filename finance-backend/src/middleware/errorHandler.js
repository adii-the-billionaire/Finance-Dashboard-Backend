import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
  }

  if (err?.name === 'ZodError' || err?.issues) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues || err.errors,
    });
  }

  if (err?.name === 'CastError' || err?.name === 'MongoServerError') {
    return res.status(400).json({ error: 'Database error', message: err.message });
  }

  console.error(err);
  const message = env.nodeEnv === 'development' ? err.message : 'Internal server error';
  return res.status(500).json({ error: 'Internal server error', message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}
