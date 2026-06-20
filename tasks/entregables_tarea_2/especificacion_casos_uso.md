# Especificación de Casos de Uso: Process-Guard Control Arena
**Estándar de Referencia:** ISO/IEC/IEEE 29148:2018 & UML 2.5.1  
**Fase:** Diseño y Requisitos de Software (Entregable Tarea 2)

Este documento define la especificación formal de los casos de uso del framework **Process-Guard Control Arena**. Describe la interacción de los actores humanos y de sistema con el middleware de evaluación "3 contra 1", garantizando la trazabilidad funcional y la reproducibilidad del proceso de control de calidad.

---

## 1. Identificación de Actores

* **Desarrollador de Software (Actor Primario - Humano):** Ingeniero que genera y modifica artefactos de software (requisitos, arquitectura, código, skills) y requiere una validación objetiva para avanzar en el ciclo de vida (SDLC).
* **Pipeline de CI/CD (Actor Primario - Sistema):** Sistema automatizado de integración y despliegue continuo que invoca al framework para validar commits y ramas de código de forma programática.
* **Orquestador BullMQ (Actor Secundario / de Sistema):** Componente middleware asíncrono que administra la cola de evaluaciones y coordina la distribución paralela de trabajos.
* **OpenRouter Gateway (Actor de Soporte - Servicio Externo):** API unificada que encapsula la comunicación con los proveedores de LLMs heterogéneos (Anthropic, Google, OpenAI).
* **Administrador del Sistema (Actor Secundario - Humano):** Ingeniero responsable de afinar los umbrales de desviación estándar, pesos de rúbricas y configuraciones de las APIs.

---

## 2. Diagrama General de Casos de Uso (UML)

```mermaid
left to right direction
actor "Desarrollador / CI-CD" as Client
actor "Orquestador (BullMQ/Redis)" as Orch
actor "OpenRouter Gateway" as LLM
actor "Administrador" as Admin

rectangle "Process-Guard Control Arena" {
  usecase "UC-01: Registrar y Encolar Artefacto" as UC1
  usecase "UC-02: Auditar Artefacto Paralelamente" as UC2
  usecase "UC-03: Sintetizar, Evaluar Gates y Consenso" as UC3
  usecase "UC-04: Consultar Reporte y Aprobación" as UC4
  usecase "UC-05: Modificar Umbrales y Rúbricas" as UC5
}

Client --> UC1
Client --> UC4
Orch --> UC2
UC2 --> LLM
UC2 ..> UC3 : <<include>>
Admin --> UC5
```

---

## 3. Especificaciones Detalladas de Casos de Uso

### UC-01: Registrar y Encolar Artefacto para Evaluación
* **ID / Nombre:** UC-01 / Registrar y Encolar Artefacto para Evaluación.
* **Actor Primario:** Desarrollador de Software o Pipeline de CI/CD.
* **Descripción:** Permite a un cliente subir un artefacto de software (de tipo A1 a A4) para someterlo al protocolo de auditoría multi-modelo de Process-Guard de manera asíncrona.
* **Precondiciones:**
  1. El cliente está autenticado mediante un token de API válido en la plataforma.
  2. El artefacto cumple con los formatos de entrada permitidos (Markdown, JSON, o archivos de código plano).
* **Flujo Principal (Escenario Exitoso):**
  1. El cliente realiza una petición HTTP `POST` a `/api/v1/evaluaciones` enviando:
     - El contenido del artefacto o archivo.
     - El tipo de artefacto (`A1`, `A2`, `A3` o `A4`).
     - (Opcional) La terna de modelos de evaluación deseados (por defecto: Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o).
  2. El sistema valida la estructura del payload y la firma del token.
  3. El sistema identifica el tipo de rúbrica correspondiente al tipo de artefacto (según `rubrica_evaluacion.md`).
  4. El sistema registra la petición en la base de datos con estado `PENDING`.
  5. El sistema inserta un nuevo trabajo (job) en la cola asíncrona de **BullMQ + Redis**.
  6. El sistema devuelve al cliente un código de estado `202 Accepted` y un `task_id` único para rastreo.
* **Flujos Alternativos:**
  * **Alt 1a: Tipo de Artefacto Inválido:**
    1. En el paso 2, el sistema detecta un tipo de artefacto no registrado (ej. `A5`).
    2. El sistema cancela el registro, genera un log de error y responde con `400 Bad Request` indicando la falla de validación.
  * **Alt 1b: Falla de Conexión de Redis:**
    1. En el paso 5, la cola de tareas no responde por fallas de conexión o desbordamiento de memoria.
    2. El sistema reintenta la conexión 3 veces. Si falla, marca el estado en BD como `FAILED` y responde con `503 Service Unavailable`.
