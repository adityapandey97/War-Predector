/**
 * Shared utilities for GSS-CFS frontend
 */
const Utils = {
  RISK_COLORS: {
    Critical: '#ff2244',
    High:     '#ff8c00',
    Moderate: '#ffd700',
    Low:      '#00ff88',
  },

  getRiskColor(tier) {
    return this.RISK_COLORS[tier] || '#7a9cc0';
  },

  getFlagEmoji(iso2) {
    if (!iso2 || iso2.length !== 2) return '🌐';
    return iso2.toUpperCase().split('').map(c =>
      String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
  },

  badgeClass(tier) {
    if (!tier) return 'badge';
    return `badge badge-${tier.toLowerCase()}`;
  },

  riskBarStyle(pct, tier) {
    const color = this.getRiskColor(tier);
    return `background: linear-gradient(90deg, ${color}88, ${color}); width: ${Math.min(pct, 100)}%`;
  },

  formatNum(n, decimals = 1) {
    if (n == null) return '—';
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(decimals) + 'T';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
    return n.toFixed(decimals);
  },

  formatPop(n) {
    if (!n) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    return n.toLocaleString();
  },

  /** Render a country card HTML */
  countryCardHTML(c, i) {
    const risk = c.risk || {};
    const pct  = risk.overallConflictProb || 0;
    const tier = risk.riskTier || 'Unknown';
    const color = this.getRiskColor(tier);

    return `
      <div class="card country-card fade-in" onclick="CountryPage.load('${c.iso3}')"
        style="animation-delay:${Math.min(i * 0.04, 0.4)}s">
        <div class="card-inner">
          <div class="country-card-top">
            <div class="country-flag-name">
              <span class="flag">${this.getFlagEmoji(c.iso2)}</span>
              <div>
                <div class="country-name-main">${c.name}</div>
                <div class="country-meta">${c.region || ''} · ${c.iso3}</div>
              </div>
            </div>
            <div>
              <div class="country-risk-val" style="color:${color}">${pct.toFixed(1)}%</div>
              <span class="${this.badgeClass(tier)}">${tier}</span>
            </div>
          </div>
          <div class="risk-bar-wrap">
            <div class="risk-bar" style="${this.riskBarStyle(pct, tier)}"></div>
          </div>
          <div class="country-mini-stats">
            <div class="mini-stat">
              <div class="mini-stat-label">MIL</div>
              <div class="mini-stat-val">${risk.militaryRisk?.toFixed(0) || '—'}</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-label">ECO</div>
              <div class="mini-stat-val">${risk.economicRisk?.toFixed(0) || '—'}</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-label">POL</div>
              <div class="mini-stat-val">${risk.politicalRisk?.toFixed(0) || '—'}</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-label">CYB</div>
              <div class="mini-stat-val">${risk.cyberRisk?.toFixed(0) || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /** Draw SVG gauge meter */
  drawGauge(canvasId, pct, tier) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.72;
    const r  = Math.min(W, H) * 0.38;

    ctx.clearRect(0, 0, W, H);

    const segments = [
      { from: 0,  to: 30,  color: '#00ff8844' },
      { from: 30, to: 60,  color: '#ffd70044' },
      { from: 60, to: 80,  color: '#ff8c0044' },
      { from: 80, to: 100, color: '#ff224444' },
    ];

    // Draw background arc segments
    segments.forEach(s => {
      const a1 = Math.PI + (s.from / 100) * Math.PI;
      const a2 = Math.PI + (s.to   / 100) * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a1, a2);
      ctx.lineWidth = 18;
      ctx.strokeStyle = s.color;
      ctx.stroke();
    });

    // Active arc
    const color = this.getRiskColor(tier);
    const activeEnd = Math.PI + (Math.min(pct, 100) / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, activeEnd);
    ctx.lineWidth = 18;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Needle
    const needleAngle = Math.PI + (Math.min(pct, 100) / 100) * Math.PI;
    const nx = cx + (r - 14) * Math.cos(needleAngle);
    const ny = cy + (r - 14) * Math.sin(needleAngle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Value text
    ctx.fillStyle = color;
    ctx.font = `bold 26px 'Share Tech Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${pct.toFixed(1)}%`, cx, cy - 26);

    ctx.fillStyle = '#7a9cc0';
    ctx.font = `10px 'Rajdhani', sans-serif`;
    ctx.fillText('CONFLICT RISK', cx, cy - 10);

    // Tick labels
    ctx.fillStyle = '#3d5a7a';
    ctx.font = `9px 'Share Tech Mono', monospace`;
    [0, 25, 50, 75, 100].forEach(v => {
      const a = Math.PI + (v / 100) * Math.PI;
      const tx = cx + (r + 14) * Math.cos(a);
      const ty = cy + (r + 14) * Math.sin(a);
      ctx.fillText(v, tx, ty);
    });
  },

  /** Build SHAP bars HTML */
  shapHTML(shapValues) {
    if (!shapValues) return '<p class="muted font-mono" style="font-size:.65rem">No SHAP data available.</p>';

    const FACTORS = {
      militaryEscalation:   { label: 'Military Escalation',    icon: '🪖', color: '#ff8c00' },
      economicStress:       { label: 'Economic Stress',        icon: '💰', color: '#c9a227' },
      politicalInstability: { label: 'Political Instability',  icon: '🗳', color: '#ffd700' },
      borderTension:        { label: 'Border Tensions',        icon: '🌐', color: '#ff2244' },
      cyberVulnerability:   { label: 'Cyber Vulnerability',    icon: '💻', color: '#00d4ff' },
      allianceIsolation:    { label: 'Alliance Isolation',     icon: '🛡', color: '#7a9cc0' },
    };

    const entries = typeof shapValues === 'object' && !(shapValues instanceof Map)
      ? Object.entries(shapValues)
      : [];
    const maxVal = Math.max(...entries.map(([, v]) => v || 0));

    return entries.sort(([, a], [, b]) => b - a).map(([k, v]) => {
      const f = FACTORS[k] || { label: k, icon: '◈', color: '#7a9cc0' };
      const w = maxVal > 0 ? (v / maxVal * 100) : 0;
      return `
        <div class="shap-row">
          <span class="shap-icon">${f.icon}</span>
          <span class="shap-name" style="color:${f.color}">${f.label}</span>
          <div class="shap-bar-wrap">
            <div class="shap-bar" style="width:${w}%; background:linear-gradient(90deg,${f.color}44,${f.color})"></div>
          </div>
          <span class="shap-val" style="color:${f.color}">${v?.toFixed(1)}%</span>
        </div>
      `;
    }).join('');
  },

  /** Current UTC time string */
  utcTimeStr() {
    return new Date().toUTCString().slice(0, -7) + ' UTC';
  },

  /** Populate a <select> with countries */
  populateCountrySelect(selectId, countries) {
    const el = document.getElementById(selectId);
    if (!el) return;
    el.innerHTML = `<option value="">— SELECT COUNTRY —</option>`;
    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.iso3;
      opt.textContent = `${c.name} (${c.iso3})`;
      el.appendChild(opt);
    });
  },
};
