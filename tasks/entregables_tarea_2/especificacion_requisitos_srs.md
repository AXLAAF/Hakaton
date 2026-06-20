# Especificación de Requisitos de Software (SRS): Process-Guard Control Arena
**Estándar de Referencia:** ISO/IEC/IEEE 29148:2018, Sección 9.4  
**Fase:** Ingeniería de Requisitos (Entregable Tarea 2)  
**Estado:** Documento Maestro Aprobado  

---

## 1. Introducción

### 1.1 Propósito
Este documento define la Especificación de Requisitos de Software (SRS) para el sistema **Process-Guard Control Arena**. El objetivo de este sistema es servir de middleware y entorno controlado (*sandbox*) para evaluar artefactos del ciclo de vida del software (SDLC) mediante un enfoque de auditoría paralela y cruzada empleando múltiples Large Language Models (LLMs). Está diseñado para ser implementado en un VPS ligero usando Fastify, Redis (BullMQ) y OpenRouter API, mitigando alucinaciones lógicas en el código y especificaciones generadas por IA.

### 1.2 Alcance del Sistema
Process-Guard Control Arena actuará como un servicio REST API que recibe artefactos de software, los clasifica según su naturaleza (Requisitos, Diseño, Skills, Código o Proyecto Integrado) y los somete a una evaluación simultánea por tres evaluadores de IA independientes (Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o) bajo rúbricas mapeadas a estándares industriales. El sistema no genera código directamente, sino que actúa como una compuerta de calidad de software (*Quality Gate*) automatizada que puede ser integrada en flujos de trabajo de desarrollo (PRs de GitHub, pipelines de CI/CD o herramientas CLI).

### 1.3 Definiciones, Acrónimos y Abreviaturas
* **LLM (Large Language Model):** Modelo de lenguaje de gran tamaño utilizado para inferencia de auditoría de código o lógica.
* **OpenRouter:** Gateway unificado de APIs para interactuar con diversos proveedores de LLMs.
* **VPS (Virtual Private Server):** Servidor virtual donde se desplegará la API de Fastify y Redis.
* **SDLC (Software Development Life Cycle):** Ciclo de vida del desarrollo de software.
* **BullMQ:** Cola de mensajes robusta basada en Redis para procesamiento de tareas en segundo plano.
* **Outlier (Atípico):** Calificación parcial emitida por una IA que se desvía críticamente respecto a la mediana del consenso del conjunto de evaluación.

### 1.4 Referencias Normativas
* **ISO/IEC/IEEE 29148:2018:** Ingeniería de Sistemas y Software — Procesos del ciclo de vida — Ingeniería de requisitos.
* **ISO/IEC 25010:2011:** Modelos de calidad de sistemas y productos de software.
* **SWEBOK v3.0:** Guide to the Software Engineering Body of Knowledge.
* **OWASP Top 10 para LLM Applications v1.1:** Marco de seguridad para el uso de modelos de lenguaje.
* **NIST AI RMF:** Artificial Intelligence Risk Management Framework.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
Process-Guard se despliega como un componente independiente en la nube que interactúa de la siguiente forma:

```
[Desarrollador / CI-CD] ---> (HTTPS / REST) ---> [Process-Guard (Fastify)] 
                                                        |
                                                 (Cola BullMQ/Redis)
                                                        |
                                                        v
[OpenRouter Gateway]   <--- (HTTPS / API) <--- [Workers de Inferencia]
      |
      +---> [Claude 3.5 Sonnet]
      +---> [Gemini 1.5 Pro]
      +---> [GPT-4o]
```

### 2.2 Funciones del Sistema
1. **Clasificación e Ingesta de Artefactos:** Recibe archivos en texto plano o estructurado y determina el pipeline de evaluación adecuado.
2. **Orquestación Asíncrona:** Encola las solicitudes para evitar el bloqueo del hilo principal de Node.js durante los tiempos de respuesta de los modelos de IA.
3. **Auditoría Multi-Modelo (3 contra 1):** Solicita evaluaciones con temperatura determinista ($T=0.0$) utilizando una sola llave de API de OpenRouter.
4. **Sintetizador de Métricas:** Aplica cálculos matemáticos para verificar el consenso del análisis y filtrar alucinaciones aplicando penalizaciones a los modelos disidentes.
5. **Generación de Reportes Cualitativos y Cuantitativos:** Entrega la calificación final consolidada del artefacto con referencias normativas y retroalimentación específica en formato JSON y Markdown.

