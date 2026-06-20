# Figura 3: Diagrama de Casos de Uso (UML)

Este diagrama representa las interacciones clave entre los actores primarios (Desarrollador y Pipeline de CI/CD), el sistema interno (Process-Guard Control Arena, el Orquestador y el Sintetizador) y los actores externos (OpenRouter Gateway y Administrador) bajo el estándar ISO/IEC/IEEE 29148.

```mermaid
graph LR
    subgraph Actores_Primarios[Actores Primarios]
        U[Desarrollador Humano]
        CI[Pipeline de CI/CD]
    end

    subgraph Sistema[Process-Guard Control Arena]
        UC1((UC-01: Registrar y<br>Encolar Artefacto))
        UC2((UC-02: Auditar Artefacto<br>Paralelamente))
        UC3((UC-03: Sintetizar, Evaluar<br>Gates y Consenso))
        UC4((UC-04: Consultar Reporte<br>y Aprobación))
        UC5((UC-05: Modificar Umbrales<br>y Rúbricas))
    end

    subgraph Actores_Secundarios[Actores de Soporte / Admin]
        OR{OpenRouter Gateway}
        ADM[Administrador de Sistema]
    end

    %% Relaciones de actores primarios
    U -->|POST /api/v1/evaluaciones| UC1
    CI -->|POST /api/v1/evaluaciones| UC1
    
    U -->|GET /api/v1/evaluaciones/:id| UC4
    CI -->|GET /api/v1/evaluaciones/:id| UC4

    %% Relaciones internas
    UC1 -.->|Encola trabajo Redis| UC2
    UC2 -.->|Incluye evaluación de gates y consenso| UC3

    %% Relaciones de actores de soporte/admin
    UC2 -->|Inferencia T=0.0 Claude/Gemini/GPT| OR
    ADM -->|Ajusta pesos y rúbricas| UC5
```
