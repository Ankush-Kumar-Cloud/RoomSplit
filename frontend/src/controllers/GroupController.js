import { Groups } from '../model/ApiModel';

/**
 * makeGroupController
 * All methods call the REST API and update global state.
 */
const makeGroupController = (state, patch) => ({
  async loadAll() {
    const groups = await Groups.getAll();
    patch({ groups });
    return groups;
  },

  async create(name) {
    const group   = await Groups.create(name);
    patch({ groups: [group, ...state.groups] });
    return group;
  },

  async join(inviteCode) {
    const group    = await Groups.join(inviteCode);
    const existing = state.groups.find(g => g._id === group._id);
    if (!existing) patch({ groups: [group, ...state.groups] });
    return group;
  },

  async rename(groupId, name) {
    const updated = await Groups.update(groupId, name);
    patch({ groups: state.groups.map(g => g._id === groupId ? updated : g) });
    return updated;
  },

  async leave(groupId) {
    await Groups.leave(groupId);
    patch({ groups: state.groups.filter(g => g._id !== groupId) });
  },

  /** Return member array for a group (already populated from API) */
  membersOf(groupId) {
    const group = state.groups.find(g => g._id === groupId);
    return group?.members || [];
  },
});

export default makeGroupController;
