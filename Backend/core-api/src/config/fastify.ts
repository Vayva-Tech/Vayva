export const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(','),
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
};
