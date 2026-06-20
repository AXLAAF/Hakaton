# TAREA 1 — Investigación y Marco Teórico
**Secciones del paper:** Abstract (borrador), Sección 1 (Introduction), Sección 2 (Related Work), Referencias

---

## Objetivo General

Construir el **sustento académico y argumental** del proyecto. Esta tarea justifica *por qué* Process-Guard existe, en qué se diferencia del estado del arte y qué problema de seguridad de IA resuelve. Sin este trabajo, el paper no tiene fundamento ante los jueces de Apart Research.

---

## Contexto del Proyecto

**Process-Guard Control Arena** es un framework de *AI Control* que audita artefactos de software (código, contextos, skills, requisitos) enviándolos simultáneamente a 3 LLMs distintos (Claude, Gemini, GPT-4). Cada modelo emite un reporte individual y una métrica parcial; el sistema sintetiza los 3 reportes para detectar alucinaciones por contraste y emite una **calificación cuantificable final** basada en SWEBOK/ISO 25010.

**Track del hackathon:** AI Security → AI Control  
**Problema que resuelve:** "La Guerra del Código" — el uso indiscriminado de IA en desarrollo de software sin procesos formales de ingeniería, generando deuda técnica, bugs y vulnerabilidades.

---

## Sub-tareas Detalladas

### 1.1 Threat Model: "La Guerra del Código" (2–3 horas)

Redactar la narrativa del problema con evidencia. Debe responder:

- ¿Por qué los desarrolladores confían ciegamente en código generado por IA?
- ¿Qué procesos formales de ingeniería de software se están omitiendo (ciclo de vida, validación, pruebas)?
- ¿Cuál es el impacto medible? (buscar estadísticas de bugs/CVEs en código generado por IA)
- ¿Por qué la "Gobernanza" corporativa no es suficiente y se necesita AI Control técnico?

**Fuentes sugeridas a buscar:**
- Estudios de GitHub Copilot y bugs: "Security weaknesses of Copilot generated code" (Pearce et al., 2022, USENIX)
- "Do Users Write More Insecure Code with AI Assistants?" (Sandoval et al., 2023)
- Stack Overflow Developer Survey 2024 (adopción de AI en desarrollo)
- OWASP Top 10 for LLM Applications 2025

**Output:** 2–3 párrafos sólidos que forman el núcleo de la Introducción.

---

### 1.2 Revisión de Trabajos Relacionados (3–4 horas)

Investigar y resumir cada uno de los siguientes pilares. Para cada uno: qué hace, en qué se parece a Process-Guard y en qué se diferencia.

#### Pilar A — AI Control Frameworks
- **Control Arena (Redwood Research / UK AISI):** Arena de evaluación donde agentes de IA interactúan con sistemas Linux reales. Evalúa si la IA opera dentro de límites de seguridad. Process-Guard **extiende** este concepto al dominio de calidad de software.
  - Paper: "Control Arena: A Framework for Data Collection on AI Control Protocols" (Baker et al., 2025)
- **AI Control (Greenblatt et al., 2024):** Marco teórico para mantener control sobre acciones de modelos sin asumir alineación.

#### Pilar B — Evaluación Multi-Modelo y Consenso
- **LMSYS Chatbot Arena:** Sistema de evaluación cruzada por votación humana. Process-Guard **automatiza** este principio: en lugar de humanos, 3 LLMs votan sobre calidad del artefacto.
- **LLM-as-a-Judge (Zheng et al., 2023):** Evaluación automática de respuestas de LLMs usando otro LLM como juez. Process-Guard usa *3 jueces simultáneos* para anular sesgos individuales.

#### Pilar C — Estándares de Calidad de Software
- **SWEBOK v3.0** (IEEE): Cuerpo de conocimiento de ingeniería de software. Define las áreas de conocimiento (Knowledge Areas) que usamos como rúbricas de evaluación.
- **ISO/IEC 25010:2011** (SQuaRE): Modelo de calidad del producto software con 8 características (Funcionalidad, Fiabilidad, Usabilidad, Eficiencia, Mantenibilidad, Portabilidad, Compatibilidad, Seguridad).
- **ISO/IEC 25041:** Guía de evaluación del modelo de calidad.

