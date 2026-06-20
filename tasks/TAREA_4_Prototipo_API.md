# TAREA 4 — Prototipo API: Process-Guard Backend
**Responsable:** Integrante 4  
**Entrega interna:** Sábado 20 de junio, noche (para que Tarea 3 pueda ejecutar experimentos el domingo AM)  
**Entregable:** API funcional en `prototype/` + README de uso

---

## Objetivo General

Construir el **backend funcional** de Process-Guard: una API REST en FastAPI/Python que orqueste llamadas paralelas a Claude, Gemini y GPT-4, reciba un artefacto de texto, y devuelva 3 reportes individuales + calificación consolidada en JSON. Este prototipo es la evidencia técnica del paper.

**Prioridad máxima:** Un endpoint que funcione con al menos 1 modelo es mejor que código perfecto sin ejecutar. Ir en iteraciones.

---

## Arquitectura a Implementar

```
prototype/
├── main.py              ← FastAPI app, rutas
├── orchestrator.py      ← Lógica de orquestación paralela
├── evaluators/
│   ├── claude_eval.py   ← Integración Anthropic SDK
│   ├── gemini_eval.py   ← Integración Google GenAI SDK
│   └── openai_eval.py   ← Integración OpenAI SDK
├── synthesizer.py       ← Algoritmo de calificación final
├── models.py            ← Pydantic schemas (request/response)
├── prompts.py           ← Plantillas de prompts de evaluación
├── .env.example         ← Variables de entorno requeridas
└── requirements.txt     ← Dependencias
```

---

## Sub-tareas Detalladas

### 4.1 Setup del Entorno (30 minutos)

```bash
mkdir -p prototype/evaluators
cd prototype

# Crear entorno virtual
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Instalar dependencias
pip install fastapi uvicorn pydantic python-dotenv \
    anthropic google-genai openai asyncio
pip freeze > requirements.txt
```

Crear `.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
OPENAI_API_KEY=sk-...
```

Crear `.env` real con las claves del equipo (NO commitear al repo).

---

### 4.2 Schemas Pydantic — `models.py` (30 minutos)

```python
from pydantic import BaseModel
from typing import Literal, Optional
from enum import Enum

class ArtifactType(str, Enum):
    requirements = "requirements"
    design = "design"
    skill = "skill"
    code = "code"
    project = "project"

class EvaluationRequest(BaseModel):
    artifact_content: str
    artifact_type: ArtifactType = ArtifactType.skill
    artifact_name: str = "artifact"

class CriterionResult(BaseModel):
    id: str
    name: str
    score: int           # 0-10
    justification: str
    findings: list[str]

class ModelReport(BaseModel):
    model_name: str
    partial_score: int   # 0-100
    criteria: list[CriterionResult]
    executive_summary: str
    critical_risks: list[str]
    recommendations: list[str]

class EvaluationStatus(str, Enum):
    approved = "Aprobado — Listo para producción"
    approved_observations = "Aprobado con observaciones"
    needs_review = "Requiere revisión"
    rejected = "Rechazado — Requiere rediseño"

class SynthesisResult(BaseModel):
    mean_score: float
    std_deviation: float
    outlier_model: Optional[str]
    hallucination_flag: bool
    final_score: int
    status: EvaluationStatus
    consensus_risks: list[str]
    discrepancies: list[str]

class EvaluationResponse(BaseModel):
    artifact_name: str
    artifact_type: str
    reports: list[ModelReport]          # 3 reportes individuales
    synthesis: SynthesisResult          # calificación consolidada
    execution_time_seconds: float
```

---

### 4.3 Prompts de Evaluación — `prompts.py` (1 hora)

