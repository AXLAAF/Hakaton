# PLAN MAESTRO — Process-Guard Control Arena
**Hackathon:** Global South AI Safety Hackathon (Apart Research)  
**Track:** AI Security → AI Control  
**Deadline:** Domingo 21 de junio, 23:59 AoE  
**Equipo:** 4 integrantes

---

## Resumen del Proyecto

**Process-Guard Control Aren** es un framework de AI Control que audita artefactos de software (código, skills, requisitos) enviándolos a 3 LLMs distintos en paralelo (Claude, Gemini, GPT-4). Cada modelo evalúa contra rúbricas formales (SWEBOK/ISO 25010), emite un reporte con métrica parcial (0-100), y un sintetizador detecta alucinaciones por discrepancia y emite una calificación cuantificable final.

---

## División de Trabajo

| Tarea | Responsable | Foco | Entrega Interna |
|-------|-------------|------|-----------------|
| [Tarea 1](TAREA_1_Investigacion_Marco_Teorico.md) | Integrante 1 | Investigación: Literatura, Threat Model, Secciones 1+2+Referencias | Sáb 20, mediodía |
| [Tarea 2](TAREA_2_Diseno_Framework.md) | Integrante 2 | Framework: Arquitectura, Rúbricas, Fórmulas, Sección 3 + Figuras | Sáb 20, tarde |
| [Tarea 3](TAREA_3_Resultados_Analisis_Discusion.md) | Integrante 3 | Resultados: Experimentos, Análisis, Secciones 4+5+6 + PDF final | Dom 21, mañana |
| [Tarea 4](TAREA_4_Prototipo_API.md) | Integrante 4 | Prototipo: FastAPI + Claude/Gemini/GPT-4 + Sintetizador | Sáb 20, noche |

---

## Cronograma

```
VIERNES 19 (hoy)
├── 15:00–17:30  Workshop Cursor
├── 17:30–18:00  Pitch del equipo
└── 18:00–23:59  Kickoff: cada quien lee su brief y empieza

SÁBADO 20
├── 09:00–12:00  T1: Literatura / T2: Rúbricas / T4: Setup + Evaluadores
├── 12:00–13:00  Check-in de equipo: T1 entrega draft Intro + Related Work
├── 13:00–18:00  T2: Diagramas + Metodología / T4: Orquestador + API completa
├── 18:00–20:00  T2 entrega Sección 3 + Figuras / T4 entrega API funcional
└── 20:00–23:59  T3 empieza experimentos con el prototipo

DOMINGO 21
├── 09:00–13:00  T3: Análisis + Gráficas + Secciones 4-5-6
├── 13:00–15:00  T3 integra todo en PDF / Todos revisan y editan
├── 15:00–20:00  Pulido final del paper + Abstract definitivo
└── 21:00        Envío final (2h de margen antes del deadline)
```

---

## Dependencias Críticas Entre Tareas

```
T1 ──────────────────────────────────────────────► T3 (abstract con resultados)
T2 (criterios/rúbricas) ─────────────────────────► T4 (prompts de evaluación)
T4 (API funcional) ──────────────────────────────► T3 (experimentos)
T1 + T2 + T3 ────────────────────────────────────► PDF FINAL
```

**Punto crítico:** T4 debe tener al menos 1 modelo funcionando antes del sábado a las 20:00 para que T3 pueda ejecutar experimentos. Si hay problemas con las API keys, resolverlos el sábado temprano.

---

## Estructura del Paper (Template Apart Research)

| Sección | Responsable | Estado |
|---------|-------------|--------|
| Abstract | T1 (con datos de T3) | Pendiente |
| 1. Introduction | T1 | Pendiente |
| 2. Related Work | T1 | Pendiente |
| 3. Methods | T2 | Pendiente |
| 4. Results | T3 | Pendiente |
| 5. Discussion & Limitations | T3 | Pendiente |
| 6. Conclusion | T3 | Pendiente |
| Code & Data | T4 | Pendiente |
| References | T1 | Pendiente |
| LLM Usage Statement | Todos | Pendiente |
| Figuras (arquitectura) | T2 | Pendiente |
| Figuras (resultados) | T3 | Pendiente |

---

## API Keys Necesarias (Tarea 4)

Obtener antes del sábado AM:
- [ ] `ANTHROPIC_API_KEY` — console.anthropic.com
- [ ] `GOOGLE_API_KEY` — aistudio.google.com (Gemini, tier gratuito disponible)
- [ ] `OPENAI_API_KEY` — platform.openai.com

**Alternativa de emergencia:** Si no hay acceso a las 3 APIs, priorizar:
1. Claude (Anthropic) — mejor razonamiento para evaluación
2. Gemini (Google) — tier gratuito, sin costo
3. GPT-4o — si hay créditos disponibles

---

## Checklist de Entrega Final

### Contenido del Paper
- [ ] Título definitivo acordado por el equipo
- [ ] Abstract ≤ 250 palabras con resultados reales
- [ ] Nombres y afiliaciones de los 4 integrantes
- [ ] Sección de Doble Uso presente (obligatoria)
- [ ] Al menos 6 referencias académicas
- [ ] Al menos 1 figura de arquitectura (Figure 1)
- [ ] Al menos 1 tabla con resultados cuantitativos (Table 1)
- [ ] 4–8 páginas (sin referencias y apéndice)

### Repositorio / Código
- [ ] Carpeta `prototype/` con la API funcional
- [ ] `prototype/README.md` con instrucciones de instalación
- [ ] `.env.example` sin claves reales
- [ ] Código committeado al repo

### Envío
- [ ] PDF exportado y revisado (figuras legibles)
- [ ] Track seleccionado: AI Security → AI Control
- [ ] Enviado vía botón en la página de Apart Research antes de las 23:59

---

## Título del Paper (a confirmar por el equipo)

**Opción A (técnico):** "Process-Guard Control Arena: Multi-Model Cross-Evaluation for Hallucination Detection in AI-Generated Software Artifacts"

**Opción B (accesible):** "Process-Guard: An AI Control Framework for Quantifiable Quality Assurance of AI-Generated Software"

**Opción C (orientado a impacto):** "Taming the Code War: A Multi-LLM Evaluation Arena for Safe AI-Assisted Software Development"

---

## Contactos de Soporte del Hackathon

- Canal `#help` en Discord de Apart Research
- Kamil Alaa: WhatsApp/Signal +201221000993 | kamil@apartresearch.com
- Discord invite: https://discord.gg/GW5ZSRt75d
