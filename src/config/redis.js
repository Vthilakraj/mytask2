const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 5000,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
};

module.exports = { connection };
