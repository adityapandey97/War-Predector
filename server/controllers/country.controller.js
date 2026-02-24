const Country   = require('../models/Country');
const RiskScore = require('../models/RiskScore');
const MilitaryData = require('../models/MilitaryData');
const { EconomicData, PoliticalData, AllianceData, CyberData, HistoricalConflict } = require('../models/DataModels');

const findCountry = (iso) =>
  Country.findOne({ $or: [{ iso3: iso.toUpperCase() }, { iso2: iso.toUpperCase() }] });

const latestRisk = (countryId) =>
  RiskScore.findOne({ country: countryId }).sort({ year: -1, month: -1 });

// GET /api/countries
exports.listCountries = async (req, res, next) => {
  try {
    const { region, tier, riskTier } = req.query;

    // Get all countries
    const filter = {};
    if (region) filter.region = region;
    if (tier)   filter.strategicTier = tier;
    const countries = await Country.find(filter).lean();

    // Attach latest risk score to each
    const enriched = await Promise.all(countries.map(async (c) => {
      const risk = await RiskScore.findOne({ country: c._id, ...(riskTier ? { riskTier } : {}) })
        .sort({ year: -1, month: -1 }).lean();
      return { ...c, risk: risk || null };
    }));

    enriched.sort((a, b) =>
      (b.risk?.overallConflictProb || 0) - (a.risk?.overallConflictProb || 0)
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) { next(err); }
};

// GET /api/countries/search?q=india
exports.searchCountries = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ success: false, error: 'Query too short' });
    const countries = await Country.find({ $text: { $search: q } }).limit(10).lean();
    if (!countries.length) {
      const fallback = await Country.find({ name: { $regex: q, $options: 'i' } }).limit(10).lean();
      return res.json({ success: true, data: fallback });
    }
    res.json({ success: true, data: countries });
  } catch (err) { next(err); }
};

// GET /api/countries/:iso/profile
exports.getProfile = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });

    const [risk, military, economic, political, alliance, cyber] = await Promise.all([
      latestRisk(country._id),
      MilitaryData.findOne({ country: country._id }).sort({ year: -1 }).lean(),
      EconomicData.findOne({ country: country._id }).sort({ year: -1 }).lean(),
      PoliticalData.findOne({ country: country._id }).sort({ year: -1 }).lean(),
      AllianceData.findOne({ country: country._id }).sort({ year: -1 }).lean(),
      CyberData.findOne({ country: country._id }).sort({ year: -1 }).lean(),
    ]);

    res.json({ success: true, data: { country, risk, military, economic, political, alliance, cyber } });
  } catch (err) { next(err); }
};

// GET /api/countries/:iso/stability
exports.getStability = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    const risk = await latestRisk(country._id);
    if (!risk) return res.status(404).json({ success: false, error: 'No risk data' });

    const radarData = [
      { dimension: 'Military',  score: parseFloat((100 - risk.militaryRisk).toFixed(1)) },
      { dimension: 'Economic',  score: parseFloat((100 - risk.economicRisk).toFixed(1)) },
      { dimension: 'Political', score: parseFloat((100 - risk.politicalRisk).toFixed(1)) },
      { dimension: 'Alliance',  score: parseFloat((100 - risk.allianceRisk).toFixed(1)) },
      { dimension: 'Cyber',     score: parseFloat((100 - risk.cyberRisk).toFixed(1)) },
      { dimension: 'Social',    score: parseFloat((100 - risk.socialRisk).toFixed(1)) },
    ];

    res.json({ success: true, data: { ...risk.toObject(), radar: radarData } });
  } catch (err) { next(err); }
};

// GET /api/countries/:iso/history?years=10
exports.getHistory = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    const years = parseInt(req.query.years || 10);
    const fromYear = new Date().getFullYear() - years;

    const [riskTrend, militaryTrend, economicTrend] = await Promise.all([
      RiskScore.find({ country: country._id, year: { $gte: fromYear } }).sort({ year: 1 }).lean(),
      MilitaryData.find({ country: country._id, year: { $gte: fromYear } }).sort({ year: 1 }).lean(),
      EconomicData.find({ country: country._id, year: { $gte: fromYear } }).sort({ year: 1 }).lean(),
    ]);

    res.json({ success: true, data: { riskTrend, militaryTrend, economicTrend } });
  } catch (err) { next(err); }
};

exports.getMilitary = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    const data = await MilitaryData.find({ country: country._id }).sort({ year: -1 }).limit(5).lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getEconomic = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    const data = await EconomicData.find({ country: country._id }).sort({ year: -1 }).limit(5).lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getConflictHistory = async (req, res, next) => {
  try {
    const country = await findCountry(req.params.iso);
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    const data = await HistoricalConflict.find({ country: country._id }).sort({ startYear: -1 }).lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
