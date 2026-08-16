#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path
from html import escape

try:
    import geopandas as gpd
    from shapely.geometry import box, Polygon, MultiPolygon, GeometryCollection
    from shapely.ops import transform as shp_transform
    from pyproj import Transformer
    import matplotlib.pyplot as plt
except Exception as exc:
    print("ERROR: Missing required Python packages.")
    print("Activate your cartography virtual environment, then install:")
    print("  pip install geopandas shapely pyproj matplotlib")
    print(f"\nOriginal error: {exc}")
    sys.exit(1)

ROOT = Path.cwd()
BASE = ROOT / "04 Shared Assets" / "basemaps"
SOURCE = BASE / "source" / "natural-earth" / "10m" / "cultural" / "ne_10m_admin_0_countries.shp"
OUT = BASE / "library" / "regions" / "BM-101"

BBOX_WGS84 = (120.0, 29.0, 146.5, 47.5)
PROJECTION_EPSG = 3857
WIDTH = 1200
HEIGHT = 900
PAD = 28

OCEAN = "#edf5f7"
LAND = "#e7e2d8"
COAST = "#9da8ad"

def fail(msg: str) -> None:
    print(f"ERROR: {msg}")
    sys.exit(1)

def polygons(geom):
    if geom is None or geom.is_empty:
        return
    if isinstance(geom, Polygon):
        yield geom
    elif isinstance(geom, MultiPolygon):
        yield from geom.geoms
    elif isinstance(geom, GeometryCollection):
        for g in geom.geoms:
            yield from polygons(g)

def feature_name(row):
    for key in ("ADMIN", "NAME", "SOVEREIGNT", "NAME_LONG"):
        val = row.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    return "Unknown"

def ring_to_path(coords):
    pts = list(coords)
    if not pts:
        return ""
    out = [f"M {pts[0][0]:.2f},{pts[0][1]:.2f}"]
    out.extend(f"L {x:.2f},{y:.2f}" for x, y in pts[1:])
    out.append("Z")
    return " ".join(out)

def geometry_to_svg_path(geom):
    chunks = []
    for poly in polygons(geom):
        chunks.append(ring_to_path(poly.exterior.coords))
        for interior in poly.interiors:
            chunks.append(ring_to_path(interior.coords))
    return " ".join(chunks)

def project_to_screen(geom, transformer, projected_bounds):
    minx, miny, maxx, maxy = projected_bounds

    def project_xy(x, y, z=None):
        return transformer.transform(x, y)

    projected = shp_transform(project_xy, geom)

    sx = (WIDTH - 2 * PAD) / (maxx - minx)
    sy = (HEIGHT - 2 * PAD) / (maxy - miny)
    scale = min(sx, sy)

    content_w = (maxx - minx) * scale
    content_h = (maxy - miny) * scale
    xoff = (WIDTH - content_w) / 2
    yoff = (HEIGHT - content_h) / 2

    def screen_xy(x, y, z=None):
        px = xoff + (x - minx) * scale
        py = HEIGHT - (yoff + (y - miny) * scale)
        return (px, py)

    return shp_transform(screen_xy, projected)

if not SOURCE.exists():
    fail(
        "Natural Earth 10m countries shapefile was not found at:\n"
        f"  {SOURCE}\n\n"
        "Run this script from the Hanten root folder."
    )

OUT.mkdir(parents=True, exist_ok=True)

print("BM-101: loading Natural Earth 10m countries...")
gdf = gpd.read_file(SOURCE)

if gdf.crs is None:
    gdf = gdf.set_crs("EPSG:4326")
else:
    gdf = gdf.to_crs("EPSG:4326")

region = box(*BBOX_WGS84)
subset = gdf[gdf.intersects(region)].copy()
subset["geometry"] = subset.geometry.intersection(region)
subset = subset[~subset.geometry.is_empty].copy()
subset["_hanten_name"] = subset.apply(feature_name, axis=1)

print(f"BM-101: {len(subset)} source features intersect the frame.")

desired = ["_hanten_name", "ADMIN", "NAME", "ISO_A3", "SOV_A3", "TYPE", "geometry"]
cols = [c for c in desired if c in subset.columns]
export_gdf = subset[cols].copy()

geojson_obj = json.loads(export_gdf.to_json(drop_id=True))
geojson_obj["hanten"] = {
    "id": "BM-101",
    "title": "Northeast Asia",
    "source": "Natural Earth 1:10m Admin 0 Countries",
    "extent_wgs84": list(BBOX_WGS84),
    "source_crs": "EPSG:4326"
}

