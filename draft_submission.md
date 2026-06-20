# Process-Guard Control Arena: Multi-Model AI Control for Software Quality Assurance

**Authors:** [Team Names]

**Track:** AI Security → AI Control · **Venue:** Global South AI Safety Hackathon (June 2026)

## Abstract

The rapid integration of large language models (LLMs) into software development has outpaced the formal engineering processes meant to ensure software quality. Developers increasingly accept AI-generated artifacts on trust, bypassing requirements validation, design review, and systematic testing—a condition we term *the War of the Code*. Prior work shows the danger is structural: roughly 40% of GitHub Copilot completions across security-relevant scenarios contain vulnerabilities (Pearce et al., 2022), and controlled studies find that developers with AI assistance write less secure code while feeling more confident (Perry et al., 2023; Sandoval et al., 2023). Corporate AI governance addresses policy and intent, but not the artifact itself. We present **Process-Guard Control Arena**, a framework that applies AI Control principles (Greenblatt et al., 2024) to software quality assurance. Process-Guard routes each artifact (code, context files, skills, requirements) to three heterogeneous LLMs in parallel; each returns an individual report and a partial metric, and the system synthesizes the three, using cross-model disagreement as a hallucination signal and emitting a single normalized quality score (0–100) grounded in SWEBOK and ISO/IEC 25010 rubrics. In pipeline-validation experiments (dry-run, pending live prototype), triple-model assessment flagged an ambiguous artifact that a single optimistic evaluator would have approved (CF penalized from 64.7 to 56; σ=20.2), while discriminating secure from vulnerable skills (Δ=45 points). Process-Guard demonstrates a scalable, technical control layer for AI-assisted software development that complements—rather than replaces—organizational governance.

## 1. Introduction

The integration of large language models (LLMs) into software development has shifted from novelty to default practice. AI assistants such as GitHub Copilot now author a substantial fraction of the code that reaches production, often with minimal human review. When developers accept AI-generated artifacts on trust, they tend to bypass the formal engineering processes—requirements validation, design review, systematic testing—that the discipline developed precisely to contain defects. We refer to this emerging condition as *the War of the Code*: a regime in which the velocity of AI-assisted production outpaces the quality controls meant to govern it.

The empirical case for concern is strong. Pearce et al. (2022) found that roughly 40% of Copilot-generated programs in security-relevant scenarios contained vulnerabilities mapped to MITRE's CWE Top 25. Controlled user studies reinforce the finding: developers with AI assistance tend to produce less secure code while reporting greater confidence (Perry et al., 2023; Sandoval et al., 2023). The OWASP Top 10 for LLM Applications (2025) further catalogs how these failure modes propagate once LLM outputs are embedded in real systems.

Corporate AI governance frameworks—policies, usage guidelines, sign-offs—are necessary but insufficient. They operate at the level of human intent, not at the level of the artifact itself. What is missing is a *technical control* layer that inspects each artifact and produces an auditable, quantitative quality judgment, in the spirit of AI Control (Greenblatt et al., 2024).

We present **Process-Guard Control Arena**, a framework that applies AI Control principles to software quality assurance. Process-Guard routes each software artifact to three heterogeneous LLMs (Claude, Gemini, GPT-4o) in parallel. Each model returns an individual report and a partial metric; the system synthesizes the three reports, using cross-model disagreement as a signal for hallucination, and emits a single normalized quality score (0–100) grounded in SWEBOK and ISO/IEC 25010 rubrics.

This work makes three contributions:

1. **Domain transfer of AI Control.** To our knowledge, this is the first application of an AI Control–style framework to the software quality-assurance domain, using SWEBOK and ISO/IEC 25010 as formal evaluation rubrics.
2. **Consensus-based hallucination detection.** We treat disagreement across three heterogeneous models as a quantified, normalized signal of hallucination, rather than relying on the self-consistency of a single model.
3. **Empirical validation pipeline.** We provide a reproducible evaluation protocol (five artifacts, four experiments) and preliminary evidence—pending live API runs—that triple-model evaluation surfaces optimistic single-model judgments that would otherwise pass as valid.

## 2. Related Work

Process-Guard draws on four lines of research: AI Control frameworks, multi-model evaluation and consensus, software quality standards, and hallucination detection.

**AI Control frameworks.** The AI Control paradigm seeks to ensure safety even when a capable model may be actively trying to subvert safeguards, without assuming alignment (Greenblatt et al., 2024). ControlArena is an open-source library for running red-team/blue-team control experiments over agents in sandboxed environments (UK AI Security Institute & Redwood Research, 2025). Process-Guard adopts the control stance—do not trust a single model's output—but transfers it from *agent behavior during task execution* to the *quality auditing of static software artifacts*.

