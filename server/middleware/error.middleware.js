const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