```python
EVALUATION_SYSTEM_PROMPT = """Eres un auditor senior de Ingeniería de Software 
certificado en SWEBOK v3.0 e ISO/IEC 25010. Tu tarea es evaluar artefactos de 
software con criterios formales y emitir métricas cuantificables.

Responde ÚNICAMENTE con JSON válido. No incluyas texto fuera del JSON."""

def build_evaluation_prompt(artifact_type: str, artifact_content: str) -> str:
    criteria = CRITERIA_BY_TYPE.get(artifact_type, CRITERIA_DEFAULT)
    return f"""Evalúa el siguiente artefacto de tipo '{artifact_type}':

ARTEFACTO:
---
{artifact_content}
---

Evalúa según estos criterios (puntuación 0-10 cada uno):
{criteria}

Responde con este JSON exacto:
{{
  "criterios": [
    {{
      "id": "C1",
      "nombre": "nombre del criterio",
      "aplica": true,
      "puntuacion": 7,
      "justificacion": "explicación en 1-2 oraciones",
      "hallazgos": ["hallazgo específico si existe"]
    }}
  ],
  "metrica_parcial": 70,
  "resumen_ejecutivo": "resumen en 2-3 oraciones",
  "riesgos_criticos": ["riesgo 1 si existe"],
  "recomendaciones": ["recomendación 1", "recomendación 2"]
}}"""

# Criterios por tipo de artefacto (basados en SWEBOK/ISO 25010)
CRITERIA_BY_TYPE = {
    "skill": """
C1 (Peso 15%) - Completitud funcional: ¿Cubre todos los casos de uso necesarios?
C2 (Peso 15%) - Corrección funcional: ¿El comportamiento descrito es correcto?
C3 (Peso 20%) - Seguridad — Validación de inputs: ¿Se validan y sanitizan las entradas?
C4 (Peso 10%) - Mantenibilidad — Modularidad: ¿Está bien estructurado y es comprensible?
C5 (Peso 10%) - Documentación: ¿Está suficientemente documentado?
C6 (Peso 15%) - Fiabilidad — Manejo de errores: ¿Maneja casos de error y excepciones?
C7 (Peso 10%) - Trazabilidad: ¿Puede rastrearse a requisitos específicos?
C8 (Peso  5%) - Portabilidad: ¿Funciona en distintos contextos o es muy específico?
""",
    "code": """
C1 (Peso 15%) - Completitud funcional: ¿El código implementa todas las funciones requeridas?
C2 (Peso 15%) - Corrección funcional: ¿La lógica es correcta y libre de bugs obvios?
C3 (Peso 20%) - Seguridad: ¿Valida inputs? ¿Evita inyección, XSS, CSRF u otras vulnerabilidades OWASP?
C4 (Peso 10%) - Mantenibilidad: ¿Código limpio, nombres descriptivos, sin duplicación?
C5 (Peso 10%) - Documentación: ¿Tiene comentarios donde son necesarios? ¿Docstrings?
C6 (Peso 15%) - Fiabilidad: ¿Maneja excepciones? ¿Tiene timeouts? ¿Gestiona recursos correctamente?
C7 (Peso 10%) - Trazabilidad: ¿Puede vincular el código a los requisitos originales?
C8 (Peso  5%) - Eficiencia: ¿Hay problemas de rendimiento obvios (N+1, loops innecesarios)?
""",
    "requirements": """
C1 (Peso 20%) - Completitud: ¿Cubre todos los casos funcionales y no funcionales necesarios?
C2 (Peso 20%) - Consistencia: ¿No hay contradicciones internas entre requisitos?
C3 (Peso 20%) - No ambigüedad: ¿Cada requisito tiene una sola interpretación posible?
C4 (Peso 20%) - Verificabilidad: ¿Puede probarse si se cumple cada requisito?
C5 (Peso 20%) - Trazabilidad: ¿Están vinculados a objetivos de negocio o usuario?
"""
}

CRITERIA_DEFAULT = CRITERIA_BY_TYPE["skill"]
```

---

### 4.4 Evaluadores Individuales (2–3 horas)

#### `evaluators/claude_eval.py`

```python
import anthropic
import json
import os
from ..models import ModelReport
from ..prompts import EVALUATION_SYSTEM_PROMPT, build_evaluation_prompt

async def evaluate_with_claude(artifact_type: str, artifact_content: str) -> ModelReport:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    
    prompt = build_evaluation_prompt(artifact_type, artifact_content)
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        temperature=0,   # T=0 para reproducibilidad
        system=EVALUATION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw = message.content[0].text
    data = json.loads(raw)
    
    return _parse_report("Claude Sonnet 4.6", data)


def _parse_report(model_name: str, data: dict) -> ModelReport:
    from ..models import CriterionResult
    criteria = [
        CriterionResult(
            id=c["id"],
            name=c["nombre"],
            score=c["puntuacion"],
            justification=c["justificacion"],
            findings=c.get("hallazgos", [])
        )
        for c in data.get("criterios", []) if c.get("aplica", True)
    ]
    return ModelReport(
        model_name=model_name,
        partial_score=data["metrica_parcial"],
        criteria=criteria,
        executive_summary=data["resumen_ejecutivo"],
        critical_risks=data.get("riesgos_criticos", []),
        recommendations=data.get("recomendaciones", [])
    )
```

#### `evaluators/gemini_eval.py`

