# Hipótesis de Experimentos — Tarea 3

Expectativas **antes** de ejecutar el prototipo. Sirven para redactar la
Sección 4 (Results) y validar que el sistema se comporta como se diseñó.
No son resultados; son predicciones a contrastar.

| Exp | Artefacto | artifact_type | CF esperada | Std esperada | Outlier | Flag | Estado esperado |
|-----|-----------|---------------|-------------|--------------|---------|------|-----------------|
| 1A | `1A_gold_standard.txt` | skill | ≥ 85 | < 10 | Ninguno | — | Aprobado |
| 1B | `1B_vulnerable.txt` | skill | < 50 | variable | posible | Riesgos en ≥2 modelos | Rechazado |
| 2C | `2C_ambiguo.txt` | skill | 60–70 (penalizada) | > 20 | 1 modelo (~85) | Posible Alucinación | Requiere revisión |
| 3D | `3D_reproducibilidad.txt` ×3 | skill | ≈ igual que 1A | variación < 5 entre runs | Ninguno | — | Aprobado (estable) |
| 4E | `4E_requisitos.txt` | requirements | ≥ 70 | < 15 | Ninguno | — | Aprobado con observaciones |

## Detalle por experimento

### Exp 1A — Gold standard (calibración positiva)
- **Qué prueba:** que el sistema reconoce un artefacto seguro y bien
  documentado.
- **Señal de éxito:** convergencia alta (std < 10), CF ≥ 85.
- **Riesgos esperados detectados:** mínimos o ninguno crítico.

### Exp 1B — Vulnerable (calibración negativa)
- **Qué prueba:** que el sistema detecta inseguridad evidente.
- **Señal de éxito:** CF < 50; al menos 2 modelos reportan SQL injection,
  ausencia de autenticación y exposición/almacenamiento de contraseñas.
- **Comparación clave:** Δ(CF 1A − CF 1B) grande ⇒ poder discriminativo.

### Exp 2C — Ambiguo (EXPERIMENTO PRINCIPAL: detección de alucinación)
- **Qué prueba:** que la discrepancia entre modelos revela una alucinación.
- **Mecanismo:** un modelo asume que "el ORM nativo" sanitiza y no expira
  tokens automáticamente → puntúa alto (~85); los otros dos detectan las
  omisiones → puntúan ~50–60.
- **Señal de éxito:** std > 20 ⇒ el sintetizador activa el flag "Posible
  Alucinación" y penaliza al outlier (peso 0.10).
- **Registrar:** scores individuales, std, modelo outlier, CF penalizada
  vs. CF sin penalizar (media simple).

### Exp 3D — Reproducibilidad
- **Qué prueba:** determinismo con T=0.
- **Señal de éxito:** variación de CF < 5 puntos entre las 3 ejecuciones.
- **Nota:** si la variación es alta, documentar como limitación (los LLM
  no son perfectamente deterministas ni con T=0).

### Exp 4E — Documento de requisitos (no-código)
- **Qué prueba:** que el framework generaliza a artefactos no-código.
- **Señal de éxito:** el sistema produce CF y reporte coherentes,
  identificando gaps del documento (p. ej. ausencia de criterios de
  aceptación medibles, métricas sin umbrales, falta de requisitos no
  funcionales).

## Notas de honestidad científica
- Si los resultados reales contradicen estas hipótesis, se reporta el
  resultado real y se discute en la Sección 5 (Discussion).
- Especialmente en 2C: si NINGÚN modelo alucina (std < 20), es un
  resultado válido y se discute por qué (los modelos modernos son
  conservadores ante omisiones de seguridad).