(OUT / "BM-101.geojson").write_text(
    json.dumps(geojson_obj, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8"
)

(OUT / "BM-101.js").write_text(
    "window.HANTEN_BM101_GEOJSON="
    + json.dumps(geojson_obj, ensure_ascii=False, separators=(",", ":"))
    + ";\n",
    encoding="utf-8"
)

transformer = Transformer.from_crs("EPSG:4326", f"EPSG:{PROJECTION_EPSG}", always_xy=True)
minlon, minlat, maxlon, maxlat = BBOX_WGS84
minx, miny = transformer.transform(minlon, minlat)
maxx, maxy = transformer.transform(maxlon, maxlat)
projected_bounds = (minx, miny, maxx, maxy)

svg_paths = []
for _, row in subset.iterrows():
    name = feature_name(row)
    screen_geom = project_to_screen(row.geometry, transformer, projected_bounds)
    d = geometry_to_svg_path(screen_geom)
    if not d:
        continue
    css_name = name.lower().replace(" ", "-").replace("'", "").replace(".", "")
    svg_paths.append(
        f'  <path class="bm101-land bm101-{escape(css_name)}" '
        f'data-country="{escape(name)}" d="{d}"/>'
    )

svg = f'''<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {WIDTH} {HEIGHT}"
     width="{WIDTH}" height="{HEIGHT}"
     role="img"
     aria-labelledby="bm101-title bm101-desc">
  <title id="bm101-title">BM-101 — Northeast Asia</title>
  <desc id="bm101-desc">Reusable Hanten basemap of Northeast Asia from Natural Earth 1:10m country geometry.</desc>
  <metadata>Hanten Cartography Library | BM-101 | Natural Earth 1:10m</metadata>
  <style>
    .bm101-ocean {{
      fill: {OCEAN};
    }}
    .bm101-land {{
      fill: {LAND};
      stroke: {COAST};
      stroke-width: 0.75;
      stroke-linejoin: round;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }}
  </style>
  <rect class="bm101-ocean" x="0" y="0" width="{WIDTH}" height="{HEIGHT}"/>
{chr(10).join(svg_paths)}
</svg>
'''
(OUT / "BM-101.svg").write_text(svg, encoding="utf-8")

print("BM-101: rendering PNG preview...")
fig = plt.figure(figsize=(12, 9), dpi=120)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_facecolor(OCEAN)

projected_gdf = subset.to_crs(epsg=PROJECTION_EPSG)
projected_gdf.plot(
    ax=ax,
    facecolor=LAND,
    edgecolor=COAST,
    linewidth=0.55,
)

ax.set_xlim(minx, maxx)
ax.set_ylim(miny, maxy)
ax.set_aspect("equal")
ax.set_axis_off()

fig.savefig(
    OUT / "BM-101.png",
    dpi=150,
    facecolor=OCEAN,
    bbox_inches="tight",
    pad_inches=0.03,
)
plt.close(fig)

metadata = {
    "id": "BM-101",
    "title": "Northeast Asia",
    "version": "1.0",
    "status": "production",
    "library": "Hanten Cartography Library",
    "type": "regional basemap",
    "source": {
        "dataset": "Natural Earth",
        "theme": "Admin 0 Countries",
        "scale": "1:10m",
        "source_file": "ne_10m_admin_0_countries.shp",
        "license": "Public domain"
    },
    "extent_wgs84": {
        "west": BBOX_WGS84[0],
        "south": BBOX_WGS84[1],
        "east": BBOX_WGS84[2],
        "north": BBOX_WGS84[3]
    },
    "crs": {
        "source_geometry": "EPSG:4326",
        "svg_preview_projection": "EPSG:3857 / Web Mercator"
    },
    "dimensions": {
        "svg_viewbox": f"0 0 {WIDTH} {HEIGHT}",
        "aspect_ratio": WIDTH / HEIGHT
    },
    "design": {
        "ocean": OCEAN,
        "land": LAND,
        "coastline": COAST,
        "principle": "No artificial coastline smoothing. Preserve source geometry."
    },
    "files": [
        "BM-101.svg",
        "BM-101.png",
        "BM-101.geojson",
        "BM-101.js",
        "metadata.json",
        "README.md"
    ]
}

(OUT / "metadata.json").write_text(
    json.dumps(metadata, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8"
)

readme = f'''# BM-101 — Northeast Asia

**Hanten Cartography Library**  
Version 1.0

## Purpose

BM-101 is the reusable high-detail regional basemap for Hanten exhibits centered
on Japan, the Korean Peninsula, the Sea of Japan / East Sea, the Russian Far
East, and nearby Northeast Asia.

It replaces coarse 1:110m world geometry when a regional exhibit needs cleaner,
more recognizable coastlines.

## Source

Natural Earth — **1:10m Admin 0 Countries**  
Source file: `ne_10m_admin_0_countries.shp`

Natural Earth data are public domain.

## Geographic extent

- West: {BBOX_WGS84[0]}°
- South: {BBOX_WGS84[1]}°
- East: {BBOX_WGS84[2]}°
- North: {BBOX_WGS84[3]}°

## Files

- `BM-101.svg` — canonical styled vector preview/master
- `BM-101.png` — quick visual reference
- `BM-101.geojson` — clipped WGS84 geometry for data-driven exhibits
- `BM-101.js` — browser-ready GeoJSON (`window.HANTEN_BM101_GEOJSON`)
- `metadata.json` — source, extent, projection, version, and use information
- `README.md` — this file

## Hanten cartographic rule

**Do not artificially smooth coastlines.**

If a coastline looks too coarse at the exhibit's display scale, use a more
detailed source dataset or a more appropriate basemap.

## Using BM-101 in an exhibit

```html
<script src="../../04 Shared Assets/basemaps/library/regions/BM-101/BM-101.js"></script>
```

Then:

```javascript
const features = HANTEN_BM101_GEOJSON.features;
```

The GeoJSON stays in WGS84 so each exhibit can choose the projection and
viewport that best serve the story.

## First intended exhibit

H008 — Sea of Japan / East Sea
'''

(OUT / "README.md").write_text(readme, encoding="utf-8")

print()
print("BM-101 BUILD COMPLETE")
print(f"Output folder:\n  {OUT}")
for name in ["BM-101.svg", "BM-101.png", "BM-101.geojson", "BM-101.js", "metadata.json", "README.md"]:
    p = OUT / name
    print(f"  ✓ {name} ({p.stat().st_size:,} bytes)")
