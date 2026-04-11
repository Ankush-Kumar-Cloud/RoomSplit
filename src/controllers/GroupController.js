/**
 * GroupController
 * ─────────────────────────────────────────────────────────
 * CRUD for groups: create, join (by invite code), rename,
 * leave, and member lookups.
 *
 * Bound to a specific userId (the currently logged-in user).
 */

import DomainModel from '../model/DomainModel';

const makeGroupController = (state, patch, userId) => ({
  /** Create a new group owned by the current user. */
  async create(name) {
    if (!name.trim()) throw new Error('Enter a group name');

    const id = DomainModel.genId();
    const group = {
      id,
      name:       name.trim(),
      ownerId:    userId,
      members:    [userId],
      inviteCode: DomainModel.genCode(),
      createdAt:  DomainModel.nowISO(),
    };

    patch({ groups: { ...state.groups, [id]: group } });
    return group;
  },

  /** Join an existing group using its 6-character invite code. */
  async join(code) {
    const group = Object.values(state.groups).find(
      g => g.inviteCode === code.trim().toUpperCase()
    );
    if (!group) throw new Error('Group not found — check the code');

    // Already a member — silently succeed
    if (group.members.includes(userId)) return group;

    const updated = { ...group, members: [...group.members, userId] };
    patch({ groups: { ...state.groups, [group.id]: updated } });
    return updated;
  },

  /** Rename a group (owner only enforced in the view). */
  async rename(groupId, name) {
    if (!name.trim()) throw new Error('Enter a group name');
    patch({
      groups: {
        ...state.groups,
        [groupId]: { ...state.groups[groupId], name: name.trim() },
      },
    });
  },

  /** Remove the current user from a group. Deletes group if last member. */
  async leave(groupId) {
    const group = state.groups[groupId];
    if (!group) return;

    const members = group.members.filter(id => id !== userId);

    if (members.length === 0) {
      // Last member left — delete the group
      const { [groupId]: _, ...rest } = state.groups;
      patch({ groups: rest });
    } else {
      // Hand ownership to first remaining member if owner left
      const newOwner = group.ownerId === userId ? members[0] : group.ownerId;
      patch({
        groups: {
          ...state.groups,
          [groupId]: { ...group, members, ownerId: newOwner },
        },
      });
    }
  },

  /** All groups the current user belongs to. */
  myGroups: () =>
    Object.values(state.groups).filter(g => g.members.includes(userId)),

  /** Resolve member IDs in a group to User objects. */
  membersOf: (groupId) =>
    (state.groups[groupId]?.members || [])
      .map(id => state.users[id])
      .filter(Boolean),
});

export default makeGroupController;
