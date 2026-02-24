const router    = require('express').Router();
const { cacheMiddleware } = require('../middleware/cache.middleware');
const Country      = require('../models/Country');
const RiskScore    = require('../models/RiskScore');
const MilitaryData = require('../models/MilitaryData');
const { EconomicData } = require('../models/DataModels');

// GET /api/compare?countries=IND,CHN,PAK
router.get('/', cacheMiddleware(120), async (req, res, next) => {
  try {
    const isos = (req.query.countries || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    if (isos.length < 2) {
      return res.status(400).json({ success: false, error: 'Provide at least 2 ISO codes' });
    }

    const results = await Promise.all(isos.map(async (iso) => {
      const c = await Country.findOne({ $or: [{ iso3: iso }, { iso2: iso }] }).lean();
      if (!c) return null;
      const risk = await RiskScore.findOne({ country: c._id }).sort({ year: -1 }).lean();
      const mil  = await MilitaryData.findOne({ country: c._id }).sort({ year: -1 }).lean();
      const eco  = await EconomicData.findOne({ country: c._id }).sort({ year: -1 }).lean();
      return { country: c, risk, military: mil, economic: eco };
    }));

    res.json({ success: true, data: results.filter(Boolean) });
  } catch (err) { next(err); }
});

module.exports = router;