#### Pilar D — Detección de Alucinaciones en LLMs
- **SelfCheckGPT (Manakul et al., 2023):** Detecta alucinaciones enviando el mismo prompt múltiples veces y verificando consistencia. Process-Guard aplica este principio entre modelos distintos (cross-model consistency).
- Buscar 1–2 papers más sobre hallucination detection en código generado.

**Output:** Sección 2 del paper (~1 página). Tabla comparativa opcional.

---

### 1.3 Posicionamiento y Contribuciones Originales (1 hora)

Redactar con claridad qué es *nuevo* en Process-Guard vs. el estado del arte. Los jueces penalizan proyectos sin diferenciación clara.

**Borradores de contribuciones para refinar:**
1. Primera aplicación de un framework de AI Control (tipo Control Arena) al dominio de Quality Assurance de software, usando SWEBOK/ISO 25010 como rúbricas de evaluación formales.
2. Mecanismo de detección de alucinaciones de LLMs basado en discrepancia de consenso entre 3 modelos heterogéneos, cuantificado en una métrica normalizada (0–100).
3. Demostración empírica de que la evaluación triple reduce falsos positivos de alucinación vs. evaluación single-model (a validar con los datos del prototipo de Tarea 4).

---

### 1.4 Abstract (1 hora — escribir al final)

Escribir el abstract **después** de tener los resultados del prototipo (coordinarse con Tarea 3). Máx. 250 palabras. Debe cubrir:
- El problema (La Guerra del Código)
- El enfoque (evaluación triple multi-modelo + SWEBOK)
- Resultados clave (calificación cuantificable, X% reducción de alucinaciones aprobadas)
- Implicación (AI Control técnico escalable para el desarrollo de software)

---

### 1.5 Referencias Bibliográficas (compilar durante toda la tarea)

Mantener lista actualizada en formato consistente. Mínimo 8–10 referencias. Sugeridas:

| # | Cita |
|---|------|
| 1 | Pearce et al. (2022). "Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions." IEEE S&P 2022. |
| 2 | Sandoval et al. (2023). "Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants." USENIX Security 2023. |
| 3 | Greenblatt et al. (2024). "AI Control: Improving Safety Despite Intentional Subversion." Redwood Research. |
| 4 | Baker et al. (2025). "Control Arena: A Framework for Data Collection on AI Control Protocols." UK AISI. |
| 5 | Zheng et al. (2023). "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena." NeurIPS 2023. |
| 6 | Manakul et al. (2023). "SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative LLMs." EMNLP 2023. |
| 7 | IEEE Computer Society. (2014). *SWEBOK v3.0: Guide to the Software Engineering Body of Knowledge.* |
| 8 | ISO/IEC 25010:2011. *Systems and software engineering — SQuaRE — System and software quality models.* |
| 9 | Chiang et al. (2024). "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference." ICML 2024. |

---

## Formato de Entrega

Entregar un archivo Markdown (`paper_secciones_1_2.md`) con:
- Sección 1 (Introduction) — ~500 palabras
- Sección 2 (Related Work) — ~400 palabras
- Lista de Referencias completa
- Borrador de Abstract — ~200 palabras

**Coordinar con:** Tarea 2 (para entender la metodología que debes describir como "contribución nueva") y Tarea 3 (para el abstract con resultados reales).

---

## Criterios de Éxito (Rúbrica del Hackathon)

- [ ] El problema está conectado claramente a AI Safety / AI Control
- [ ] Se explica *por qué* Process-Guard es nuevo vs. trabajos relacionados
- [ ] Se citan al menos 6 referencias académicas relevantes
- [ ] La sección de contribuciones es específica (no genérica)
- [ ] El abstract puede leerse independientemente y comunica el valor del proyecto
