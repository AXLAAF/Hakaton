'use strict';

require('dotenv').config();

const path = require('path');
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const staticPlugin = require('@fastify/static');
const { runEvaluation } = require('./src/orchestrator');
const { evaluationRequestSchema, evaluationResponseSchema } = require('./src/models');

const app = Fastify({ logger: true, connectionTimeout: 90_000 });

app.register(cors, { origin: '*' });

app.register(staticPlugin, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

app.get('/health', async () => ({
  status: 'ok',
  version: '0.1.0',
  timestamp: new Date().toISOString(),
  evaluators: ['openai/gpt-4o-mini', 'deepseek/deepseek-chat', 'qwen/qwen3-8b'],
}));

app.post(
  '/evaluate',
  {
    schema: {
      body: evaluationRequestSchema,
      response: { 200: evaluationResponseSchema },
    },
  },
  async (request, reply) => {
    const {
      artifact_content,
      artifact_type = 'skill',
      artifact_name = 'artifact',
      artifact_id   = 'ART-001',
    } = request.body;

    const start = Date.now();

    let reports, synthesis, errors;
    try {
      ({ reports, synthesis, errors } = await runEvaluation(artifact_type, artifact_content, artifact_id));
    } catch (err) {
      const code = err.statusCode || 503;
      return reply.status(code).send({ error: err.message });
    }

    if (errors.length > 0) {
      request.log.warn({ errors }, 'Some evaluators failed');
    }

    return {
      artifact_name,
      artifact_type,
      reports,
      synthesis,
      execution_time_seconds: Math.round((Date.now() - start) / 10) / 100,
    };
  },
);

const PORT = process.env.PORT || 4747;
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: Number(PORT), host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
