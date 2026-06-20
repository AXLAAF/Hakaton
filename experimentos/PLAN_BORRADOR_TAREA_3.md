# Plan de Implementación — Borrador Tarea 3

**Objetivo:** Tener un borrador completo de Tarea 3 listo para rellenar con datos reales en cuanto el prototipo (T4) esté operativo.  
**Entrega interna:** Domingo 21 de junio, mañana  
**Estado del prototipo:** Pendiente (`prototype/` no existe aún)

---

## Definición de "borrador listo"

Un borrador está **completo** cuando cumple todo esto:

| Entregable | Borrador = | Falta para versión final |
|------------|------------|--------------------------|
| `artefactos/*.txt` | 5 archivos finales con hipótesis documentadas | Nada |
| `resultados_experimentos.json` | Schema + estructura vacía o datos de prueba marcados `dry_run: true` | Datos reales de API |
| `tabla_maestra.md` | Tabla con placeholders `—` o datos de prueba | Scores reales |
| `paper_secciones_4_5_6.md` | Secciones 5.2–5.4 y 6 completas; 4 y 5.1 con `[PLACEHOLDER]` | Reemplazar placeholders |
| `figuras/*.png` | Generadas con datos de prueba + captions | Regenerar con datos reales |
| `generate_figures.py` | Funcional, lee JSON | Nada |
| `run_experiments.py` | Funcional contra API (o modo dry-run) | Ejecutar contra API real |
| PDF final | Esqueleto integrado (T1+T2+borrador T3) | Abstract y Results con números reales |

---

## Estructura de carpetas a crear

```
Hakaton/experimentos/
├── PLAN_BORRADOR_TAREA_3.md          ← este archivo
├── README.md                          ← cómo ejecutar todo
├── artefactos/
│   ├── 1A_gold_standard.txt
│   ├── 1B_vulnerable.txt
│   ├── 2C_ambiguo.txt
│   ├── 3D_reproducibilidad.txt      ← copia de 1A
│   ├── 4E_requisitos.txt            ← copia de flujo_sqa_ia.md
│   └── HIPOTESIS.md                 ← expectativas por experimento
├── scripts/
│   ├── run_experiments.py
│   ├── generate_figures.py
│   └── synthesize_local.py          ← fórmula CF sin API (fallback)
├── datos/
│   ├── resultados_experimentos.json
│   ├── resultados_dry_run.json      ← datos ficticios para figuras
│   └── schema.json                  ← contrato JSON esperado de T4
├── salida/
│   ├── tabla_maestra.md
│   ├── paper_secciones_4_5_6.md
│   └── figuras/
│       ├── fig3_calibracion.png
│       ├── fig4_alucinacion.png
│       └── fig5_reproducibilidad.png
└── integracion/
    └── checklist_pdf.md
```

---

## Fases de implementación

### Fase 0 — Setup (15 min)

**Tareas:**
- [ ] Crear estructura de carpetas anterior
- [ ] Confirmar con T4: URL del endpoint (`http://localhost:8000/evaluate`), schema del request/response
- [ ] Confirmar con T2: prompts y pesos de rúbrica finalizados (afectan interpretación de scores)
- [ ] Verificar disponibilidad de API keys (mínimo Gemini gratuito)

**Criterio de done:** Carpetas creadas, README con variables de entorno documentadas.

---

### Fase 1 — Artefactos de prueba (1–1.5 h) — SIN prototipo

**Responsable:** Integrante 3  
**Bloqueante:** Ninguno

#### 1A — Gold standard (`1A_gold_standard.txt`)

Contenido mínimo (~150–250 líneas o menos si es conciso):
- Skill: `POST /api/v1/users` — crear usuario
- Validación de inputs (email, password strength)
- Autenticación Bearer token
- Sanitización parametrizada (ORM/prepared statements)
- Rate limiting
- Manejo de errores HTTP estándar
- Logging sin datos sensibles
- Documentación inline clara

**Hipótesis documentada en `HIPOTESIS.md`:**
```
Exp 1A | CF ≥ 85 | std < 10 | outlier: ninguno | estado: Aprobado
```

#### 1B — Vulnerable (`1B_vulnerable.txt`)

