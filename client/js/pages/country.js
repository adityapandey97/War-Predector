/**
 * Country Intelligence Dashboard Page
 */
const CountryPage = (() => {
  let currentIso = '';

  function init() {
    const sel = document.getElementById('country-select');
    if (sel) {
      sel.addEventListener('change', () => {
        if (sel.value) load(sel.value);
      });
    }
  }

  async function load(iso) {
    if (!iso) return;
    currentIso = iso;

    // Sync select
    const sel = document.getElementById('country-select');
    if (sel) sel.value = iso;

    // Navigate to country page if not active
    const page = document.getElementById('page-country');
    if (page && !page.classList.contains('active')) {
      Sidebar.navigate('country');
    }

    const content = document.getElementById('country-profile-content');
    content.innerHTML = '<div class="loading">LOADING INTELLIGENCE PROFILE...</div>';

    try {
      const [profileRes, stabilityRes, historyRes, conflictsRes] = await Promise.all([
        API.getProfile(iso),
        API.getStability(iso),
        API.getHistory(iso, 10),
        API.getConflicts(iso),
      ]);

      const p  = profileRes.data;
      const st = stabilityRes.data;
      const h  = historyRes.data;
      const cf = conflictsRes.data;

      renderProfile(p, st, h, cf);
    } catch (e) {
      content.innerHTML = `<div class="loading" style="color:var(--alert-red)">ERROR LOADING DATA: ${e.message}</div>`;
    }
  }

  function renderProfile(p, st, h, conflicts) {
    const { country, military: mil, economic: eco, political: pol, alliance: ali, cyber } = p;
    const pct   = st?.overallConflictProb || 0;
    const tier  = st?.riskTier || 'Unknown';
    const color = Utils.getRiskColor(tier);
    const flag  = Utils.getFlagEmoji(country.iso2);

    document.getElementById('country-profile-content').innerHTML = `
      <!-- Profile Header -->
      <div class="card country-profile-hdr mb-4">
        <div class="profile-top">
          <div class="profile-flag-name">
            <span class="profile-flag">${flag}</span>
            <div>
              <div class="profile-country-name">${country.name}</div>
              <div class="profile-meta">
                <span class="profile-meta-item">${country.region || ''}</span>
                <span class="profile-meta-item">·</span>
                <span class="profile-meta-item">${country.strategicTier || ''}</span>
                <span class="profile-meta-item">·</span>
                <span class="profile-meta-item">POP: ${Utils.formatPop(country.population)}</span>
              </div>
            </div>
          </div>
          <div class="profile-risk">
            <div class="profile-risk-label">CONFLICT RISK INDEX</div>
            <div class="profile-risk-val" style="color:${color}">${pct.toFixed(1)}<span style="font-size:1.5rem">%</span></div>
            <span class="${Utils.badgeClass(tier)} mt-2" style="display:inline-flex">● ${tier}</span>
          </div>
        </div>
        <div class="profile-quick-stats">
          ${[
            { l: 'DEFENSE BUDGET', v: mil?.defenseBudgetGdpPct ? mil.defenseBudgetGdpPct + '% GDP' : '—' },
            { l: 'GDP (USD)',       v: eco?.gdpUsd ? '$' + Utils.formatNum(eco.gdpUsd) : '—' },
            { l: 'ACTIVE FORCES',  v: mil?.activePersonnel ? Utils.formatNum(mil.activePersonnel, 0) : '—' },
            { l: 'CYBER RANK',     v: cyber?.cyberPowerRank ? '#' + cyber.cyberPowerRank : '—' },
          ].map(s => `
            <div class="card card-inner">
              <div class="metric-label">${s.l}</div>
              <div style="font-family:var(--font-mono);font-size:1rem;font-weight:700;color:var(--cyan);margin-top:4px">${s.v}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="country-tabs">
        <button class="tab-btn active" onclick="CountryPage.showTab('overview')">OVERVIEW</button>
        <button class="tab-btn" onclick="CountryPage.showTab('military')">MILITARY</button>
        <button class="tab-btn" onclick="CountryPage.showTab('economic')">ECONOMIC</button>
        <button class="tab-btn" onclick="CountryPage.showTab('political')">POLITICAL</button>
        <button class="tab-btn" onclick="CountryPage.showTab('cyber')">CYBER</button>
        <button class="tab-btn" onclick="CountryPage.showTab('history')">HISTORY</button>
      </div>

      <!-- Overview Tab -->
      <div class="tab-panel active" id="tab-overview">
        <div class="grid-2 mb-4">
          <!-- Radar -->
          <div class="card">
            <div class="card-inner">
              <div class="section-hdr"><span>STABILITY RADAR</span></div>
              <canvas id="stability-radar" height="260"></canvas>
            </div>
          </div>
          <!-- Gauge -->
          <div class="card">
            <div class="card-inner">
              <div class="section-hdr"><span>CONFLICT RISK METER</span></div>
              <canvas id="risk-gauge-canvas" width="300" height="180" style="display:block;margin:0 auto"></canvas>
              <div style="display:flex;justify-content:center;gap:12px;margin-top:8px">
                ${['Low','Moderate','High','Critical'].map(t => `
                  <div style="display:flex;align-items:center;gap:4px">
                    <div style="width:8px;height:8px;border-radius:2px;background:${Utils.getRiskColor(t)};opacity:${tier===t?1:0.25}"></div>
                    <span style="font-family:var(--font-mono);font-size:.55rem;color:var(--text-muted)">${t}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- 10-year Risk Trend -->
        <div class="card mb-4">
          <div class="card-inner">
            <div class="section-hdr"><span>10-YEAR RISK TREND</span></div>
            <canvas id="risk-trend-chart" height="160"></canvas>
          </div>
        </div>

        <!-- AI Explanation -->
        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>AI RISK EXPLANATION</span></div>
            ${Utils.shapHTML(st?.shapValues)}
            <div class="mt-3" style="padding:10px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.1);border-radius:3px">
              <span style="font-family:var(--font-mono);font-size:.65rem;color:var(--cyan)">AI ASSESSMENT: </span>
              <span style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-secondary)">${st?.explanation || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Military Tab -->
      <div class="tab-panel" id="tab-military">
        <div class="grid-5 mb-4">
          ${militaryStatsHTML(mil)}
        </div>
        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>DEFENSE BUDGET TREND (% GDP)</span></div>
            <canvas id="military-trend-chart" height="160"></canvas>
          </div>
        </div>
      </div>

      <!-- Economic Tab -->
      <div class="tab-panel" id="tab-economic">
        <div class="grid-4 mb-4">
          ${economicStatsHTML(eco)}
        </div>
        <div class="card">
          <div class="card-inner">
            <div class="section-hdr"><span>GDP GROWTH &amp; ECONOMIC STRESS TREND</span></div>
            <canvas id="economic-trend-chart" height="160"></canvas>
          </div>
        </div>
      </div>

      <!-- Political Tab -->
      <div class="tab-panel" id="tab-political">
        <div class="grid-4">
          ${politicalStatsHTML(pol)}
        </div>
      </div>

      <!-- Cyber Tab -->
      <div class="tab-panel" id="tab-cyber">
        <div class="grid-4">
          ${cyberStatsHTML(cyber)}
        </div>
      </div>

      <!-- History Tab -->
      <div class="tab-panel" id="tab-history">
        ${conflictHistoryHTML(conflicts, country.name)}
      </div>
    `;

    // Draw radar
    if (st?.radar) {
      const labels = st.radar.map(r => r.dimension);
      const vals   = st.radar.map(r => r.score);
      Charts.radar('stability-radar', labels, [{
        label: 'Stability',
        data: vals,
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0,255,136,0.12)',
        pointBackgroundColor: '#00ff88',
        borderWidth: 2,
      }]);
    }

    // Draw gauge
    Utils.drawGauge('risk-gauge-canvas', pct, tier);

    // Draw risk trend
    if (h?.riskTrend?.length) {
      const labels = h.riskTrend.map(r => r.year);
      Charts.area('risk-trend-chart', labels, [
        { label: 'Conflict Risk %', data: h.riskTrend.map(r => r.overallConflictProb), borderColor: '#ff2244', backgroundColor: 'rgba(255,34,68,0.15)' },
        { label: 'Military',        data: h.riskTrend.map(r => r.militaryRisk),        borderColor: '#ff8c00', backgroundColor: 'transparent', fill: false },
        { label: 'Economic',        data: h.riskTrend.map(r => r.economicRisk),        borderColor: '#ffd700', backgroundColor: 'transparent', fill: false },
      ]);
    }

    // Draw military trend
    if (h?.militaryTrend?.length) {
      Charts.bar('military-trend-chart',
        h.militaryTrend.map(r => r.year),
        [{ label: '% GDP', data: h.militaryTrend.map(r => r.defenseBudgetGdpPct), backgroundColor: 'rgba(0,212,255,0.6)' }],
        { yMax: 20 }
      );
    }

    // Draw economic trend
    if (h?.economicTrend?.length) {
      Charts.line('economic-trend-chart',
        h.economicTrend.map(r => r.year),
        [
          { label: 'GDP Growth %', data: h.economicTrend.map(r => r.gdpGrowthPct), borderColor: '#00ff88' },
          { label: 'Inflation %',  data: h.economicTrend.map(r => r.inflationRate), borderColor: '#ff8c00' },
        ]
      );
    }
  }

  function showTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick*="${tabId}"]`)?.classList.add('active');
    document.getElementById(`tab-${tabId}`)?.classList.add('active');
  }

  function statCard(label, val, color = 'var(--cyan)', cardClass = '') {
    return `
      <div class="card ${cardClass}">
        <div class="card-inner">
          <div class="metric-label">${label}</div>
          <div style="font-family:var(--font-mono);font-size:0.95rem;font-weight:700;color:${color};margin-top:4px">${val || '—'}</div>
        </div>
      </div>`;
  }

  function militaryStatsHTML(mil) {
    if (!mil) return '<div class="loading">NO MILITARY DATA</div>';
    return [
      statCard('DEFENSE BUDGET', mil.defenseBudgetUsd ? '$' + Utils.formatNum(mil.defenseBudgetUsd) + 'M' : '—', 'var(--cyan)'),
      statCard('% OF GDP',       mil.defenseBudgetGdpPct ? mil.defenseBudgetGdpPct + '%' : '—', 'var(--gold)'),
      statCard('ACTIVE FORCES',  mil.activePersonnel ? Utils.formatNum(mil.activePersonnel, 0) : '—', 'var(--radar-green)'),
      statCard('RESERVE',        mil.reservePersonnel ? Utils.formatNum(mil.reservePersonnel, 0) : '—'),
      statCard('NAVAL VESSELS',  mil.navalVessels || '—', 'var(--cyan)'),
      statCard('SUBMARINES',     mil.submarines || '—', 'var(--cyan)'),
      statCard('AIRCRAFT',       mil.fighterAircraft || '—', 'var(--alert-orange)'),
      statCard('NUCLEAR STATUS', mil.nuclearStatus ? '⚡ ARMED' : '○ NONE', mil.nuclearStatus ? 'var(--alert-red)' : 'var(--text-muted)'),
      statCard('MCI SCORE',      mil.mciScore ? mil.mciScore.toFixed(1) + '/100' : '—', 'var(--radar-green)'),
      statCard('FORCE READINESS',mil.forceReadinessScore ? mil.forceReadinessScore.toFixed(1) + '/100' : '—', 'var(--radar-green)'),
    ].join('');
  }

  function economicStatsHTML(eco) {
    if (!eco) return '<div class="loading">NO ECONOMIC DATA</div>';
    return [
      statCard('GDP (USD)',       eco.gdpUsd ? '$' + Utils.formatNum(eco.gdpUsd) : '—', 'var(--gold)', 'card-gold'),
      statCard('GDP GROWTH',     eco.gdpGrowthPct != null ? eco.gdpGrowthPct.toFixed(1) + '%' : '—', 'var(--radar-green)'),
      statCard('INFLATION RATE', eco.inflationRate != null ? eco.inflationRate.toFixed(1) + '%' : '—', 'var(--alert-orange)'),
      statCard('DEBT/GDP',       eco.debtGdpRatio ? eco.debtGdpRatio + '%' : '—'),
      statCard('FOREX RESERVES', eco.forexReservesUsd ? '$' + Utils.formatNum(eco.forexReservesUsd) : '—', 'var(--cyan)'),
      statCard('ECONOMIC STRESS', eco.economicStressIndex ? eco.economicStressIndex.toFixed(1) + '/100' : '—', 'var(--alert-red)'),
      statCard('SANCTIONS',      eco.sanctionsExposure ? eco.sanctionsExposure.toFixed(1) : '—'),
      statCard('ENERGY DEPEND.', eco.energyDependencyPct ? eco.energyDependencyPct + '%' : '—'),
    ].join('');
  }

  function politicalStatsHTML(pol) {
    if (!pol) return '<div class="loading">NO POLITICAL DATA</div>';
    return [
      statCard('REGIME TYPE',    pol.regimeType || '—', 'var(--alert-yellow)', 'card-gold'),
      statCard('POLITY SCORE',   pol.polityScore != null ? pol.polityScore + '/10' : '—', 'var(--alert-yellow)'),
      statCard('CORRUPTION IDX', pol.corruptionIndex ? pol.corruptionIndex.toFixed(0) + '/100' : '—'),
      statCard('STABILITY',      pol.politicalStabilityIdx != null ? pol.politicalStabilityIdx.toFixed(2) : '—'),
      statCard('COUP PROB.',     pol.coupProbability ? pol.coupProbability + '%' : '—', 'var(--alert-red)'),
      statCard('PROTEST EVENTS', pol.protestFrequency || '—'),
      statCard('GOV. RISK',      pol.governanceRiskScore ? pol.governanceRiskScore.toFixed(1) + '/100' : '—', 'var(--alert-red)'),
      statCard('INTERNAL CONF.', pol.internalConflictProb ? pol.internalConflictProb + '%' : '—', 'var(--alert-orange)'),
    ].join('');
  }

  function cyberStatsHTML(cyber) {
    if (!cyber) return '<div class="loading">NO CYBER DATA</div>';
    return [
      statCard('CYBER RANK',     cyber.cyberPowerRank ? '#' + cyber.cyberPowerRank : '—', 'var(--cyan)'),
      statCard('SATELLITES',     cyber.satellitesCount || '—', 'var(--cyan)'),
      statCard('SPACE COMMAND',  cyber.spaceCommand ? '✓ YES' : '✗ NO', cyber.spaceCommand ? 'var(--radar-green)' : 'var(--text-muted)'),
      statCard('INFRA RESILIENCE', cyber.infraResilienceScore ? cyber.infraResilienceScore.toFixed(1) + '/100' : '—', 'var(--radar-green)'),
      statCard('CYBER ATTACKS/YR', cyber.cyberAttacksFreq || '—', 'var(--alert-red)'),
      statCard('CYBER DOMINANCE', cyber.cyberDominanceIndex ? cyber.cyberDominanceIndex.toFixed(1) : '—', 'var(--cyan)'),
      statCard('INFRA VULN.',     cyber.infraVulnerabilityScore ? cyber.infraVulnerabilityScore.toFixed(1) + '/100' : '—', 'var(--alert-orange)'),
      statCard('AI MIL INVEST.', cyber.aiMilitaryInvestmentUsd ? '$' + Utils.formatNum(cyber.aiMilitaryInvestmentUsd) : '—', 'var(--gold)'),
    ].join('');
  }

  function conflictHistoryHTML(conflicts, name) {
    if (!conflicts?.length) return '<div class="card card-inner"><div class="loading">NO CONFLICT HISTORY ON RECORD</div></div>';
    return `
      <div class="card">
        <div class="card-inner">
          <div class="section-hdr"><span>CONFLICT RECORD — ${name?.toUpperCase()}</span></div>
          <div class="space-y-4">
            ${conflicts.map(c => `
              <div class="alert-row alert-row-high">
                <div class="alert-left">
                  <div style="font-family:var(--font-mono);font-size:.7rem;color:var(--cyan);width:80px;flex-shrink:0">
                    ${c.startYear}${c.endYear && c.endYear !== c.startYear ? `–${c.endYear}` : ''}
                  </div>
                  <div>
                    <div style="font-family:var(--font-display);font-weight:600;font-size:.85rem">${c.conflictName || '—'}</div>
                    <div style="font-family:var(--font-mono);font-size:.6rem;color:var(--text-muted)">
                      ${c.conflictType || ''} · ${c.role || ''} · Deaths: ${c.battleDeaths?.toLocaleString() || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div style="font-family:var(--font-mono);font-size:.7rem;color:${c.outcome === 'Victory' ? 'var(--radar-green)' : c.outcome === 'Defeat' ? 'var(--alert-red)' : 'var(--text-muted)'}">
                  ${c.outcome || '—'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
  }

  return { init, load, showTab };
})();
