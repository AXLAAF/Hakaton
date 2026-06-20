'use strict';

const { chatComplete } = require('../llm_client');
const { EVALUATION_SYSTEM_PROMPT, buildEvaluationPrompt } = require('../prompts');
const { parseReport } = require('./claude_eval');

const MODEL = 'deepseek/deepseek-chat';

async function evaluateSecond(tipo, artifactContent, artifactId) {
  const prompt = buildEvaluationPrompt(tipo, artifactContent, artifactId);
  const data   = await chatComplete(MODEL, EVALUATION_SYSTEM_PROMPT, prompt);
  return parseReport('DeepSeek V3', tipo, artifactId, data);
}

module.exports = { evaluateSecond };
