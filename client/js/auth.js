/**
 * GSS-CFS Session Helper — no JWT, no tokens
 * Stores logged-in user in sessionStorage only
 */
const Auth = {
  isLoggedIn() {
    return !!sessionStorage.getItem('gss_user');
  },

  getUser() {
    try { return JSON.parse(sessionStorage.getItem('gss_user') || 'null'); }
    catch { return null; }
  },

  setSession(user) {
    sessionStorage.setItem('gss_user', JSON.stringify(user));
  },

  logout() {
    sessionStorage.clear();
    window.location.href = '/index.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/index.html';
    }
  },

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = '/dashboard.html';
    }
  },
};
