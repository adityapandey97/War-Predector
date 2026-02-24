/**
 * Chart.js wrapper helpers for GSS-CFS
 */
const Charts = {
  _instances: {},

  CHART_DEFAULTS: {
    color: '#7a9cc0',
    gridColor: 'rgba(0,212,255,0.06)',
    tooltipBg: '#091524',
    tooltipBorder: 'rgba(0,212,255,0.2)',
    fontMono: "'Share Tech Mono', monospace",
  },

  destroy(id) {
    if (this._instances[id]) {
      this._instances[id].destroy();
      delete this._instances[id];
    }
  },

  radar(canvasId, labels, datasets) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this._instances[canvasId] = new Chart(canvas, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: 'rgba(0,212,255,0.08)' },
            angleLines: { color: 'rgba(0,212,255,0.08)' },
            pointLabels: { color: '#7a9cc0', font: { family: this.CHART_DEFAULTS.fontMono, size: 10 } },
            ticks: { display: false },
          },
        },
        plugins: {
          legend: { labels: { color: '#7a9cc0', font: { family: this.CHART_DEFAULTS.fontMono, size: 10 } } },
          tooltip: this._tooltipStyle(),
        },
      },
    });
  },

  bar(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this._instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        scales: {
          x: this._axisStyle(),
          y: { ...this._axisStyle(), min: options.yMin ?? 0, max: options.yMax ?? 100 },
        },
        plugins: { legend: this._legendStyle(), tooltip: this._tooltipStyle() },
      },
    });
  },

  line(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this._instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: this._axisStyle(),
          y: { ...this._axisStyle(), min: options.yMin, max: options.yMax },
        },
        plugins: { legend: this._legendStyle(), tooltip: this._tooltipStyle() },
        elements: { point: { radius: 3 }, line: { tension: 0.3 } },
      },
    });
  },

  area(canvasId, labels, datasets, options = {}) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this._instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets: datasets.map(d => ({ ...d, fill: true })) },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: this._axisStyle(),
          y: { ...this._axisStyle(), min: options.yMin ?? 0, max: options.yMax ?? 100 },
        },
        plugins: { legend: this._legendStyle(), tooltip: this._tooltipStyle() },
        elements: { point: { radius: 2 }, line: { tension: 0.4 } },
      },
    });
  },

  _axisStyle() {
    return {
      grid: { color: this.CHART_DEFAULTS.gridColor },
      ticks: { color: this.CHART_DEFAULTS.color, font: { family: this.CHART_DEFAULTS.fontMono, size: 10 } },
    };
  },

  _legendStyle() {
    return {
      labels: {
        color: this.CHART_DEFAULTS.color,
        font: { family: this.CHART_DEFAULTS.fontMono, size: 10 },
        boxWidth: 10,
      },
    };
  },

  _tooltipStyle() {
    return {
      backgroundColor: this.CHART_DEFAULTS.tooltipBg,
      borderColor: this.CHART_DEFAULTS.tooltipBorder,
      borderWidth: 1,
      titleFont: { family: this.CHART_DEFAULTS.fontMono, size: 11 },
      bodyFont: { family: this.CHART_DEFAULTS.fontMono, size: 11 },
      titleColor: '#00d4ff',
      bodyColor: '#7a9cc0',
    };
  },
};
