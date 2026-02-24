const router = require('express').Router();
const Joi    = require('joi');
const User   = require('../models/User');

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const schema = Joi.object({
      fullName: Joi.string().min(2).max(80).required(),
      email:    Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const exists = await User.findOne({ email: value.email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email is already registered' });
    }

    const user = await User.create(value);
    res.status(201).json({ success: true, user: user.toSafeObject() });

  } catch (err) { next(err); }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const schema = Joi.object({
      email:    Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const user = await User.findOne({ email: value.email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(value.password))) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password' });
    }

    res.json({ success: true, user: user.toSafeObject() });

  } catch (err) { next(err); }
});

module.exports = router;
