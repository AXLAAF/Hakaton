# Rúbricas de Evaluación — Process-Guard Control Arena (v2.0)
 
**Documento de apoyo — XookTech**
 
**Proceso relacionado:** Auditoría de artefactos en la Arena de Evaluación (Process-Guard).
**Quién lo aplica:** Modelos de lenguaje (auditores) bajo el protocolo de la Sección 4; supervisado por el responsable de SQA.
**Objetivo:** Definir un instrumento de evaluación *medible, repetible y defendible* para auditar artefactos de software, distinguiendo lo que se puntúa de lo que se veta.
 
> **Por qué existe esta v2.** La versión anterior era un checklist con pesos: criterios + porcentajes + preguntas de sí/no, sin niveles intermedios definidos. Eso deja el umbral de "suficiente" al criterio de cada auditor, lo cual es inaceptable cuando el auditor es estocástico (un LLM). Esta versión añade tres cosas que faltaban: **escalas ancladas** (Sección 3.1), **criterios de veto** separados de los compensatorios (Sección 3.2), y un **protocolo de auditor** que controla la varianza entre corridas (Sección 4).
 
---
 
## 1. Alcance y supuestos
 
Esta rúbrica aplica a cuatro tipos de artefacto:
 
| Tipo | Artefacto | Rúbrica |
|------|-----------|---------|
| A1 | Requisitos: especificaciones, historias de usuario, requerimientos funcionales/no funcionales | Sección 5.1 |
| A2 | Diseño de arquitectura: diagramas, UML, descripciones arquitectónicas, ADRs | Sección 5.2 |
| A3 | Código fuente | Sección 5.3 |
| A4 | Skills: instrucciones de sistema / prompts listos para integrar en un SDK agéntico | Sección 5.4 |
 
**Supuestos declarados (corríjanse si no aplican):**
 
- Los auditores son LLMs que reciben esta rúbrica como parte de su prompt. Por eso la rúbrica es a la vez *instrumento de medición* y *especificación de tarea*; ambos roles se atienden por separado (Secciones 3 y 4).
- Cada artefacto se evalúa contra un **contexto de referencia** explícito (los requisitos A1 para A2/A3, o el objetivo declarado del skill para A4). Sin contexto de referencia, los criterios de trazabilidad y completitud **no son evaluables** y se marcan como tal (Sección 3.5), no se inventan.
- "Process-Guard" implies que el sistema *bloquea* artefactos deficientes. Por eso el modelo de decisión no es un simple promedio: incorpora vetos (Sección 3.2).
---
 
## 2. Fundamento normativo
 
Cada norma se cita porque **sostiene un juicio concreto**, no por autoridad. Donde el documento original mezclaba marcos (p. ej. OWASP web con OWASP-LLM, o IEEE 830 con 29148), aquí se asigna la norma correcta a cada criterio.
 
| Norma | Versión | Qué aporta | Dónde se usa |
|-------|---------|------------|--------------|
| ISO/IEC/IEEE 29148 | 2018 | Características del requisito bien formado (necesario, no ambiguo, completo, singular, factible, verificable, correcto, conforme, trazable) | A1 |
| ISO/IEC/IEEE 42010 | 2022 | Descripción arquitectónica: stakeholders, *concerns*, *viewpoints*, justificación de decisiones | A2 |
| ISO/IEC 25010 | 2023 | Modelo de calidad de producto (9 características). En 2023: se añade *Safety*; *Usability*→*Interaction Capability*; *Portability*→*Flexibility* | A2, A3 |
| ISO/IEC 25040 | — | Proceso de evaluación SQuaRE: niveles de puntuación y criterios de decisión | Sección 3 (método) |
| ISO/IEC 25023 | — | Medición de la calidad del producto: cómo cuantificar las características de 25010 | Sección 3.1 |
| SWEBOK Guide | v4.0 (IEEE CS, oct 2024) | Cuerpo de conocimiento. v4 añade KAs dedicadas de **Software Architecture** y **Software Security**, además de Requirements, Design, Construction, Testing, Maintenance | A1–A4 |
| OWASP Top 10 for LLM Applications | 2025 | Riesgos específicos de LLM: LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, LLM06 Excessive Agency, LLM07 System Prompt Leakage | A4 |
| OWASP Top 10 / CWE | — | Riesgos de seguridad de código de aplicación tradicional (no-LLM) | A3 |
| NIST AI RMF | 1.0 (2023) | Gobernanza de riesgo de sistemas de IA (Govern/Map/Measure/Manage) | A4 + gobernanza del propio auditor (Sección 4) |
 
