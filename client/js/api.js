/**
 * GSS-CFS API Service — Production Ready
 */

const API = (() => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  async function request(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${BASE_URL}/api${path}`, opts);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Request failed');

      return data;
    } catch (err) {
      console.error(`[API] ${method} ${path}:`, err.message);
      throw err;
    }
  }

  return {
    login:    (email, password) => request('POST', '/auth/login', { email, password }),
    register: (payload)         => request('POST', '/auth/register', payload),

    getCountries: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/countries${qs ? '?' + qs : ''}`);
    },

    searchCountries: (q)   => request('GET', `/countries/search?q=${encodeURIComponent(q)}`),
    getProfile:      (iso) => request('GET', `/countries/${iso}/profile`),
    getStability:    (iso) => request('GET', `/countries/${iso}/stability`),
    getHistory:      (iso, years = 10) => request('GET', `/countries/${iso}/history?years=${years}`),
    getMilitary:     (iso) => request('GET', `/countries/${iso}/military`),
    getEconomic:     (iso) => request('GET', `/countries/${iso}/economic`),
    getConflicts:    (iso) => request('GET', `/countries/${iso}/conflict-history`),

    getHeatmap:      ()        => request('GET', '/risk/heatmap'),
    getHighAlert:    ()        => request('GET', '/risk/high-alert'),
    simulate:        (payload) => request('POST', '/risk/simulate', payload),

    compareCountries: (isos) => request('GET', `/compare?countries=${isos.join(',')}`),

    getAlerts:     (threshold = 60) => request('GET', `/alerts?threshold=${threshold}`),
    getAlertStats: ()                => request('GET', '/alerts/stats'),
  };
})();

export default API;
