const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (ttl = 300) => (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = cache.get(key);
  if (cached) return res.json(cached);

  const origJson = res.json.bind(res);
  res.json = (body) => {
    cache.set(key, body, ttl);
    return origJson(body);
  };
  next();
};

module.exports = { cacheMiddleware };
