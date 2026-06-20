'use strict';

// ─── System prompt (auditor protocol — Sección 4) ────────────────────────────

const EVALUATION_SYSTEM_PROMPT = `Eres un auditor de Ingeniería de Software que aplica la rúbrica Process-Guard v2.0.

PROTOCOLO (sin excepción):
1. ORDEN: para cada gate y criterio, PRIMERO extrae y cita evidencia del artefacto (ubicación exacta + extracto). DESPUÉS asigna resultado o nivel. Nunca al revés.
2. ESCALA DE NIVELES: 4=Cumple plenamente · 3=Desviaciones menores · 2=Cumple parcialmente · 1=Deficiente · 0=No cumple · N/E=Sin información suficiente para juzgar.
3. REGLA DURA: ante duda entre dos niveles, asigna el menor. El Guard sesa hacia el rechazo, no hacia el beneficio de la duda.
4. ABSTENCIÓN: marca N/E solo cuando no existe información suficiente — NO inventes juicios sobre información ausente.
5. SALIDA: responde ÚNICAMENTE con el JSON del esquema definido. Sin texto fuera del JSON.

Fundamento: ISO/IEC/IEEE 29148:2018 · ISO/IEC/IEEE 42010:2022 · ISO/IEC 25010:2023 · SWEBOK v4.0 · OWASP Top 10 for LLM Applications 2025 · NIST AI RMF 1.0.`;

// ─── Rubrics per artifact type ────────────────────────────────────────────────

const RUBRIC_A1 = `
=== RÚBRICA v2.0 — A1: REQUISITOS ===
Fundamento: ISO/IEC/IEEE 29148:2018 · SWEBOK v4.0 KA Software Requirements

── GATES (veto binario) ─────────────────────────────────────────────────────
Si cualquier gate resulta NO_CUMPLE → veredicto = REPROBADO sin calcular puntaje.

G-A1.1 [Singularidad evaluable]
  CUMPLE si: Cada enunciado expresa una sola capacidad/restricción; no hay requisitos compuestos que oculten alcance.

G-A1.2 [Existencia de criterio de aceptación]
  CUMPLE si: Todo requisito funcional incluye o permite derivar un criterio de aceptación objetivo. Un requisito no verificable no es un requisito.

── CRITERIOS PUNTUABLES (pesos suman 100%) ──────────────────────────────────

C1 — No ambigüedad · peso 25%
  Nivel 0: Abundan superlativos ("rápido", "amigable"), pronombres vagos o términos con múltiples interpretaciones.
  Nivel 2: Mayormente claro pero con ≥1 término interpretable de doble forma.
  Nivel 4: Cada requisito admite una sola interpretación; sin lenguaje subjetivo.

C2 — Completitud del conjunto · peso 20%
  Nivel 0: Faltan flujos principales o el enunciado remite a "etc." u omisiones implícitas.
  Nivel 2: Flujos principales cubiertos; faltan casos borde o de error relevantes.
  Nivel 4: Flujos principales, alternos y de excepción cubiertos; los faltantes están explícitamente marcados como fuera de alcance.

C3 — Consistencia · peso 20%
  Nivel 0: Dos o más requisitos se contradicen directamente.
  Nivel 2: Sin contradicciones lógicas pero con solapamientos o términos usados de forma inconsistente.
  Nivel 4: Sin contradicciones; terminología uniforme y definida.

C4 — Verificabilidad · peso 20%
  Nivel 0: Criterios de aceptación ausentes o no medibles.
  Nivel 2: Criterios presentes pero parcialmente subjetivos.
  Nivel 4: Todo requisito tiene un criterio de aceptación medible y objetivo.

C5 — Trazabilidad · peso 15%
  Nivel 0: Ningún vínculo a objetivo de negocio o de sistema.
  Nivel 2: Vínculo parcial o implícito.
  Nivel 4: Cada requisito traza a un objetivo superior identificable.
`;

