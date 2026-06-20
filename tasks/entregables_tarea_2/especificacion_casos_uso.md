# Especificación de Casos de Uso: Process-Guard Control Arena
**Estándar de Referencia:** ISO/IEC/IEEE 29148:2018 & UML 2.5.1  
**Fase:** Diseño y Requisitos de Software (Entregable Tarea 2)

Este documento define la especificación formal de los casos de uso del framework **Process-Guard Control Arena**. Describe la interacción de los actores humanos y de sistema con el middleware de evaluación "3 contra 1", garantizando la trazabilidad funcional y la reproducibilidad del proceso de control de calidad.

---

## 1. Identificación de Actores

* **Desarrollador de Software (Actor Primario - Humano):** Ingeniero que genera y modifica artefactos de software (requisitos, arquitectura, skills, código) y requiere una validación objetiva para avanzar en el ciclo de vida (SDLC).
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
  usecase "UC-03: Sintetizar y Detectar Alucinaciones" as UC3
  usecase "UC-04: Consultar Reporte de Seguridad" as UC4
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
* **Descripción:** Permite a un cliente subir un artefacto de software (de tipo A1 a A5) para someterlo al protocolo de auditoría multi-modelo de Process-Guard de manera asíncrona.
* **Precondiciones:**
  1. El cliente está autenticado mediante un token de API válido en la plataforma.
  2. El artefacto cumple con los formatos de entrada permitidos (Markdown, JSON, o archivos de código plano).
* **Flujo Principal (Escenario Exitoso):**
  1. El cliente realiza una petición HTTP `POST` a `/api/v1/evaluaciones` enviando:
     - El contenido del artefacto o archivo.
     - El tipo de artefacto (`A1`, `A2`, `A3`, `A4` o `A5`).
     - (Opcional) La terna de modelos de evaluación deseados (por defecto: Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o).
  2. El sistema valida la estructura del payload y la firma del token.
  3. El sistema identifica el tipo de rúbrica correspondiente al tipo de artefacto (según `rubrica_evaluacion.md`).
  4. El sistema registra la petición en la base de datos con estado `PENDING`.
  5. El sistema inserta un nuevo trabajo (job) en la cola asíncrona de **BullMQ + Redis**.
  6. El sistema devuelve al cliente un código de estado `202 Accepted` y un `task_id` único para rastreo.
* **Flujos Alternativos:**
  * **Alt 1a: Tipo de Artefacto Inválido:**
    1. En el paso 2, el sistema detecta un tipo de artefacto no registrado (ej. `A6`).
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
  6. El sistema recibe las 3 respuestas en formato JSON, conteniendo las puntuaciones detalladas por criterio y una métrica parcial ($s_1, s_2, s_3$).
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

### UC-03: Sintetizar y Detectar Alucinaciones
* **ID / Nombre:** UC-03 / Sintetizar y Detectar Alucinaciones.
* **Actor Primario:** Orquestador (Sistema).
* **Descripción:** Procesa estadísticamente las métricas parciales provistas por los evaluadores para detectar anomalías de consenso y alucinaciones, aplicando las ecuaciones matemáticas de penalización correspondientes.
* **Precondiciones:** Se cuenta con las 3 calificaciones parciales válidas ($s_1, s_2, s_3$) y desgloses de criterios de UC-02.
* **Flujo Principal (Escenario Exitoso - Consenso Alto):**
  1. El sistema calcula el promedio de las puntuaciones:
     $$ CF = \frac{s_1 + s_2 + s_3}{3} $$
  2. El sistema calcula la desviación estándar ($\sigma$) del conjunto de puntuaciones.
  3. El sistema valida que $\sigma < 10$.
  4. El sistema almacena la Calificación Final ($CF$) y marca el estado de la evaluación como `SUCCESS` con etiqueta `Alto Consenso`.
  5. El sistema consolida la justificación cualitativa concatenando los comentarios y argumentos de los tres modelos en un reporte unificado.
