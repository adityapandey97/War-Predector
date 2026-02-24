const router    = require('express').Router();
const { cacheMiddleware } = require('../middleware/cache.middleware');
const Country   = require('../models/Country');
const RiskScore = require('../models/RiskScore');
const { computeRisk, simulateScenario } = require('../utils/riskEngine');

// GET /api/risk/heatmap — all countries with latest risk
router.get('/heatmap', cacheMiddleware(60), async (req, res, next) => {
  try {
    const countries = await Country.find({}).lean();
    const result = await Promise.all(countries.map(async (c) => {
      const risk = await RiskScore.findOne({ country: c._id }).sort({ year: -1, month: -1 }).lean();
      return {
        name: c.name, iso3: c.iso3, iso2: c.iso2,
        region: c.region, strategicTier: c.strategicTier,
        lat: c.lat, lng: c.lng,
        overallConflictProb: risk?.overallConflictProb ?? null,
        riskTier:            risk?.riskTier            ?? null,
        militaryRisk:        risk?.militaryRisk        ?? null,
        economicRisk:        risk?.economicRisk        ?? null,
        politicalRisk:       risk?.politicalRisk       ?? null,
      };
    }));
    result.sort((a, b) => (b.overallConflictProb || 0) - (a.overallConflictProb || 0));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// GET /api/risk/high-alert — Critical + High countries
router.get('/high-alert', cacheMiddleware(60), async (req, res, next) => {
  try {
    const scores = await RiskScore
      .find({ riskTier: { $in: ['Critical', 'High'] } })
      .sort({ overallConflictProb: -1 })
      .populate('country', 'name iso3 iso2 region')
      .lean();

    // De-duplicate: one entry per country (latest score)
    const seen   = new Set();
    const unique = scores.filter(s => {
      const id = s.country?._id?.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.json({ success: true, count: unique.length, data: unique });
  } catch (err) { next(err); }
});

// POST /api/risk/simulate
router.post('/simulate', async (req, res, next) => {
  try {
    const { iso, overrides } = req.body;
    if (!iso) return res.status(400).json({ success: false, error: 'iso is required' });

    const country = await Country.findOne({
      $or: [{ iso3: iso.toUpperCase() }, { iso2: iso.toUpperCase() }],
    });
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });

    const latest = await RiskScore.findOne({ country: country._id }).sort({ year: -1 }).lean();
    if (!latest)  return res.status(404).json({ success: false, error: 'No risk data for this country' });

    const baseScores = {
      militaryRisk:  latest.militaryRisk,
      economicRisk:  latest.economicRisk,
      politicalRisk: latest.politicalRisk,
      allianceRisk:  latest.allianceRisk,
      cyberRisk:     latest.cyberRisk,
      socialRisk:    latest.socialRisk,
    };

    const baseline  = computeRisk(baseScores);
    const simulated = simulateScenario(baseScores, overrides || {});
    const delta     = parseFloat((simulated.overallConflictProb - baseline.overallConflictProb).toFixed(2));

    res.json({ success: true, data: { baseline, simulated, delta, scenario: overrides } });
  } catch (err) { next(err); }
});

module.exports = router;
