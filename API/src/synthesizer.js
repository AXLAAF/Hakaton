'use strict';

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function synthesize(reports) {
  // ── Phase 1: Gate consensus ──────────────────────────────────────────────
  // A gate fails in synthesis if the majority of models (≥ ceil(N/2)) say NO_CUMPLE
  const gateIds = [...new Set(reports.flatMap((r) => r.gates.map((g) => g.id)))];
  const failedGates = [];

  for (const gateId of gateIds) {
    const results = reports
      .map((r) => r.gates.find((g) => g.id === gateId)?.resultado)
      .filter(Boolean);
    const noCumple = results.filter((r) => r === 'NO_CUMPLE').length;
    if (noCumple >= Math.ceil(results.length / 2)) failedGates.push(gateId);
  }

  if (failedGates.length > 0) {
    return {
      veredicto_final:            'REPROBADO',
      puntaje_consenso:           null,
      gates_fallidos:             failedGates,
      criterios_discrepantes:     [],
      correcciones_obligatorias:  dedupe(reports.flatMap((r) => r.correcciones_obligatorias || [])),
      hallucination_flag:         false,
      outlier_model:              null,
    };
  }

  // ── Phase 2: Criteria aggregation (Sección 3 — reconciliación inter-evaluador) ──
  const criterionIds = [...new Set(reports.flatMap((r) => r.criteria.map((c) => c.id)))];
  const discrepantes = [];
  const aggregated   = [];

  for (const cId of criterionIds) {
    const entries  = reports.map((r) => r.criteria.find((c) => c.id === cId)).filter(Boolean);
    const peso     = entries[0]?.peso || 0;
    const niveles  = entries.map((e) => e.nivel).filter((n) => n !== 'N/E' && n != null);

    if (niveles.length === 0) {
      aggregated.push({ id: cId, nivel: 'N/E', peso });
      continue;
    }

    const dispersion = Math.max(...niveles) - Math.min(...niveles);
    if (dispersion > 1) discrepantes.push(cId);

    aggregated.push({ id: cId, nivel: median(niveles), peso });
  }

  // ── Score from consensus criteria ────────────────────────────────────────
  const evaluables      = aggregated.filter((c) => c.nivel !== 'N/E');
  const pesoTotal       = aggregated.reduce((s, c) => s + c.peso, 0) || 100;
  const pesoEvaluado    = evaluables.reduce((s, c) => s + c.peso, 0);
  const pesoEvaluadoPct = (pesoEvaluado / pesoTotal) * 100;

  if (pesoEvaluadoPct < 60) {
    return {
      veredicto_final:            'INCONCLUSO',
      puntaje_consenso:           null,
      gates_fallidos:             [],
      criterios_discrepantes:     discrepantes,
      correcciones_obligatorias:  [],
      hallucination_flag:         false,
      outlier_model:              null,
    };
  }

  const factor   = pesoTotal / pesoEvaluado;
  const puntaje  = Math.round(
    evaluables.reduce((s, c) => s + (c.nivel / 4) * c.peso * factor, 0) * 100,
  ) / 100;

  let veredicto;
  if (puntaje >= 85)      veredicto = 'APROBADO';
  else if (puntaje >= 70) veredicto = 'APROBADO_CON_OBSERVACIONES';
  else                    veredicto = 'REPROBADO';

  // ── Outlier / hallucination detection ────────────────────────────────────
  const puntajes = reports.map((r) => r.puntaje).filter((p) => p != null);
  let outlierModel     = null;
  let hallucinationFlag = false;

  if (puntajes.length >= 3) {
    const avg    = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
    const maxDev = Math.max(...puntajes.map((p) => Math.abs(p - avg)));
    if (maxDev > 20) {
      const idx    = puntajes.findIndex((p) => Math.abs(p - avg) === maxDev);
      outlierModel      = reports[idx]?.model_name || null;
      hallucinationFlag = true;
    }
  }

  return {
    veredicto_final:            veredicto,
    puntaje_consenso:           puntaje,
    gates_fallidos:             [],
    criterios_discrepantes:     discrepantes,
    correcciones_obligatorias:  dedupe(reports.flatMap((r) => r.correcciones_obligatorias || [])),
    hallucination_flag:         hallucinationFlag,
    outlier_model:              outlierModel,
  };
}

function dedupe(arr) {
  return [...new Set(arr)].slice(0, 6);
}

module.exports = { synthesize };
