/**
 * Compare Page
 */
const ComparePage = (() => {
  const COLORS = ['#00d4ff', '#ff8c00', '#00ff88', '#ffd700'];
  let selected = ['IND', 'CHN', 'PAK'];
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    renderTags();
    load();
    document.getElementById('compare-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addCountry();
    });
  }

  function addCountry() {
    const input = document.getElementById('compare-input');
    const iso = (input?.value || '').trim().toUpperCase();
    if (iso && iso.length >= 2 && !selected.includes(iso) && selected.length < 4) {
      selected.push(iso);
      input.value = '';
      renderTags();
      load();
    }
  }

  function removeCountry(iso) {
    selected = selected.filter(s => s !== iso);
    renderTags();
    load();
  }

  function renderTags() {
    const container = document.getElementById('compare-tags');
    if (!container) return;
    container.innerHTML = selected.map((iso, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:3px;
        background:${COLORS[i]}18;border:1px solid ${COLORS[i]}44">
        <span style="font-family:var(--font-mono);font-size:.7rem;font-weight:700;color:${COLORS[i]}">${iso}</span>
        <button onclick="ComparePage.removeCountry('${iso}')" style="color:${COLORS[i]};font-size:.8rem;line-height:1">✕</button>
      </div>
    `).join('');
  }

  async function load() {
    if (!selected.length) return;
    try {
      const res = await API.compareCountries(selected);
      const data = res?.data || [];
      renderCards(data);
      renderCharts(data);
    } catch (e) {
      document.getElementById('compare-cards').innerHTML =
        '<div class="loading" style="color:var(--alert-red)">FAILED TO LOAD COMPARISON</div>';
    }
  }

  function renderCards(data) {
    const container = document.getElementById('compare-cards');
    if (!data.length) {
      container.innerHTML = '<div class="loading">ADD COUNTRIES TO COMPARE</div>';
      return;
    }
    container.innerHTML = data.map((d, i) => {
      const c    = d.country;
      const risk = d.risk || {};
      const color = COLORS[i];
      const tier = risk.riskTier || '—';
      return `
        <div class="card compare-card" style="border-left:3px solid ${color}">
          <div style="font-family:var(--font-display);font-weight:700;font-size:.85rem;letter-spacing:.05em;margin-bottom:12px">
            ${Utils.getFlagEmoji(c.iso2)} ${c.name?.toUpperCase()}
          </div>
          ${[
            ['RISK', risk.overallConflictProb?.toFixed(1) + '%'],
            ['MILITARY', risk.militaryRisk?.toFixed(1)],
            ['ECONOMIC', risk.economicRisk?.toFixed(1)],
            ['POLITICAL', risk.politicalRisk?.toFixed(1)],
            ['CYBER', risk.cyberRisk?.toFixed(1)],
          ].map(([k, v]) => `
            <div class="compare-stat-row">
              <span class="compare-stat-key">${k}</span>
              <span class="compare-stat-val" style="color:${color}">${v || '—'}</span>
            </div>
          `).join('')}
          <div style="margin-top:10px">
            <span class="${Utils.badgeClass(tier)}">${tier}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderCharts(data) {
    const labels = ['Military', 'Economic', 'Political', 'Alliance', 'Cyber', 'Social'];

    const radarDatasets = data.map((d, i) => ({
      label: d.country.iso3,
      data: labels.map(l => {
        const key = l.toLowerCase() + 'Risk';
        return parseFloat((100 - (d.risk?.[key] || 0)).toFixed(1));
      }),
      borderColor: COLORS[i],
      backgroundColor: COLORS[i] + '18',
      pointBackgroundColor: COLORS[i],
      borderWidth: 2,
    }));
    Charts.radar('compare-radar', labels, radarDatasets);

    const barLabels  = data.map(d => d.country.iso3);
    const barDatasets = [
      { label: 'Conflict Risk', data: data.map(d => d.risk?.overallConflictProb || 0), backgroundColor: 'rgba(255,34,68,0.7)' },
      { label: 'Military',      data: data.map(d => d.risk?.militaryRisk || 0),        backgroundColor: 'rgba(255,140,0,0.7)' },
      { label: 'Economic',      data: data.map(d => d.risk?.economicRisk || 0),        backgroundColor: 'rgba(201,162,39,0.7)' },
      { label: 'Political',     data: data.map(d => d.risk?.politicalRisk || 0),       backgroundColor: 'rgba(255,215,0,0.7)' },
    ];
    Charts.bar('compare-bar', barLabels, barDatasets);
  }

  return { init, addCountry, removeCountry };
})();