* **Flujos Alternativos:**
  * **Alt 3a: Desviación Estándar Crítica (Detección de Alucinación - $\sigma > 20$):**
    1. En el paso 3, el sistema detecta que la desviación estándar es mayor a 20 ($\sigma > 20$).
    2. El sistema identifica el valor "outlier" como aquel que tiene la mayor distancia absoluta respecto a la mediana del conjunto.
    3. El sistema recalcula la calificación final aplicando la fórmula penalizada:
       $$ CF_{discrepancia} = (0.45 \times s_{consenso1}) + (0.45 \times s_{consenso2}) + (0.1 \times s_{outlier}) $$
    4. El sistema almacena la $CF$ recalculada y marca la tarea como `SUCCESS` con etiquetas `Discrepancia Crítica` y `Alucinación Detectada`, señalando cuál modelo fue penalizado y por qué criterio específico de la rúbrica (ej. ISO 25010 o OWASP).
  * **Alt 3b: Desviación Estándar Moderada ($10 \le \sigma \le 20$):**
    1. En el paso 3, el sistema detecta que la desviación estándar está en el rango de advertencia.
    2. El sistema calcula la $CF$ como el promedio directo de las tres puntuaciones.
    3. El sistema marca el reporte final con una etiqueta de advertencia (`Flag: Revisión Manual Recomendada`) debido a opiniones divergentes leves.
* **Postcondiciones:** La Calificación Final y las etiquetas de consenso son guardadas en la base de datos PostgreSQL, y el trabajo del worker se marca como completado.

---

### UC-04: Consultar Reporte de Seguridad y Aprobación
* **ID / Nombre:** UC-04 / Consultar Reporte de Seguridad y Aprobación.
* **Actor Primario:** Desarrollador de Software o Pipeline de CI/CD.
* **Descripción:** Permite a un desarrollador o pipeline de CI/CD recuperar el reporte final de la evaluación para decidir si el artefacto puede continuar al siguiente paso del ciclo de vida.
* **Precondiciones:**
  1. Existe un `task_id` generado previamente en UC-01.
* **Flujo Principal (Escenario Exitoso):**
  1. El cliente envía una petición HTTP `GET` a `/api/v1/evaluaciones/{task_id}`.
  2. El sistema valida el `task_id` y verifica que el token del cliente tenga permisos de lectura sobre dicho recurso.
  3. El sistema extrae de la base de datos el reporte detallado: estado (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`), calificación final ($CF$), marcas de alucinación/desviación, y las métricas detalladas por estándar (ISO 25010, OWASP, ISO 29148, etc.).
  4. El sistema devuelve un código `200 OK` con un payload JSON estructurado.
  5. *Acción del Cliente (CI/CD):* Si la evaluación finaliza en `SUCCESS` y la $CF \ge 80$ (umbral del pipeline), el pipeline continúa con la integración del código o diseño.
* **Flujos Alternativos:**
  * **Alt 4a: Tarea en Proceso:**
    1. En el paso 3, el sistema verifica que el estado de la tarea es `PENDING` o `PROCESSING`.
    2. El sistema responde con `200 OK` enviando el estado actual y un tiempo estimado de finalización basado en la posición en la cola BullMQ, sin incluir calificaciones parciales aún.
  * **Alt 4b: Rechazo por Calificación Insuficiente (Aprobación denegada):**
    1. En el paso 5, el pipeline analiza el JSON y lee una $CF < 80$.
    2. El pipeline aborta automáticamente la compilación o merge de la rama, notificando en el chat del equipo o en el PR (Pull Request) del desarrollador el reporte Markdown con las fallas indicadas por las IAs auditoras.
* **Postcondiciones:** El cliente obtiene la trazabilidad exacta de por qué el artefacto fue aprobado o rechazado, mapeado a los estándares de ingeniería de software.
