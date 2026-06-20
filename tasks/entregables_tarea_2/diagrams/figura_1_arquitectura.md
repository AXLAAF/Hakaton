# Figura 1: Arquitectura de Evaluación de Process-Guard

```mermaid
graph TD
    U[Usuario / CI-CD Pipeline] -->|Sube 1 Solo Artefacto\n(Requisitos, Diseño, Código, Skill)| VPS[VPS Reverse Proxy\nNginx / Caddy]
    VPS --> API[Process-Guard API\nFastify + Node.js]
    API --> ORCH[Orquestador de Tareas\nBullMQ + Redis]
    
    ORCH -->|API Key Unificada| OR_PROXY{OpenRouter API Gateway}
    
    OR_PROXY -->|Evalúa el MISMO artefacto| M1[IA 1: Claude 3.5 Sonnet]
    OR_PROXY -->|Evalúa el MISMO artefacto| M2[IA 2: Gemini 1.5 Pro]
    OR_PROXY -->|Evalúa el MISMO artefacto| M3[IA 3: GPT-4o]
    
    M1 -->|Reporte Individual + Gates + Métrica| SYNTH[Sintetizador de Dos Fases\nEvaluación de Gates y Consenso]
    M2 -->|Reporte Individual + Gates + Métrica| SYNTH
    M3 -->|Reporte Individual + Gates + Métrica| SYNTH
    
    SYNTH -->|Fase 1: Gates de Veto\nFase 2: Consenso y N/E| DB[(Almacenamiento\nPostgreSQL)]
    SYNTH --> OUT[Veredicto Consolidado de las 3 IAs\n(APROBADO, APROBADO_CON_OBS, REPROBADO, INCONCLUSO)]
```