* **Postcondiciones:** El artefacto queda almacenado temporalmente y el trabajo está encolado en Redis a la espera de un worker activo.

---

### UC-02: Auditar Artefacto Paralelamente (3 contra 1)
* **ID / Nombre:** UC-02 / Auditar Artefacto Paralelamente.
* **Actor Primario:** Orquestador BullMQ (Sistema).
* **Actores Secundarios:** OpenRouter Gateway (Servicio Externo).
* **Descripción:** Un worker de BullMQ extrae la tarea de la cola, genera los prompts dinámicos basados en la rúbrica seleccionada, y realiza las peticiones en paralelo a los 3 modelos LLM a través de OpenRouter.
* **Precondiciones:**
  1. Un trabajo con estado `PENDING` está disponible en la cola de Redis.
  2. La API Key de OpenRouter está cargada correctamente en el entorno.
* **Flujo Principal (Escenario Exitoso):**
  1. El worker de BullMQ extrae el trabajo y cambia su estado a `PROCESSING`.
  2. El sistema lee el contenido del artefacto y carga la rúbrica específica.
  3. El sistema inyecta la rúbrica y las reglas de salida en un *System Prompt* estricto de auditoría (forzando formato JSON).
  4. El orquestador inicia 3 peticiones HTTP asíncronas en paralelo hacia la API de OpenRouter, parametrizando `temperature = 0.0` para cada modelo de la terna.
  5. OpenRouter procesa la inferencia en los respectivos proveedores (Anthropic, Google, OpenAI).
  6. El sistema recibe las 3 respuestas en formato JSON, conteniendo la evaluación de los gates, las puntuaciones detalladas por criterio y una métrica parcial ($s_1, s_2, s_3$).
  7. El sistema valida que los JSON recibidos contengan la estructura métrica requerida.
  8. Se invoca automáticamente al sintetizador (UC-03).
* **Flujos Alternativos:**
  * **Alt 2a: Timeout o Caída de un Modelo en OpenRouter:**
    1. En el paso 4 o 5, uno de los modelos no responde dentro del límite establecido (30 segundos).
    2. El orquestador ejecuta una política de reintento automático (hasta 2 veces).
    3. Si persiste el fallo, el orquestador aborta la consolidación y marca la tarea como `FAILED` con la descripción del modelo caído.
  * **Alt 2b: Formato JSON Inválido de un Evaluador:**
    1. En el paso 7, la respuesta de uno de los LLMs no es un JSON válido o carece de las propiedades de la rúbrica.
    2. El sistema realiza una llamada de corrección ("self-healing prompt") al modelo fallido, enviando el error de sintaxis del parser.
    3. Si la corrección falla, se asume discrepancia de sistema y la tarea se marca como `FAILED`.
* **Postcondiciones:** Las 3 evaluaciones crudas individuales son recolectadas y validadas estructuralmente.

---

### UC-03: Sintetizar, Evaluar Gates y Consenso
* **ID / Nombre:** UC-03 / Sintetizar, Evaluar Gates y Consenso.
* **Actor Primario:** Orquestador (Sistema).
* **Descripción:** Procesa en primera instancia los criterios de veto (Gates). Si son aprobados, calcula consensos, maneja criterios no evaluados (`N/E`) y determina el veredicto final.
* **Precondiciones:** Se cuenta con las 3 evaluaciones válidas individuales de UC-02.
* **Flujo Principal (Escenario Exitoso - Todos los Gates Pasan y Consenso Alto):**
  1. El sistema evalúa los resultados de los `Gates` en los 3 modelos. Verifica que todos sean `CUMPLE`.
  2. El sistema calcula el promedio de las puntuaciones compensatorias:
     $$ CF = \frac{s_1 + s_2 + s_3}{3} $$
  3. El sistema calcula la desviación estándar ($\sigma$) del conjunto de puntuaciones.
  4. El sistema valida que $\sigma < 10$.
  5. El sistema asigna el veredicto en base a la $CF$ (Aprobado si $CF \ge 85$).
  6. El sistema almacena el veredicto final (`APROBADO`) y marca el estado de la evaluación como `SUCCESS`.
  7. El sistema consolida la justificación cualitativa concatenando la evidencia y argumentos de los tres modelos en un reporte unificado.
