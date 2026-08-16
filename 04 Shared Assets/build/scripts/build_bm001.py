from pathlib import Path
import json
import geopandas as gpd
import matplotlib.pyplot as plt

ROOT = Path("04 Shared Assets/basemaps")

LAND = ROOT / "source/natural-earth/110m/physical/ne_110m_land.geojson"
COUNTRIES = ROOT / "source/natural-earth/110m/cultural/ne_110m_admin_0_countries.geojson"

OUT = ROOT / "library/world/BM-001"
OUT.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------
# BM-001 — Hanten World / Equal Earth
# ------------------------------------------------------------

land = gpd.read_file(LAND)
countries = gpd.read_file(COUNTRIES)

# Equal Earth projection — EPSG:8857
land = land.to_crs("EPSG:8857")
countries = countries.to_crs("EPSG:8857")

fig, ax = plt.subplots(figsize=(14, 7))

# Quiet Hanten foundation
land.plot(
    ax=ax,
    facecolor="#F2F2F0",
    edgecolor="#555555",
    linewidth=0.55,
)

# National boundaries
countries.boundary.plot(
    ax=ax,
    color="#A6A6A2",
    linewidth=0.32,
)

ax.set_axis_off()
ax.set_aspect("equal")

# Minimize unused surrounding space
xmin, ymin, xmax, ymax = land.total_bounds
pad_x = (xmax - xmin) * 0.015
pad_y = (ymax - ymin) * 0.015

ax.set_xlim(xmin - pad_x, xmax + pad_x)
ax.set_ylim(ymin - pad_y, ymax + pad_y)

plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

# SVG master
fig.savefig(
    OUT / "BM-001.svg",
    format="svg",
    transparent=True,
    bbox_inches="tight",
    pad_inches=0.05,
)

# PNG preview
fig.savefig(
    OUT / "BM-001.png",
    format="png",
    dpi=180,
    transparent=False,
    facecolor="white",
    bbox_inches="tight",
    pad_inches=0.05,
)

plt.close(fig)

metadata = {
    "id": "BM-001",
    "name": "Hanten World — Equal Earth",
    "version": "1.0.0",
    "status": "candidate",
    "projection": {
        "name": "Equal Earth",
        "epsg": 8857
    },
    "source": {
        "provider": "Natural Earth",
        "scale": "1:110m",
        "land": "ne_110m_land.geojson",
        "countries": "ne_110m_admin_0_countries.geojson"
    },
    "layers": [
        "land",
        "coastlines",
        "national boundaries"
    ],
    "labels": False,
    "terrain": False,
    "intended_use": [
        "general world exhibits",
        "area comparisons",
        "educational overlays"
    ]
}

with open(OUT / "metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

readme = """# BM-001 — Hanten World / Equal Earth

## Purpose

BM-001 is the canonical Hanten world basemap for general educational
exhibits and comparisons where relative land area should be preserved.

## Projection

Equal Earth — EPSG:8857

## Source

Natural Earth 1:110m vector data.

## Included

- Land
- Coastlines
- National boundaries
- Antarctica
- Major islands

## Excluded

- Labels
- Terrain
- Relief
- Rivers
- Cities
- Annotations
- Exhibit-specific highlighting

## Files

- `BM-001.svg` — canonical vector master
- `BM-001.png` — preview
- `metadata.json` — structured asset metadata
- `README.md` — documentation

## Hanten Standard

The basemap is intentionally quiet. Exhibit-specific colors, labels,
annotations, and highlights should be added by the exhibit rather than
baked into the shared basemap.

## Status

Version 1.0.0 — Candidate
"""

with open(OUT / "README.md", "w", encoding="utf-8") as f:
    f.write(readme)

print()
print("BM-001 built successfully.")
print(f"Location: {OUT}")
print()
for filename in ["BM-001.svg", "BM-001.png", "metadata.json", "README.md"]:
    print(" ✓", filename)