> **Nota sobre versiones omitidas:** donde no se indica año (25040, 25023, OWASP/CWE) es porque la familia se cita por su contenido estable, no por una edición específica. Verifica la edición vigente antes de una auditoría formal.
 
> **Advertencia heredada del marco OWASP-LLM (relevante para el propio auditor):** OWASP 2025 es explícito en que *un system prompt no es un control de seguridad* — un modelo estocástico no puede funcionar como frontera auditable. Esto aplica a esta misma rúbrica: no asumas que escribir "sé objetivo" en el prompt produce objetividad. La objetividad la dan los anclajes (3.1) y la evidencia obligatoria (3.4), no las instrucciones.
 
---
 
## 3. Modelo de evaluación
 
### 3.1 Escala de niveles anclados (0–4)
 
Todo criterio puntuable se evalúa en una escala de cinco niveles. Cada criterio define **observables** para los niveles 0, 2 y 4; los niveles 1 y 3 son interpolaciones explícitas.
 
| Nivel | Etiqueta | Significado genérico |
|-------|----------|----------------------|
| **4** | Cumple plenamente | Cumple el criterio sin excepciones observables. La evidencia lo demuestra directamente. |
| **3** | Cumple con desviaciones menores | Cumple en lo esencial; existen defectos cosméticos o de bajo impacto que no comprometen el criterio. |
| **2** | Cumple parcialmente | Cumple en algunos aspectos y falla en otros de impacto medio. Requiere corrección antes de aprobar. |
| **1** | Deficiente | Falla en la mayoría de los aspectos; lo poco que cumple es incidental. |
| **0** | No cumple / ausente | El criterio no se atiende, o se atiende de forma que lo contradice. |
| **N/E** | No evaluable | El artefacto o el contexto no aportan información suficiente para juzgar. Ver 3.5. |
 
**Regla dura:** un nivel solo puede asignarse si la evidencia citada (3.4) sostiene *ese* nivel y no uno inferior. Ante la duda entre dos niveles, se asigna el menor. Esto es deliberado: un *Guard* debe sesgar hacia el rechazo, no hacia el beneficio de la duda.
 
### 3.2 Criterios compensatorios vs. criterios de veto
 
No todos los criterios pesan igual ni se comportan igual. Se distinguen dos clases:
 
- **Compensatorios (puntuables):** entran al promedio ponderado. Una debilidad puede compensarse con fortalezas en otros criterios.
- **De veto / gate (eliminatorios):** se evalúan como `CUMPLE` / `NO CUMPLE`. Un `NO CUMPLE` en cualquier gate **reprueba el artefacto sin importar la puntuación ponderada**. No se promedian.
La razón es directa: en un promedio compensatorio, un hueco de seguridad crítico (peso 20%) se diluye contra buena documentación y modularidad, y el artefacto pasa. Para algo cuyo trabajo es *guardar* un proceso, eso es una falla de diseño. Por eso seguridad crítica, corrección funcional y compatibilidad estructural son **gates**, no pesos.
 
### 3.3 Regla de agregación y umbrales de decisión
 
El veredicto se calcula en dos fases:
 
**Fase 1 — Gates.** Si cualquier criterio de veto del tipo de artefacto resulta `NO CUMPLE` → veredicto **REPROBADO**. Fin. No se calcula puntuación.
 
**Fase 2 — Puntuación ponderada** (solo si todos los gates pasan). Se calcula el puntaje sobre 100:
 
```
Puntaje = Σ (nivel_criterio / 4 × peso_criterio)
```
 
donde los pesos de los criterios compensatorios suman 100%. Los criterios marcados `N/E` se excluyen del promedio y sus pesos se redistribuyen proporcionalmente entre los criterios evaluables (y se reporta cuántos puntos de peso quedaron sin evaluar).
 
| Puntaje | Veredicto |
|---------|-----------|
| ≥ 85 | **APROBADO** |
| 70 – 84 | **APROBADO CON OBSERVACIONES** (lista de correcciones obligatoria) |
| < 70 | **REPROBADO** |
 
> Los umbrales (85/70) son una decisión de calibración inicial, no una verdad normativa. Deben ajustarse contra un conjunto de artefactos de referencia ya etiquetados por un humano antes de confiar en ellos en producción.
 