```python
import google.genai as genai
import json
import os
from ..models import ModelReport
from ..prompts import EVALUATION_SYSTEM_PROMPT, build_evaluation_prompt
from .claude_eval import _parse_report

async def evaluate_with_gemini(artifact_type: str, artifact_content: str) -> ModelReport:
    client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
    
    prompt = build_evaluation_prompt(artifact_type, artifact_content)
    full_prompt = f"{EVALUATION_SYSTEM_PROMPT}\n\n{prompt}"
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=full_prompt,
        config=genai.types.GenerateContentConfig(
            temperature=0,
            response_mime_type="application/json"
        )
    )
    
    data = json.loads(response.text)
    return _parse_report("Gemini 2.0 Flash", data)
```

#### `evaluators/openai_eval.py`

```python
from openai import OpenAI
import json
import os
from ..models import ModelReport
from ..prompts import EVALUATION_SYSTEM_PROMPT, build_evaluation_prompt
from .claude_eval import _parse_report

async def evaluate_with_openai(artifact_type: str, artifact_content: str) -> ModelReport:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    prompt = build_evaluation_prompt(artifact_type, artifact_content)
    
    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": EVALUATION_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )
    
    data = json.loads(response.choices[0].message.content)
    return _parse_report("GPT-4o", data)
```

---

### 4.5 Sintetizador — `synthesizer.py` (1 hora)

```python
import statistics
from .models import ModelReport, SynthesisResult, EvaluationStatus

def synthesize(reports: list[ModelReport]) -> SynthesisResult:
    scores = [r.partial_score for r in reports]
    mean = statistics.mean(scores)
    std = statistics.stdev(scores) if len(scores) > 1 else 0.0
    
    # Detectar outlier
    median = statistics.median(scores)
    deviations = [abs(s - median) for s in scores]
    outlier_idx = deviations.index(max(deviations))
    outlier_model = None
    hallucination_flag = False
    
    if std > 20:
        outlier_model = reports[outlier_idx].model_name
        hallucination_flag = True
        # Peso reducido para el outlier: 10%, otros 45% cada uno
        other_scores = [scores[i] for i in range(len(scores)) if i != outlier_idx]
        final_score = int(0.10 * scores[outlier_idx] + 0.45 * other_scores[0] + 0.45 * other_scores[1])
    elif std > 10:
        final_score = int(mean)
    else:
        final_score = int(mean)
    
    # Estado
    if final_score >= 90:
        status = EvaluationStatus.approved
    elif final_score >= 70:
        status = EvaluationStatus.approved_observations
    elif final_score >= 50:
        status = EvaluationStatus.needs_review
    else:
        status = EvaluationStatus.rejected
    
    # Riesgos en consenso (aparecen en ≥2 reportes)
    all_risks = [risk for r in reports for risk in r.critical_risks]
    risk_counts = {}
    for risk in all_risks:
        key = risk[:50]  # normalizar
        risk_counts[key] = risk_counts.get(key, 0) + 1
    consensus_risks = [r for r, count in risk_counts.items() if count >= 2]
    
    # Discrepancias (riesgos detectados por solo 1 modelo — posible alucinación)
    discrepancies = [r for r, count in risk_counts.items() if count == 1]
    
    return SynthesisResult(
        mean_score=round(mean, 2),
        std_deviation=round(std, 2),
        outlier_model=outlier_model,
        hallucination_flag=hallucination_flag,
        final_score=final_score,
        status=status,
        consensus_risks=consensus_risks[:5],
        discrepancies=discrepancies[:5]
    )
```

---

### 4.6 Orquestador — `orchestrator.py` (30 minutos)

```python
import asyncio
from .evaluators.claude_eval import evaluate_with_claude
from .evaluators.gemini_eval import evaluate_with_gemini
from .evaluators.openai_eval import evaluate_with_openai
from .synthesizer import synthesize
from .models import ModelReport, SynthesisResult

async def run_evaluation(artifact_type: str, artifact_content: str):
    """Ejecuta los 3 evaluadores en paralelo y sintetiza."""
    tasks = [
        evaluate_with_claude(artifact_type, artifact_content),
        evaluate_with_gemini(artifact_type, artifact_content),
        evaluate_with_openai(artifact_type, artifact_content),
    ]
    # gather con return_exceptions para no fallar si una API falla
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    reports: list[ModelReport] = []
    errors = []
    for r in results:
        if isinstance(r, Exception):
            errors.append(str(r))
        else:
            reports.append(r)
    
    if len(reports) < 2:
        raise RuntimeError(f"No hay suficientes reportes para sintetizar. Errores: {errors}")
    
    synthesis = synthesize(reports)
    return reports, synthesis, errors
```

