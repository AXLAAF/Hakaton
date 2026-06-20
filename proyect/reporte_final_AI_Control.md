# Process-Guard Control Arena: Un framework de AI Control para mitigar la "Guerra del Código"

## 1. Resumen
Con la proliferación de modelos de lenguaje generativos en los entornos de desarrollo (IDE) como Cursor o Copilot, los programadores pueden generar código de manera acelerada. Sin embargo, esta práctica ("La Guerra del Código") frecuentemente ignora los procesos formales de la Ingeniería de Software (SWEBOK, ISO), generando altos volúmenes de deuda técnica, vulnerabilidades y alucinaciones. Este documento propone **Process-Guard Control Arena**, un marco de trabajo de **AI Control** inspirado en *Linux Arena*, que implementa una "Arena de Evaluación" local. En este entorno, múltiples agentes de IA actúan de forma cruzada como auditores implacables de código, garantizando que todo el código generado cumpla con los requisitos, métricas de calidad y procesos arquitectónicos antes de ser aprobado.

## 2. Introducción y Planteamiento del Problema
Actualmente, el paradigma de desarrollo ha cambiado radicalmente. En el pasado, los procesos de ingeniería (como la educción de requisitos, validación, pruebas de regresión y diseño arquitectónico) eran obligatorios. Hoy, un desarrollador inserta un "prompt" y un modelo de inteligencia artificial genera la solución. Si bien esto incrementa la velocidad, destruye el proceso metódico:
- No existen requisitos trazables.
- No hay validación de arquitectura.
- Las IAs sufren de alucinaciones (ej. alteraciones lógicas que el desarrollador da por correctas).

A este fenómeno de producción masiva y caótica lo denominamos **"La Guerra del Código"**. Como consecuencia, observamos que los entregables generados sin un proceso de desarrollo tienen un incremento del 80% en bugs e inseguridades sistémicas. Existe un riesgo crítico en usar IA para crear productos sin un mecanismo de *Control*. No basta con la "Gobernanza" (que establece políticas y regulaciones externas para las compañías); se requiere un mecanismo técnico de **AI Control** para limitar, validar y auditar el comportamiento del modelo directamente en el entorno de desarrollo.

## 3. Trabajos Relacionados y Marco de Referencia
El presente trabajo toma fuerte inspiración de entornos de investigación y evaluación de seguridad de IA:
1. **Linux Arena (Redwood Research):** Un sandbox de control donde los modelos de IA interactúan con sistemas operativos reales, permitiendo a los investigadores evaluar si la IA se mantiene dentro de los límites de seguridad esperados en la ejecución de comandos.
2. **Control Arena (UK AI Safety Institute):** Entornos rigurosos de evaluación de modelos y agentes bajo presión.
3. **LMSYS Chatbot Arena:** Sistema de evaluación cruzada y validación en tiempo real.
4. **SWEBOK / Normas ISO SQA:** Los fundamentos teóricos de calidad de software y verificación que históricamente se utilizaban para medir y asegurar el desarrollo seguro.

## 4. Metodología: "Process-Guard Control Arena"
La solución propuesta es el diseño de un framework de control integrable en editores modernos (como Cursor a través de su API). Process-Guard actúa como un middleware de validación, forzando al código generado por IA a ser analizado por otras IAs en una "Arena de Control".

### Arquitectura de la Arena
Se implementa una configuración **multi-modelo** (ej. integrando Claude, Gemini y GPT-4). Para no depender de un solo modelo (y evitar sus sesgos/alucinaciones), la arquitectura delega 3 responsabilidades de control simultáneas a los diferentes modelos.

**Las 3 Skills de Evaluación (Auditores de la Arena):**
1. **Control de Requisitos:** Un agente de IA evalúa la especificación del proyecto, buscando ambigüedades, "huecos" lógicos y contrastando que el output del modelo generador coincida con el objetivo inicial de desarrollo.
2. **Control SQA (Gobernanza Técnica):** Un segundo agente evalúa la arquitectura generada contra los estándares SWEBOK/ISO, identificando deuda técnica, acoplamientos peligrosos y falta de procesos formales.
3. **Control de Testing:** Un tercer agente revisa la usabilidad, seguridad y diseña pruebas de regresión.

El código se inyecta en la API con el contexto de las skills y los estándares. Los modelos ejecutan sus evaluaciones y, finalmente, se consolida una matriz de veredictos cruzados.

## 5. Resultados Esperados y Prototipo
Al implementar este prototipo de "Arena", se espera demostrar que la evaluación cruzada automatizada reduce significativamente la introducción de deuda técnica en proyectos de desarrollo asistido. 
El flujo propuesto en `flujo_sqa_ia.md` genera reportes (ej. `requisitos_modelo1.md`, `sqa_modelo2.md`) que exponen las discrepancias. Si un modelo generó una alucinación (ej. una suma incorrecta), la matriz de resultados de la Arena identificará el fallo por falta de concordancia con la base de requisitos.

## 6. Discusión
Este enfoque transiciona la carga de la "Gobernanza" (política y burocrática) al **"AI Control"** técnico. En lugar de educar exhaustivamente a todos los desarrolladores junior del mundo sobre ingeniería de software, se les dota de un entorno (Arena) que audita implacablemente los entregables de IA. Esto sienta las bases para un desarrollo asistido verdaderamente escalable y seguro.

## 7. Limitaciones y Riesgos de Doble Uso
* **Limitaciones:** El sistema depende del acceso a modelos avanzados y variados mediante APIs, lo cual introduce fricciones de costos y latencia en tiempo de desarrollo. Además, el consenso entre modelos no es una garantía matemática de correctness.
* **Doble Uso:** Entornos de evaluación automatizados pueden ser utilizados por actores maliciosos de manera invertida, es decir, para optimizar ataques iterativos ("jailbreaks") evaluando cómo un sistema de seguridad detecta código malicioso, logrando así generar malware indetectable.

## 8. Referencias
* Redwood Research (Linux Arena)
* SWEBOK v3.0 (Software Engineering Body of Knowledge)
* UK AI Safety Institute (Evaluación de Control de Agentes de IA)