### 3.4 Evidencia obligatoria
 
Ningún nivel ni veredicto es válido sin evidencia. Para cada criterio el auditor **debe citar la ubicación exacta** en el artefacto que sostiene su juicio (número de línea, identificador de requisito, fragmento de diagrama, etc.) y un extracto breve. Si no puede señalar la evidencia, el criterio es `N/E`, no un nivel inventado.
 
Esto no es burocracia: es el principal control de varianza del auditor LLM. Un modelo que primero localiza evidencia y luego puntúa produce resultados mucho más estables entre corridas que uno que puntúa "de impresión".
 
### 3.5 Abstención (No evaluable)
 
El auditor **debe** marcar `N/E` cuando:
 
- El contexto de referencia necesario no fue provisto (p. ej. evaluar trazabilidad sin los requisitos de origen).
- El artefacto está incompleto o truncado en la sección relevante.
- El criterio no aplica al subtipo de artefacto (p. ej. seguridad LLM en código que no interactúa con un LLM).
Inventar un juicio sobre información ausente es un error más grave que abstenerse. El reporte final indica el porcentaje de peso evaluado; por debajo de cierto umbral (sugerido: 60% del peso evaluable), el veredicto global se marca como **INCONCLUSO** y se devuelve para evaluación humana.
 
---
 
## 4. Protocolo del auditor (LLM)
 
Esta sección trata la rúbrica como *especificación de tarea*. Sin ella, dos corridas del mismo artefacto dan números distintos.
 
1. **Determinismo.** Temperatura 0 (o el mínimo disponible). Se fija una semilla si el SDK lo permite.
2. **Orden obligatorio: evidencia → juicio.** El auditor primero extrae y cita la evidencia relevante; solo después asigna el nivel. Está prohibido emitir el nivel antes de la evidencia.
3. **Salida estructurada.** El auditor responde **únicamente** con el JSON del esquema de la Sección 6, sin prosa fuera del JSON. Esto permite validar y agregar los resultados de forma programática.
4. **Calibración con ejemplos anclados.** El prompt del auditor incluye, por cada tipo de artefacto, al menos un ejemplo de nivel 4 y uno de nivel ≤1 ya etiquetados por un humano (*few-shot* de anclaje). Esto reduce la deriva de criterio más que cualquier instrucción en prosa.
5. **Reconciliación inter-evaluador.** Cada artefacto se evalúa por **N ≥ 3** corridas (mismo modelo con re-muestreo, o preferiblemente modelos distintos). Por criterio:
   - Si la dispersión de niveles ≤ 1, se toma la mediana.
   - Si la dispersión > 1, el criterio se escala a revisión (humana o de un modelo árbitro). La dispersión alta es señal de que el anclaje de ese criterio es débil y debe reescribirse.
6. **Gobernanza del auditor (NIST AI RMF).** Se registra qué modelo y versión auditó, con qué rúbrica (versión), y se conserva el JSON de evidencia. Un veredicto sin trazabilidad de quién/cómo lo emitió no es auditable y, por tanto, no cuenta.
---
 
## 5. Rúbricas por tipo de artefacto
 
Cada rúbrica lista primero sus **gates** (veto) y luego sus **criterios puntuables** (pesos suman 100%). Para cada criterio puntuable se dan los anclajes 0 / 2 / 4.
 
---
 
### 5.1 Requisitos (A1)
 
**Fundamento:** ISO/IEC/IEEE 29148:2018 (características del requisito bien formado) · SWEBOK v4.0 KA *Software Requirements*.
 
**Gates (veto):**
 
| Gate | Fuente | CUMPLE si… |
|------|--------|------------|
| **G-A1.1 — Singularidad evaluable** | 29148 §5.2.4 | Cada enunciado expresa una sola capacidad/restricción; no hay requisitos compuestos que oculten alcance. |
| **G-A1.2 — Existencia de criterio de aceptación** | 29148 §5.2.6 (verificable) | Todo requisito funcional incluye o permite derivar un criterio de aceptación objetivo. Un requisito no verificable **no es un requisito**. |
 
**Criterios puntuables:**
 
