"""Utility script to compile LaTeX files into PDFs using pdflatex.

This script is invoked from the Node.js backend to convert generated
LaTeX source files into PDF documents. It expects pdflatex to be
available on the PATH.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def compile_latex(tex_path: Path, output_dir: Path, cleanup: bool) -> Path:
    """Compile the provided .tex file into a PDF using pdflatex."""

    tex_path = tex_path.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    command = [
        "pdflatex",
        "-interaction=nonstopmode",
        f"-output-directory={output_dir}",
        str(tex_path),
    ]

    # Run pdflatex and surface any compilation errors to the caller.
    process = subprocess.run(
        command,
        cwd=str(tex_path.parent),
        capture_output=True,
        text=True,
        check=False,
    )

    if process.returncode != 0:
        sys.stderr.write(process.stdout)
        sys.stderr.write(process.stderr)
        raise RuntimeError("pdflatex failed")

    pdf_path = output_dir / (tex_path.stem + ".pdf")
    if not pdf_path.exists():
        raise FileNotFoundError("Expected PDF was not created")

    if cleanup:
        for ext in (".aux", ".log", ".out", ".toc", ".synctex.gz"):
            candidate = output_dir / (tex_path.stem + ext)
            if candidate.exists():
                candidate.unlink(missing_ok=True)

    return pdf_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Compile LaTeX to PDF")
    parser.add_argument("--tex", required=True, help="Path to the LaTeX .tex file")
    parser.add_argument(
        "--out",
        required=True,
        help="Directory where the compiled PDF should be written",
    )
    parser.add_argument(
        "--cleanup",
        action="store_true",
        help="Remove auxiliary files generated during compilation",
    )
    args = parser.parse_args()

    try:
        pdf_path = compile_latex(Path(args.tex), Path(args.out), args.cleanup)
    except Exception as exc:  # pylint: disable=broad-except
        sys.stderr.write(f"{exc}\n")
        return 1

    print(json.dumps({"pdf": str(pdf_path)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())








