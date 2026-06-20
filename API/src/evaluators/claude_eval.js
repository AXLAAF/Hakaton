'use strict';

const { chatComplete } = require('../llm_client');
const { EVALUATION_SYSTEM_PROMPT, buildEvaluationPrompt } = require('../prompts');

const MODEL = 'openai/gpt-4o-mini';

// Recalculates puntaje server-side so we don't trust the LLM's arithmetic
function computeScore(gates, criteria) {
  const failedGate = gates.find((g) => g.resultado === 'NO_CUMPLE');
  if (failedGate) return { puntaje: null, veredicto: 'REPROBADO', pesoEvaluadoPct: 100 };

  const evaluables = criteria.filter((c) => c.nivel !== 'N/E');
  const pesoTotal   = criteria.reduce((s, c) => s + c.peso, 0) || 100;
  const pesoEvaluado = evaluables.reduce((s, c) => s + c.peso, 0);
  const pesoEvaluadoPct = (pesoEvaluado / pesoTotal) * 100;

  if (pesoEvaluadoPct < 60) return { puntaje: null, veredicto: 'INCONCLUSO', pesoEvaluadoPct };

  const factor  = pesoTotal / pesoEvaluado;
  const puntaje = Math.round(
    evaluables.reduce((s, c) => s + (Number(c.nivel) / 4) * c.peso * factor, 0) * 100,
  ) / 100;

  let veredicto;
  if (puntaje >= 85)      veredicto = 'APROBADO';
  else if (puntaje >= 70) veredicto = 'APROBADO_CON_OBSERVACIONES';
  else                    veredicto = 'REPROBADO';

  return { puntaje, veredicto, pesoEvaluadoPct };
}

function parseReport(modelName, tipo, artifactId, data) {
  const gates = (data.gates || []).map((g) => ({
    id:            g.id,
    resultado:     g.resultado === 'NO_CUMPLE' ? 'NO_CUMPLE' : 'CUMPLE',
    evidencia:     g.evidencia  || { ubicacion: '', extracto: '' },
    justificacion: g.justificacion || '',
  }));

  // LLM outputs field as "criterios" (Section 6 schema)
  const criteria = (data.criterios || []).map((c) => ({
    id:            c.id,
    nivel:         c.nivel === 'N/E' ? 'N/E' : Number(c.nivel),
    peso:          Number(c.peso) || 0,
    evidencia:     c.evidencia  || { ubicacion: '', extracto: '' },
    justificacion: c.justificacion || '',
  }));

  const { puntaje, veredicto, pesoEvaluadoPct } = computeScore(gates, criteria);

  return {
    model_name:                modelName,
    rubrica_version:           '2.0',
    tipo,
    gates,
    criteria,
    peso_evaluado_pct:         Math.round(pesoEvaluadoPct * 100) / 100,
    puntaje,
    veredicto,
    correcciones_obligatorias: data.correcciones_obligatorias || [],
  };
}

async function evaluateFirst(tipo, artifactContent, artifactId) {
  const prompt = buildEvaluationPrompt(tipo, artifactContent, artifactId);
  const data   = await chatComplete(MODEL, EVALUATION_SYSTEM_PROMPT, prompt);
  return parseReport('GPT-4o Mini', tipo, artifactId, data);
}

module.exports = { evaluateFirst, parseReport, computeScore };
