# Checklist de Integración del PDF Final (Domingo AM)

Responsable de compilación: Integrante 3. Herramienta sugerida: Pandoc +
LaTeX o Google Docs con la plantilla oficial de Apart Research.

## Insumos por tarea

| Insumo | Origen | Estado |
|--------|--------|--------|
| Secciones 1–2 (Intro, Related Work) + Referencias | T1 (`paper_secciones_1_2.md`) | [ ] |
| Abstract (≤250 palabras, con números de Exp 2C) | T1 + datos T3 | [ ] |
| Sección 3 (Methods) + Figuras 1–2 (arquitectura) | T2 | [ ] |
| Secciones 4–6 | T3 (`paper_secciones_4_5_6.md`) | [ ] |
| Figuras 3–5 (resultados) + Table 1 | T3 (`salida/figuras/`, `tabla_maestra.md`) | [ ] |
| Code & Data appendix | T4 (`prototype/README.md`) | [ ] |
| LLM Usage Statement | Todos | [ ] |

## Pasos de compilación

1. [ ] Consolidar todas las secciones en un único Markdown en orden:
       Abstract → 1 → 2 → 3 → 4 → 5 → 6 → References → Appendix.
2. [ ] Insertar figuras con captions numerados (Figure 1..5) y referenciarlas
       en el texto.
3. [ ] Insertar Table 1 (versión limpia de `tabla_maestra.md`, sin el banner
       de dry-run).
4. [ ] Reemplazar TODOS los `[PLACEHOLDER]` de las secciones 4 y 6.
5. [ ] Exportar a PDF.
6. [ ] Revisar: ≤ 8 páginas (sin referencias ni apéndice).

## Verificación final de contenido

- [ ] Título definitivo acordado por el equipo
- [ ] Nombres y afiliaciones de los 4 integrantes
- [ ] Track marcado: AI Security → AI Control
- [ ] Todas las secciones integradas (1–6)
- [ ] Figuras numeradas con captions descriptivos y legibles en PDF
- [ ] Referencias en formato consistente
- [ ] Sección de Limitaciones presente (5.2)
- [ ] Sección de Doble Uso presente (5.3) — OBLIGATORIA
- [ ] LLM Usage Statement al final
- [ ] Ningún dato de dry-run presentado como real
- [ ] PDF exportado, figuras legibles a tamaño impreso

## Criterios de éxito (rúbrica del hackathon)

- [ ] Hay datos cuantitativos reales (aunque sean pocos experimentos)
- [ ] La detección de alucinaciones está demostrada con al menos 1 caso (Exp 2C)
- [ ] Las figuras tienen captions descriptivos y son legibles
- [ ] La sección de Doble Uso es honesta y específica
- [ ] Las limitaciones son reconocidas sin eufemismos
- [ ] El PDF final respeta el template y el límite de páginas
