/**
 * Sidebar navigation — no JWT, uses sessionStorage session only
 */
const Sidebar = {
  collapsed: false,

  init() {
    // Session guard — redirect to login if not logged in
    Auth.requireAuth();

    // Show logged-in user name & role
    const user = Auth.getUser();
    if (user) {
      const nameEl = document.getElementById('user-name');
      const roleEl = document.getElementById('user-role');
      if (nameEl) nameEl.textContent = user.fullName || user.email;
      if (roleEl) roleEl.textContent = `${(user.role || 'ANALYST').toUpperCase()} CLEARANCE`;
    }

    // Live UTC clock
    const tick = () => {
      const t = new Date().toUTCString().replace('GMT', 'UTC');
      const st = document.getElementById('status-time');
      const tt = document.getElementById('topbar-time');
      if (st) st.textContent = t;
      if (tt) tt.textContent = t;
    };
    tick();
    setInterval(tick, 1000);

    // Nav item clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.page));
    });

    // Sidebar toggle collapse
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggle());

    // Load high-alert count for topbar
    this.loadAlertCount();
  },

  navigate(pageId) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`)?.classList.add('active');

    // Trigger each page's init once
    const inits = {
      global:   () => DashboardPage.init(),
      country:  () => CountryPage.init(),
      compare:  () => ComparePage.init(),
      trends:   () => TrendsPage.init(),
      insights: () => InsightsPage.init(),
      alerts:   () => AlertsPage.init(),
    };
    if (inits[pageId]) inits[pageId]();
  },

  toggle() {
    this.collapsed = !this.collapsed;
    document.getElementById('sidebar')?.classList.toggle('collapsed', this.collapsed);
    const btn = document.getElementById('sidebar-toggle');
    if (btn) btn.textContent = this.collapsed ? '»' : '«';
  },

  async loadAlertCount() {
    try {
      const data     = await API.getHighAlert();
      const critical = (data?.data || []).filter(d => d.riskTier === 'Critical').length;
      const el       = document.getElementById('critical-count');
      if (el) el.textContent = `${critical} CRITICAL`;
    } catch { /* silent fail */ }
  },
};

// Bootstrap on dashboard page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sidebar')) {
    Sidebar.init();
    DashboardPage.init();   // load global heatmap as default page
  }
});