| ID | Criterio | Fuente | Peso | Anclaje 0 / 2 / 4 |
|----|----------|--------|------|-------------------|
| C1 | **No ambigüedad** | 29148 (unambiguous) | 25% | **0:** abundan superlativos, "rápido", "amigable", pronombres vagos. **2:** mayormente claro pero con ≥1 término interpretable de doble forma. **4:** cada requisito admite una sola interpretación; sin lenguaje subjetivo. |
| C2 | **Completitud (del conjunto)** | 29148 (complete as a set) | 20% | **0:** faltan flujos principales o el enunciado remite a "etc.". **2:** flujos principales cubiertos, faltan casos borde o de error relevantes. **4:** flujos principales, alternos y de excepción cubiertos; los faltantes están explícitamente marcados como fuera de alcance. |
| C3 | **Consistencia** | 29148 (consistent) | 20% | **0:** dos requisitos se contradicen directamente. **2:** sin contradicciones lógicas pero con solapamientos o términos usados de forma inconsistente. **4:** sin contradicciones; terminología uniforme y definida. |
| C4 | **Verificabilidad (calidad del criterio)** | 29148 / SWEBOK V&V | 20% | **0:** criterios ausentes o no medibles. **2:** criterios presentes pero parcialmente subjetivos. **4:** todo requisito tiene un criterio de aceptación medible y objetivo. |
| C5 | **Trazabilidad** | 29148 / SWEBOK | 15% | **0:** ningún vínculo a objetivo de negocio/sistema. **2:** vínculo parcial o implícito. **4:** cada requisito traza a un objetivo superior identificable. |
 
---
 
### 5.2 Diseño de arquitectura (A2)
 
**Fundamento:** ISO/IEC/IEEE 42010:2022 (descripción arquitectónica) · SWEBOK v4.0 KA *Software Architecture* y *Software Security* · ISO/IEC 25010:2023 (atributos de calidad).
 
**Gates (veto):**
 
| Gate | Fuente | CUMPLE si… |
|------|--------|------------|
| **G-A2.1 — Seguridad crítica por diseño** | SWEBOK v4 *Software Security* / 25010:2023 *Security* | No existe una superficie de ataque crítica sin mitigación (p. ej. datos sensibles sin control de acceso, ausencia total de mínimo privilegio en un sistema que lo requiere). |
| **G-A2.2 — Concerns de stakeholders cubiertos** | 42010:2022 | La arquitectura identifica a los stakeholders y atiende sus *concerns* declarados; no ignora un concern crítico del contexto. |
 
**Criterios puntuables:**
 
| ID | Criterio | Fuente | Peso | Anclaje 0 / 2 / 4 |
|----|----------|--------|------|-------------------|
| C1 | **Cohesión y acoplamiento** | SWEBOK v4 *Software Design* | 25% | **0:** módulos con responsabilidades mezcladas y dependencias circulares. **2:** estructura razonable con algún acoplamiento evitable. **4:** alta cohesión, bajo acoplamiento, dependencias justificadas. |
| C2 | **Seguridad por diseño (no crítica)** | SWEBOK v4 *Software Security* | 20% | **0:** sin defensa en profundidad ni mínimo privilegio. **2:** principios aplicados parcialmente. **4:** superficies de ataque identificadas; mínimo privilegio y defensa en profundidad aplicados y justificados. |
| C3 | **Eficiencia y escalabilidad** | 25010:2023 *Performance Efficiency* | 20% | **0:** ignora carga y crecimiento; cuellos de botella evidentes. **2:** contempla recursos pero no el crecimiento. **4:** maneja recursos y soporta crecimiento sin deterioro estructural, con justificación. |
| C4 | **Trazabilidad hacia requisitos** | 42010:2022 / SWEBOK | 20% | **0:** decisiones sin vínculo a requisitos. **2:** vínculo parcial. **4:** cada decisión arquitectónica significativa se justifica contra un requisito (A1). |
| C5 | **Patrones y justificación de decisiones** | 42010:2022 (rationale) | 15% | **0:** sin patrones reconocibles ni justificación. **2:** usa patrones pero no justifica la elección frente a alternativas. **4:** patrones reconocidos, con *rationale* explícito frente a alternativas descartadas (estilo ADR). |
 
---
 
### 5.3 Código fuente (A3)
 
**Fundamento:** ISO/IEC 25010:2023 (modelo de calidad de producto) · ISO/IEC 25023 (medición) · SWEBOK v4.0 KAs *Software Construction*, *Software Security*, *Software Maintenance* · OWASP Top 10 / CWE (seguridad de código de aplicación).
 
