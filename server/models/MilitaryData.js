const mongoose = require('mongoose');

const militaryDataSchema = new mongoose.Schema({
  country:             { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  iso3:                String,
  year:                { type: Number, required: true },
  defenseBudgetUsd:    Number,   // USD millions
  defenseBudgetGdpPct: Number,   // % of GDP
  activePersonnel:     Number,
  reservePersonnel:    Number,
  navalVessels:        Number,
  submarines:          Number,
  fighterAircraft:     Number,
  bombers:             Number,
  missileCapability:   Number,
  nuclearStatus:       { type: Boolean, default: false },
  nuclearWarheads:     { type: Number, default: 0 },
  armsImportsUsd:      Number,
  armsExportsUsd:      Number,
  mciScore:            Number,   // Military Capability Index 0–100
  forceReadinessScore: Number,
  offensivePostureRatio: Number,
  dataSource:          String,
}, { timestamps: true });

militaryDataSchema.index({ country: 1, year: -1 });

module.exports = mongoose.model('MilitaryData', militaryDataSchema);
