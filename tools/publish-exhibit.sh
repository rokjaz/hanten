#!/bin/bash

set -euo pipefail

# ============================================================
# HANTEN EXHIBIT PUBLISHER
# Publishes an approved H###_v2.html from the Hanten master
# project into the website-v2 production structure.
# ============================================================

if [[ $# -ne 1 ]]; then
  echo "Usage: ./tools/publish-exhibit.sh H###"
  echo "Example: ./tools/publish-exhibit.sh H002"
  exit 1
fi

ID="$1"

if [[ ! "$ID" =~ ^H[0-9]{3}$ ]]; then
  echo "ERROR: Exhibit ID must look like H001, H002, H059, etc."
  exit 1
fi

MASTER="${HANTEN_MASTER:-$HOME/Library/CloudStorage/GoogleDrive-rokjaz@gmail.com/My Drive/Hanten}"
MAPS="$MASTER/02 Maps"

SOURCE_DIR="$(find "$MAPS" -maxdepth 1 -type d -name "${ID}*" -print -quit)"

if [[ -z "$SOURCE_DIR" ]]; then
  echo "ERROR: Could not find a master folder beginning with $ID"
  exit 1
fi

# Source file: H###.html (the standardized master). An older
# H###_v2.html is used only if H###.html is missing.
SOURCE_HTML="$SOURCE_DIR/${ID}.html"

if [[ ! -f "$SOURCE_HTML" && -f "$SOURCE_DIR/${ID}_v2.html" ]]; then
  SOURCE_HTML="$SOURCE_DIR/${ID}_v2.html"
fi

if [[ ! -f "$SOURCE_HTML" ]]; then
  echo
  echo "NOT READY FOR PUBLICATION: $ID"
  echo
  echo "No ${ID}.html found in:"
  echo "  $SOURCE_DIR"
  echo
  echo "No website files were changed."
  exit 2
fi

DEST_DIR="exhibits/$ID"
DEST_HTML="$DEST_DIR/index.html"

mkdir -p "$DEST_DIR"

echo
echo "============================================================"
echo "Publishing $ID"
echo "============================================================"
echo "Master:"
echo "  $SOURCE_HTML"
echo
echo "Website:"
echo "  $DEST_HTML"
echo

cp "$SOURCE_HTML" "$DEST_HTML"

# ------------------------------------------------------------
# Find master Shared Assets references before rewriting them.
# Copy missing dependencies into website assets while
# preserving their Shared Assets folder structure.
# Existing website assets are NOT overwritten.
# ------------------------------------------------------------

python3 - "$DEST_HTML" "$MASTER" <<'PY'
from pathlib import Path
import re
import shutil
import sys

html_path = Path(sys.argv[1])
master = Path(sys.argv[2])

text = html_path.read_text()

pattern = re.compile(
    r'(?:\.\./)+04 Shared Assets/([^"\')\s>]+)'
)

refs = sorted(set(pattern.findall(text)))

for rel in refs:
    src = master / "04 Shared Assets" / rel
    dst = Path("assets") / rel

    if not src.exists():
        print(f"WARNING: referenced shared asset not found: {src}")
        continue

    dst.parent.mkdir(parents=True, exist_ok=True)

    if dst.exists() and rel != "css/hanten.css":
        print(f"KEEP existing website asset: {dst}")
    else:
        shutil.copy2(src, dst)
        print(f"COPY shared asset: {dst}")

# Rewrite all Shared Assets prefixes to the website asset root.
text = re.sub(
    r'(?:\.\./)+04 Shared Assets/',
    '../../assets/',
    text
)

html_path.write_text(text)
PY

# ------------------------------------------------------------
# Rewrite links between master exhibit folders for website use.
#
# Example:
#   ../H015 Gerrymander - Real Districts/H015_v2.html
# becomes:
#   ../H015/
# ------------------------------------------------------------

python3 - "$DEST_HTML" <<'PYLINKS'
from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

pattern = re.compile(
    r'\.\./H(\d{3})[^/"]*/H\1(?:_v2)?\.html'
)

s, count = pattern.subn(
    lambda m: f'../H{m.group(1)}/index.html',
    s
)

# Ensure rewritten inter-exhibit anchors open in a new tab/window.
s = re.sub(
    r'<a href="(\.\./H\d{3}/index\.html)"(?![^>]*target=)',
    r'<a href="\1" target="_blank" rel="noopener noreferrer"',
    s
)

p.write_text(s, encoding="utf-8")

if count:
    print(f"REWRITE inter-exhibit links: {count}")
else:
    print("NOTE: No inter-exhibit master links found.")
PYLINKS

# ------------------------------------------------------------
# Standardize Save Image capture target.
# The exported PNG should capture the complete exhibit rather
# than a chart/map-only stage.
# ------------------------------------------------------------

python3 - "$DEST_HTML" <<'PY'
from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text()

marker = "HantenSaveImage.init({"

if marker in s:
    before, after = s.split(marker, 1)

    updated, count = re.subn(
        r'target\s*:\s*["\'][^"\']+["\']',
        'target: ".hanten-exhibit"',
        after,
        count=1
    )

    if count:
        s = before + marker + updated
        p.write_text(s)
        print("STANDARDIZE export target: .hanten-exhibit")
    else:
        print("WARNING: Save Image target not found.")
else:
    print("NOTE: No HantenSaveImage.init block found.")
PY

# ------------------------------------------------------------
# H numbers are internal only: drop "H### — " from the page
# title and the H### prefix from Save Image file names.
# ------------------------------------------------------------

python3 - "$DEST_HTML" <<'PYHNUM'
from pathlib import Path
import re
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
s = re.sub(r'<title>\s*H\d{3}\s*[—–-]\s*', '<title>', s)
m = re.search(r'<title>([^<]*)</title>', s)
slug = re.sub(r'[^a-z0-9]+', '-', (m.group(1) if m else 'exhibit').lower()).strip('-')[:60].rstrip('-')
s = re.sub(r'"H\d{3}(?:_v\d+)?\.png"', '"hanten-' + slug + '.png"', s)
s = re.sub(r'"H\d{3}[-_]([^"]+\.png)"', r'"hanten-\1"', s)
p.write_text(s, encoding="utf-8")
print("HIDE H number in title and image file name")
PYHNUM

echo
echo "============================================================"
echo "DEPENDENCY CHECK"
echo "============================================================"

# Report anything that still points directly into the master
# Hanten project structure.
if grep -nE \
  '04 Shared Assets|02 Maps|My Drive/Hanten|/Users/rokjaz' \
  "$DEST_HTML"
then
  echo
  echo "WARNING: unresolved master-project reference(s) remain."
else
  echo "PASS: No direct master-project paths found."
fi

echo
echo "============================================================"
echo "EXTERNAL / FILE REFERENCES"
echo "============================================================"

grep -nE \
  '(src=|href=|fetch\(|d3\.(json|csv|tsv)|url\()' \
  "$DEST_HTML" || true

echo
echo "============================================================"
echo "GIT STATUS"
echo "============================================================"

git status --short

echo
echo "============================================================"
echo "$ID prepared successfully."
echo
echo "NEXT:"
echo "  open $DEST_HTML"
echo
echo "Test the exhibit and Save Image before committing."
echo "============================================================"