> **Subtipo:** si el código *interactúa con un LLM* (orquesta prompts, consume salida de un modelo, expone herramientas a un agente), añade además los gates de la Sección 5.4 referidos a OWASP-LLM. Para código tradicional, la seguridad se evalúa contra OWASP Top 10 / CWE, **no** contra OWASP-LLM (era un error de categoría en la versión anterior).
 
**Gates (veto):**
 
| Gate | Fuente | CUMPLE si… |
|------|--------|------------|
| **G-A3.1 — Corrección funcional** | 25010:2023 *Functional Correctness* | El código produce resultados correctos para los casos especificados. Si la lógica central es incorrecta, ningún otro mérito lo rescata. |
| **G-A3.2 — Sin vulnerabilidad de seguridad crítica** | OWASP Top 10 / CWE (o OWASP-LLM si aplica) | No hay vulnerabilidad crítica explotable (inyección, validación de input ausente en frontera de confianza, secreto embebido). |
 
**Criterios puntuables:**
 
| ID | Criterio | Fuente | Peso | Anclaje 0 / 2 / 4 |
|----|----------|--------|------|-------------------|
| C1 | **Adecuación funcional** | 25010:2023 *Functional Suitability* | 20% | **0:** faltan funciones especificadas. **2:** implementa lo principal, omite casos. **4:** cubre todas las funciones del contexto. |
| C2 | **Fiabilidad / manejo de errores** | 25010:2023 *Reliability* | 20% | **0:** errores no manejados; falla de forma silenciosa o catastrófica. **2:** manejo parcial; algunas excepciones se tragan. **4:** excepciones controladas, descriptivas y recuperables donde corresponde. |
| C3 | **Seguridad (no crítica)** | OWASP / CWE | 15% | **0:** múltiples malas prácticas de seguridad. **2:** sin fallas críticas pero con validaciones débiles. **4:** validación de inputs, manejo seguro de datos, sin malas prácticas. |
| C4 | **Mantenibilidad / modularidad** | 25010:2023 *Maintainability* | 15% | **0:** funciones enormes, lógica duplicada, alto acoplamiento. **2:** estructura aceptable con deuda evidente. **4:** modular, cohesivo, bajo acoplamiento, fácil de cambiar. |
| C5 | **Documentación y tipado** | SWEBOK v4 *Software Maintenance* | 10% | **0:** sin comentarios ni tipos donde el lenguaje los permite. **2:** documentación parcial. **4:** lógica no trivial documentada, tipada y comprensible por terceros. |
| C6 | **Trazabilidad con requisitos** | SWEBOK v4 *Software Requirements* | 10% | **0:** imposible vincular el código a un requisito. **2:** vínculo parcial/implícito. **4:** cada función traza a un requisito explícito. |
| C7 | **Portabilidad** | 25010:2023 *Flexibility* (incl. portabilidad) | 10% | **0:** dependencia rígida de un entorno/librería no estándar sin necesidad. **2:** acoplamiento moderado al entorno. **4:** dependencias justificadas y aisladas; portable. |
 
---
 
### 5.4 Skills / instrucciones de sistema (A4)
 
**Fundamento:** OWASP Top 10 for LLM Applications 2025 · NIST AI RMF 1.0 · SWEBOK v4.0 KA *Software Security*. Para skills que ejecutan herramientas de forma autónoma, considerar adicionalmente el OWASP Top 10 for Agentic AI (2025).
 
> Un skill es a la vez código (se integra a un SDK) y prompt (es texto que dirige a un modelo estocástico). Por eso tiene gates de ambos mundos.
 
**Gates (veto):**
 
| Gate | Fuente | CUMPLE si… |
|------|--------|------------|
| **G-A4.1 — Resistencia a inyección de prompt** | OWASP LLM01:2025 | El skill separa instrucciones de datos no confiables y no es trivialmente secuestrable por contenido externo (documentos, web, tickets) que diga "ignora las instrucciones anteriores". |
| **G-A4.2 — Sin fuga de instrucciones ni secretos** | OWASP LLM02 / LLM07:2025 | El skill no embebe credenciales, tokens ni connection strings (un system prompt **no** es un almacén seguro), y no expone su lógica sensible ante una solicitud directa. |
| **G-A4.3 — Compatibilidad estructural con el SDK** | Arquitectura de control | El skill respeta los límites de tokens del SDK evaluador y usa correctamente el esquema de *function calling*. (Antes era "+10% extra", lo que rompía la escala a 110%. Ahora es un gate binario: o integra, o no integra.) |
 