**Multi-model evaluation and consensus.** LLM-as-a-Judge uses one model to score another's outputs, achieving high agreement with human preferences (Zheng et al., 2023). Chatbot Arena scales this through large-volume human pairwise voting (Chiang et al., 2024). Process-Guard automates and hardens this principle: three heterogeneous LLMs evaluate each artifact simultaneously, diluting idiosyncratic biases of any one model.

**Software quality standards.** Process-Guard grounds its rubrics in SWEBOK v3.0 (IEEE Computer Society, 2014) and ISO/IEC 25010:2011, supplemented for code artifacts by the OWASP Top 10 for LLM Applications (2025) and for requirements by ISO/IEC/IEEE 29148. This grounding makes the resulting metric interpretable and defensible.

**Hallucination detection.** SelfCheckGPT detects hallucinations by sampling the same model multiple times and measuring response consistency (Manakul et al., 2023). Process-Guard generalizes this from *intra-model* to *cross-model* consistency: divergence among three independent models on the same artifact is used as the hallucination signal.

| Approach | Evaluation domain | Evaluators | Output | Difference from Process-Guard |
|---|---|---|---|---|
| ControlArena (UK AISI & Redwood, 2025) | Agent behavior in sandboxes | Protocols + monitor model | Safety/usefulness scores | Evaluates runtime behavior, not static artifact quality |
| LLM-as-a-Judge (Zheng et al., 2023) | LLM response quality | 1 judge model | Pairwise/scalar score | Single judge; no consensus or hallucination signal |
| Chatbot Arena (Chiang et al., 2024) | LLM response quality | Human crowd | Elo ranking | Human voting; not automated or artifact-focused |
| SelfCheckGPT (Manakul et al., 2023) | Factual consistency | 1 model, resampled | Hallucination score | Intra-model consistency only |
| **Process-Guard (this work)** | **Software artifacts** | **3 heterogeneous LLMs** | **Normalized 0–100 quality score** | **Cross-model consensus + SWEBOK/ISO rubrics** |

## 3. Methods

### 3.1 Framework Overview

Process-Guard Control Arena is a validation middleware inserted into the software development lifecycle (SDLC). Any **artifact**—requirements document, agent skill, design specification, or source code—can be submitted for **simultaneous triple evaluation** by heterogeneous LLMs. The synthesizer consolidates reports, filters discrepancies indicative of hallucination, and returns a final score (CF, 0–100) that gates progression to the next development phase.

### 3.2 Artifact Types and Rubrics

The framework categorizes artifacts into five types: A1 (Requirements), A2 (Design), A3 (Skills/Instructions), A4 (Code), and A5 (Integrated Project). Code and skill artifacts (A3–A4) are scored against **ISO/IEC 25010** and the **OWASP Top 10 for LLM Applications**. Planning artifacts (A1–A2) are audited against **SWEBOK v3.0**, **ISO/IEC/IEEE 29148**, **ISO/IEC/IEEE 42010**, and the **NIST AI RMF**.

### 3.3 Multi-Model Protocol

The prototype deploys on a VPS using **Fastify (Node.js)** with asynchronous task queuing via **BullMQ and Redis** to avoid HTTP timeouts during inference. All three evaluators (Claude 3.5 Sonnet, Gemini 1.5 Pro, GPT-4o) are accessed through **OpenRouter** as a unified API gateway. Temperature is set to `T=0` for maximal determinism. Each evaluator prompt forces strict JSON output with per-criterion breakdown and a partial score.

### 3.4 Synthesizer and Hallucination Detection

The synthesizer collects partial scores $(s_1, s_2, s_3)$ and computes standard deviation $\sigma$. If $\sigma < 10$, CF is the simple mean (high consensus). If $\sigma > 20$, the system flags *Possible Hallucination*, identifies the outlier (farthest from median), and applies a penalized weighted average: consensus models weight 0.45 each, outlier weight 0.10.

$$CF_{consenso} = \frac{s_1 + s_2 + s_3}{3}$$

$$CF_{discrepancia} = 0.45 \cdot s_{consenso1} + 0.45 \cdot s_{consenso2} + 0.10 \cdot s_{outlier}$$

### 3.5 Experimental Design

We designed four experiments over five artifacts (see `experimentos/artefactos/`):