Misma funcionalidad que 1A pero **deliberadamente mal**:
- Concatenación SQL directa con input del usuario
- Sin validación de tipos
- Credenciales en logs
- Sin autenticación en el endpoint
- Sin rate limiting

**Hipótesis:**
```
Exp 1B | CF < 50 | std variable | ≥2 modelos flaggean SQLi/auth
```

#### 2C — Ambiguo (`2C_ambiguo.txt`)

Basado en el ejemplo de la tarea:
- Login con ORM "nativo" sin especificar cuál
- JWT sin expiración ni refresh
- Sin rate limiting ni sanitización explícita
- Tono técnico pero incompleto (provoca asunciones)

**Hipótesis:**
```
Exp 2C | std > 20 | 1 outlier ~85 | 2 modelos ~50-60 | flag alucinación
```

#### 3D — Reproducibilidad

- Copiar `1A_gold_standard.txt` → `3D_reproducibilidad.txt`
- Mismo artefacto, 3 ejecuciones con T=0

**Hipótesis:**
```
Exp 3D | variación CF < 5 puntos entre runs
```

#### 4E — Requisitos

- Copiar `Hakaton/proyect/flujo_sqa_ia.md` → `4E_requisitos.txt`
- Tipo de artefacto: `requirements`

**Hipótesis:**
```
Exp 4E | CF ≥ 70 | sistema evalúa no-código | hallazgos sobre gaps del doc
```

**Criterio de done:** 5 archivos `.txt` + `HIPOTESIS.md` con tabla de expectativas.

---

### Fase 2 — Contrato de datos y scripts (1.5–2 h) — SIN prototipo

#### 2.1 — `datos/schema.json`

Definir el contrato que `run_experiments.py` espera de `POST /evaluate`:

```json
{
  "request": {
    "artifact_content": "string",
    "artifact_type": "skill | requirements | design | code | project"
  },
  "response": {
    "reports": [
      { "model_name": "string", "partial_score": 0, "critical_risks": [] }
    ],
    "synthesis": {
      "mean_score": 0.0,
      "std_deviation": 0.0,
      "outlier_model": "string | null",
      "hallucination_flag": false,
      "final_score": 0,
      "status": "approved | approved_observations | needs_review | rejected"
    }
  }
}
```

Coordinar con T4 para que el response real coincida. Si difiere, adaptar el script.

#### 2.2 — `scripts/synthesize_local.py`

Implementar la fórmula de Tarea 2 (fallback si T4 no entrega sintetizador):

```python
# std < 10  → CF = mean(scores)
# std 10-20 → CF = mean, flag "Revisión Recomendada"
# std > 20  → CF = 0.45*s1 + 0.45*s2 + 0.10*s_outlier, flag alucinación
```

Útil para: validar figuras, evaluación manual de emergencia, tests unitarios.

#### 2.3 — `scripts/run_experiments.py`

Comportamiento:

```
python run_experiments.py --api http://localhost:8000 --dry-run   # sin API
python run_experiments.py --api http://localhost:8000             # ejecución real
```

Para cada experimento:
1. Leer artefacto de `artefactos/`
2. `POST /evaluate` con `artifact_type` correcto
3. Guardar respuesta cruda con timestamp, experiment_id, run_number
4. Para Exp 3D: 3 llamadas secuenciales al mismo artefacto
5. Escribir `datos/resultados_experimentos.json`
6. Generar `salida/tabla_maestra.md` automáticamente

**Modo `--dry-run`:** Usar `resultados_dry_run.json` (scores ficticios coherentes con hipótesis) para probar pipeline sin API.

#### 2.4 — `datos/resultados_dry_run.json`

Datos ficticios **marcados explícitamente** para no confundir con resultados reales:

| Exp | s_Claude | s_Gemini | s_GPT4 | Std | Outlier | CF |
|-----|----------|----------|--------|-----|---------|-----|
| 1A | 88 | 86 | 87 | 1.0 | — | 87 |
| 1B | 42 | 38 | 45 | 3.6 | — | 42 |
| 2C | 84 | 55 | 58 | 15.6* | Claude | 68** |
| 3D run1-3 | 87 | 87 | 86 | — | — | 87 |

