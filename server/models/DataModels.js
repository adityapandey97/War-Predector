const mongoose = require('mongoose');

// ── Economic Data ─────────────────────────────────────────────────────────────
const economicDataSchema = new mongoose.Schema({
  country:           { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:              String,
  year:              { type: Number, required: true },
  gdpUsd:            Number,
  gdpGrowthPct:      Number,
  gdpPerCapita:      Number,
  inflationRate:     Number,
  debtGdpRatio:      Number,
  forexReservesUsd:  Number,
  tradeBalanceUsd:   Number,
  tradeDependencyRatio: Number,
  stockVolatilityIdx:  Number,
  sanctionsExposure:   Number,
  energyDependencyPct: Number,
  economicStressIndex: Number,
  crisisVulnerability: Number,
  resourceSecurityScore: Number,
  dataSource: String,
}, { timestamps: true });
economicDataSchema.index({ country: 1, year: -1 });

// ── Political Data ────────────────────────────────────────────────────────────
const politicalDataSchema = new mongoose.Schema({
  country:              { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:                 String,
  year:                 { type: Number, required: true },
  regimeType:           { type: String, enum: ['Democracy', 'Anocracy', 'Autocracy', 'Failed State'] },
  polityScore:          Number,
  corruptionIndex:      Number,
  politicalStabilityIdx: Number,
  protestFrequency:     Number,
  coupProbability:      Number,
  leadershipTenureYrs:  Number,
  electionRiskScore:    Number,
  governanceRiskScore:  Number,
  internalConflictProb: Number,
  dataSource:           String,
}, { timestamps: true });
politicalDataSchema.index({ country: 1, year: -1 });

// ── Alliance Data ─────────────────────────────────────────────────────────────
const allianceDataSchema = new mongoose.Schema({
  country:              { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:                 String,
  year:                 { type: Number, required: true },
  alliances:            [String],
  defenseTreaties:      Number,
  strategicRivalries:   Number,
  activeBorderDisputes: Number,
  neighborAvgMilitary:  Number,
  diplomaticTensionIdx: Number,
  allianceShieldIndex:  Number,
  isolationRiskScore:   Number,
  borderTensionHeat:    Number,
  dataSource:           String,
}, { timestamps: true });
allianceDataSchema.index({ country: 1, year: -1 });

// ── Cyber Data ────────────────────────────────────────────────────────────────
const cyberDataSchema = new mongoose.Schema({
  country:                 { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:                    String,
  year:                    { type: Number, required: true },
  cyberPowerRank:          Number,
  aiMilitaryInvestmentUsd: Number,
  satellitesCount:         Number,
  spaceCommand:            Boolean,
  infraResilienceScore:    Number,
  cyberAttacksFreq:        Number,
  cyberDominanceIndex:     Number,
  infraVulnerabilityScore: Number,
  dataSource:              String,
}, { timestamps: true });
cyberDataSchema.index({ country: 1, year: -1 });

// ── Historical Conflict ───────────────────────────────────────────────────────
const historicalConflictSchema = new mongoose.Schema({
  country:      { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:         String,
  conflictName: String,
  startYear:    Number,
  endYear:      Number,
  conflictType: String,
  battleDeaths: Number,
  role:         String,
  outcome:      String,
  dataSource:   String,
}, { timestamps: true });
historicalConflictSchema.index({ country: 1, startYear: -1 });

module.exports = {
  EconomicData:       mongoose.model('EconomicData',      economicDataSchema),
  PoliticalData:      mongoose.model('PoliticalData',     politicalDataSchema),
  AllianceData:       mongoose.model('AllianceData',      allianceDataSchema),
  CyberData:          mongoose.model('CyberData',         cyberDataSchema),
  HistoricalConflict: mongoose.model('HistoricalConflict', historicalConflictSchema),
};
