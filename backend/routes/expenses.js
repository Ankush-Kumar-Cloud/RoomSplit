const express  = require('express');
const { body } = require('express-validator');
const { protect }  = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { getBudgets, upsertBudget, getSettlements, toggleSettlement } = require('../controllers/budgetSettlementController');

const router = express.Router({ mergeParams: true }); // mergeParams gives access to :groupId

router.use(protect);

/* ── Expenses ── */
router.route('/expenses')
  .get(getExpenses)   // GET  /api/groups/:groupId/expenses
  .post(             // POST /api/groups/:groupId/expenses
    [
      body('item').trim().notEmpty().withMessage('Item name is required'),
      body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be > 0'),
      body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
      validate,
    ],
    createExpense
  );

router.route('/expenses/:expenseId')
  .put(updateExpense)    // PUT    /api/groups/:groupId/expenses/:expenseId
  .delete(deleteExpense); // DELETE /api/groups/:groupId/expenses/:expenseId

/* ── Budgets ── */
router.route('/budgets')
  .get(getBudgets)     // GET /api/groups/:groupId/budgets?month=YYYY-MM
  .put(upsertBudget);  // PUT /api/groups/:groupId/budgets

/* ── Settlements ── */
router.route('/settlements')
  .get(getSettlements); // GET /api/groups/:groupId/settlements?month=YYYY-MM

router.post('/settlements/toggle', toggleSettlement); // POST toggle paid status

module.exports = router;
