const router = require('express').Router();
const { cacheMiddleware } = require('../middleware/cache.middleware');
const ctrl = require('../controllers/country.controller');

// All open — no auth required
router.get('/',                      cacheMiddleware(120),  ctrl.listCountries);
router.get('/search',                                       ctrl.searchCountries);
router.get('/:iso/profile',          cacheMiddleware(300),  ctrl.getProfile);
router.get('/:iso/stability',        cacheMiddleware(120),  ctrl.getStability);
router.get('/:iso/history',          cacheMiddleware(600),  ctrl.getHistory);
router.get('/:iso/military',         cacheMiddleware(600),  ctrl.getMilitary);
router.get('/:iso/economic',         cacheMiddleware(600),  ctrl.getEconomic);
router.get('/:iso/conflict-history', cacheMiddleware(3600), ctrl.getConflictHistory);

module.exports = router;
