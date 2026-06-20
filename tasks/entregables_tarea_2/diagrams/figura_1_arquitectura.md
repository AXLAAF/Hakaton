# Figura 1: Arquitectura de Evaluación de Process-Guard

```mermaid
graph TD
    U[Usuario / CI-CD Pipeline] -->|Sube 1 Solo Artefacto\n(Contexto, Requisitos, Skill, Proyecto)| VPS[VPS Reverse Proxy\nNginx / Caddy]
    VPS --> API[Process-Guard API\nFastify + Node.js]
    API --> ORCH[Orquestador de Tareas\nBullMQ + Redis]
    
    ORCH -->|API Key Unificada| OR_PROXY{OpenRouter API Gateway}
    
    OR_PROXY -->|Evalúa el MISMO artefacto| M1[IA 1: Claude 3.5 Sonnet]
    OR_PROXY -->|Evalúa el MISMO artefacto| M2[IA 2: Gemini 1.5 Pro]
    OR_PROXY -->|Evalúa el MISMO artefacto| M3[IA 3: GPT-4o]
    
    M1 -->|Reporte Individual + Métrica| SYNTH[Sintetizador\nDetección de Discrepancias]
    M2 -->|Reporte Individual + Métrica| SYNTH
    M3 -->|Reporte Individual + Métrica| SYNTH
    
    SYNTH --> DB[(Almacenamiento\nPostgreSQL)]
    SYNTH --> CF[1 Calificación Cuantificable\nNúmero Sólido 0-100]
    
    CF --> OUT[Resumen Consolidado de las 3 IAs\nJSON / Markdown]
```