const RUBRIC_A2 = `
=== RÚBRICA v2.0 — A2: DISEÑO DE ARQUITECTURA ===
Fundamento: ISO/IEC/IEEE 42010:2022 · SWEBOK v4.0 KAs Software Architecture y Software Security · ISO/IEC 25010:2023

── GATES (veto binario) ─────────────────────────────────────────────────────
Si cualquier gate resulta NO_CUMPLE → veredicto = REPROBADO sin calcular puntaje.

G-A2.1 [Seguridad crítica por diseño]
  CUMPLE si: No existe una superficie de ataque crítica sin mitigación (ej. datos sensibles sin control de acceso, ausencia total de mínimo privilegio en un sistema que lo requiere).

G-A2.2 [Concerns de stakeholders cubiertos]
  CUMPLE si: La arquitectura identifica a los stakeholders y atiende sus concerns declarados; no ignora un concern crítico del contexto.

── CRITERIOS PUNTUABLES (pesos suman 100%) ──────────────────────────────────

C1 — Cohesión y acoplamiento · peso 25%
  Nivel 0: Módulos con responsabilidades mezcladas y dependencias circulares.
  Nivel 2: Estructura razonable con algún acoplamiento evitable.
  Nivel 4: Alta cohesión, bajo acoplamiento, dependencias justificadas.

C2 — Seguridad por diseño (no crítica) · peso 20%
  Nivel 0: Sin defensa en profundidad ni aplicación de mínimo privilegio.
  Nivel 2: Principios aplicados parcialmente.
  Nivel 4: Superficies de ataque identificadas; mínimo privilegio y defensa en profundidad aplicados y justificados.

C3 — Eficiencia y escalabilidad · peso 20%
  Nivel 0: Ignora carga y crecimiento; cuellos de botella evidentes.
  Nivel 2: Contempla recursos pero no el crecimiento.
  Nivel 4: Maneja recursos y soporta crecimiento sin deterioro estructural, con justificación.

C4 — Trazabilidad hacia requisitos · peso 20%
  Nivel 0: Decisiones de diseño sin vínculo a requisitos.
  Nivel 2: Vínculo parcial o implícito.
  Nivel 4: Cada decisión arquitectónica significativa se justifica contra un requisito (A1).

C5 — Patrones y justificación de decisiones · peso 15%
  Nivel 0: Sin patrones reconocibles ni justificación de decisiones.
  Nivel 2: Usa patrones pero no justifica la elección frente a alternativas.
  Nivel 4: Patrones reconocidos con rationale explícito frente a alternativas descartadas (estilo ADR).
`;