### 2.3 Características de los Usuarios
* **Ingeniero de Software / Desarrollador:** Consume la API a través de herramientas de línea de comandos (CLI) o integraciones locales. Requiere respuestas rápidas y reportes claros del estado de su código.
* **Administrador de DevOps / QA:** Configura los pipelines de CI/CD para integrarlos con Process-Guard, definiendo los umbrales de aprobación mínimos (ej. Score >= 80).
* **Auditor de Seguridad de IA / Admin:** Modifica los prompts de sistema, pesos de las rúbricas y parámetros de conexión con OpenRouter.

### 2.4 Restricciones y Dependencias
* **Dependencia de Red:** La latencia y disponibilidad de la inferencia dependen al 100% de la disponibilidad de la API de OpenRouter y de los proveedores de LLMs.
* **Costes de Consumo de Tokens:** El framework está sujeto a cuotas financieras y límites de velocidad de los modelos a través del gateway.
* **Determinismo:** Aunque se configure temperatura $0.0$, ligeras variaciones a nivel de hardware o fallos de conexión pueden provocar variaciones menores no deterministas.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (SRS-REQ)

#### 3.1.1 Ingesta de Artefactos e Identificación
* **SRS-REQ-001 (Validación de Payload):** El sistema debe proveer un endpoint HTTP POST en `/api/v1/evaluaciones` que acepte payloads JSON estructurados conteniendo el contenido del artefacto, el tipo de artefacto (`A1`, `A2`, `A3`, `A4`, `A5`), y opcionalmente configuraciones del webhook de retorno.
* **SRS-REQ-002 (Tipificación de Artefactos):** El sistema debe clasificar el artefacto según los tipos definidos en el Plan Maestro:
  * **A1:** Documentos de Requisitos (SWEBOK / ISO 29148).
  * **A2:** Documentos de Diseño y Arquitectura (ISO 42010 / TOGAF).
  * **A3:** Skills de Agentes e Instrucciones de Sistema.
  * **A4:** Módulos de Código Fuente (ISO 25010 / OWASP).
  * **A5:** Proyecto de Software Integrado.

