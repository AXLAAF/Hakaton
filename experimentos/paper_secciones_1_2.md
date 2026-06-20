# Process-Guard Control Arena: Multi-Model AI Control for Software Quality Assurance

> **Track:** AI Security → AI Control · **Venue:** Apart Research AI Safety Hackathon
> **Status:** Draft — Sections 1–2, Abstract, and References (Task 1 deliverable)

---

## Abstract

> *Draft — finalize once prototype results from Task 3/4 are available. Max 250 words.*

The rapid integration of large language models (LLMs) into software development has outpaced the formal engineering processes meant to ensure software quality. Developers increasingly accept AI-generated artifacts on trust, bypassing requirements validation, design review, and systematic testing—a condition we term *the War of the Code*. Prior work shows the danger is structural: roughly 40% of GitHub Copilot completions across security-relevant scenarios contain vulnerabilities (Pearce et al., 2022), and controlled studies find that developers with AI assistance write less secure code while feeling more confident (Perry et al., 2023; Sandoval et al., 2023). Corporate "AI governance" addresses policy and intent, but not the artifact itself. We present **Process-Guard Control Arena**, a framework that applies AI Control principles (Greenblatt et al., 2024) to software quality assurance. Process-Guard routes each artifact (code, context files, skills, requirements) to three heterogeneous LLMs in parallel; each returns an individual report and a partial metric, and the system synthesizes the three, using cross-model disagreement as a hallucination signal and emitting a single normalized quality score (0–100) grounded in SWEBOK and ISO/IEC 25010 rubrics. Our evaluation shows that triple-model assessment reduces the rate of hallucinated judgments accepted as valid by **[X]%** relative to single-model evaluation. Process-Guard demonstrates a scalable, technical control layer for AI-assisted software development that complements—rather than replaces—organizational governance.

**Keywords:** AI Control, software quality assurance, hallucination detection, multi-model consensus, SWEBOK, ISO/IEC 25010.

---

## 1. Introduction

The integration of large language models (LLMs) into software development has shifted from novelty to default practice. AI assistants such as GitHub Copilot now author a substantial fraction of the code that reaches production, often with minimal human review. This acceleration carries an under-examined cost. When developers accept AI-generated artifacts on trust, they tend to bypass the formal engineering processes—requirements validation, design review, systematic testing—that the discipline developed precisely to contain defects. We refer to this emerging condition as *the War of the Code*: a regime in which the velocity of AI-assisted production outpaces the quality controls meant to govern it.

The empirical case for concern is strong. In a systematic study of Copilot across 89 security-relevant scenarios, Pearce et al. (2022) found that roughly 40% of generated programs contained vulnerabilities mapped to MITRE's CWE Top 25. Controlled user studies reinforce the finding from the human side: developers with AI assistance tend to produce less secure code while reporting greater confidence in its correctness (Perry et al., 2023; Sandoval et al., 2023). The OWASP Top 10 for LLM Applications (2025) further catalogs how these failure modes propagate once LLM outputs are embedded in real systems. The risk is therefore not isolated bugs but a structural erosion of software quality assurance.

Corporate "AI governance" frameworks—policies, usage guidelines, sign-offs—are necessary but insufficient. They operate at the level of human intent and process documentation, not at the level of the artifact itself. What is missing is a *technical control* layer that inspects each artifact and produces an auditable, quantitative quality judgment, in the spirit of AI Control (Greenblatt et al., 2024), which seeks to bound the behavior of capable models without assuming their alignment.

We present **Process-Guard Control Arena**, a framework that applies AI Control principles to software quality assurance. Process-Guard routes each software artifact (code, context files, skills, requirements) to three heterogeneous LLMs (Claude, Gemini, GPT-4) in parallel. Each model returns an individual report and a partial metric; the system then synthesizes the three reports, using cross-model disagreement as a signal for hallucination, and emits a single normalized quality score (0–100) grounded in SWEBOK and ISO/IEC 25010 rubrics.

This work makes three contributions:

1. **Domain transfer of AI Control.** To our knowledge, this is the first application of an AI Control–style framework to the software quality-assurance domain, using SWEBOK and ISO/IEC 25010 as formal evaluation rubrics.
2. **Consensus-based hallucination detection.** We introduce a mechanism that treats disagreement across three heterogeneous models as a quantified, normalized signal of hallucination, rather than relying on the self-consistency of a single model.
3. **Empirical validation.** We provide evidence (Section 4) that triple-model evaluation reduces the rate of hallucinated assessments accepted as valid, relative to single-model evaluation.

---

## 2. Related Work

Process-Guard draws on four lines of research: AI Control frameworks, multi-model evaluation and consensus, software quality standards, and hallucination detection.

