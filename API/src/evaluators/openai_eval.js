'use strict';

const { chatComplete } = require('../llm_client');
const { EVALUATION_SYSTEM_PROMPT, buildEvaluationPrompt } = require('../prompts');
const { parseReport } = require('./claude_eval');

const MODEL = 'qwen/qwen3-8b';

async function evaluateThird(tipo, artifactContent, artifactId) {
  const prompt = buildEvaluationPrompt(tipo, artifactContent, artifactId);
  const data   = await chatComplete(MODEL, EVALUATION_SYSTEM_PROMPT, prompt);
  return parseReport('Qwen3 8B', tipo, artifactId, data);
}

module.exports = { evaluateThird };