**Criterios puntuables:**
 
| ID | Criterio | Fuente | Peso | Anclaje 0 / 2 / 4 |
|----|----------|--------|------|-------------------|
| C1 | **Adecuación a su objetivo** | 25010:2023 *Functional Suitability* | 25% | **0:** el skill no logra la tarea declarada. **2:** la logra para el caso feliz, falla en variaciones. **4:** cumple su objetivo de forma robusta ante variación de entrada. |
| C2 | **Control de agencia (mínimo privilegio)** | OWASP LLM06:2025 *Excessive Agency* | 20% | **0:** el skill puede ejecutar acciones de alto impacto sin restricción ni confirmación. **2:** límites parciales. **4:** el skill solo puede hacer lo necesario; acciones sensibles requieren confirmación o están acotadas. |
| C3 | **Claridad y no ambigüedad de la instrucción** | 29148 (unambiguous), aplicado a prompts | 20% | **0:** instrucciones contradictorias o vagas que el modelo interpretará de forma impredecible. **2:** mayormente claras con zonas grises. **4:** instrucciones precisas, sin contradicción, con comportamiento predecible. |
| C4 | **Manejo de casos límite y abstención** | NIST AI RMF (Manage) | 20% | **0:** no contempla qué hacer ante entrada inesperada; alucinará o actuará igual. **2:** contempla algunos casos. **4:** define explícitamente cuándo abstenerse, pedir aclaración o degradar con seguridad. |
| C5 | **Documentación y mantenibilidad del skill** | SWEBOK v4 *Software Maintenance* | 15% | **0:** sin documentar; imposible de modificar sin romperlo. **2:** documentación parcial. **4:** propósito, entradas, salidas y límites documentados; modificable sin efectos colaterales sorpresa. |
 
---
 
## 6. Anexo — Esquema de salida del auditor
 
El auditor responde **solo** con este JSON (sin texto fuera de él):
 
```json
{
  "artefacto_id": "string",
  "tipo": "A1 | A2 | A3 | A4",
  "rubrica_version": "2.0",
  "modelo_auditor": "string",
  "gates": [
    {
      "id": "G-A3.1",
      "resultado": "CUMPLE | NO_CUMPLE",
      "evidencia": { "ubicacion": "línea 42 / REQ-014 / nodo 'Auth'", "extracto": "..." },
      "justificacion": "1-2 frases"
    }
  ],
  "criterios": [
    {
      "id": "C1",
      "nivel": "0 | 1 | 2 | 3 | 4 | N/E",
      "peso": 25,
      "evidencia": { "ubicacion": "...", "extracto": "..." },
      "justificacion": "1-2 frases que anclan el nivel al observable de la rúbrica"
    }
  ],
  "peso_evaluado_pct": 100,
  "puntaje": 0,
  "veredicto": "APROBADO | APROBADO_CON_OBSERVACIONES | REPROBADO | INCONCLUSO",
  "correcciones_obligatorias": ["string"]
}
```
 
**Reglas de cálculo recordadas:**
- Cualquier gate `NO_CUMPLE` → `veredicto = REPROBADO`, sin calcular puntaje.
- Criterios `N/E` se excluyen y su peso se redistribuyen; si `peso_evaluado_pct < 60` → `veredicto = INCONCLUSO`.
- `puntaje = Σ (nivel/4 × peso)` sobre los criterios evaluados, normalizado a 100.
---
 
## 7. Control de versiones
 
| Versión | Cambios principales |
|---------|---------------------|
| 1.0 | Checklist con criterios, pesos y preguntas sí/no. |
| **2.0** | Escalas ancladas 0–4; separación gates/compensatorios; pesos normalizados a 100% (eliminado el "+10% extra"); citas corregidas (29148:2018 en vez de IEEE 830; 25010:2023; 42010:2022; SWEBOK v4.0; OWASP-LLM solo donde aplica); añadido protocolo de auditor estocástico (determinismo, evidencia obligatoria, esquema JSON, reconciliación inter-evaluador); añadida abstención `N/E` y veredicto `INCONCLUSO`. |
 
> **Pendiente antes de producción:** calibrar umbrales (85/70) and los anclajes contra un conjunto de artefactos ya etiquetados por un humano. Una rúbrica sin calibrar es una hipótesis, no un instrumento.
