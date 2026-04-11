const Group = require('../models/Group');
const User  = require('../models/User');

/* ── Helpers ── */
const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const populateGroup = (query) =>
  query.populate('owner', 'name email').populate('members', 'name email');

/**
 * @route  POST /api/groups
 * @access Private
 */
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Group name is required' });

    // Generate a unique invite code (retry on collision)
    let inviteCode, exists = true;
    while (exists) {
      inviteCode = genCode();
      exists = await Group.exists({ inviteCode });
    }

    const group = await Group.create({
      name:       name.trim(),
      owner:      req.user._id,
      members:    [req.user._id],
      inviteCode,
    });

    const populated = await populateGroup(Group.findById(group._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  GET /api/groups
 * @access Private — returns groups the current user belongs to
 */
const getMyGroups = async (req, res) => {
  try {
    const groups = await populateGroup(
      Group.find({ members: req.user._id }).sort({ createdAt: -1 })
    );
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  GET /api/groups/:id
 * @access Private — must be a member
 */
const getGroup = async (req, res) => {
  try {
    const group = await populateGroup(Group.findById(req.params.id));
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  POST /api/groups/join
 * @access Private — join by invite code
 */
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode?.trim()) return res.status(400).json({ message: 'Invite code is required' });

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!group) return res.status(404).json({ message: 'Group not found — check the code' });

    const alreadyMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!alreadyMember) {
      group.members.push(req.user._id);
      await group.save();
    }

    const populated = await populateGroup(Group.findById(group._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  PUT /api/groups/:id
 * @access Private — owner only
 */
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can rename the group' });
    }
    if (!req.body.name?.trim()) return res.status(400).json({ message: 'Name is required' });

    group.name = req.body.name.trim();
    await group.save();

    const populated = await populateGroup(Group.findById(group._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route  DELETE /api/groups/:id/leave
 * @access Private — any member
 */
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const uid = req.user._id.toString();
    group.members = group.members.filter(m => m.toString() !== uid);

    if (group.members.length === 0) {
      await group.deleteOne();
      return res.json({ message: 'Group deleted — you were the last member' });
    }

    // Transfer ownership if owner left
    if (group.owner.toString() === uid) {
      group.owner = group.members[0];
    }

    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createGroup, getMyGroups, getGroup, joinGroup, updateGroup, leaveGroup };
