import { Auth } from '../model/ApiModel';

/**
 * makeAuthController
 * Actions: login, signup, logout, updateProfile.
 * On success each method updates `patch` so views re-render.
 */
const makeAuthController = (patch) => ({
  async login(email, password) {
    const user = await Auth.login(email, password); // throws on error
    patch({ user });
    return user;
  },

  async signup(name, email, password) {
    const user = await Auth.signup(name, email, password);
    patch({ user });
    return user;
  },

  async logout() {
    Auth.logout();
    patch({ user: null, groups: [], expenses: {}, budgets: {}, settlements: {} });
  },

  async updateProfile(name) {
    const user = await Auth.updateProfile(name);
    patch({ user });
    return user;
  },
});

export default makeAuthController;
