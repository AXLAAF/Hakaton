# 3. Metodología

## 3.1 Overview del Framework Process-Guard
Process-Guard Control Arena se presenta como un middleware de validación ("sandbox") para procesos de ingeniería de software. A diferencia de las evaluaciones convencionales que analizan el modelo generador tras su desarrollo, nuestro framework se inserta directamente en el ciclo de vida del software (SDLC). Permite someter cualquier **artefacto** (sea un documento de requisitos, una "skill" de agente, o código fuente) a una **evaluación triple y simultánea** por parte de diferentes Large Language Models (LLMs). El sistema consolida los reportes, filtra discrepancias causadas por alucinaciones y otorga una calificación final cuantificable (0-100) que determina si el artefacto es apto para avanzar a la siguiente fase de desarrollo.

## 3.2 Tipos de Artefactos y Fundamentos Métricos
Para evitar la subjetividad inherente en las respuestas de los LLMs, se han diseñado rúbricas estrictas mapeadas a estándares industriales. El framework categoriza los artefactos en cinco tipos principales (A1: Requisitos, A2: Diseño, A3: Skills/Instrucciones, A4: Código, A5: Proyecto Integrado).
La evaluación de la correctitud, seguridad y mantenibilidad de los artefactos de desarrollo (A3 y A4) se rige basándose en el estándar de calidad **ISO/IEC 25010** en conjunto con el **OWASP Top 10 para LLM Applications** (para mitigar vulnerabilidades como prompt injection o manejo inseguro de estado). Por otro lado, los artefactos de planificación y diseño (A1 y A2) son auditados de acuerdo con el **SWEBOK v3.0**, **ISO/IEC/IEEE 29148** (Ingeniería de Requisitos), **ISO/IEC/IEEE 42010** (Descripción Arquitectónica) y los lineamientos de mitigación de riesgos del **NIST AI RMF** (Risk Management Framework).

## 3.3 Protocolo de Evaluación Multi-Modelo
El sistema orquesta llamadas asíncronas a las APIs de tres modelos de estado del arte heterogéneos (e.g., Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o).
El protocolo de evaluación requiere que la temperatura (`T`) de todos los modelos esté configurada en `0.0` para maximizar el determinismo y la reproducibilidad de la auditoría. El "prompt" evaluador instruye explícitamente a la IA a asumir el rol de auditor certificado, forzando la salida en un formato `JSON` estricto que contiene el desglose de métricas por criterio y una métrica parcial.

## 3.4 Sintetizador y Detección de Alucinaciones
Una limitación conocida del "live coding" con IA es la generación de código plausible pero lógicamente incorrecto (alucinaciones). Process-Guard aborda este riesgo mediante validación cruzada. El componente sintetizador recolecta las métricas parciales ($s_1, s_2, s_3$) y calcula la desviación estándar ($\sigma$). 

Si $\sigma < 10$, se asume un alto nivel de consenso y la Calificación Final ($CF$) es el promedio de las puntuaciones.
Si $\sigma > 20$, se asume una discrepancia crítica indicativa de una probable alucinación por parte de uno de los modelos. En este escenario, el sistema identifica al modelo atípico o "outlier" (aquel cuya puntuación difiere más de la mediana) y aplica una fuerte penalización en el promedio ponderado, asignándole un peso de apenas $0.1$, mientras distribuye el peso restante ($0.45$) entre los modelos que sí alcanzaron consenso.
$$ CF_{consenso} = \frac{s_1 + s_2 + s_3}{3} $$
$$ CF_{discrepancia} = (0.45 \times s_{consenso1}) + (0.45 \times s_{consenso2}) + (0.1 \times s_{outlier}) $$

## 3.5 Decisiones de Diseño
El diseño de la Arena se fundamenta en tres decisiones críticas:
1. **Modelos Heterogéneos:** Emplear modelos de diferentes proveedores (Anthropic, Google, OpenAI) asegura sesgos de entrenamiento distintos, lo que resulta en una validación cruzada genuina y reduce el riesgo de colapso de consenso sobre una alucinación específica.
2. **Evaluación Continua por Artefactos:** Transicionar de evaluar únicamente código a evaluar también contexto y requisitos permite detectar problemas lógicos desde las primeras etapas del ciclo de vida del software, previniendo la acumulación de deuda técnica.
3. **Métrica Estricta en lugar de "Linting":** La parametrización en base a ISO 25010 transforma validaciones subjetivas en métricas cuantitativas reproducibles, brindando un indicador confiable de seguridad.
4. **Verificación Nativa de Skills (SDK):** Para los artefactos tipo "Skill" (Instrucciones de sistema), la Arena realiza una verificación nativa. Cada modelo evalúa la *Skill* comprobando su compatibilidad estructural con las capacidades exclusivas de su propio SDK (límites de tokens, soporte de *function calling* y restricciones del entorno).
