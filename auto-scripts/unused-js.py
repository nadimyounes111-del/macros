"""
Finds JS functions defined in .js files and id's in .html files and finds unused parameters
"""

import re
import os
import hashlib
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = "/Users/nadimyounes/Desktop/Macro Site/tracknorm"

JS_FILES = [
    "js/shared/firebase.js",
    "js/shared/icons.js",
    "js/solo/app-init.js",
    "js/solo/auth.js",
    "js/solo/buttons.js",
    "js/solo/food-log.js",
    "js/solo/macros-sum.js",
    "js/solo/settings.js",
    "js/solo/widgets.js",
]

HTML_FILES = [
    "index.html",
    "app.html",
]

ICONS_FILE = "js/shared/icons.js"


def read_file(filepath):
    try:
        return Path(filepath).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"  [SKIP] Not found: {filepath}")
        return ""


# ===== 1. Duplicate function declarations =====

def find_function_declarations(js_files):
    declarations = defaultdict(list)
    pattern = re.compile(r'function\s+(\w+)\s*\(')
    for filepath in js_files:
        text = read_file(filepath)
        for i, line in enumerate(text.splitlines(), 1):
            for match in pattern.finditer(line):
                declarations[match.group(1)].append((filepath, i))
    return {name: locs for name, locs in declarations.items() if len(locs) > 1}


# ===== 2. data-icon references vs actual ICONS keys =====

def find_icon_keys(icons_text):
    pattern = re.compile(r'["\']?([\w-]+)["\']?\s*:\s*`\s*<svg')
    return set(pattern.findall(icons_text))


def find_data_icon_usages(all_files):
    pattern = re.compile(r'data-icon=[\'"]([\w-]+)[\'"]')
    usages = defaultdict(list)
    for filepath in all_files:
        text = read_file(filepath)
        for i, line in enumerate(text.splitlines(), 1):
            for match in pattern.finditer(line):
                usages[match.group(1)].append((filepath, i))
    return usages


# ===== 3. Duplicate large string blocks (template literals) =====

def find_duplicate_strings(js_files, min_length=100):
    pattern = re.compile(r'`([^`]{%d,})`' % min_length)
    seen = defaultdict(list)
    for filepath in js_files:
        text = read_file(filepath)
        for match in pattern.finditer(text):
            content = match.group(1)
            h = hashlib.md5(content.encode()).hexdigest()
            seen[h].append((filepath, content[:60].replace("\n", " ") + "..."))
    return {h: locs for h, locs in seen.items() if len(locs) > 1}


# ===== 4. getElementById references vs actual ids in HTML =====

def find_id_references(js_files):
    pattern = re.compile(r'getElementById\([\'"](\w[\w-]*)[\'"]\)')
    refs = defaultdict(list)
    for filepath in js_files:
        text = read_file(filepath)
        for i, line in enumerate(text.splitlines(), 1):
            for match in pattern.finditer(line):
                refs[match.group(1)].append((filepath, i))
    return refs


def find_id_definitions(html_files):
    pattern = re.compile(r'id=[\'"](\w[\w-]*)[\'"]')
    ids = set()
    for filepath in html_files:
        ids.update(pattern.findall(read_file(filepath)))
    return ids


# ===== 5. Unused function parameters (heuristic) =====

def extract_function_bodies(text):
    results = []
    pattern = re.compile(r'function\s+(\w+)\s*\(([^)]*)\)\s*{')
    for match in pattern.finditer(text):
        name = match.group(1)
        params_raw = match.group(2)
        params = [p.strip().split("=")[0].strip() for p in params_raw.split(",") if p.strip()]
        if not params:
            continue

        start = match.end() - 1
        depth = 0
        end = None
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
        if end is None:
            continue

        body = text[match.end():end]
        results.append((name, params, body))
    return results


def find_unused_params(js_files):
    unused = []
    for filepath in js_files:
        text = read_file(filepath)
        for name, params, body in extract_function_bodies(text):
            for p in params:
                if not re.search(r'\b' + re.escape(p) + r'\b', body):
                    unused.append((filepath, name, p))
    return unused


def main():
    os.chdir(PROJECT_ROOT)
    all_files = JS_FILES + HTML_FILES

    print("=" * 60)
    print("DUPLICATE FUNCTION NAMES (silent overwrite risk)")
    print("=" * 60)
    dupes = find_function_declarations(JS_FILES)
    if not dupes:
        print("  none found")
    for name, locs in dupes.items():
        print(f"  {name}:")
        for f, line in locs:
            print(f"    {f}:{line}")

    print()
    print("=" * 60)
    print("BROKEN data-icon REFERENCES (no matching ICONS key)")
    print("=" * 60)
    icons_text = read_file(ICONS_FILE)
    icon_keys = find_icon_keys(icons_text)
    usages = find_data_icon_usages(all_files)
    missing = {k: v for k, v in usages.items() if k not in icon_keys}
    if not missing:
        print("  none found")
    for key, locs in missing.items():
        print(f"  '{key}' used at:")
        for f, line in locs:
            print(f"    {f}:{line}")

    print()
    print("=" * 60)
    print("DUPLICATE LARGE STRING BLOCKS (e.g. copy-pasted SVGs)")
    print("=" * 60)
    dup_strings = find_duplicate_strings(JS_FILES)
    if not dup_strings:
        print("  none found")
    for h, locs in dup_strings.items():
        print(f"  duplicate ({len(locs)}x): {locs[0][1]}")
        for f, _ in locs:
            print(f"    {f}")

    print()
    print("=" * 60)
    print("getElementById REFERENCES WITH NO MATCHING HTML id")
    print("=" * 60)
    id_refs = find_id_references(JS_FILES)
    id_defs = find_id_definitions(HTML_FILES)
    missing_ids = {k: v for k, v in id_refs.items() if k not in id_defs}
    if not missing_ids:
        print("  none found")
    for id_name, locs in missing_ids.items():
        print(f"  '{id_name}' referenced at:")
        for f, line in locs:
            print(f"    {f}:{line}")

    print()
    print("=" * 60)
    print("UNUSED FUNCTION PARAMETERS")
    print("=" * 60)
    unused = find_unused_params(JS_FILES)
    if not unused:
        print("  none found")
    for filepath, fn_name, param in unused:
        print(f"  {fn_name}({param}) — unused param in {filepath}")


if __name__ == "__main__":
    main()