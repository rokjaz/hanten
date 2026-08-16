from pathlib import Path
import json
import sys

if len(sys.argv) != 2:
    print("Usage: python3 validate_basemap.py BM-001")
    sys.exit(1)

asset_id = sys.argv[1]

ROOT = Path("04 Shared Assets/basemaps/library")
matches = list(ROOT.glob(f"**/{asset_id}"))

if not matches:
    print(f"ERROR: {asset_id} not found in basemap library.")
    sys.exit(1)

asset = matches[0]

required = [
    asset / f"{asset_id}.svg",
    asset / f"{asset_id}.png",
    asset / "metadata.json",
    asset / "README.md",
]

errors = []

for file in required:
    if not file.exists():
        errors.append(f"Missing: {file.name}")

metadata_file = asset / "metadata.json"

if metadata_file.exists():
    try:
        metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"metadata.json is invalid JSON: {exc}")
        metadata = {}

    required_metadata = [
        "id",
        "name",
        "version",
        "projection",
        "source",
    ]

    for key in required_metadata:
        if key not in metadata:
            errors.append(f"metadata.json missing field: {key}")

    if metadata.get("id") != asset_id:
        errors.append(
            f"metadata id '{metadata.get('id')}' does not match {asset_id}"
        )

if errors:
    print()
    print(f"{asset_id} VALIDATION FAILED")
    print("-" * 40)

    for error in errors:
        print(" ✗", error)

    print()
    sys.exit(1)

print()
print(f"{asset_id} VALIDATION PASSED")
print("-" * 40)

for file in required:
    print(" ✓", file.name)

print(" ✓ metadata fields")
print(" ✓ asset ID")
print()
