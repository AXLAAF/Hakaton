"""Run the Tarea 3 experiment suite against the Process-Guard API.

Modes
-----
Real:    python run_experiments.py --api http://localhost:8000
Dry-run: python run_experiments.py --dry-run

In real mode it POSTs each artifact to {api}/evaluate and stores the raw
responses in datos/resultados_experimentos.json. In dry-run mode it copies
datos/resultados_dry_run.json so the rest of the pipeline (figures, tables)
can be validated before the prototype (Tarea 4) exists.

It also (re)generates salida/tabla_maestra.md from whichever results file
was produced.

Coordinate the response shape with Tarea 4 (see datos/schema.json). If the
real response differs, adjust `parse_response`.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "artefactos"
DATA = ROOT / "datos"
OUT = ROOT / "salida"

# (experiment_id, label, artifact_file, artifact_type, runs)
EXPERIMENTS = [
    ("1A", "Skill gold standard", "1A_gold_standard.txt", "skill", 1),
    ("1B", "Skill vulnerable", "1B_vulnerable.txt", "skill", 1),
    ("2C", "Skill ambigua (alucinacion)", "2C_ambiguo.txt", "skill", 1),
    ("3D", "Reproducibilidad", "3D_reproducibilidad.txt", "skill", 3),
    ("4E", "Documento de requisitos PG", "4E_requisitos.txt", "requirements", 1),
]


def parse_response(payload: dict) -> dict:
    """Normalize the API response to our internal record shape.

    Adjust here if Tarea 4 returns a different structure.
    """
    reports = [
        {
            "model_name": r.get("model_name"),
            "partial_score": r.get("partial_score"),
            "critical_risks": r.get("critical_risks", []),
        }
        for r in payload.get("reports", [])
    ]
    synth = payload.get("synthesis", {})
    return {"reports": reports, "synthesis": synth}


def call_api(api_base: str, artifact_type: str, content: str) -> dict:
    import urllib.request

    url = api_base.rstrip("/") + "/evaluate"
    body = json.dumps(
        {"artifact_type": artifact_type, "artifact_content": content}
    ).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_real(api_base: str) -> dict:
    records = []
    for exp_id, label, fname, atype, runs in EXPERIMENTS:
        path = ARTIFACTS / fname
        if not path.exists():
            print(f"[WARN] missing artifact {fname}, skipping", file=sys.stderr)
            continue
        content = path.read_text(encoding="utf-8")
        for run in range(1, runs + 1):
            print(f"[run] {exp_id} run {run}/{runs} ({fname}) ...")
            try:
                raw = call_api(api_base, atype, content)
                parsed = parse_response(raw)
                status = "ok"
                error = None
            except Exception as exc:  # noqa: BLE001
                parsed = {"reports": [], "synthesis": {}}
                status = "error"
                error = str(exc)
                print(f"   [ERROR] {error}", file=sys.stderr)
            records.append(
                {
                    "experiment_id": exp_id,
                    "label": (label if runs == 1 else f"{label} run {run}"),
                    "artifact_file": fname,
                    "artifact_type": atype,
                    "run": run,
                    "status": status,
                    "error": error,
                    **parsed,
                }
            )
    return {
        "dry_run": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "api_base": api_base,
        "experiments": records,
    }


def load_dry_run() -> dict:
    src = DATA / "resultados_dry_run.json"
    if not src.exists():
        raise FileNotFoundError(f"missing {src}")
    return json.loads(src.read_text(encoding="utf-8"))


def write_master_table(results: dict, out_path: Path) -> None:
    rows = []
    header = (
        "| Exp | Artefacto | s_Claude | s_Gemini | s_GPT-4o | Media | Std | "
        "Outlier | CF | Estado |"
    )
    sep = "|-----|-----------|----------|----------|----------|-------|-----|---------|-----|--------|"

    def score_of(reports, needle):
        for r in reports:
            name = (r.get("model_name") or "").lower()
            if needle in name:
                return r.get("partial_score")
        return None

    def fmt(v):
        return "—" if v is None else str(v)

    for rec in results.get("experiments", []):
        reports = rec.get("reports", [])
        synth = rec.get("synthesis", {})
        label = rec.get("label", rec.get("experiment_id", ""))
        exp_tag = rec.get("experiment_id", "")
        if rec.get("run", 1) > 1 and "run" not in label.lower():
            exp_tag = f"{exp_tag} (run {rec['run']})"
        rows.append(
            "| {exp} | {label} | {c} | {g} | {p} | {mean} | {std} | {out} | {cf} | {st} |".format(
                exp=exp_tag,
                label=label,
                c=fmt(score_of(reports, "claude")),
                g=fmt(score_of(reports, "gemini")),
                p=fmt(score_of(reports, "gpt")),
                mean=fmt(synth.get("mean_score")),
                std=fmt(synth.get("std_deviation")),
                out=fmt(synth.get("outlier_model") or ("Ninguno" if synth else None)),
                cf=fmt(synth.get("final_score")),
                st=fmt(synth.get("status")),
            )
        )

    banner = ""
    if results.get("dry_run"):
        banner = (
            "> **AVISO:** Tabla generada con datos de DRY-RUN (ficticios). "
            "Reemplazar con datos reales antes de la entrega.\n\n"
        )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        "# Tabla Maestra de Resultados\n\n"
        + banner
        + "\n".join([header, sep, *rows])
        + "\n",
        encoding="utf-8",
    )
    print(f"[ok] wrote {out_path}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Run Process-Guard experiments")
    ap.add_argument("--api", default="http://localhost:8000",
                    help="Base URL of the Process-Guard API")
    ap.add_argument("--dry-run", action="store_true",
                    help="Use datos/resultados_dry_run.json instead of calling the API")
    args = ap.parse_args()

    DATA.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        results = load_dry_run()
        print("[mode] DRY-RUN (datos ficticios)")
    else:
        print(f"[mode] REAL against {args.api}")
        results = run_real(args.api)

    out_json = DATA / "resultados_experimentos.json"
    out_json.write_text(json.dumps(results, indent=2, ensure_ascii=False),
                        encoding="utf-8")
    print(f"[ok] wrote {out_json}")

    write_master_table(results, OUT / "tabla_maestra.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