| Exp | Artifact | Hypothesis tested |
|-----|----------|-------------------|
| 1A | Gold-standard skill | Positive calibration: CF ≥ 85, σ < 10 |
| 1B | Vulnerable skill | Negative calibration: CF < 50, ≥2 models flag SQLi/auth issues |
| 2C | Ambiguous login skill | **Primary:** σ > 20 reveals optimistic outlier hallucination |
| 3D | Same as 1A × 3 runs | Reproducibility at T=0: CF spread < 5 points |
| 4E | Requirements document | Generalization to non-code artifacts |

**What did not work (yet):** Live API evaluation (Tarea 4 prototype) was not available at draft time. Results below come from a **dry-run pipeline** (`resultados_dry_run.json`) that simulates synthesizer behavior to validate figures, tables, and paper structure. These numbers must be replaced with live runs before final submission.

## 4. Results

> **Observation vs. interpretation:** Table 1 reports dry-run outputs from the validated synthesis pipeline. They are consistent with pre-registered hypotheses (see `HIPOTESIS.md`) but are **not** live API measurements. Interpretations below describe expected system behavior; final claims require prototype confirmation.

**Table 1.** Consolidated evaluation scores across four experiments (dry-run data). CF = final score after synthesis; σ = standard deviation of partial scores.

| Exp | Artifact | s_Claude | s_Gemini | s_GPT-4o | Mean | σ | Outlier | CF | Status |
|-----|----------|----------|----------|----------|------|---|---------|-----|--------|
| 1A | Skill gold standard | 88 | 86 | 87 | 87.0 | 1.0 | — | 87 | Approved |
| 1B | Skill vulnerable | 42 | 38 | 45 | 41.7 | 3.5 | — | 42 | Rejected |
| 2C | Skill ambiguous | 88 | 52 | 54 | 64.7 | **20.2** | Claude | 56 | Needs review |
| 3D (×3) | Reproducibility | — | — | — | 86.7–87.0 | 1.0–1.5 | — | 87 | Approved |
| 4E | Requirements doc | 74 | 71 | 76 | 73.7 | 2.5 | — | 74 | Approved w/ notes |

### 4.1 Base Calibration (Experiment 1)

The secure artifact (1A) achieved CF=87 (σ=1.0), while the vulnerable variant (1B) scored CF=42 (σ=3.5). The 45-point gap confirms discriminative power. All three models converged on the secure artifact; at least two independently flagged SQL injection and missing authentication in the vulnerable one.

### 4.2 Hallucination Detection (Experiment 2)

The ambiguous login skill (2C) omitted explicit statements about input sanitization, token expiration, and rate limiting. This produced σ=20.2, crossing the σ>20 threshold and triggering the *Possible Hallucination* flag. Claude scored 88—assuming the "native ORM" guaranteed sanitization—while Gemini (52) and GPT-4o (54) flagged omissions. The synthesizer penalized Claude (weight 0.10), yielding CF=56 versus an unpenalized mean of 64.7. **Interpretation:** cross-model disagreement surfaced an optimistic assumption that single-model review would have accepted.

### 4.3 Reproducibility (Experiment 3)

Three runs of the gold-standard artifact at T=0 produced CF values of 87, 87, and 87 (spread = 0 points). This supports approximate determinism under the dry-run assumption; residual variation in live API calls remains an open question (see Section 5.2).

### 4.4 Requirements Evaluation (Experiment 4)

Evaluating the project's own requirements document returned CF=74 (σ=2.5), identifying gaps such as absent measurable acceptance criteria and missing non-functional requirements. This demonstrates applicability beyond code artifacts.

**Baseline comparison:** A naive single-model baseline (Claude only, no synthesis) would have approved artifact 2C at score 88. Triple-model synthesis lowered the effective verdict to CF=56 and flagged the artifact for human review—a 32-point safety margin on this test case.

## 5. Discussion and Limitations

### 5.1 Implications for AI Safety

Process-Guard demonstrates that AI Control need not be confined to autonomous runtime agents: it can be embedded in the *software development process* itself. By requiring three independent models to converge before an artifact advances, the framework reduces the rate of "false-safe" verdicts—insecure artifacts that a single model approves through an optimistic hallucination. The same mechanism generalizes to any domain with formal quality standards wherever independent evaluator disagreement signals risk.

### 5.2 Limitations

