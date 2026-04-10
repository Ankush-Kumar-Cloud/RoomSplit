/**
 * AuthController
 * ─────────────────────────────────────────────────────────
 * Handles user registration, login, logout, and profile
 * updates. Receives (state, patch) from useAppState and
 * returns an action map consumed by the View layer.
 *
 * No React imports — controllers are plain JS factories.
 */

import DomainModel from '../model/DomainModel';

const makeAuthController = (state, patch) => ({
  /**
   * Login an existing user.
   * Throws a human-readable Error on failure.
   */
  async login(email, password) {
    const user = Object.values(state.users).find(
      u => u.email === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password');
    patch({ session: user.id });
    return user;
  },

  /**
   * Register a new user.
   * Throws on validation failures or duplicate email.
   */
  async signup(name, email, password) {
    if (!name.trim())    throw new Error('Name is required');
    if (!email.trim())   throw new Error('Email is required');
    if (!password)       throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const duplicate = Object.values(state.users).find(
      u => u.email === email.toLowerCase()
    );
    if (duplicate) throw new Error('Email already registered');

    const id   = DomainModel.genId();
    const user = {
      id,
      name:     name.trim(),
      email:    email.toLowerCase(),
      password,
      joinedAt: DomainModel.nowISO(),
    };

    patch({ users: { ...state.users, [id]: user }, session: id });
    return user;
  },

  /** Clear the session — effectively logs out. */
  async logout() {
    patch({ session: null });
  },

  /** Update the display name for a user. */
  async updateProfile(userId, { name }) {
    if (!name.trim()) throw new Error('Name cannot be empty');
    patch({
      users: {
        ...state.users,
        [userId]: { ...state.users[userId], name: name.trim() },
      },
    });
  },
});

export default makeAuthController;
