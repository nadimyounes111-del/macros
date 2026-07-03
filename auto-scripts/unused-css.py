"""
Finds CSS classes defined in .css files that are never referenced in .html or .js files
"""

import re
import os
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = "/Users/nadimyounes/Desktop/Macros" 

CSS_FILES = [
    "css/widget.css",
    "css/modal.css",
    "css/base.css",
    "css/buttons.css",
    "css/food-log.css",
    "css/header.css",
    "css/macros-sum.css",
    "css/trackers.css",
    "css/pin.css"
    "css/settings.css"
]

HTML_JS_FILES = [
    "index.html",
    "js/libraries/firebase.js",
    "js/buttons.js",
    "js/config.js",
    "js/food-log.js",
    "js/macros-sum.js",
    "js/trackers.js",
]

PSEUDO = {
    "hover", "focus", "active", "visited", "checked", "disabled", "enabled",
    "first-child", "last-child", "nth-child", "first-of-type", "last-of-type",
    "not", "is", "where", "has", "root", "before", "after", "placeholder",
    "focus-within", "focus-visible", "empty", "target", "required", "optional",
    "valid", "invalid", "read-only", "read-write", "link", "ttf", "woff",
    "woff2", "eot", "svg", "otf", "region", "endregion", "row-alt"
}

# used to ignore hex codes after (#) when looking for IDs
pattern = r'#(?!(?:[a-fA-F0-9]{3,4}){1,2}\b)([a-zA-Z][\w-]*)'

def extract_css_classes(filepath):
    classes = {}
    try:
        text = Path(filepath).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"  [SKIP] Not found: {filepath}")
        return classes
    for i, line in enumerate(text.splitlines(), 1):
        for m in re.findall(r'\.([a-zA-Z][\w-]*)', line):
            if m not in classes and m not in PSEUDO:
                classes[m] = i
        for m in re.findall(pattern, line):
            if m not in classes and m not in PSEUDO:
                classes[m] = i
    return classes


def extract_used_identifiers(filepath):
    identifiers = set()
    try:
        text = Path(filepath).read_text(encoding="utf-8")
    except FileNotFoundError:
        return identifiers
    for match in re.finditer(r'class=["\']([^"\']+)["\']', text):
        for cls in match.group(1).split():
            identifiers.add(cls)
    for match in re.finditer(r'id=["\']([^"\']+)["\']', text):
        identifiers.add(match.group(1).strip())
    for match in re.finditer(r'classList\.(?:add|remove|toggle|contains|replace)\(([^)]+)\)', text):
        for cls in re.findall(r'["\']([^"\']+)["\']', match.group(1)):
            identifiers.add(cls)
    for match in re.finditer(r'(?:querySelector(?:All)?|closest|matches)\(["\']([^"\']+)["\']\)', text):
        for cls in re.findall(r'[.#]([a-zA-Z][\w-]*)', match.group(1)):
            identifiers.add(cls)
    for match in re.finditer(r'getElementById\(["\']([^"\']+)["\']\)', text):
        identifiers.add(match.group(1))
    for match in re.finditer(r'\.className\s*[+]?=\s*["\']([^"\']+)["\']', text):
        for cls in match.group(1).split():
            identifiers.add(cls)
    return identifiers


def main():
    os.chdir(PROJECT_ROOT)
    all_defined = {}
    defined_per_file = defaultdict(dict)

    for css_file in CSS_FILES:
        classes = extract_css_classes(css_file)
        for cls, lineno in classes.items():
            if cls not in all_defined:
                all_defined[cls] = (css_file, lineno)
            defined_per_file[css_file][cls] = lineno

    all_used = set()
    for f in HTML_JS_FILES:
        all_used |= extract_used_identifiers(f)

    unused_by_file = defaultdict(list)
    for cls, (css_file, lineno) in all_defined.items():
        if cls not in all_used:
            unused_by_file[css_file].append((lineno, cls))

    total_unused = sum(len(v) for v in unused_by_file.values())

    for css_file in CSS_FILES:
        entries = sorted(unused_by_file.get(css_file, []))
        if not entries:
            continue
        print(f"\nFile: {css_file}")
        for lineno, cls in entries:
            print(f"Line:{lineno:4d} {cls}")

    print(f"\n\033[92mCOMPLETE\033[0m: Found {total_unused} classes\n")


if __name__ == "__main__":
    main()