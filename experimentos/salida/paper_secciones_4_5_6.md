<!--
  Process-Guard Control Arena — Paper sections 4, 5, 6 (Tarea 3 DRAFT)

  CONVENTION:
    [PLACEHOLDER] = replace with real numbers after running the prototype.
    Sections 5.2, 5.3, 5.4 and 6 (except result figures) are written and do
    NOT depend on experimental data.

  Target length: Section 4 ~400 words, Section 5 ~400 words, Section 6 ~150 words.
-->

## 4. Results

We evaluated five artifacts across four experiments using the Process-Guard
`POST /evaluate` endpoint with three evaluator models (Claude, Gemini,
GPT-4o). Unless noted, all calls used temperature `T=0`. Raw outputs are in
`resultados_experimentos.json`; Table 1 summarizes the consolidated scores.

### 4.1 Base Calibration (Experiment 1)

To verify that the system discriminates secure from insecure artifacts, we
submitted a gold-standard registration skill (1A) and a deliberately
vulnerable variant (1B). The secure artifact achieved **CF=[CF_1A]**
(std=[STD_1A]), while the vulnerable artifact scored **CF=[CF_1B]**
(std=[STD_1B]). The score gap of **[DELTA_1AB]** points confirms the
system's discriminative power. All three models converged on the secure
artifact (Figure 3), and at least two independently flagged SQL injection
and missing authentication in the vulnerable one (Table 1).

### 4.2 Hallucination Detection (Experiment 2)

The ambiguous login skill (2C) omitted any explicit statement about input
sanitization, token expiration, and rate limiting. This produced a
dispersion of **std=[STD_2C]**, [crossing/not crossing] the `std>20`
threshold and [triggering/not triggering] the "Possible Hallucination"
flag. The outlier model was **[OUTLIER_2C]**, deviating **[DEV_2C]** points
above the median by assuming the "native ORM" guaranteed sanitization. The
synthesizer penalized the outlier (weight 0.10), yielding a penalized
**CF=[CF_2C]** versus an unpenalized mean of **[MEAN_2C]** (Figure 4). This
is the paper's central result: cross-model disagreement surfaced an
optimistic assumption that a single-model review would have accepted.

### 4.3 Reproducibility (Experiment 3)

Submitting the gold-standard artifact three times at `T=0` produced CF
values of **[CF_3D_1], [CF_3D_2], [CF_3D_3]**, a spread of **[SPREAD_3D]**
points (Figure 5). [This confirms / This partially confirms] determinism;
residual variation reflects the inherent non-determinism of LLM APIs even
at `T=0`.

### 4.4 Requirements Evaluation (Experiment 4)

To test generalization beyond code, we evaluated the project's own
requirements document. Process-Guard returned **CF=[CF_4E]**
(std=[STD_4E]), classifying it as *[STATUS_4E]* and identifying
[FINDINGS_4E] (e.g., absence of measurable acceptance criteria and missing
non-functional requirements). This demonstrates the framework applies to
non-code artifacts across the software lifecycle.

<!-- If only 1–2 models were available, state it explicitly here and in 5.2. -->

---

## 5. Discussion & Limitations

### 5.1 Implications for AI Safety

Process-Guard demonstrates that AI Control need not be confined to
autonomous runtime agents: it can be embedded in the *software development
process* itself. By requiring three independent models to converge before
an artifact advances, the framework reduces the rate of "false-safe"
verdicts — insecure artifacts that a single model approves through an
optimistic hallucination. In our experiments, single-model review would
have accepted artifact 2C at a score of **[OUTLIER_SCORE_2C]**, whereas the
triple-model synthesis flagged it and lowered the consolidated score to
**[CF_2C]**. This quantifies the safety margin added by cross-model
disagreement. The same mechanism generalizes to any domain with formal
quality standards — medical documentation, legal contracts, infrastructure
configuration — wherever a rubric can be expressed and a divergence between
independent evaluators signals risk.

