#!/usr/bin/env python3
"""
Extract permission codes used by the frontend.

Sources:
- Vue template directive `v-permission="..."`
- Backticked codes like `user:create` in markdown docs (for completeness)

Outputs:
- Default: JSON printed to stdout: [{code, count, occurrences:[{file,line,text}]}]
- Optional: write Markdown / CSV tables (see --out-md / --out-csv)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict


ATTR_RE = re.compile(r'v-permission\s*=\s*(?:"([^"]+)"|\'([^\']+)\')')
STRING_RE = re.compile(r"'([^']+)'|\"([^\"]+)\"")
MD_CODE_RE = re.compile(r"`([a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+)`")


def iter_files(root: str) -> list[str]:
    exts = {".vue", ".js", ".ts", ".jsx", ".tsx", ".md"}
    out: list[str] = []

    src_dir = os.path.join(root, "src")
    for dirpath, _dirnames, filenames in os.walk(src_dir):
        for fn in filenames:
            if os.path.splitext(fn)[1] in exts:
                out.append(os.path.join(dirpath, fn))

    # Include top-level docs commonly used in this repo.
    for fn in ["ad_user前端功能清单与API.md", "ad_user前端缺失与升级说明.md"]:
        p = os.path.join(root, fn)
        if os.path.exists(p):
            out.append(p)

    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "root",
        nargs="?",
        default=os.getcwd(),
        help="Project root (default: current working directory)",
    )
    parser.add_argument("--out-md", default="", help="Write a Markdown table to this path")
    parser.add_argument("--out-csv", default="", help="Write a CSV table to this path")
    args = parser.parse_args()

    root = os.path.abspath(args.root)

    codes: dict[str, list[dict]] = defaultdict(list)

    for path in iter_files(root):
        try:
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            continue

        rel = os.path.relpath(path, root)
        is_md = rel.lower().endswith(".md")

        for lineno, line in enumerate(lines, start=1):
            if not is_md:
                m = ATTR_RE.search(line)
                if m:
                    expr = m.group(1) or m.group(2) or ""
                    # v-permission="'user:create'" or v-permission="['a','b']"
                    for sm in STRING_RE.finditer(expr):
                        s = sm.group(1) or sm.group(2) or ""
                        if ":" in s and not s.startswith("http"):
                            codes[s].append(
                                {"file": rel, "line": lineno, "text": line.strip()}
                            )

            # Also capture documented codes in markdown for completeness.
            for c in MD_CODE_RE.findall(line):
                codes.setdefault(c, [])

    out = []
    for code in sorted(codes.keys()):
        occ = codes[code]
        out.append({"code": code, "count": len(occ), "occurrences": occ[:10]})

    if args.out_md:
        used = [d for d in out if d["count"] > 0]
        doc_only = [d for d in out if d["count"] == 0]
        lines: list[str] = []
        lines.append("# Frontend Permission Codes\n")
        lines.append(
            "来源：扫描 `src/**` 内所有 `v-permission` 指令，并补充扫描仓库根目录两份文档中反引号标注的 code。\n"
        )
        lines.append("\n## 1) 实际在前端使用（v-permission 命中）\n")
        lines.append("| Code | 使用次数 | 位置（最多展示 3 条） |\n")
        lines.append("|---|---:|---|\n")
        for d in used:
            occ = d.get("occurrences", [])[:3]
            loc = "<br>".join([f"`{o['file']}:{o['line']}`" for o in occ])
            lines.append(f"| `{d['code']}` | {d['count']} | {loc} |\n")

        lines.append("\n## 2) 文档中提到但当前前端未使用（建议/规划）\n")
        lines.append("| Code | 说明 |\n")
        lines.append("|---|---|\n")
        for d in doc_only:
            lines.append(f"| `{d['code']}` | 文档中出现，但未在 `v-permission` 中扫描到 |\n")

        os.makedirs(os.path.dirname(os.path.abspath(args.out_md)) or ".", exist_ok=True)
        with open(args.out_md, "w", encoding="utf-8") as f:
            f.write("".join(lines))

    if args.out_csv:
        used = [d for d in out if d["count"] > 0]
        doc_only = [d for d in out if d["count"] == 0]
        os.makedirs(os.path.dirname(os.path.abspath(args.out_csv)) or ".", exist_ok=True)
        import csv

        with open(args.out_csv, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["code", "count", "locations"])
            for d in used:
                locs = "; ".join(
                    [f"{o['file']}:{o['line']}" for o in d.get("occurrences", [])]
                )
                w.writerow([d["code"], d["count"], locs])
            for d in doc_only:
                w.writerow([d["code"], 0, "DOC_ONLY"])

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