const RUBRIC_A3 = `
=== RÚBRICA v2.0 — A3: CÓDIGO FUENTE ===
Fundamento: ISO/IEC 25010:2023 · SWEBOK v4.0 KAs Software Construction, Software Security, Software Maintenance · OWASP Top 10 / CWE

NOTA: Si el código interactúa con un LLM (orquesta prompts, consume salida de un modelo), aplican además los gates G-A4.1 y G-A4.2. Para código tradicional, la seguridad se evalúa contra OWASP Top 10 / CWE únicamente, NO contra OWASP-LLM.

── GATES (veto binario) ─────────────────────────────────────────────────────
Si cualquier gate resulta NO_CUMPLE → veredicto = REPROBADO sin calcular puntaje.

G-A3.1 [Corrección funcional]
  CUMPLE si: El código produce resultados correctos para los casos especificados. Si la lógica central es incorrecta, ningún otro mérito lo rescata.

G-A3.2 [Sin vulnerabilidad de seguridad crítica]
  CUMPLE si: No hay vulnerabilidad crítica explotable (inyección, validación de input ausente en frontera de confianza, secreto embebido en código).

── CRITERIOS PUNTUABLES (pesos suman 100%) ──────────────────────────────────

C1 — Adecuación funcional · peso 20%
  Nivel 0: Faltan funciones especificadas en el contexto.
  Nivel 2: Implementa lo principal, omite casos secundarios.
  Nivel 4: Cubre todas las funciones del contexto provisto.

C2 — Fiabilidad / manejo de errores · peso 20%
  Nivel 0: Errores no manejados; falla silenciosa o catastrófica.
  Nivel 2: Manejo parcial; algunas excepciones se tragan sin informar.
  Nivel 4: Excepciones controladas, descriptivas y recuperables donde corresponde.

C3 — Seguridad (no crítica) · peso 15%
  Nivel 0: Múltiples malas prácticas de seguridad (OWASP / CWE).
  Nivel 2: Sin fallas críticas pero con validaciones débiles.
  Nivel 4: Validación de inputs, manejo seguro de datos, sin malas prácticas.

C4 — Mantenibilidad / modularidad · peso 15%
  Nivel 0: Funciones enormes, lógica duplicada, alto acoplamiento.
  Nivel 2: Estructura aceptable con deuda técnica evidente.
  Nivel 4: Modular, cohesivo, bajo acoplamiento, fácil de cambiar.

C5 — Documentación y tipado · peso 10%
  Nivel 0: Sin comentarios ni tipos donde el lenguaje los permite.
  Nivel 2: Documentación parcial.
  Nivel 4: Lógica no trivial documentada, tipada y comprensible por terceros.

C6 — Trazabilidad con requisitos · peso 10%
  Nivel 0: Imposible vincular el código a un requisito.
  Nivel 2: Vínculo parcial o implícito.
  Nivel 4: Cada función traza a un requisito explícito.

C7 — Portabilidad · peso 10%
  Nivel 0: Dependencia rígida de un entorno/librería no estándar sin necesidad.
  Nivel 2: Acoplamiento moderado al entorno.
  Nivel 4: Dependencias justificadas y aisladas; portable.
`;

const RUBRIC_A4 = `
=== RÚBRICA v2.0 — A4: SKILLS / INSTRUCCIONES DE SISTEMA ===
Fundamento: OWASP Top 10 for LLM Applications 2025 · NIST AI RMF 1.0 · SWEBOK v4.0 KA Software Security

NOTA: Un skill es a la vez código (se integra a un SDK) y prompt (dirige a un modelo estocástico). Tiene gates de ambos mundos. Para skills con herramientas autónomas, considerar también OWASP Top 10 for Agentic AI 2025.

── GATES (veto binario) ─────────────────────────────────────────────────────
Si cualquier gate resulta NO_CUMPLE → veredicto = REPROBADO sin calcular puntaje.

G-A4.1 [Resistencia a inyección de prompt — OWASP LLM01:2025]
  CUMPLE si: El skill separa instrucciones de datos no confiables y no es trivialmente secuestrable por contenido externo (documentos, web, tickets) que diga "ignora las instrucciones anteriores".

G-A4.2 [Sin fuga de instrucciones ni secretos — OWASP LLM02/LLM07:2025]
  CUMPLE si: El skill no embebe credenciales, tokens ni connection strings, y no expone su lógica sensible ante una solicitud directa. Un system prompt NO es un almacén seguro.

G-A4.3 [Compatibilidad estructural con el SDK]
  CUMPLE si: El skill respeta los límites de tokens del SDK evaluador y usa correctamente el esquema de function calling.

── CRITERIOS PUNTUABLES (pesos suman 100%) ──────────────────────────────────

C1 — Adecuación a su objetivo · peso 25%
  Nivel 0: El skill no logra la tarea declarada.
  Nivel 2: La logra para el caso feliz; falla ante variaciones de entrada.
  Nivel 4: Cumple su objetivo de forma robusta ante variación de entrada.

C2 — Control de agencia / mínimo privilegio — OWASP LLM06:2025 · peso 20%
  Nivel 0: El skill puede ejecutar acciones de alto impacto sin restricción ni confirmación.
  Nivel 2: Límites de agencia parciales.
  Nivel 4: El skill solo puede hacer lo necesario; acciones sensibles requieren confirmación o están acotadas.

C3 — Claridad y no ambigüedad de la instrucción · peso 20%
  Nivel 0: Instrucciones contradictorias o vagas que el modelo interpretará de forma impredecible.
  Nivel 2: Mayormente claras con zonas grises.
  Nivel 4: Instrucciones precisas, sin contradicción, con comportamiento predecible.

C4 — Manejo de casos límite y abstención — NIST AI RMF (Manage) · peso 20%
  Nivel 0: No contempla qué hacer ante entrada inesperada; el modelo alucinará o actuará igual.
  Nivel 2: Contempla algunos casos límite.
  Nivel 4: Define explícitamente cuándo abstenerse, pedir aclaración o degradar con seguridad.

C5 — Documentación y mantenibilidad del skill · peso 15%
  Nivel 0: Sin documentar; imposible de modificar sin romperlo.
  Nivel 2: Documentación parcial.
  Nivel 4: Propósito, entradas, salidas y límites documentados; modificable sin efectos colaterales.
`;