\* Ajustar para std > 20 si el dry-run debe demostrar flag de alucinación (ej. 88, 52, 54 → std ≈ 20.8)  
\** Con penalización de outlier

**Criterio de done:** Scripts ejecutan sin error en dry-run; tabla maestra se genera automáticamente.

---

### Fase 3 — Figuras (1 h) — SIN prototipo (con dry-run)

#### `scripts/generate_figures.py`

Lee `resultados_experimentos.json` o `--input datos/resultados_dry_run.json`.

| Figura | Tipo | Datos | Caption borrador |
|--------|------|-------|------------------|
| Fig 3 | Barras agrupadas | Exp 1A vs 1B × 3 modelos | "Model score comparison for secure (1A) vs. vulnerable (1B) skill artifacts." |
| Fig 4 | Barras + línea mediana | Exp 2C, outlier resaltado | "Score dispersion on ambiguous authentication skill (2C); outlier model flagged by synthesizer." |
| Fig 5 | Boxplot | 3 runs de Exp 3D | "CF score distribution across three T=0 runs of artifact 3D." |

Salida: `salida/figuras/fig3_calibracion.png`, etc.  
Resolución: 300 DPI, fuente legible en PDF (mín. 10pt en ejes).

**Criterio de done:** 3 PNG generados desde dry-run; captions en `tabla_maestra.md` o archivo `figuras_captions.md`.

---

### Fase 4 — Redacción del paper (2–2.5 h) — MAYORMENTE sin prototipo

Archivo: `salida/paper_secciones_4_5_6.md`

#### Sección 4 — Results (~400 palabras) — BORRADOR con placeholders

Estructura fija; reemplazar `[X]` cuando lleguen datos:

```markdown
## 4. Results

### 4.1 Base Calibration (Experiment 1)
We evaluated a gold-standard API skill (1A) and an intentionally vulnerable variant (1B).
The secure artifact achieved CF=[N] (std=[X]), while the vulnerable artifact scored CF=[M] (std=[Y]).
All three models converged on the secure artifact (Figure 3, Table 1).

### 4.2 Hallucination Detection (Experiment 2)
The ambiguous login skill (2C) produced std=[X], triggering the hallucination flag.
Outlier model: [nombre], deviation from median: [Y] points.
Penalized CF=[Z] vs. unpenalized mean=[Z'] (Figure 4).

### 4.3 Reproducibility (Experiment 3)
Three T=0 runs of artifact 3D showed CF variation of [X] points (Figure 5).

### 4.4 Requirements Evaluation (Experiment 4)
Process-Guard evaluated the project requirements document (4E) with CF=[N].
Key findings: [hallazgos específicos del documento].
```

#### Sección 5 — Discussion — REDACTAR COMPLETA

| Subsección | Depende de datos | Acción borrador |
|------------|------------------|-----------------|
| 5.1 Implicaciones AI Safety | Parcial | Redactar marco; 1 párrafo con `[cuantificar con Tabla 1]` |
| 5.2 Limitaciones | No | **Escribir completa** (latencia, costo, consenso≠verdad, APIs, rúbricas, scope) |
| 5.3 Doble Uso | No | **Escribir completa** (3 riesgos + 3 mitigaciones de la tarea) |
| 5.4 Trabajo futuro | No | **Escribir completa** |

Fuente para 5.2: `Hakaton/proyect/analisis_limitaciones_apis.md`

#### Sección 6 — Conclusion (~150 palabras) — BORRADOR

4 puntos de la tarea con placeholders:
1. Problema (completo)
2. Solución (completo)
3. Resultado principal → `[el sistema detecta/no detecta alucinaciones con std > 20 en Exp 2C]`
4. Implicación AI Control (completo)

**Criterio de done:** `paper_secciones_4_5_6.md` ≥ 800 palabras; secciones 5.2–5.4 sin placeholders.

---

### Fase 5 — Ejecución real (2–3 h) — REQUIERE prototipo T4

**Trigger:** `curl http://localhost:8000/health` responde OK.

**Orden de ejecución (prioridad si hay limitaciones):**

