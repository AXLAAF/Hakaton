'use strict';

const ARTIFACT_TYPES = ['requirements', 'design', 'code', 'skill', 'project'];

// Maps URL-friendly type names to rubric section codes
const ARTIFACT_TYPE_MAP = {
  requirements: 'A1',
  design:       'A2',
  code:         'A3',
  skill:        'A4',
  project:      'A1', // no dedicated rubric in v2 — falls back to A1
};

const VERDICTS = {
  APROBADO:                  'APROBADO',
  APROBADO_CON_OBSERVACIONES:'APROBADO_CON_OBSERVACIONES',
  REPROBADO:                 'REPROBADO',
  INCONCLUSO:                'INCONCLUSO',
};

// ─── Request ────────────────────────────────────────────────────────────────

const evaluationRequestSchema = {
  type: 'object',
  required: ['artifact_content'],
  properties: {
    artifact_content: { type: 'string', minLength: 20 },
    artifact_type:    { type: 'string', enum: ARTIFACT_TYPES, default: 'skill' },
    artifact_name:    { type: 'string', default: 'artifact' },
    artifact_id:      { type: 'string', default: 'ART-001' },
  },
};

// ─── Response sub-schemas ────────────────────────────────────────────────────

const evidenceSchema = {
  type: 'object',
  properties: {
    ubicacion: { type: 'string' },
    extracto:  { type: 'string' },
  },
};

const gateResultSchema = {
  type: 'object',
  properties: {
    id:            { type: 'string' },
    resultado:     { type: 'string', enum: ['CUMPLE', 'NO_CUMPLE'] },
    evidencia:     evidenceSchema,
    justificacion: { type: 'string' },
  },
};

const criterionResultSchema = {
  type: 'object',
  properties: {
    id:            { type: 'string' },
    nivel:         {},          // 0-4 (number) or "N/E" (string)
    peso:          { type: 'number' },
    evidencia:     evidenceSchema,
    justificacion: { type: 'string' },
  },
};

const modelReportSchema = {
  type: 'object',
  properties: {
    model_name:               { type: 'string' },
    rubrica_version:          { type: 'string' },
    tipo:                     { type: 'string' },
    gates:                    { type: 'array', items: gateResultSchema },
    criteria:                 { type: 'array', items: criterionResultSchema },
    peso_evaluado_pct:        { type: 'number' },
    puntaje:                  { type: ['number', 'null'] },
    veredicto:                { type: 'string' },
    correcciones_obligatorias:{ type: 'array', items: { type: 'string' } },
  },
};

const synthesisResultSchema = {
  type: 'object',
  properties: {
    veredicto_final:           { type: 'string' },
    puntaje_consenso:          { type: ['number', 'null'] },
    gates_fallidos:            { type: 'array', items: { type: 'string' } },
    criterios_discrepantes:    { type: 'array', items: { type: 'string' } },
    correcciones_obligatorias: { type: 'array', items: { type: 'string' } },
    hallucination_flag:        { type: 'boolean' },
    outlier_model:             { type: ['string', 'null'] },
  },
};

const evaluationResponseSchema = {
  type: 'object',
  properties: {
    artifact_name:            { type: 'string' },
    artifact_type:            { type: 'string' },
    reports:                  { type: 'array', items: modelReportSchema },
    synthesis:                synthesisResultSchema,
    execution_time_seconds:   { type: 'number' },
  },
};

module.exports = {
  ARTIFACT_TYPES,
  ARTIFACT_TYPE_MAP,
  VERDICTS,
  evaluationRequestSchema,
  evaluationResponseSchema,
};
