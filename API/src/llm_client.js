'use strict';

const OpenAI = require('openai');

// Fail fast at startup — don't wait for the first request
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('[llm_client] OPENROUTER_API_KEY is not set. Set it in .env and restart.');
  process.exit(1);
}

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/process-guard',
    'X-Title': 'Process-Guard Control Arena',
  },
  timeout: 60_000, // 60 s per call — prevents hanging requests
});

// Qwen3 (and some models) may wrap JSON in markdown or thinking tokens.
// Extract the first valid JSON object/array from the raw string.
function extractJson(raw) {
  const start = raw.search(/[{[]/);
  if (start === -1) throw new SyntaxError('No JSON object found in model response');
  // Find matching closing bracket
  const open  = raw[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === open)  depth++;
    if (raw[i] === close) depth--;
    if (depth === 0) return JSON.parse(raw.slice(start, i + 1));
  }
  throw new SyntaxError('Unmatched JSON brackets in model response');
}

async function chatComplete(model, systemPrompt, userPrompt) {
  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    // response_format is omitted: not all OpenRouter models support json_object mode;
    // we rely on the prompt instruction + extractJson() to get valid JSON.
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
  });

  const raw = response.choices[0].message.content || '';
  return extractJson(raw);
}

module.exports = { chatComplete };