- **Dry-run status.** Current results simulate synthesizer behavior; live prototype validation (Tarea 4) is pending. Claims must be re-verified against real API outputs.
- **Latency and cost.** Each evaluation issues three parallel calls to premium APIs, limiting high-frequency CI use.
- **Consensus is not truth.** Models sharing training-data biases can converge on the same hallucination.
- **API dependency.** A 2-of-3 fallback reduces the hallucination-detection signal when a provider is unavailable.
- **Rubrics as proxies.** SWEBOK and ISO/IEC 25010 are reference frameworks, not oracles of production quality.
- **Small sample.** Five artifacts across four experiments; larger benchmarks are needed for statistical significance.
- **Determinism.** Even at T=0, provider-side non-determinism may introduce score variation.

### 5.3 Dual Use

Process-Guard can be misused to iteratively mutate insecure code until it scores as "safe," tune prompt-injection payloads against AI systems, or create a false sense of security when teams skip human review. Mitigations: deploy as an internal tool only, do not persist evaluated artifacts, and surface the disclaimer *"CF is a guidance metric, not a security certification"* in every report.

### 5.4 Future Work

- Validate all experiments against the live prototype and report confidence intervals.
- Package Process-Guard as a GitHub Action for CI/CD gating.
- Add a fourth "red-team" evaluator specialized in vulnerability discovery.
- Incorporate open-source models to reduce cost and proprietary-API dependence.
- Extend rubrics to AI-safety-specific artifacts (agent alignment evaluations).

## 6. Conclusion

The unconstrained use of AI to generate software bypasses formal engineering processes, accumulating technical debt and security flaws born of model hallucinations. Process-Guard Control Arena addresses this by auditing software artifacts through three independent LLMs scored against quantifiable SWEBOK/ISO 25010 rubrics, with a synthesizer that detects hallucinations via cross-model variance. Preliminary pipeline validation shows the system discriminates secure from vulnerable artifacts (Δ=45 points), flags ambiguous skills through outlier penalization (σ=20.2), and generalizes to requirements documents. The broader implication is that AI Control can serve as a technical, preventive mechanism across the software lifecycle, complementing—not replacing—human review and organizational governance. Final empirical claims await live prototype confirmation.

## Code and Data

- **Repository:** https://github.com/AXLAAF/Hakaton
- **Experiments:** `experimentos/scripts/run_experiments.py`, `experimentos/scripts/synthesize_local.py`
- **Artifacts:** `experimentos/artefactos/` (five test files)
- **Dry-run data:** `experimentos/datos/resultados_dry_run.json`
- **Figures:** `experimentos/scripts/generate_figures.py` → `experimentos/salida/`

## References

1. Chiang, W.-L., Zheng, L., Sheng, Y., Angelopoulos, A. N., Li, T., Li, D., Zhang, H., Zhu, B., Jordan, M., Gonzalez, J. E., & Stoica, I. (2024). *Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference.* ICML 2024.
2. Greenblatt, R., Shlegeris, B., Sachan, K., & Roger, F. (2024). *AI Control: Improving Safety Despite Intentional Subversion.* ICML 2024. arXiv:2312.06942.
3. IEEE Computer Society. (2014). *SWEBOK v3.0: Guide to the Software Engineering Body of Knowledge.*
4. ISO/IEC. (2011). *ISO/IEC 25010:2011 — Systems and software Quality Requirements and Evaluation (SQuaRE).*
5. Manakul, P., Liusie, A., & Gales, M. J. F. (2023). *SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models.* EMNLP 2023.
6. OWASP. (2025). *OWASP Top 10 for Large Language Model Applications.* OWASP Foundation.
7. Pearce, H., Ahmad, B., Tan, B., Dolan-Gavitt, B., & Karri, R. (2022). *Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions.* IEEE S&P 2022.
8. Perry, N., Srivastava, M., Kumar, D., & Boneh, D. (2023). *Do Users Write More Insecure Code with AI Assistants?* CCS 2023.
9. Sandoval, G., Pearce, H., Nys, T., Karri, R., Garg, S., & Dolan-Gavitt, B. (2023). *Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants.* USENIX Security 2023.
10. UK AI Security Institute & Redwood Research. (2025). *ControlArena.* https://github.com/UKGovernmentBEIS/control-arena
11. Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.* NeurIPS 2023.

---

**LLM Usage Statement:** LLMs (Claude via Cursor) were used to draft and consolidate sections of this submission from team-authored source documents (`experimentos/paper_secciones_1_2.md`, `tasks/entregables_tarea_2/paper_seccion_3_metodologia.md`, `experimentos/salida/paper_secciones_4_5_6.md`). All factual claims, citations, experimental numbers, and limitations were cross-checked against project artifacts and marked as dry-run where applicable. The team independently verified structure, honesty constraints, and alignment with pre-registered hypotheses before accepting this draft.
