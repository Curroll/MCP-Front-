import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
    requestId: req.requestId
  });

  const response = {
    error: 'Internal Server Error',
    requestId: req.requestId
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.message;
    response.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(response);
};

export const notFound = (req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    requestId: req.requestId
  });
};