**AI Control frameworks.** The AI Control paradigm seeks to ensure safety even when a capable model may be actively trying to subvert safeguards, without assuming the model is aligned (Greenblatt et al., 2024). Its reference implementation, ControlArena, is an open-source library for running red-team/blue-team control experiments over agents operating in sandboxed environments (UK AI Security Institute & Redwood Research, 2025). Process-Guard adopts the control stance—do not trust a single model's output—but transfers it from *agent behavior during task execution* to the *quality auditing of static software artifacts*.

**Multi-model evaluation and consensus.** The LLM-as-a-Judge paradigm uses one model to score the outputs of another, achieving high agreement with human preferences (Zheng et al., 2023). Chatbot Arena scales this idea through large-volume human pairwise voting (Chiang et al., 2024). Process-Guard automates and hardens this principle: instead of a single judge or human crowd, three heterogeneous LLMs evaluate each artifact simultaneously, so that idiosyncratic biases of any one model are diluted by the panel.

**Software quality standards.** Rather than inventing ad-hoc criteria, Process-Guard grounds its rubrics in established standards. SWEBOK v3.0 defines the knowledge areas of software engineering used to structure the evaluation dimensions (IEEE Computer Society, 2014), and ISO/IEC 25010:2011 supplies the eight product-quality characteristics (functional suitability, reliability, usability, performance efficiency, maintainability, portability, compatibility, security) that the panel scores against. This grounding makes the resulting metric interpretable and defensible.

**Hallucination detection.** SelfCheckGPT detects hallucinations by sampling the same model multiple times and measuring the consistency of its responses (Manakul et al., 2023). Process-Guard generalizes this from *intra-model* to *cross-model* consistency: divergence among three independent models on the same artifact is used as the hallucination signal, which is harder to game than the self-consistency of one model.

### Comparison with prior work

| Approach | Evaluation domain | Evaluators | Output | Difference from Process-Guard |
|---|---|---|---|---|
| ControlArena (UK AISI & Redwood, 2025) | Agent behavior in sandboxes | Protocols + monitor model | Safety/usefulness scores | Evaluates runtime behavior, not static artifact quality |
| LLM-as-a-Judge (Zheng et al., 2023) | LLM response quality | 1 judge model | Pairwise/scalar score | Single judge; no consensus or hallucination signal |
| Chatbot Arena (Chiang et al., 2024) | LLM response quality | Human crowd | Elo ranking | Human voting; not automated or artifact-focused |
| SelfCheckGPT (Manakul et al., 2023) | Factual consistency | 1 model, resampled | Hallucination score | Intra-model consistency only |
| **Process-Guard (this work)** | **Software artifacts** | **3 heterogeneous LLMs** | **Normalized 0–100 quality score** | **Cross-model consensus + SWEBOK/ISO rubrics** |

---

## References

1. Chiang, W.-L., Zheng, L., Sheng, Y., Angelopoulos, A. N., Li, T., Li, D., Zhang, H., Zhu, B., Jordan, M., Gonzalez, J. E., & Stoica, I. (2024). *Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference.* Proceedings of the 41st International Conference on Machine Learning (ICML).
2. Greenblatt, R., Shlegeris, B., Sachan, K., & Roger, F. (2024). *AI Control: Improving Safety Despite Intentional Subversion.* Proceedings of the 41st International Conference on Machine Learning (ICML), PMLR 235:16295–16336. (Preprint: arXiv:2312.06942, 2023.)
3. IEEE Computer Society. (2014). *SWEBOK v3.0: Guide to the Software Engineering Body of Knowledge.* IEEE.
4. ISO/IEC. (2011). *ISO/IEC 25010:2011 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models.*
5. Manakul, P., Liusie, A., & Gales, M. J. F. (2023). *SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models.* Proceedings of EMNLP 2023.
6. OWASP. (2025). *OWASP Top 10 for Large Language Model Applications.* OWASP Foundation.
7. Pearce, H., Ahmad, B., Tan, B., Dolan-Gavitt, B., & Karri, R. (2022). *Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions.* 2022 IEEE Symposium on Security and Privacy (SP), 754–768.
8. Perry, N., Srivastava, M., Kumar, D., & Boneh, D. (2023). *Do Users Write More Insecure Code with AI Assistants?* Proceedings of the 2023 ACM SIGSAC Conference on Computer and Communications Security (CCS '23), 2785–2799.
9. Sandoval, G., Pearce, H., Nys, T., Karri, R., Garg, S., & Dolan-Gavitt, B. (2023). *Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants.* 32nd USENIX Security Symposium (USENIX Security 23), 2205–2222.
10. UK AI Security Institute & Redwood Research. (2025). *ControlArena: A library for running AI control experiments.* https://github.com/UKGovernmentBEIS/control-arena
11. Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.* Advances in Neural Information Processing Systems 36 (NeurIPS 2023), Datasets and Benchmarks Track.
