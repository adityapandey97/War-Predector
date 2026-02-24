/**
 * Dashboard Page — Global Heatmap
 */
const DashboardPage = (() => {
  let allCountries = [];
  let initialized  = false;

  async function init() {
    if (initialized) return;
    initialized = true;
    await load();

    // Filters
    document.getElementById('global-search')?.addEventListener('input', render);
    document.getElementById('global-tier-filter')?.addEventListener('change', render);
    document.getElementById('global-region-filter')?.addEventListener('change', render);
    document.getElementById('global-sort')?.addEventListener('change', render);
  }

  async function load() {
    try {
      const res = await API.getCountries();
      allCountries = res?.data || [];
      updateStats();
      render();
      // Populate country selects in other pages
      Utils.populateCountrySelect('country-select', allCountries);
      Utils.populateCountrySelect('sim-country',    allCountries);
      Utils.populateCountrySelect('trends-country', allCountries);
    } catch (e) {
      document.getElementById('country-grid').innerHTML =
        '<div class="loading" style="color:var(--alert-red)">FAILED TO LOAD DATA. CHECK SERVER.</div>';
    }
  }

  function updateStats() {
    const critical = allCountries.filter(c => c.risk?.riskTier === 'Critical').length;
    const high     = allCountries.filter(c => c.risk?.riskTier === 'High').length;
    const moderate = allCountries.filter(c => c.risk?.riskTier === 'Moderate').length;
    const low      = allCountries.filter(c => c.risk?.riskTier === 'Low').length;
    const avg      = allCountries.reduce((s, c) => s + (c.risk?.overallConflictProb || 0), 0) / (allCountries.length || 1);

    document.getElementById('stat-critical').textContent = critical;
    document.getElementById('stat-high').textContent     = high;
    document.getElementById('stat-moderate').textContent = moderate;
    document.getElementById('stat-low').textContent      = low;
    document.getElementById('stat-avg').textContent      = avg.toFixed(1) + '%';
    document.getElementById('global-subtitle').textContent =
      `REAL-TIME CONFLICT RISK ASSESSMENT — ${allCountries.length} COUNTRIES MONITORED`;
  }

  function render() {
    const q      = (document.getElementById('global-search')?.value || '').toLowerCase();
    const tier   = document.getElementById('global-tier-filter')?.value || '';
    const region = document.getElementById('global-region-filter')?.value || '';
    const sort   = document.getElementById('global-sort')?.value || 'risk_desc';

    let items = [...allCountries];

    if (q) items = items.filter(c =>
      c.name.toLowerCase().includes(q) || c.iso3?.toLowerCase().includes(q)
    );
    if (tier)   items = items.filter(c => c.risk?.riskTier === tier);
    if (region) items = items.filter(c => c.region === region);

    switch (sort) {
      case 'risk_desc': items.sort((a, b) => (b.risk?.overallConflictProb || 0) - (a.risk?.overallConflictProb || 0)); break;
      case 'risk_asc':  items.sort((a, b) => (a.risk?.overallConflictProb || 0) - (b.risk?.overallConflictProb || 0)); break;
      case 'name':      items.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    const grid = document.getElementById('country-grid');
    if (!items.length) {
      grid.innerHTML = '<div class="loading" style="color:var(--text-muted)">NO COUNTRIES MATCH FILTER</div>';
      return;
    }
    grid.innerHTML = items.map((c, i) => Utils.countryCardHTML(c, i)).join('');

    // Click navigates to country page
    grid.querySelectorAll('.country-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        const iso = items[i].iso3;
        CountryPage.load(iso);
        Sidebar.navigate('country');
      });
    });
  }

  return { init, load };
})();
