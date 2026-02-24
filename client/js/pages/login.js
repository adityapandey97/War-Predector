'use strict';

/* ── Tab switcher ─────────────────────────────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab + '-btn').classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');

  // Clear messages when switching
  ['login-error', 'register-error', 'register-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.textContent = ''; }
  });
}

/* ── Init on DOM ready ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // If already logged in → go to dashboard
  if (Auth.isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return;
  }

  /* ── LOGIN FORM ─────────────────────────────────────────────────────── */
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    const btn      = document.getElementById('login-btn');

    errEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'AUTHENTICATING...';

    try {
      const res = await API.login(email, password);
      // Store minimal session (no JWT needed, just user info)
      Auth.setSession(res.user);
      window.location.href = '/dashboard.html';
    } catch (err) {
      errEl.textContent = '⚠ ' + (err.message || 'Invalid email or password');
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'AUTHORIZE ACCESS';
    }
  });

  /* ── REGISTER FORM ──────────────────────────────────────────────────── */
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName  = document.getElementById('reg-name').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const password  = document.getElementById('reg-password').value;
    const confirm   = document.getElementById('reg-confirm').value;
    const errEl     = document.getElementById('register-error');
    const successEl = document.getElementById('register-success');
    const btn       = document.getElementById('register-btn');

    errEl.style.display     = 'none';
    successEl.style.display = 'none';

    // Client-side validation
    if (password !== confirm) {
      errEl.textContent = '⚠ Passwords do not match';
      errEl.style.display = 'block';
      return;
    }
    if (password.length < 8) {
      errEl.textContent = '⚠ Password must be at least 8 characters';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'CREATING ACCOUNT...';

    try {
      await API.register({ fullName, email, password });

      // Show success and switch to login after 1.5s
      successEl.textContent = '✓ Account created! Redirecting to login...';
      successEl.style.display = 'block';

      // Pre-fill login email
      document.getElementById('login-email').value = email;

      setTimeout(() => switchTab('login'), 1500);
    } catch (err) {
      errEl.textContent = '⚠ ' + (err.message || 'Registration failed. Try again.');
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'CREATE ACCOUNT';
    }
  });
});
