"""Generate the Tarea 3 paper figures from an experiment results JSON.

Usage
-----
python generate_figures.py                 # uses datos/resultados_experimentos.json
python generate_figures.py --input datos/resultados_dry_run.json

Produces (in salida/figuras/):
    fig3_calibracion.png      Grouped bars: secure (1A) vs vulnerable (1B) per model
    fig4_alucinacion.png      Bars + median line for 2C, outlier highlighted
    fig5_reproducibilidad.png Boxplot of CF across the three 3D runs

Figures are saved at 300 DPI. If the source is a dry-run, a visible
"DRY-RUN / SIMULATED DATA" watermark is stamped on every figure.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "datos"
FIGDIR = ROOT / "salida" / "figuras"

MODEL_ORDER = ["Claude", "Gemini", "GPT-4o"]
COLOR_SECURE = "#2e7d32"
COLOR_VULN = "#c62828"
COLOR_NORMAL = "#1565c0"
COLOR_OUTLIER = "#ef6c00"


def load_results(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def index_by_experiment(results: dict) -> dict:
    out: dict[str, list] = {}
    for rec in results.get("experiments", []):
        out.setdefault(rec["experiment_id"], []).append(rec)
    return out


def score_map(rec: dict) -> dict:
    m = {}
    for r in rec.get("reports", []):
        name = r.get("model_name", "")
        for canonical in MODEL_ORDER:
            if canonical.lower().split("-")[0] in name.lower():
                m[canonical] = r.get("partial_score")
    return m


def stamp_watermark(ax, dry_run: bool) -> None:
    if not dry_run:
        return
    ax.text(
        0.5, 0.5, "DRY-RUN / SIMULATED DATA",
        transform=ax.transAxes, fontsize=22, color="gray",
        alpha=0.25, ha="center", va="center", rotation=30, zorder=10,
    )


def fig3_calibration(by_exp: dict, dry_run: bool) -> None:
    rec_1a = by_exp.get("1A", [{}])[0]
    rec_1b = by_exp.get("1B", [{}])[0]
    s1a = score_map(rec_1a)
    s1b = score_map(rec_1b)

    x = range(len(MODEL_ORDER))
    width = 0.38
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.bar([i - width / 2 for i in x], [s1a.get(m, 0) for m in MODEL_ORDER],
           width, label="1A secure", color=COLOR_SECURE)
    ax.bar([i + width / 2 for i in x], [s1b.get(m, 0) for m in MODEL_ORDER],
           width, label="1B vulnerable", color=COLOR_VULN)
    ax.set_xticks(list(x))
    ax.set_xticklabels(MODEL_ORDER, fontsize=11)
    ax.set_ylabel("Partial score (0-100)", fontsize=11)
    ax.set_ylim(0, 100)
    ax.set_title("Figure 3 — Base calibration: secure vs. vulnerable skill")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    stamp_watermark(ax, dry_run)
    fig.tight_layout()
    out = FIGDIR / "fig3_calibracion.png"
    fig.savefig(out, dpi=300)
    plt.close(fig)
    print(f"[ok] {out}")


def fig4_hallucination(by_exp: dict, dry_run: bool) -> None:
    rec = by_exp.get("2C", [{}])[0]
    smap = score_map(rec)
    synth = rec.get("synthesis", {})
    outlier = synth.get("outlier_model")
    median = synth.get("median_score")

    models = [m for m in MODEL_ORDER if m in smap]
    scores = [smap[m] for m in models]
    colors = [
        COLOR_OUTLIER if (outlier and outlier.lower() in m.lower()) else COLOR_NORMAL
        for m in models
    ]

    fig, ax = plt.subplots(figsize=(7, 4.5))
    bars = ax.bar(models, scores, color=colors)
    for b, s in zip(bars, scores):
        ax.text(b.get_x() + b.get_width() / 2, s + 1, str(s),
                ha="center", va="bottom", fontsize=10)
    if median is not None:
        ax.axhline(median, color="black", linestyle="--", linewidth=1,
                   label=f"median = {median}")
    cf = synth.get("final_score")
    std = synth.get("std_deviation")
    subtitle = f"std = {std}, penalized CF = {cf}" if std is not None else ""
    ax.set_ylabel("Partial score (0-100)", fontsize=11)
    ax.set_ylim(0, 100)
    ax.set_title("Figure 4 — Hallucination detection (ambiguous skill 2C)")
    if subtitle:
        ax.text(0.5, 0.95, subtitle, transform=ax.transAxes, ha="center",
                va="top", fontsize=10, color="dimgray")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    stamp_watermark(ax, dry_run)
    fig.tight_layout()
    out = FIGDIR / "fig4_alucinacion.png"
    fig.savefig(out, dpi=300)
    plt.close(fig)
    print(f"[ok] {out}")


def fig5_reproducibility(by_exp: dict, dry_run: bool) -> None:
    recs = by_exp.get("3D", [])
    cfs = [r.get("synthesis", {}).get("final_score") for r in recs]
    cfs = [c for c in cfs if c is not None]

    fig, ax = plt.subplots(figsize=(6, 4.5))
    if cfs:
        # matplotlib >=3.9 uses tick_labels; older uses labels.
        try:
            ax.boxplot([cfs], tick_labels=["3D (CF)"], widths=0.4)
        except TypeError:
            ax.boxplot([cfs], labels=["3D (CF)"], widths=0.4)
        for i, c in enumerate(cfs, start=1):
            ax.plot(1, c, "o", color=COLOR_NORMAL)
            ax.annotate(f"run {i}: {c}", (1, c), textcoords="offset points",
                        xytext=(10, 0), fontsize=9)
        spread = max(cfs) - min(cfs)
        ax.set_title(f"Figure 5 — Reproducibility at T=0 (CF spread = {spread})")
    else:
        ax.set_title("Figure 5 — Reproducibility (no data)")
    ax.set_ylabel("Consolidated Final score (CF)", fontsize=11)
    ax.set_ylim(0, 100)
    ax.grid(axis="y", alpha=0.3)
    stamp_watermark(ax, dry_run)
    fig.tight_layout()
    out = FIGDIR / "fig5_reproducibilidad.png"
    fig.savefig(out, dpi=300)
    plt.close(fig)
    print(f"[ok] {out}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate Tarea 3 figures")
    ap.add_argument("--input", default=str(DATA / "resultados_experimentos.json"),
                    help="Path to results JSON")
    args = ap.parse_args()

    path = Path(args.input)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        print(f"[ERROR] results file not found: {path}")
        print("        Run run_experiments.py first (use --dry-run if no API).")
        return 1

    results = load_results(path)
    dry_run = bool(results.get("dry_run"))
    FIGDIR.mkdir(parents=True, exist_ok=True)

    by_exp = index_by_experiment(results)
    fig3_calibration(by_exp, dry_run)
    fig4_hallucination(by_exp, dry_run)
    fig5_reproducibility(by_exp, dry_run)

    if dry_run:
        print("[note] figures stamped DRY-RUN; regenerate with real data before delivery.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
