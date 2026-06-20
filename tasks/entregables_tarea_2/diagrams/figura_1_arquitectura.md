# Figura 1: Arquitectura de Evaluación de Process-Guard

```mermaid
graph TD
    U[Usuario / CI-CD Pipeline] -->|Sube artefacto| API[Process-Guard API\nFastAPI]
    API --> ORCH[Orquestador Asíncrono\nasyncio.gather]
    
    ORCH -->|Prompt Evaluación + Artefacto| M1[Claude 3.5 Sonnet\nAnthropic API]
    ORCH -->|Prompt Evaluación + Artefacto| M2[Gemini 1.5 Pro\nGoogle GenAI API]
    ORCH -->|Prompt Evaluación + Artefacto| M3[GPT-4o\nOpenAI API]
    
    M1 -->|Reporte + Métrica JSON| SYNTH[Sintetizador\nDetección de Outlier]
    M2 -->|Reporte + Métrica JSON| SYNTH
    M3 -->|Reporte + Métrica JSON| SYNTH
    
    SYNTH --> CF[Calificación Final\n0-100 + Estado]
    SYNTH --> REPORT[Reporte Consolidado\nDiscrepancias + Riesgos]
    
    CF --> OUT[Output al usuario\nJSON / Markdown / PDF]
    REPORT --> OUT
```
