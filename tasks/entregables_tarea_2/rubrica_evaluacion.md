# Rúbricas de Evaluación: Process-Guard Control Arena

Estas rúbricas definen los criterios estandarizados que los modelos de lenguaje utilizarán para auditar los artefactos en la Arena de Evaluación. Las rúbricas se fundamentan en estándares internacionales (SWEBOK v3.0 e ISO/IEC 25010) para garantizar que la evaluación sea rigurosa, imparcial y técnica, distanciándose de opiniones subjetivas.

## 1. Evaluación de Requisitos (Artefacto Tipo A1)
Esta rúbrica se aplica a especificaciones de software, historias de usuario, o documentos de requerimientos funcionales y no funcionales.

| ID | Criterio | Fuente Normativa | Peso | Descripción para el Auditor (Prompt) |
|----|----------|------------------|------|---------------------------------------|
| **C1** | Completitud | SWEBOK § Requirements | 20% | ¿El documento aborda todos los escenarios posibles, incluyendo casos borde y excepciones? |
| **C2** | Consistencia | SWEBOK § Requirements | 20% | ¿El documento está libre de contradicciones lógicas entre diferentes requisitos? |
| **C3** | No ambigüedad | IEEE 830 | 20% | ¿Cada requerimiento tiene una y solo una interpretación posible por parte de un desarrollador? |
| **C4** | Verificabilidad | SWEBOK § V&V | 20% | ¿Es posible diseñar una prueba objetiva (criterio de aceptación) que demuestre que el requisito se ha cumplido? |
| **C5** | Trazabilidad | SWEBOK § Requirements | 20% | ¿El requisito se vincula claramente a un objetivo de negocio o de sistema superior? |

---

## 2. Evaluación de Código y Skills (Artefactos Tipo A3 y A4)
Esta rúbrica se aplica a fragmentos de código fuente, instrucciones de sistema (skills) y módulos arquitectónicos listos para integración.

| ID | Criterio | Fuente Normativa | Peso | Descripción para el Auditor (Prompt) |
|----|----------|------------------|------|---------------------------------------|
| **C1** | Adecuación Funcional | ISO 25010 § Functional Suitability | 15% | ¿El código implementa todas las funciones especificadas en los requisitos o en el contexto proporcionado? |
| **C2** | Corrección Funcional | ISO 25010 § Functional Correctness | 15% | ¿El código proporciona los resultados correctos y precisos de acuerdo con la lógica esperada? |
| **C3** | Seguridad | SWEBOK § Software Security | 20% | ¿Existen vulnerabilidades potenciales (ej. inyección, falta de validación de inputs, manejo inseguro de estado)? |
| **C4** | Mantenibilidad (Modularidad)| ISO 25010 § Maintainability | 10% | ¿El código o la instrucción es altamente cohesivo y de bajo acoplamiento, facilitando cambios futuros? |
| **C5** | Documentación de Código | SWEBOK § Software Maintenance | 10% | ¿La lógica está adecuadamente documentada, comentada y tipada para la comprensión de terceros? |
| **C6** | Fiabilidad (Manejo de Errores)| ISO 25010 § Reliability | 15% | ¿El software previene fallas y maneja las excepciones de manera controlada y descriptiva? |
| **C7** | Trazabilidad con Requisitos | SWEBOK § Software Requirements | 10% | ¿Se puede trazar la función de este código a un requisito funcional explícito? |
| **C8** | Portabilidad | ISO 25010 § Portability | 5% | ¿El código depende excesivamente de librerías o entornos específicos no estandarizados? |