```
1. Smoke test: 1 artefacto pequeño → verificar JSON válido
2. Exp 1A + 1B (calibración) — OBLIGATORIO
3. Exp 2C (alucinación) — OBLIGATORIO para el paper
4. Exp 3D × 3 runs (reproducibilidad)
5. Exp 4E (requisitos)
```

**Si solo hay 1–2 modelos disponibles:**
- Ejecutar igual; documentar en 5.2 Limitaciones
- Usar `synthesize_local.py` con los scores disponibles
- No inventar el tercer score

**Post-ejecución (30 min):**
- [ ] Reemplazar placeholders en Sección 4
- [ ] Completar párrafo cuantitativo en 5.1
- [ ] Actualizar Conclusion
- [ ] `python generate_figures.py --input datos/resultados_experimentos.json`
- [ ] Regenerar `tabla_maestra.md`

---

### Fase 6 — Integración PDF (1–2 h) — Domingo AM

Archivo guía: `integracion/checklist_pdf.md`

**Pasos:**
1. Recibir de T1: `paper_secciones_1_2.md` + referencias
2. Recibir de T2: Sección 3 + Figuras 1–2
3. Integrar Secciones 4–6 + Figuras 3–5 + Table 1
4. Abstract definitivo (T1, con números de Exp 2C)
5. LLM Usage Statement (todos)
6. Exportar PDF (Pandoc/LaTeX o Google Docs template)
7. Verificar: ≤8 páginas, figuras legibles, Doble Uso presente

---

## Cronograma sugerido

| Ventana | Fase | Entregable |
|---------|------|------------|
| Sáb 20, 14:00–15:30 | Fase 0 + 1 | Artefactos + HIPOTESIS.md |
| Sáb 20, 15:30–17:30 | Fase 2 | Scripts + schema + dry-run JSON |
| Sáb 20, 17:30–18:30 | Fase 3 | Figuras desde dry-run |
| Sáb 20, 18:30–21:00 | Fase 4 | paper_secciones_4_5_6.md borrador |
| Sáb 20, 21:00+ | Fase 5 | Ejecución real (cuando T4 entregue) |
| Dom 21, 09:00–11:00 | Fase 5 cont. | Datos reales → placeholders |
| Dom 21, 11:00–13:00 | Fase 6 | PDF final integrado |

---

## Plan B — Si T4 no entrega a tiempo

| Escenario | Acción |
|-----------|--------|
| API con 1 modelo | Ejecutar Exp 1+2; limitación documentada |
| Sin API | Evaluación manual: mismo prompt en 3 chats; scores a mano en JSON |
| Sin ninguna API | Entregar borrador con dry-run marcado `dry_run: true` + Limitaciones explícitas |
| Timeout domingo 09:00 | Priorizar Exp 2C (alucinación) sobre Exp 3D y 4E |

**Regla:** Nunca publicar datos ficticios como reales. Si se usa dry-run en el paper, debe decirse en Limitaciones.

---

## Checklist rápido — Borrador completo

### Sin prototipo (hacer hoy)
- [ ] 5 artefactos en `artefactos/`
- [ ] `HIPOTESIS.md` con expectativas
- [ ] `schema.json` acordado con T4
- [ ] `run_experiments.py` con `--dry-run`
- [ ] `generate_figures.py` produce 3 PNG
- [ ] `paper_secciones_4_5_6.md` (5.2, 5.3, 5.4, 6 completos)
- [ ] `tabla_maestra.md` generada desde dry-run

### Con prototipo (domingo AM)
- [ ] `resultados_experimentos.json` con datos reales
- [ ] Placeholders de Sección 4 reemplazados
- [ ] Figuras regeneradas con datos reales
- [ ] Abstract actualizado (T1)
- [ ] PDF integrado y revisado

---

## Próximo paso inmediato

Ejecutar **Fase 0 + Fase 1** en una sola sesión (~1.5 h): crear carpetas, escribir los 5 artefactos y `HIPOTESIS.md`. Es el trabajo de mayor valor que no depende de nadie más.

Después: implementar `run_experiments.py` y `generate_figures.py` en modo dry-run para validar el pipeline completo antes de que exista la API.