* **Flujos Alternativos:**
  * **Alt 3a: Falla de un Gate (Criterio de Veto):**
    1. En el paso 1, el sistema detecta que al menos un gate resultó en `NO_CUMPLE` en alguna de las evaluaciones.
    2. El sistema detiene inmediatamente el proceso, cancela el cálculo de la Calificación Final ($CF$).
    3. El sistema emite directamente el veredicto **REPROBADO**, identificando el gate que falló y la justificación y evidencia aportada por el modelo.
    4. El estado se marca como `SUCCESS` con el veredicto definitivo de `REPROBADO`.
  * **Alt 3b: Desviación Estándar Crítica (Detección de Alucinación - $\sigma > 20$):**
    1. En el paso 4, el sistema detecta que la desviación estándar es mayor a 20 ($\sigma > 20$).
    2. El sistema identifica el valor "outlier" como aquel que tiene la mayor distancia absoluta respecto a la mediana del conjunto.
    3. El sistema recalcula la calificación final aplicando la fórmula penalizada:
       $$ CF_{discrepancia} = (0.45 \times s_{consenso1}) + (0.45 \times s_{consenso2}) + (0.1 \times s_{outlier}) $$
    4. El sistema almacena la $CF$ recalculada y marca la tarea como `SUCCESS` con etiquetas de alucinación detectada, registrando el veredicto basado en la $CF$ recalculada.
  * **Alt 3c: Criterios No Evaluables e Inconclusos (`N/E`):**
    1. El sistema detecta que uno o más criterios compensatorios se marcaron como `N/E`.
    2. El sistema redistribuye el peso de los criterios `N/E` de forma proporcional entre los criterios activos.
    3. Si el peso total evaluado es menor al 60% (`peso_evaluado_pct < 60`), el sistema aborta el cálculo de veredicto automatizado y marca el reporte como **INCONCLUSO**, enviándolo a revisión humana.
* **Postcondiciones:** El veredicto final y el reporte consolidados son persistidos en la base de datos, y el trabajo en cola se da por finalizado de forma exitosa.

---

### UC-04: Consultar Reporte de Seguridad y Aprobación
* **ID / Nombre:** UC-04 / Consultar Reporte de Seguridad y Aprobación.
* **Actor Primario:** Desarrollador de Software o Pipeline de CI/CD.
* **Descripción:** Permite a un desarrollador o pipeline de CI/CD recuperar el reporte final de la evaluación para decidir si el artefacto puede continuar al siguiente paso del ciclo de vida.
* **Precondiciones:**
  1. Existe un `task_id` generado previamente en UC-01.
* **Flujo Principal (Escenario Exitoso):**
  1. El cliente envía una petición HTTP `GET` a `/api/v1/evaluaciones/{task_id}`.
  2. El sistema valida el `task_id` y verifica que el token del cliente tenga permisos de lectura.
  3. El sistema extrae el reporte detallado: estado, veredicto final (`APROBADO`, `APROBADO_CON_OBSERVACIONES`, `REPROBADO`, `INCONCLUSO`), calificación final ($CF$), marcas de alucinación y evidencia.
  4. El sistema devuelve un código `200 OK` con un payload JSON estructurado.
  5. *Acción del Cliente (CI/CD):* Si el veredicto es `APROBADO`, el pipeline continúa con la integración del código o diseño de forma transparente.
* **Flujos Alternativos:**
  * **Alt 4a: Tarea en Proceso:**
    1. En el paso 3, el sistema verifica que el estado de la tarea es `PENDING` o `PROCESSING`.
    2. El sistema responde con `200 OK` enviando el estado actual y un tiempo estimado, sin calificaciones parciales.
  * **Alt 4b: Aprobación con Observaciones:**
    1. En el paso 5, el pipeline lee el veredicto `APROBADO_CON_OBSERVACIONES` (score 70-84).
    2. El pipeline permite continuar pero registra advertencias en la bitácora e inyecta las tareas de corrección obligatorias en el backlog del equipo de desarrollo.
  * **Alt 4c: Rechazo por Reprobación o Inconcluso:**
    1. En el paso 5, el pipeline lee el veredicto `REPROBADO` o `INCONCLUSO`.
    2. El pipeline aborta automáticamente la compilación o merge de la rama, bloqueando el avance en el ciclo de vida y notificando el reporte de fallas de seguridad/gates en el pull request.
* **Postcondiciones:** El cliente obtiene la trazabilidad exacta de la evaluación mapeada a los estándares de ingeniería de software.
