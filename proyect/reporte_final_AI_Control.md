# Process-Guard Control Arena: Un framework de AI Control para mitigar la "Guerra del Código"

## 1. Resumen (Objetivo General)
Con la proliferación de modelos de lenguaje generativos en el desarrollo de software, los programadores construyen herramientas a un ritmo acelerado. Sin embargo, esta práctica (denominada "La Guerra del Código") frecuentemente ignora los procesos formales de la Ingeniería de Software y su ciclo de vida. Esto genera altos volúmenes de deuda técnica, código inseguro y alucinaciones algorítmicas. 

Para solucionar esto proponemos **Process-Guard Control Arena**, cuyo objetivo general es ser un *framework* de **AI Control** con las siguientes características:
1. **Flexibilidad Total:** La herramienta puede recibir cualquier artefacto del proyecto (un archivo de contexto, un documento de requisitos, una *skill* de Cursor, o todo el proyecto de software completo).
2. **Evaluación de "3 contra 1":** Las IAs no hacen cosas separadas. Las 3 IAs evalúan el **mismo** artefacto simultáneamente basándose en métricas de procesos de ingeniería de software.
3. **Síntesis y Cuantificación:** El sistema consolida los reportes en un resumen general que exalta las discrepancias y otorga una calificación final cuantificable (un número sólido) para determinar si el artefacto es seguro y usable antes de avanzar en el ciclo de vida.

## 2. Introducción y Planteamiento del Problema
Tradicionalmente, los procesos de ingeniería de software (educción de requisitos, validación, pruebas) eran ineludibles. Hoy, un desarrollador confía a ciegas en el código generado por IA. La omisión de estos procesos provoca un aumento significativo de bugs y fallos de seguridad (estimado en un 80% superior en entornos carentes de metodologías formales). 

Existe un riesgo crítico en usar IA para el desarrollo de software público sin mecanismos de verificación. No basta con depender de la "Gobernanza" (establecer reglas para sancionar corporaciones); se requiere un mecanismo técnico y preventivo de **AI Control**. Necesitamos herramientas que auditen, guíen y califiquen cuantitativamente si los artefactos generados son seguros, usables y tienen concordancia con los objetivos del proyecto.

## 3. Trabajos Relacionados y Marco de Referencia
Este proyecto toma inspiración de los actuales entornos de investigación y evaluación de seguridad en IA:
1. **Linux Arena (Redwood Research) y Control Arena:** Sandboxes donde los modelos interactúan con sistemas reales para evaluar si la IA opera dentro de límites de seguridad sistémicos.
2. **LMSYS Chatbot Arena:** Sistema de evaluación cruzada y validación de outputs por consenso.
3. **SWEBOK e ISOs de Software:** Fundamentos teóricos de calidad y ciclo de vida de ingeniería de software, utilizados como la métrica base para las evaluaciones de nuestra herramienta.

## 4. Metodología: "Process-Guard Control Arena"
La solución es un framework de validación integrado (a través de APIs de modelos). A diferencia de los linters tradicionales, Process-Guard divide la evaluación del proyecto en múltiples **tareas** a lo largo de todo el ciclo de vida del software.

### Arquitectura Multi-Modelo y El Nuevo Flujo de Evaluación por Tareas
Process-Guard se define por su arquitectura de "3 contra 1" (3 IAs evaluando 1 solo artefacto y colapsando en 1 calificación). El flujo por cada tarea es el siguiente:

1. **Flexibilidad Total del Input:** El usuario sube cualquier artefacto del proyecto (archivo de contexto, documento de requisitos, una *skill*, o el código completo).
2. **Evaluación Triple Simultánea:** Las 3 IAs (ej. Claude, Gemini, GPT-4) no hacen cosas separadas; evalúan el mismo artefacto simultáneamente. Cada una lo califica basándose en los procesos y métricas del ciclo de vida del software, entregando un reporte y una métrica individual.
3. **Síntesis y Cuantificación:** Al final, el sintetizador colapsa los 3 reportes individuales en un resumen general que exalta las discrepancias y alucinaciones. Como resultado final, Process-Guard otorga una **calificación cuantificable** (un número sólido de 0 a 100) para determinar si el artefacto es seguro y usable.

## 5. Resultados Esperados y Prototipo
Al implementar este prototipo mediante acceso API, se espera demostrar que la revisión cruzada anula las alucinaciones críticas a través de una **evaluación cuantificable**.

**Ejemplo Práctico de Cuantificación (Evaluación de un Artefacto - "Skill"):**
1. **Artefacto sometido:** Un archivo de *Skill* (instrucciones del sistema) diseñado para crear endpoints de manejo de datos.
2. **Evaluación de las 3 IAs (Basado en SWEBOK / ISO 25010):**
   * *IA 1 (Ej. Claude):* Detecta falta de requisitos de validación de inputs. Otorga una métrica parcial de **60/100**.
   * *IA 2 (Ej. GPT-4):* Alucina asumiendo erróneamente que el framework sanitizará los datos de forma nativa. Otorga una métrica de **95/100**.
   * *IA 3 (Ej. Gemini):* Coincide con la IA 1, advirtiendo sobre vulnerabilidades de seguridad y deuda técnica. Otorga una métrica de **55/100**.
3. **Síntesis y Calificación Final:** Process-Guard detecta la discrepancia de la IA 2 (identificando la alucinación por contraste). Sintetiza los reportes en un documento que expone el riesgo de inyección, y emite una **calificación cuantificable final de 70/100 (Estado: Requiere Revisión)**.

Este flujo estandarizado advierte al usuario de forma objetiva, mitigando los riesgos antes de avanzar en el ciclo de vida del software.

## 6. Discusión
Este enfoque transiciona la carga desde la "Gobernanza" corporativa/política hacia el **"AI Control"** técnico. En una industria emergente donde falta formación en ingeniería formal, es insostenible educar a cada desarrollador sobre todos los procesos existentes. En cambio, dotarlos de un verificador (Arena) que califique cuantitativamente sus proyectos establece un estándar de seguridad implacable y escalable.

## 7. Limitaciones y Riesgos de Doble Uso
* **Limitaciones:** El sistema introduce latencia y costos al requerir tres inferencias paralelas de LLMs avanzados por cada artefacto. Adicionalmente, el consenso entre modelos no ofrece garantías de correctitud matemática formal.
* **Doble Uso:** Entornos de evaluación automatizados ("Arenas") podrían ser empleados por actores maliciosos de manera inversa: automatizando la creación de malware y mutándolo iterativamente hasta lograr que la Arena le asigne una calificación de "seguro", logrando así evadir detectores de vulnerabilidades.

## 8. Referencias
* Redwood Research (Linux Arena - AI Control Framework)
* SWEBOK v3.0 (Software Engineering Body of Knowledge)
* Control Arena y LMSYS Chatbot Arena
