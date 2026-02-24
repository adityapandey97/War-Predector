/**
 * Trends Page
 */
const TrendsPage = (() => {
  let currentYears = 5;
  let initialized  = false;

  function init() {
    if (initialized) return;
    initialized = true;
    document.getElementById('trends-country')?.addEventListener('change', e => {
      if (e.target.value) load(e.target.value, currentYears);
    });
  }

  function setYears(btn, years) {
    currentYears = years;
    document.querySelectorAll('[data-years]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const iso = document.getElementById('trends-country')?.value;
    if (iso) load(iso, years);
  }

  async function load(iso, years) {
    const content = document.getElementById('trends-content');
    content.innerHTML = '<div class="loading">LOADING TREND DATA...</div>';
    try {
      const res = await API.getHistory(iso, years);
      const h   = res.data;
      renderTrends(iso, h, years);
    } catch (e) {
      content.innerHTML = `<div class="loading" style="color:var(--alert-red)">FAILED TO LOAD TRENDS</div>`;
    }
  }

  function renderTrends(iso, h, years) {
    const content = document.getElementById('trends-content');
    content.innerHTML = `
      <div class="card mb-4">
        <div class="card-inner">
          <div class="section-hdr"><span>CONFLICT RISK INDEX — ${iso} (${years}-YEAR)</span></div>
          <canvas id="trend-risk-chart" height="180"></canvas>
        </div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>MILITARY CAPABILITY TREND</span></div>
            <canvas id="trend-military-chart" height="180"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>ECONOMIC INDICATORS</span></div>
            <canvas id="trend-economic-chart" height="180"></canvas>
          </div>
        </div>
      </div>
    `;

    if (h?.riskTrend?.length) {
      const labels = h.riskTrend.map(r => r.year);
      Charts.area('trend-risk-chart', labels, [
        { label: 'Risk %',   data: h.riskTrend.map(r => r.overallConflictProb), borderColor: '#ff2244', backgroundColor: 'rgba(255,34,68,0.12)' },
        { label: 'Military', data: h.riskTrend.map(r => r.militaryRisk),        borderColor: '#ff8c00', backgroundColor: 'transparent', fill: false },
        { label: 'Economic', data: h.riskTrend.map(r => r.economicRisk),        borderColor: '#ffd700', backgroundColor: 'transparent', fill: false },
        { label: 'Political',data: h.riskTrend.map(r => r.politicalRisk),       borderColor: '#c9a227', backgroundColor: 'transparent', fill: false },
      ]);
    }

    if (h?.militaryTrend?.length) {
      const labels = h.militaryTrend.map(r => r.year);
      Charts.line('trend-military-chart', labels, [
        { label: 'Defense % GDP', data: h.militaryTrend.map(r => r.defenseBudgetGdpPct), borderColor: '#00d4ff' },
        { label: 'MCI Score',     data: h.militaryTrend.map(r => r.mciScore),            borderColor: '#ff8c00' },
      ]);
    }

    if (h?.economicTrend?.length) {
      const labels = h.economicTrend.map(r => r.year);
      Charts.line('trend-economic-chart', labels, [
        { label: 'GDP Growth %',    data: h.economicTrend.map(r => r.gdpGrowthPct),        borderColor: '#00ff88' },
        { label: 'Inflation %',     data: h.economicTrend.map(r => r.inflationRate),        borderColor: '#ff8c00' },
        { label: 'Stress Index',    data: h.economicTrend.map(r => r.economicStressIndex),  borderColor: '#ff2244' },
      ]);
    }
  }

  return { init, setYears };
})();


/**
 * Insights / Simulation Page
 */
const InsightsPage = (() => {
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    loadAlerts();
  }

  async function runSimulation() {
    const iso = document.getElementById('sim-country')?.value;
    if (!iso) { alert('Please select a country first.'); return; }

    const overrides = {
      gdpChangePct:              parseFloat(document.getElementById('sim-gdp')?.value || 0),
      militaryBudgetChangePct:   parseFloat(document.getElementById('sim-mil')?.value || 0),
      politicalStabilityChange:  parseFloat(document.getElementById('sim-pol')?.value || 0),
      allianceChange:            parseFloat(document.getElementById('sim-ali')?.value || 0),
    };

    const resultsEl = document.getElementById('sim-results');
    resultsEl.innerHTML = '<div class="card"><div class="card-inner"><div class="loading blink">COMPUTING SIMULATION...</div></div></div>';

    try {
      const res   = await API.simulate({ iso, overrides });
      const { baseline, simulated, delta } = res.data;
      const color = delta > 0 ? 'var(--alert-red)' : delta < 0 ? 'var(--radar-green)' : 'var(--text-secondary)';
      const msg   = delta > 15 ? 'SIGNIFICANT RISK ESCALATION'
                  : delta > 0  ? 'MODERATE RISK INCREASE'
                  : delta < -10 ? 'SIGNIFICANT RISK REDUCTION'
                  : delta < 0  ? 'MODERATE RISK DECREASE'
                  : 'NO SIGNIFICANT CHANGE';

      resultsEl.innerHTML = `
        <div class="space-y-4">
          <div class="card" style="text-align:center">
            <div class="card-inner">
              <div class="metric-label">RISK CHANGE</div>
              <div style="font-family:var(--font-mono);font-size:2.5rem;font-weight:700;color:${color};margin:8px 0">
                ${delta > 0 ? '+' : ''}${delta.toFixed(2)}%
              </div>
              <div style="font-family:var(--font-mono);font-size:.6rem;color:var(--text-secondary);letter-spacing:.1em">${msg}</div>
            </div>
          </div>
          <div class="grid-2">
            <div class="card">
              <div class="card-inner">
                <div class="metric-label">BASELINE RISK</div>
                <div style="font-family:var(--font-mono);font-size:1.5rem;font-weight:700;color:var(--text-secondary);margin:6px 0">
                  ${baseline.overallConflictProb.toFixed(1)}%
                </div>
                <span class="${Utils.badgeClass(baseline.riskTier)}">${baseline.riskTier}</span>
              </div>
            </div>
            <div class="card" style="border-color:rgba(0,212,255,.3)">
              <div class="card-inner">
                <div class="metric-label">SIMULATED RISK</div>
                <div style="font-family:var(--font-mono);font-size:1.5rem;font-weight:700;color:${color};margin:6px 0">
                  ${simulated.overallConflictProb.toFixed(1)}%
                </div>
                <span class="${Utils.badgeClass(simulated.riskTier)}">${simulated.riskTier}</span>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-inner">
              <div class="metric-label mb-4">AI ASSESSMENT</div>
              <div style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-secondary);line-height:1.6">
                ${simulated.explanation}
              </div>
              ${delta > 15 ? `
                <div style="margin-top:10px;padding:8px 12px;background:rgba(255,34,68,.1);border:1px solid rgba(255,34,68,.2);border-radius:3px;display:flex;align-items:center;gap:8px">
                  <span class="blink" style="color:var(--alert-red)">⚠</span>
                  <span style="font-family:var(--font-mono);font-size:.6rem;color:var(--alert-red)">EARLY WARNING THRESHOLD EXCEEDED — ESCALATION PROBABLE</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      resultsEl.innerHTML = `<div class="card"><div class="card-inner"><div class="loading" style="color:var(--alert-red)">SIMULATION FAILED: ${e.message}</div></div></div>`;
    }
  }

  async function loadAlerts() {
    try {
      const res  = await API.getHighAlert();
      const data = (res?.data || []).slice(0, 6);
      const el   = document.getElementById('insights-alerts');
      if (!el) return;
      el.innerHTML = data.map(d => {
        const c = d.country || d.countryData || {};
        const tier = d.riskTier;
        const color = Utils.getRiskColor(tier);
        return `
          <div class="alert-row" style="background:${color}0c;border:1px solid ${color}22;margin-bottom:6px">
            <div class="alert-left">
              <span class="dot-blink" style="background:${color};width:6px;height:6px;border-radius:50%;flex-shrink:0"></span>
              <div style="font-family:var(--font-display);font-size:.85rem;font-weight:600">${c.name || d.iso3}</div>
            </div>
            <div class="alert-right">
              <span class="alert-risk-val" style="color:${color}">${d.overallConflictProb?.toFixed(1)}%</span>
              <span class="${Utils.badgeClass(tier)}">${tier}</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {}
  }

  return { init, runSimulation };
})();


/**
 * Alerts Page
 */
const AlertsPage = (() => {
  let initialized = false;

  async function init() {
    if (initialized) return;
    initialized = true;
    load();
  }

  async function load() {
    const content = document.getElementById('alerts-content');
    content.innerHTML = '<div class="loading">LOADING ALERTS...</div>';

    try {
      const [alertsRes, statsRes] = await Promise.all([
        API.getAlerts(60),
        API.getAlertStats(),
      ]);

      const alerts = alertsRes?.data || [];
      const critical = alerts.filter(a => a.riskTier === 'Critical');
      const high     = alerts.filter(a => a.riskTier === 'High');

      content.innerHTML = `
        ${critical.length ? `
          <div class="card card-red mb-4">
            <div class="card-inner">
              <div class="section-hdr">
                <span class="blink" style="color:var(--alert-red);font-size:1rem">⚠</span>
                <span style="color:var(--alert-red)">CRITICAL RISK ALERTS</span>
                <span class="badge badge-critical">${critical.length} COUNTRIES</span>
              </div>
              <div class="space-y-4">
                ${critical.map(a => alertRowHTML(a, 'critical')).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        ${high.length ? `
          <div class="card card-orange mb-4">
            <div class="card-inner">
              <div class="section-hdr"><span style="color:var(--alert-orange)">◈ HIGH RISK MONITORING</span></div>
              <div class="space-y-4">
                ${high.map(a => alertRowHTML(a, 'high')).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>ALERT CONFIGURATION</span></div>
            <p style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">
              Alerts are triggered automatically when any country's conflict probability exceeds 60%.
              Critical alerts fire above 80%. Configure email notifications in settings.
            </p>
            <div style="padding:10px;background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.1);border-radius:3px;font-family:var(--font-mono);font-size:.6rem;color:var(--text-muted)">
              ◈ ALERT SUBSCRIPTION MANAGEMENT — CONFIGURE IN SETTINGS
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      content.innerHTML = `<div class="loading" style="color:var(--alert-red)">FAILED TO LOAD ALERTS</div>`;
    }
  }

  function alertRowHTML(a, type) {
    const c = a.countryData || a.country || {};
    const color = type === 'critical' ? 'var(--alert-red)' : 'var(--alert-orange)';
    const pct   = a.overallConflictProb || 0;
    return `
      <div class="alert-row alert-row-${type}">
        <div class="alert-left">
          <span style="font-size:1.4rem">${Utils.getFlagEmoji(c.iso2)}</span>
          <div>
            <div style="font-family:var(--font-display);font-size:.9rem;font-weight:600">${c.name || a.iso3}</div>
            <div style="font-family:var(--font-mono);font-size:.55rem;color:var(--text-muted)">${c.region || ''}</div>
          </div>
        </div>
        <div class="alert-right">
          <div style="width:100px">
            <div class="risk-bar-wrap" style="margin-top:0">
              <div class="risk-bar" style="${Utils.riskBarStyle(pct, a.riskTier)}"></div>
            </div>
          </div>
          <span class="alert-risk-val" style="color:${color}">${pct.toFixed(1)}%</span>
          <span class="${Utils.badgeClass(a.riskTier)}">${a.riskTier}</span>
        </div>
      </div>
    `;
  }

  return { init };
})();


/**
 * Login Page handler
 */
if (document.getElementById('login-form')) {
  Auth.redirectIfLoggedIn();
}
