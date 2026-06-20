# 3. Metodología

## 3.1 Overview del Framework Process-Guard
Process-Guard Control Arena se presenta como un middleware de validación ("sandbox") para procesos de ingeniería de software. A diferencia de las evaluaciones convencionales que analizan el modelo generador tras su desarrollo, nuestro framework se inserta directamente en el ciclo de vida del software (SDLC). Permite someter cualquier **artefacto** (sea un documento de requisitos, diseño arquitectónico, código fuente o un "skill" de agente) a una **evaluación triple y simultánea** por parte de diferentes Large Language Models (LLMs). El sistema consolida los reportes, filtra discrepancias causadas por alucinaciones y otorga veredictos basados en un modelo de dos fases (Gates de veto y puntuaciones ponderadas) que determinan si el artefacto es apto para avanzar a la siguiente fase de desarrollo.

## 3.2 Tipos de Artefactos y Fundamentos Métricos
Para evitar la subjetividad inherente en las respuestas de los LLMs, se han diseñado rúbricas estrictas mapeadas a estándares industriales. El framework categoriza los artefactos en cuatro tipos principales:
*   **A1: Requisitos** (ISO/IEC/IEEE 29148:2018 y SWEBOK v4.0).
*   **A2: Diseño de Arquitectura** (ISO/IEC/IEEE 42010:2022, SWEBOK v4.0 e ISO/IEC 25010:2023).
*   **A3: Código Fuente** (ISO/IEC 25010:2023, SWEBOK v4.0 y OWASP Top 10 / CWE para código tradicional).
*   **A4: Skills / Prompts de Agente** (OWASP Top 10 para LLM Applications 2025 y NIST AI RMF 1.0).

La rúbrica separa explícitamente la seguridad tradicional (OWASP/CWE) en código de aplicación (`A3`), de los riesgos específicos de prompt injection y fuga de system prompts en los skills agénticos (`A4`), evitando errores de categoría metodológicos en la auditoría.

## 3.3 Protocolo de Evaluación Multi-Modelo y Orquestación
El sistema se despliega en un **VPS (Virtual Private Server)**, utilizando **Fastify (Node.js)** como framework principal debido a su alto rendimiento y baja sobrecarga. Para prevenir timeouts HTTP causados por el tiempo de inferencia de las APIs, las llamadas a los modelos de estado del arte (Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o) se gestionan a través de una cola de tareas asíncrona implementada con **BullMQ y Redis**.
Para simplificar la infraestructura y la gestión de credenciales, el orquestador consume la API de **OpenRouter** como *gateway* unificado. Esto permite redirigir las evaluaciones a múltiples proveedores (Anthropic, Google, OpenAI) usando una única llave de API (*API key*) estandarizada bajo un solo protocolo. El protocolo de evaluación requiere que la temperatura (`T`) de todos los modelos esté configurada en `0.0` para maximizar el determinismo y la reproducibilidad de la auditoría. El "prompt" evaluador instruye explícitamente a la IA a asumir el rol de auditor certificado, forzando la salida en un formato `JSON` estricto que contiene la validación de los gates de veto, el desglose de métricas por criterio compensatorio y la evidencia textual citada.

## 3.4 Sintetizador, Gates de Veto y Consenso
Una limitación conocida del "live coding" con IA es la generación de código plausible pero lógicamente incorrecto (alucinaciones) o inseguro. Process-Guard aborda este riesgo mediante un sintetizador de dos fases:

1.  **Fase 1 — Gates de Veto (Binarios):** El sintetizador evalúa los criterios de veto clave del artefacto (ej. corrección funcional o vulnerabilidad de seguridad crítica). Si algún gate resulta en `NO_CUMPLE` en alguna evaluación, el artefacto se marca como **REPROBADO** de manera automática y se detiene el proceso, omitiendo cualquier cálculo de calificación final.
2.  **Fase 2 — Calificación Compensatoria:** Si todos los gates son aprobados, el sintetizador analiza las puntuaciones compensatorias individuales ($s_1, s_2, s_3$) y calcula la desviación estándar ($\sigma$) del consenso:
    *   Si $\sigma < 10$, se asume un alto nivel de consenso y la Calificación Final ($CF$) es el promedio simple de las puntuaciones:
        $$ CF = \frac{s_1 + s_2 + s_3}{3} $$
    *   Si $\sigma > 20$, se asume una discrepancia crítica (probable alucinación de un modelo). El sistema detecta al modelo "outlier" (mayor distancia absoluta a la mediana) y calcula la $CF$ aplicando una fuerte penalización (peso de $0.1$ al outlier y $0.45$ a los dos consensuados):
        $$ CF_{discrepancia} = (0.45 \times s_{consenso1}) + (0.45 \times s_{consenso2}) + (0.1 \times s_{outlier}) $$
3.  **Abstención y Estado Inconcluso:** Si hay criterios marcados como no evaluables (`N/E`) por falta de contexto, el peso se redistribuye. Si el peso total evaluado es menor al 60% (`peso_evaluado_pct < 60`), el sintetizador emite un veredicto de **INCONCLUSO** y deriva el análisis a un auditor humano.

Los veredictos finales automatizados se definen en base a la $CF$: **APROBADO** ($\ge 85$), **APROBADO CON OBSERVACIONES** ($70-84$) y **REPROBADO** ($< 70$).

## 3.5 Decisiones de Diseño
El diseño de la Arena se fundamenta en cuatro decisiones críticas:
1.  **Modelos Heterogéneos:** Emplear modelos de diferentes proveedores (Anthropic, Google, OpenAI) asegura sesgos de entrenamiento distintos, lo que resulta en una validación cruzada genuina y reduce el riesgo de colapso de consenso sobre una alucinación específica.
2.  **Evaluación Continua por Artefactos:** Transicionar de evaluar únicamente código a evaluar también contexto y requisitos permite detectar problemas lógicos desde las primeras etapas del ciclo de vida del software, previniendo la acumulación de deuda técnica.
3.  **Modelo de Control Basado en Vetos (Gates):** Impedir que una excelente modularidad o documentación compense un fallo crítico de seguridad o un defecto lógico insalvable mediante el aislamiento de criterios de tipo "gate".
4.  **Verificación Estructural de Skills (SDK):** Para los artefactos tipo "Skill" (Instrucciones de sistema), la compatibilidad estructural con las capacidades del SDK (límite de tokens, soporte de function calling) se evalúa obligatoriamente a través de un gate de veto en el modelo evaluador nativo.