#### 3.1.2 Cola de Tareas Asíncronas
* **SRS-REQ-003 (Encolamiento No Bloqueante):** El sistema debe registrar de forma inmediata el artefacto en base de datos en estado `PENDING` y encolarlo en **Redis** usando **BullMQ**, liberando la conexión del cliente con un estado HTTP `202 Accepted` y un `task_id` único en menos de 500 ms.
* **SRS-REQ-004 (Monitoreo de Estado):** El sistema debe proveer un endpoint HTTP GET en `/api/v1/evaluaciones/{task_id}` que retorne el estado del procesamiento (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`) y el progreso de los workers en tiempo real.

#### 3.1.3 Orquestación y Conexión de Modelos
* **SRS-REQ-005 (Prompting Basado en Rúbrica):** El worker debe inyectar de forma dinámica el artefacto dentro de un System Prompt estandarizado que contiene los criterios de la rúbrica definida para ese tipo específico de archivo en `rubrica_evaluacion.md`.
* **SRS-REQ-006 (Ejecución en Paralelo):** El sistema debe despachar de manera simultánea (usando promesas paralelas de JavaScript) tres peticiones HTTP POST a la API de **OpenRouter** destinadas a los modelos correspondientes de la terna.
* **SRS-REQ-007 (Determinismo Estricto):** El sistema debe enviar la variable `temperature: 0.0` y forzar las restricciones de esquema JSON a través del gateway de OpenRouter para asegurar respuestas con estructura determinista y parseables automáticamente.
* **SRS-REQ-008 (Compatibilidad Nativa SDK para A3):** Si el artefacto es de tipo `A3` (Skill), el sistema debe exigir que cada modelo evalúe la compatibilidad de las instrucciones con su propio SDK nativo (verificación de restricciones de tokens y herramientas nativas del modelo evaluador).

#### 3.1.4 Sintetizador y Detección de Alucinaciones
* **SRS-REQ-009 (Cálculo de Desviación Estándar):** El sistema debe calcular la desviación estándar ($\sigma$) de las tres puntuaciones obtenidas ($s_1, s_2, s_3$) para evaluar la solidez del consenso.
* **SRS-REQ-010 (Fórmula de Aprobación de Consenso):** Si $\sigma < 10$, el sistema debe calcular la calificación final ($CF$) como la media aritmética simple de las puntuaciones:
  $$ CF = \frac{s_1 + s_2 + s_3}{3} $$
* **SRS-REQ-011 (Fórmula de Penalización por Alucinación):** Si $\sigma > 20$, el sistema debe marcar alucinación probable, detectar al modelo "outlier" (aquel con mayor desviación absoluta respecto a la mediana del conjunto) y calcular la calificación final penalizando su peso a un $0.1$, mientras asigna un peso del $0.45$ a los dos modelos restantes:
  $$ CF = (0.45 \times s_{consenso1}) + (0.45 \times s_{consenso2}) + (0.1 \times s_{outlier}) $$
* **SRS-REQ-012 (Etiquetado y Logs):** Si ocurre el caso de discrepancia crítica ($\sigma > 20$), el sistema debe persistir en la BD una alerta de "Alucinación Probable Detectada", identificando explícitamente el modelo penalizado y guardando el desglose de su reporte para fines de auditoría.

---

### 3.2 Requisitos No Funcionales (SRS-NFR)

#### 3.2.1 Rendimiento y Eficiencia (ISO/IEC 25010 - Performance Efficiency)
* **SRS-NFR-001 (Latencia de Respuesta):** El orquestador debe soportar múltiples solicitudes de evaluación concurrentes sin degradación del servidor local de Fastify. El tiempo de procesamiento interno de la API (excluyendo el tiempo de inferencia externa de los LLMs) no debe superar los 100 ms por solicitud de encolado.
* **SRS-NFR-002 (Control de Timeouts):** Las llamadas HTTP de inferencia hacia OpenRouter deben poseer un timeout máximo de 45 segundos por modelo. Pasado este tiempo, el worker debe reintentar la solicitud una sola vez antes de marcar la tarea como fallida.

#### 3.2.2 Seguridad (ISO/IEC 25010 - Security / OWASP Top 10 para LLMs)
* **SRS-NFR-003 (Autenticación y Autorización):** Todos los endpoints de la API REST deben requerir autenticación mediante tokens JWT (JSON Web Tokens) transmitidos en las cabeceras HTTP `Authorization: Bearer <token>`.
* **SRS-NFR-004 (Aislamiento de API Keys):** La clave de OpenRouter debe almacenarse exclusivamente como una variable de entorno encriptada en el VPS y nunca exponerse al cliente final a través de ninguna respuesta de la API.
* **SRS-NFR-005 (Protección contra Inyecciones):** Los prompts inyectados dinámicamente deben estructurarse de tal modo que aíslen el contenido del artefacto del usuario en etiquetas delimitadoras específicas (`<artifact_content>...</artifact_content>`) instruyendo al modelo evaluador a ignorar cualquier instrucción de sistema contenida en su interior (mitigando *prompt injection* indirecta).

#### 3.2.3 Fiabilidad y Tolerancia a Fallos (ISO/IEC 25010 - Reliability)
* **SRS-NFR-006 (Recuperación de Cola de Tareas):** En caso de apagado o reinicio abrupto del VPS, los trabajos en estado `PENDING` o `PROCESSING` deben recuperarse de Redis una vez reestablecido el servicio, evitando la pérdida de solicitudes.
* **SRS-NFR-007 (Manejo de Errores de API Externa):** Ante fallos HTTP 429 (Límite de peticiones) o 503 (Servicio no disponible) de OpenRouter, el worker debe aplicar una estrategia de retroceso exponencial (*exponential backoff*) con un factor de retraso de 2 segundos.

#### 3.2.4 Mantenibilidad (ISO/IEC 25010 - Maintainability)
* **SRS-NFR-008 (Auditoría de Rúbricas):** Las rúbricas del sistema de evaluación deben estar desacopladas del código de orquestación (por ejemplo, en archivos JSON/YAML independientes de configuración) para facilitar su modificación o adición de estándares (ISO 29148, ISO 42010, OWASP, etc.) sin necesidad de recompilar o redesplegar el servidor.