### 5.2 Limitations

We are explicit about the boundaries of this work:

- **Latency and cost.** Each evaluation issues three parallel calls to
  premium APIs. Estimated average cost per evaluation is
  **[COST_ESTIMATE]** (USD/tokens), and latency is bounded by the slowest
  model. This limits high-frequency use in tight CI loops.
- **Consensus is not truth.** Agreement among three models does not
  guarantee correctness. Models sharing training-data biases can converge
  on the *same* hallucination, producing a confident but wrong verdict.
- **Dependency on proprietary APIs.** The system degrades if any provider
  is unavailable. We mitigate with a 2-of-3 fallback, but this reduces the
  hallucination-detection signal that depends on three-way variance.
- **Rubrics as proxies.** SWEBOK and ISO/IEC 25010 are reference
  frameworks, not absolute oracles of quality; an artifact can satisfy the
  rubric and still fail in production.
- **Hackathon scope.** We tested a small number of artifact types with few
  examples per type. Larger-scale evaluation is needed before any claim of
  general reliability.
- **Determinism.** Even at `T=0`, provider-side non-determinism introduces
  minor score variation (Experiment 3), so CF should be read as a guidance
  band rather than an exact figure.

### 5.3 Dual Use

Process-Guard, like any evaluation tool, can be misused:

1. **Evasion of vulnerability detectors.** An adversary could run
   Process-Guard in reverse — iteratively mutating malware or insecure code
   until it scores as "safe," effectively searching for variants that evade
   the rubric criteria.
2. **Optimizing injection prompts.** The same loop could tune prompt-
   injection payloads against AI systems until they pass evaluation.
3. **False sense of security.** Teams may trust a high CF (≥90) and skip
   human review, ignoring vulnerabilities outside the current rubric scope.

**Mitigations.** We recommend: (a) deploying Process-Guard only as an
internal evaluation tool, not an unauthenticated public service; (b) not
persisting evaluated artifacts, to protect source-code privacy; and (c)
shipping an explicit disclaimer — *"CF is a guidance metric, not a security
certification"* — surfaced in every report.

### 5.4 Future Work

- Extend the rubrics directly into the AI-safety domain (e.g., evaluating
  agent alignment, not just software quality).
- Package Process-Guard as a GitHub Action for CI/CD gating.
- Add a fourth "red-team" evaluator specialized in finding vulnerabilities
  the other three miss.
- Incorporate open-source models (LLaMA, Mistral) to reduce cost and
  proprietary-API dependence.
- Scale the evaluation to a larger, labeled benchmark to measure precision
  and recall of hallucination detection.

---

## 6. Conclusion

The unconstrained use of AI to generate software bypasses formal software-
engineering processes, accumulating technical debt and security flaws born
of model hallucinations. Process-Guard Control Arena addresses this by
auditing software artifacts through three independent LLMs scored against
quantifiable SWEBOK/ISO 25010 rubrics, with a synthesizer that detects
hallucinations via cross-model variance. Our experiments show the system
**[detects/does not detect]** hallucinations — flagging artifact 2C at
std=**[STD_2C]** — while producing **[reproducible / approximately
reproducible]** scores at `T=0` (spread of **[SPREAD_3D]** points). The
broader implication is that AI Control can be applied as a technical,
preventive mechanism across the software lifecycle, complementing — not
replacing — human review and organizational governance.

<!--
  PLACEHOLDER CHECKLIST (fill after Fase 5):
  [CF_1A] [STD_1A] [CF_1B] [STD_1B] [DELTA_1AB]
  [STD_2C] [OUTLIER_2C] [DEV_2C] [CF_2C] [MEAN_2C] [OUTLIER_SCORE_2C]
  [CF_3D_1] [CF_3D_2] [CF_3D_3] [SPREAD_3D]
  [CF_4E] [STD_4E] [STATUS_4E] [FINDINGS_4E]
  [COST_ESTIMATE]
-->
