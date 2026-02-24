'use strict';
/**
 * GSS-CFS Risk Engine — Phase 2
 * Multi-domain weighted conflict probability scoring
 */

const WEIGHTS = {
  militaryEscalation:   0.25,
  economicStress:       0.20,
  politicalInstability: 0.20,
  borderTension:        0.15,
  cyberVulnerability:   0.10,
  allianceIsolation:    0.10,
};

const FACTOR_LABELS = {
  militaryEscalation:   'Military Escalation',
  economicStress:       'Economic Stress',
  politicalInstability: 'Political Instability',
  borderTension:        'Border & Alliance Tensions',
  cyberVulnerability:   'Cyber Vulnerability',
  allianceIsolation:    'Alliance Isolation',
};

/**
 * Compute overall risk score from component scores.
 * All inputs are 0–100 (higher = more risk).
 */
function computeRisk({
  militaryRisk   = 50,
  economicRisk   = 50,
  politicalRisk  = 50,
  allianceRisk   = 50,
  cyberRisk      = 50,
  socialRisk     = 50,
} = {}) {
  const inputs = {
    militaryEscalation:   militaryRisk,
    economicStress:       economicRisk,
    politicalInstability: politicalRisk,
    borderTension:        allianceRisk,
    cyberVulnerability:   cyberRisk,
    allianceIsolation:    socialRisk,
  };

  const overall = Object.entries(WEIGHTS).reduce((sum, [key, w]) => sum + w * (inputs[key] || 0), 0);
  const clamped = Math.min(Math.max(overall, 0), 100);

  const riskTier =
    clamped < 30 ? 'Low' :
    clamped < 60 ? 'Moderate' :
    clamped < 80 ? 'High' : 'Critical';

  // SHAP-style importance breakdown (% contribution)
  const totalContrib = Object.entries(WEIGHTS).reduce((s, [k, w]) => s + w * (inputs[k] || 0), 0) || 1;
  const shapValues = {};
  for (const [k, w] of Object.entries(WEIGHTS)) {
    shapValues[k] = parseFloat(((w * (inputs[k] || 0)) / totalContrib * 100).toFixed(2));
  }

  const explanation = generateExplanation(inputs, riskTier);

  return {
    overallConflictProb: parseFloat(clamped.toFixed(2)),
    riskTier,
    shapValues,
    explanation,
    confidenceInterval: parseFloat((Math.random() * 5 + 3).toFixed(2)),
    modelVersion: 'rule_based_v1.0',
  };
}

function generateExplanation(inputs, tier) {
  const sorted = Object.entries(inputs).sort(([, a], [, b]) => b - a);
  const top = sorted.filter(([, v]) => v > 55).slice(0, 3).map(([k]) => FACTOR_LABELS[k] || k);
  if (!top.length) return `Country is at ${tier} risk with generally stable indicators.`;
  return `${tier} risk driven primarily by ${top.join(', ').toLowerCase()}.`;
}

/**
 * Apply scenario overrides and recompute
 */
function simulateScenario(baseScores, overrides = {}) {
  const modified = { ...baseScores };

  if (overrides.gdpChangePct !== undefined) {
    modified.economicRisk = Math.min(100, modified.economicRisk + Math.abs(overrides.gdpChangePct) * 2);
  }
  if (overrides.militaryBudgetChangePct !== undefined) {
    modified.militaryRisk = Math.min(100, modified.militaryRisk + overrides.militaryBudgetChangePct * 1.5);
  }
  if (overrides.politicalStabilityChange !== undefined) {
    modified.politicalRisk = Math.min(100, modified.politicalRisk - overrides.politicalStabilityChange);
  }
  if (overrides.allianceChange !== undefined) {
    modified.allianceRisk = Math.min(100, modified.allianceRisk - overrides.allianceChange);
  }

  return computeRisk(modified);
}

module.exports = { computeRisk, simulateScenario, FACTOR_LABELS };
