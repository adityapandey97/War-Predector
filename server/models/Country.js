const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name:          { type: String, required: true, index: true },
  iso3:          { type: String, required: true, unique: true, uppercase: true, length: 3 },
  iso2:          { type: String, required: true, unique: true, uppercase: true, length: 2 },
  formalName:    String,
  region:        String,
  subRegion:     String,
  capital:       String,
  population:    Number,
  areaKm2:       Number,
  strategicTier: {
    type: String,
    enum: ['Global Power', 'Regional Power', 'Minor Power', 'Fragile State'],
    default: 'Minor Power',
  },
  lat: Number,
  lng: Number,
}, { timestamps: true });

countrySchema.index({ name: 'text', iso3: 1, iso2: 1 });

module.exports = mongoose.model('Country', countrySchema);
