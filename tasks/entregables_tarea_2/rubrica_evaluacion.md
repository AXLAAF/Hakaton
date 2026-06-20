# Rúbricas de Evaluación: Process-Guard Control Arena

Estas rúbricas definen los criterios estandarizados que los modelos de lenguaje utilizarán para auditar los artefactos en la Arena de Evaluación. Las rúbricas se fundamentan en estándares internacionales (SWEBOK v3.0, ISO/IEC 25010, OWASP Top 10 para LLMs, NIST AI RMF, ISO/IEC/IEEE 29148 y 42010) para garantizar que la evaluación sea rigurosa, imparcial y técnica, distanciándose de opiniones subjetivas.

## 1. Evaluación de Requisitos (Artefacto Tipo A1)
Esta rúbrica se aplica a especificaciones de software, historias de usuario, o documentos de requerimientos funcionales y no funcionales.

| ID | Criterio | Fuente Normativa | Peso | Descripción para el Auditor (Prompt) |
|----|----------|------------------|------|---------------------------------------|
| **C1** | Completitud | SWEBOK § Requirements | 20% | ¿El documento aborda todos los escenarios posibles, incluyendo casos borde y excepciones? |
| **C2** | Consistencia | SWEBOK § Requirements | 20% | ¿El documento está libre de contradicciones lógicas entre diferentes requisitos? |
| **C3** | No ambigüedad | ISO/IEC/IEEE 29148 / IEEE 830 | 20% | ¿Cada requerimiento tiene una y solo una interpretación posible por parte de un desarrollador? |
| **C4** | Verificabilidad | SWEBOK § V&V | 20% | ¿Es posible diseñar una prueba objetiva (criterio de aceptación) que demuestre que el requisito se ha cumplido? |
| **C5** | Trazabilidad | BABOK / SWEBOK | 20% | ¿El requisito se vincula claramente a un objetivo de negocio o de sistema superior? |

---

## 2. Evaluación de Diseño de Arquitectura (Artefacto Tipo A2)
Esta rúbrica se aplica a diagramas de flujo, documentos UML, descripciones arquitectónicas y registros de decisiones técnicas (ADRs).

| ID | Criterio | Fuente Normativa | Peso | Descripción para el Auditor (Prompt) |
|----|----------|------------------|------|---------------------------------------|
| **C1** | Cohesión y Acoplamiento | SWEBOK § Software Design | 25% | ¿El diseño promueve alta cohesión dentro de los módulos y bajo acoplamiento entre ellos? |
| **C2** | Seguridad por Diseño | NIST AI RMF / OWASP | 25% | ¿Se identifican superficies de ataque y se aplican principios de mínimo privilegio y defensa en profundidad? |
| **C3** | Eficiencia y Escalabilidad | ISO 25010 § Performance Efficiency | 20% | ¿El diseño contempla un manejo adecuado de recursos y soporta crecimiento sin deterioro estructural? |
| **C4** | Trazabilidad hacia Requisitos | SWEBOK / TOGAF | 15% | ¿Todas las decisiones de diseño pueden ser directamente justificadas y vinculadas a un requerimiento funcional (A1)? |
| **C5** | Patrones y Estandarización | ISO/IEC/IEEE 42010 | 15% | ¿Se utilizan patrones de diseño y arquitectónicos reconocidos, justificando su elección frente a alternativas? |

---

## 3. Evaluación de Código y Skills (Artefactos Tipo A3 y A4)
Esta rúbrica se aplica a fragmentos de código fuente, instrucciones de sistema (skills) y módulos arquitectónicos listos para integración.

| ID | Criterio | Fuente Normativa | Peso | Descripción para el Auditor (Prompt) |
|----|----------|------------------|------|---------------------------------------|
| **C1** | Adecuación Funcional | ISO 25010 § Functional Suitability | 15% | ¿El código implementa todas las funciones especificadas en los requisitos o en el contexto proporcionado? |
| **C2** | Corrección Funcional | ISO 25010 § Functional Correctness | 15% | ¿El código proporciona los resultados correctos y precisos de acuerdo con la lógica esperada? |
| **C3** | Seguridad | OWASP Top 10 para LLMs | 20% | ¿Existen vulnerabilidades potenciales (ej. inyección, prompt leaking, falta de validación de inputs)? |
| **C4** | Mantenibilidad (Modularidad)| ISO 25010 § Maintainability | 10% | ¿El código o la instrucción es altamente cohesivo y de bajo acoplamiento, facilitando cambios futuros? |
| **C5** | Documentación de Código | SWEBOK § Software Maintenance | 10% | ¿La lógica está adecuadamente documentada, comentada y tipada para la comprensión de terceros? |
| **C6** | Fiabilidad (Manejo de Errores)| ISO 25010 § Reliability | 15% | ¿El software previene fallas y maneja las excepciones de manera controlada y descriptiva? |
| **C7** | Trazabilidad con Requisitos | SWEBOK § Software Requirements | 10% | ¿Se puede trazar la función de este código a un requisito funcional explícito? |
| **C8** | Portabilidad | ISO 25010 § Portability | 5% | ¿El código depende excesivamente de librerías o entornos específicos no estandarizados? |
| **C9** | Compatibilidad Nativa SDK (Solo Skills) | Arquitectura de Control | 10% (Extra) | ¿La *Skill* es estructuralmente compatible con el SDK evaluador (límites de tokens, soporte de *function calling*)? |