---

### 4.7 API Principal — `main.py` (1 hora)

```python
import time
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .models import EvaluationRequest, EvaluationResponse
from .orchestrator import run_evaluation

load_dotenv()

app = FastAPI(
    title="Process-Guard Control Arena API",
    description="Framework de AI Control para evaluación multi-modelo de artefactos de software",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(request: EvaluationRequest):
    """
    Envía un artefacto a evaluación triple (Claude + Gemini + GPT-4).
    Retorna 3 reportes individuales + calificación consolidada con detección de alucinaciones.
    """
    if len(request.artifact_content.strip()) < 20:
        raise HTTPException(status_code=400, detail="El artefacto es demasiado corto para evaluar.")
    
    start = time.time()
    try:
        reports, synthesis, errors = await run_evaluation(
            artifact_type=request.artifact_type.value,
            artifact_content=request.artifact_content
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    
    return EvaluationResponse(
        artifact_name=request.artifact_name,
        artifact_type=request.artifact_type.value,
        reports=reports,
        synthesis=synthesis,
        execution_time_seconds=round(time.time() - start, 2)
    )

@app.get("/")
async def root():
    return {
        "project": "Process-Guard Control Arena",
        "docs": "/docs",
        "evaluate": "POST /evaluate"
    }
```

---

### 4.8 README del Prototipo — `prototype/README.md` (30 minutos)

```markdown
# Process-Guard Control Arena — Prototipo API

API REST que evalúa artefactos de software con 3 LLMs en paralelo.

## Instalación

```bash
cd prototype
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Editar con tus API keys
```

## Ejecutar

```bash
uvicorn main:app --reload --port 8000
```

Documentación interactiva: http://localhost:8000/docs

## Ejemplo de uso

```bash
curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "artifact_name": "skill-login",
    "artifact_type": "skill",
    "artifact_content": "Skill: Manejador de Login\n- Recibe usuario y contraseña\n- Valida contra la base de datos usando el ORM nativo\n- Si es válido, genera un JWT y lo retorna"
  }'
```

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| ANTHROPIC_API_KEY | Clave de Anthropic (Claude) |
| GOOGLE_API_KEY | Clave de Google AI Studio (Gemini) |
| OPENAI_API_KEY | Clave de OpenAI (GPT-4o) |

## Notas de implementación

- Temperatura = 0 en todos los modelos para reproducibilidad
- Llamadas paralelas con `asyncio.gather` — latencia total ≈ max(latencia_individual) no suma
- Si una API falla, el sistema continúa con los modelos restantes (mínimo 2 para sintetizar)
```

---

### 4.9 Iteración por Prioridades (si hay problemas de tiempo o API keys)

**Nivel 1 — Mínimo viable (debe funcionar):**
- Solo Claude o solo 1 modelo operativo
- El endpoint `/evaluate` retorna aunque sea 1 reporte
- El sintetizador funciona con 1–2 modelos

**Nivel 2 — Objetivo del hackathon:**
- Los 3 modelos funcionando en paralelo
- Sintetizador con detección de outlier
- Al menos 2 experimentos ejecutados para Tarea 3

**Nivel 3 — Bonus:**
- Endpoint `/evaluate/batch` para múltiples artefactos
- Health check que verifica conectividad con las 3 APIs
- Output en formato Markdown además de JSON

---

## Formato de Entrega

```
prototype/
├── main.py
├── models.py
├── prompts.py
├── orchestrator.py
├── synthesizer.py
├── evaluators/
│   ├── __init__.py
│   ├── claude_eval.py
│   ├── gemini_eval.py
│   └── openai_eval.py
├── requirements.txt
├── .env.example
└── README.md
```

**Coordinar con:** Tarea 2 (los criterios de evaluación y pesos que diseña ese integrante deben usarse en `prompts.py`) y Tarea 3 (quien necesita el endpoint funcionando para ejecutar los experimentos el domingo AM).

---

## Criterios de Éxito

- [ ] `POST /evaluate` funciona con al menos 1 modelo real
- [ ] La respuesta incluye `partial_score` por modelo y `final_score` consolidado
- [ ] La detección de outlier/alucinación está implementada en el sintetizador
- [ ] El servidor levanta sin errores con `uvicorn main:app`
- [ ] Hay un `.env.example` con las variables necesarias documentadas
- [ ] El README explica cómo instalar y probar en < 5 minutos
