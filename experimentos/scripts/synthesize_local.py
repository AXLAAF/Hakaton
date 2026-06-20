"""Local synthesizer — replicates the Process-Guard scoring formula (Tarea 2).

Used as a fallback when the prototype (Tarea 4) is unavailable, and to
validate figures from scores entered manually. Mirrors the algorithm in
TAREA_2_Diseno_Framework.md and prototype/synthesizer.py.

Rules:
    std < 10  -> CF = mean(scores),            no flag
    10 <= std <= 20 -> CF = mean(scores),      flag "Revision Recomendada"
    std > 20  -> CF = 0.45*c1 + 0.45*c2 + 0.10*outlier, flag "Posible Alucinacion"

The outlier is the model whose score deviates most from the median.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field, asdict
from typing import Optional


STATUS_THRESHOLDS = [
    (90, "approved"),
    (70, "approved_observations"),
    (50, "needs_review"),
    (0, "rejected"),
]


def status_for(score: float) -> str:
    for threshold, label in STATUS_THRESHOLDS:
        if score >= threshold:
            return label
    return "rejected"


@dataclass
class SynthesisResult:
    scores: dict
    mean_score: float
    std_deviation: float
    median_score: float
    outlier_model: Optional[str]
    hallucination_flag: bool
    review_flag: bool
    final_score: int
    status: str
    note: str = ""

    def as_dict(self) -> dict:
        return asdict(self)


def synthesize(scores: dict[str, float]) -> SynthesisResult:
    """scores: mapping model_name -> partial_score (0-100)."""
    if not scores:
        raise ValueError("scores must not be empty")

    names = list(scores.keys())
    values = [float(scores[n]) for n in names]

    mean = statistics.mean(values)
    std = statistics.stdev(values) if len(values) > 1 else 0.0
    median = statistics.median(values)

    outlier_model: Optional[str] = None
    hallucination_flag = False
    review_flag = False
    note = ""

    if len(values) >= 3 and std > 20:
        deviations = [abs(v - median) for v in values]
        outlier_idx = deviations.index(max(deviations))
        outlier_model = names[outlier_idx]
        hallucination_flag = True
        others = [values[i] for i in range(len(values)) if i != outlier_idx]
        final = 0.45 * others[0] + 0.45 * others[1] + 0.10 * values[outlier_idx]
        note = "std > 20: outlier penalized (weight 0.10)"
    elif std > 10:
        review_flag = True
        final = mean
        note = "10 < std <= 20: review recommended"
    else:
        final = mean
        note = "std <= 10: high consensus"

    final_int = int(round(final))

    return SynthesisResult(
        scores=dict(scores),
        mean_score=round(mean, 2),
        std_deviation=round(std, 2),
        median_score=round(median, 2),
        outlier_model=outlier_model,
        hallucination_flag=hallucination_flag,
        review_flag=review_flag,
        final_score=final_int,
        status=status_for(final_int),
        note=note,
    )


if __name__ == "__main__":
    # Quick self-check with the dry-run hypotheses.
    examples = {
        "1A gold": {"Claude": 88, "Gemini": 86, "GPT-4o": 87},
        "1B vuln": {"Claude": 42, "Gemini": 38, "GPT-4o": 45},
        "2C ambiguo": {"Claude": 88, "Gemini": 52, "GPT-4o": 54},
    }
    for name, scores in examples.items():
        r = synthesize(scores)
        print(f"{name:12} -> CF={r.final_score:3d} std={r.std_deviation:5.2f} "
              f"status={r.status:22} outlier={r.outlier_model} "
              f"halluc={r.hallucination_flag}")
