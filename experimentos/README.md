# Experimentos — Tarea 3 (Process-Guard)

Pipeline reproducible para los experimentos, figuras y secciones 4–6 del
paper. Diseñado para funcionar **antes** de que exista el prototipo (Tarea
4) usando un modo dry-run, y para ejecutarse contra la API real cuando esté
disponible.

## Estructura

```
experimentos/
├── PLAN_BORRADOR_TAREA_3.md     Plan de implementación
├── artefactos/                  Inputs de prueba (.txt) + HIPOTESIS.md
├── scripts/                     run_experiments, generate_figures, synthesize_local
├── datos/                       schema.json, resultados_*.json
├── salida/                      tabla_maestra.md, paper_secciones_4_5_6.md, figuras/
└── integracion/                 checklist_pdf.md
```

## Requisitos

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install matplotlib
```

`run_experiments.py` usa solo la librería estándar (`urllib`), así que no
requiere dependencias extra. `generate_figures.py` requiere `matplotlib`.

## Uso

### 1. Sin prototipo (validar el pipeline con datos ficticios)

```bash
cd Hakaton/experimentos
python scripts/run_experiments.py --dry-run
python scripts/generate_figures.py --input datos/resultados_dry_run.json
```

Esto genera `salida/tabla_maestra.md` y las 3 figuras (con marca de agua
"DRY-RUN"). Sirve para confirmar que todo el flujo funciona.

### 2. Con prototipo (datos reales)

```bash
# Verificar que la API responde
curl http://localhost:8000/health

# Ejecutar los 4 experimentos (Exp 3 corre 3 veces automaticamente)
python scripts/run_experiments.py --api http://localhost:8000

# Generar figuras con datos reales (sin marca de agua)
python scripts/generate_figures.py
```

Después:
1. Reemplazar los `[PLACEHOLDER]` en `salida/paper_secciones_4_5_6.md` con
   los números de `datos/resultados_experimentos.json` / `tabla_maestra.md`.
2. Seguir `integracion/checklist_pdf.md` para el PDF final.

### Fallback sin API (evaluación manual)

Si no hay API pero sí acceso a los chats de los modelos: pegar el prompt de
evaluación (de T2/T4) con cada artefacto en Claude/Gemini/GPT, anotar los
scores y usarlos con:

```bash
python scripts/synthesize_local.py
```

para obtener CF, std y flag de alucinación con la misma fórmula del sistema.

## Mapa de entregables (Tarea 3)

| Entregable pedido | Archivo |
|-------------------|---------|
| `resultados_experimentos.json` | `datos/resultados_experimentos.json` |
| `paper_secciones_4_5_6.md` | `salida/paper_secciones_4_5_6.md` |
| `figuras/` | `salida/figuras/` |
| Tabla maestra | `salida/tabla_maestra.md` |

## Estado actual

- [x] Artefactos de prueba + hipótesis
- [x] Scripts (run, figuras, sintetizador local)
- [x] Datos dry-run + schema
- [x] Borrador de secciones 4–6 (5.2–5.4 y 6 completas; 4 y 5.1 con placeholders)
- [ ] Ejecución real contra el prototipo (bloqueado por Tarea 4)
- [ ] Reemplazo de placeholders con datos reales
- [ ] PDF final integrado
