'use strict';

const { evaluateFirst }  = require('./evaluators/claude_eval');
const { evaluateSecond } = require('./evaluators/gemini_eval');
const { evaluateThird }  = require('./evaluators/openai_eval');
const { synthesize }     = require('./synthesizer');
const { ARTIFACT_TYPE_MAP } = require('./models');

async function runEvaluation(artifactType, artifactContent, artifactId) {
  const tipo = ARTIFACT_TYPE_MAP[artifactType] || 'A3';

  const settled = await Promise.allSettled([
    evaluateFirst (tipo, artifactContent, artifactId),
    evaluateSecond(tipo, artifactContent, artifactId),
    evaluateThird (tipo, artifactContent, artifactId),
  ]);

  const reports = [];
  const errors  = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      reports.push(result.value);
    } else {
      errors.push(result.reason?.message || String(result.reason));
    }
  }

  if (reports.length < 2) {
    const err = new Error(
      `Insufficient reports to synthesize (${reports.length}/3). Errors: ${errors.join(' | ')}`,
    );
    err.statusCode = 503;
    throw err;
  }

  const synthesis = synthesize(reports);
  return { reports, synthesis, errors };
}

module.exports = { runEvaluation };
