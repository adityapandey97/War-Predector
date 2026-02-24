const router    = require('express').Router();
const { cacheMiddleware } = require('../middleware/cache.middleware');
const RiskScore = require('../models/RiskScore');

// GET /api/alerts?threshold=60
router.get('/', cacheMiddleware(60), async (req, res, next) => {
  try {
    const threshold = parseFloat(req.query.threshold || 60);

    const pipeline = [
      { $sort: { year: -1, month: -1 } },
      { $group: { _id: '$country', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
      { $match: { overallConflictProb: { $gte: threshold } } },
      { $sort: { overallConflictProb: -1 } },
      { $lookup: { from: 'countries', localField: 'country', foreignField: '_id', as: 'countryData' } },
      { $unwind: '$countryData' },
    ];

    const alerts = await RiskScore.aggregate(pipeline);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) { next(err); }
});

// GET /api/alerts/stats
router.get('/stats', cacheMiddleware(120), async (req, res, next) => {
  try {
    const pipeline = [
      { $sort: { year: -1 } },
      { $group: { _id: '$country', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
      { $group: {
        _id: '$riskTier',
        count: { $sum: 1 },
        avgRisk: { $avg: '$overallConflictProb' },
      }},
    ];
    const stats = await RiskScore.aggregate(pipeline);
    const total = await RiskScore.distinct('country').then(a => a.length);
    res.json({ success: true, data: { byTier: stats, totalMonitored: total } });
  } catch (err) { next(err); }
});

module.exports = router;
