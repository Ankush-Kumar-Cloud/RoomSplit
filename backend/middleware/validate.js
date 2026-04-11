const { validationResult } = require('express-validator');

/**
 * validate
 * ─────────────────────────────────────────────────────────
 * Middleware that runs after express-validator checks and
 * returns a 400 with all validation errors if any failed.
 * Use as the last item in a validator array:
 *
 *   router.post('/route', [check(…), validate], handler)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
