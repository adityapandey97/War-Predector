const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  country:    { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:       { type: String, required: true },
  year:       { type: Number, required: true },
  month:      { type: Number, default: 1 },

  // Component risk scores (0–100)
  militaryRisk:  { type: Number, default: 50 },
  economicRisk:  { type: Number, default: 50 },
  politicalRisk: { type: Number, default: 50 },
  allianceRisk:  { type: Number, default: 50 },
  cyberRisk:     { type: Number, default: 50 },
  socialRisk:    { type: Number, default: 50 },

  // Composite
  overallConflictProb: { type: Number, default: 50 },
  riskTier: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Moderate',
  },

  // ML outputs
  shapValues:         { type: Map, of: Number },
  confidenceInterval: { type: Number, default: 5 },
  explanation:        String,
  modelVersion:       { type: String, default: 'rule_based_v1.0' },

  computedAt: { type: Date, default: Date.now },
}, { timestamps: true });

riskScoreSchema.index({ country: 1, year: -1, month: -1 });
riskScoreSchema.index({ iso3: 1, year: -1 });
riskScoreSchema.index({ riskTier: 1, overallConflictProb: -1 });

module.exports = mongoose.model('RiskScore', riskScoreSchema);
