# BM-101 — Northeast Asia

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

- West: 120.0°
- South: 29.0°
- East: 146.5°
- North: 47.5°

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