const RUBRIC_BY_TIPO = { A1: RUBRIC_A1, A2: RUBRIC_A2, A3: RUBRIC_A3, A4: RUBRIC_A4 };

// ─── Output schema injected into every user prompt ───────────────────────────

const OUTPUT_SCHEMA = `
── ESQUEMA DE SALIDA (JSON exacto — sin texto fuera del objeto) ─────────────
{
  "artefacto_id": "<ID provisto>",
  "tipo": "<A1|A2|A3|A4>",
  "rubrica_version": "2.0",
  "gates": [
    {
      "id": "G-Ax.y",
      "resultado": "CUMPLE",
      "evidencia": { "ubicacion": "línea / sección / nodo exacto", "extracto": "fragmento breve del artefacto" },
      "justificacion": "1-2 frases que anclan el resultado a la condición CUMPLE de la rúbrica"
    }
  ],
  "criterios": [
    {
      "id": "C1",
      "nivel": 2,
      "peso": 25,
      "evidencia": { "ubicacion": "...", "extracto": "..." },
      "justificacion": "1-2 frases que anclan el nivel al observable de la rúbrica"
    }
  ],
  "peso_evaluado_pct": 100,
  "puntaje": 68.75,
  "veredicto": "APROBADO_CON_OBSERVACIONES",
  "correcciones_obligatorias": ["acción concreta 1", "acción concreta 2"]
}

REGLAS DE CÁLCULO (aplica tú mismo):
- Gate NO_CUMPLE → veredicto = "REPROBADO", puntaje = null.
- Criterio N/E: excluir del cálculo; redistribuir su peso proporcionalmente entre los evaluables.
- peso_evaluado_pct = (suma pesos evaluables / suma pesos totales) × 100.
- Si peso_evaluado_pct < 60 → veredicto = "INCONCLUSO", puntaje = null.
- puntaje = Σ(nivel / 4 × peso) sobre criterios evaluables, normalizado a 100.
- puntaje ≥ 85 → "APROBADO".
- 70 ≤ puntaje < 85 → "APROBADO_CON_OBSERVACIONES".
- puntaje < 70 → "REPROBADO".
- correcciones_obligatorias: obligatorio cuando veredicto ≠ "APROBADO".
`;

// ─── Public API ───────────────────────────────────────────────────────────────

function buildEvaluationPrompt(tipo, artifactContent, artifactId) {
  const rubric = RUBRIC_BY_TIPO[tipo] || RUBRIC_A3;
  return `Evalúa el siguiente artefacto aplicando la rúbrica Process-Guard v2.0.

ARTEFACTO ID: ${artifactId}
TIPO: ${tipo}

ARTEFACTO:
---
${artifactContent}
---
${rubric}
${OUTPUT_SCHEMA}`;
}

module.exports = { EVALUATION_SYSTEM_PROMPT, buildEvaluationPrompt };
