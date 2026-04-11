const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createGroup, getMyGroups, getGroup,
  joinGroup, updateGroup, leaveGroup,
} = require('../controllers/groupController');

const router = express.Router();

// All group routes require authentication
router.use(protect);

router.route('/')
  .get(getMyGroups)   // GET  /api/groups
  .post(createGroup); // POST /api/groups

router.post('/join', joinGroup); // POST /api/groups/join

router.route('/:id')
  .get(getGroup)      // GET  /api/groups/:id
  .put(updateGroup);  // PUT  /api/groups/:id

router.delete('/:id/leave', leaveGroup); // DELETE /api/groups/:id/leave

module.exports = router;
