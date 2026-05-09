#!/usr/bin/env python3
"""
generate_tiles.py
-----------------
Dot-density vector tile generator for Census 2021 Output Area data.

Pipeline:
  1. Load OA boundary shapefile → convert EPSG:27700 → WGS84
  2. Load census CSV → extract category columns
  3. Randomly place one point per person inside each OA polygon (parallel)
  4. Write ratio polygons as GeoJSONSeq (.ndjson) — streamable, no memory spike
  5. Run Tippecanoe: dots layer  (-Z8 -z14 -B13, no compression)
  6. Run Tippecanoe: ratios layer (same zoom range, simplified)
  7. Write per-dataset config.json snippet

Usage:
  python generate_tiles.py --dataset TS021_ethnic_group_tb_6a_2021
  python generate_tiles.py --dataset TS030_religion_oa_2021 --cores 12

Requirements:
  pip install pandas geopandas shapely p_tqdm numpy
  brew install tippecanoe
"""

import argparse
import json
import os
import random
import shutil
from pathlib import Path

import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from p_tqdm import p_uimap


# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULTS = {
    "data_dir":  "2021-oa-data",
    "shapefile": "OA_2021_EW_BFC_V8.shp",
    "output_dir": "..",
    "temp_dir":   "temp",
    "cores":      8,
    "chunks":     8,
}


# ---------------------------------------------------------------------------
# Point generation
# ---------------------------------------------------------------------------
def generate_random_points(count: int, polygon) -> list:
    """Rejection-sample `count` random points inside `polygon`."""
    points = []
    minx, miny, maxx, maxy = polygon.bounds
    max_attempts = count * 10
    attempts = 0
    while len(points) < count and attempts < max_attempts:
        x = random.uniform(minx, maxx)
        y = random.uniform(miny, maxy)
        if polygon.contains(Point(x, y)):
            points.append([x, y])
        attempts += 1
    return points


def process_chunk(args) -> Path:
    """
    Process one chunk of OA codes and write dots to an NDJSON file.
    Each feature carries only {cat: int} so tiles stay small.
    """
    chunk_idx, oa_codes, output_file, data, categories, geometries = args
    with open(output_file, "w") as f:
        for oa_code in oa_codes:
            if oa_code not in geometries.index or oa_code not in data.index:
                continue
            row = data.loc[oa_code]
            polygon = geometries.loc[oa_code]
            for cat_idx, category in enumerate(categories):
                count = int(row[category])
                if count <= 0:
                    continue
                for x, y in generate_random_points(count, polygon):
                    feature = {
                        "type": "Feature",
                        "properties": {"cat": cat_idx},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [round(x, 6), round(y, 6)],
                        },
                    }
                    f.write(json.dumps(feature) + "\n")
    return output_file


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def main(args):
    dataset    = args.dataset
    data_dir   = Path(args.data_dir)
    shapefile  = Path(args.shapefile)
    output_dir = Path(args.output_dir)
    temp_dir   = Path(args.temp_dir)
    num_cores  = args.cores
    num_chunks = args.chunks

    temp_dir.mkdir(exist_ok=True)
    output_dataset_dir = output_dir / dataset
    output_dataset_dir.mkdir(exist_ok=True)

    # ------------------------------------------------------------------
    # 1. Load geometry — convert British National Grid → WGS84
    # ------------------------------------------------------------------
    print("── 1. Loading shapefile...")
    shp = gpd.read_file(shapefile)
    print(f"   CRS: {shp.crs}")
    if shp.crs.to_epsg() != 4326:
        print("   Converting EPSG:27700 → EPSG:4326...")
        shp = shp.to_crs(epsg=4326)
    geom = shp.set_index("OA21CD").geometry
    print(f"   Loaded {len(geom):,} Output Areas")
    print(f"   Bounds: {geom.total_bounds.round(4)}")

    # ------------------------------------------------------------------
    # 2. Load census CSV
    # ------------------------------------------------------------------
    print(f"\n── 2. Loading census data: {dataset}.csv")
    data = pd.read_csv(data_dir / f"{dataset}.csv").set_index("Geography code")
    cols = list(data.columns)
    categories = cols[cols.index("Classification") + 1 : cols.index("Total")]
    data = data[categories]
    print(f"   Categories ({len(categories)}):")
    for i, cat in enumerate(categories):
        print(f"     {i}: {cat}")

    # ------------------------------------------------------------------
    # 3. Common OAs
    # ------------------------------------------------------------------
    print("\n── 3. Matching OA codes...")
    common_oas = list(set(data.index) & set(geom.index))
    coverage = 100 * len(common_oas) / len(data)
    print(f"   Common OAs: {len(common_oas):,}  ({coverage:.1f}% coverage)")
    np.random.shuffle(common_oas)

    # ------------------------------------------------------------------
    # 4. Generate dot points (parallel)
    # ------------------------------------------------------------------
    print(f"\n── 4. Generating points ({num_cores} cores, {num_chunks} chunks)...")
    chunks = np.array_split(common_oas, num_chunks)
    args_list = [
        (i, list(chunk), temp_dir / f"{dataset}_chunk_{i}.ndjson",
         data, categories, geom)
        for i, chunk in enumerate(chunks)
    ]
    results = list(p_uimap(process_chunk, args_list, num_cpus=num_cores))
    print(f"   Written: {len(results)} chunk files")

    # ------------------------------------------------------------------
    # 5. Ratio polygons — GeoJSONSeq (NDJSON)
    #    Using GeoJSONSeq instead of GeoJSON:
    #      • Streamable line-by-line — Tippecanoe reads in parallel with --read-parallel
    #      • No memory spike from building a FeatureCollection wrapper
    #      • Avoids the truncated-JSON error seen with large GeoJSON files
    # ------------------------------------------------------------------
    print("\n── 5. Writing ratio polygons as GeoJSONSeq (.ndjson)...")
    ratio_gdf = gpd.GeoDataFrame(geom)
    ratio_gdf["ratios"] = [
        str(list(data.loc[oa].values)).replace(" ", "")
        if oa in data.index else "[]"
        for oa in ratio_gdf.index
    ]
    ratio_file = output_dataset_dir / "ratio.ndjson"
    ratio_gdf.to_file(ratio_file, driver="GeoJSONSeq")
    print(f"   Saved: {ratio_file}")

    # ------------------------------------------------------------------
    # 6. Tippecanoe — dots
    #    -Z8 -z14   explicit zoom range (avoids -zg "two distinct locations" crash)
    #    -B13       base zoom for feature retention without dropping
    #    --no-tile-compression  raw .pbf so MapLibre can read without decompression
    #    --no-tile-size-limit   census tiles are dense; don't truncate
    #    --no-feature-limit     keep all points (drop-fraction would lose data)
    # ------------------------------------------------------------------
    print("\n── 6. Tippecanoe — dots layer...")
    dots_cmd = (
        f'tippecanoe -f -l {dataset} '
        f'--no-tile-compression '
        f'--no-tile-size-limit '
        f'--no-feature-limit '
        f'--read-parallel '
        f'-Z8 -z14 -B13 '
        f'--output-to-directory="{output_dataset_dir}" '
        f'{temp_dir}/*chunk*.ndjson'
    )
    print(f"   {dots_cmd}")
    ret = os.system(dots_cmd)
    if ret != 0:
        raise RuntimeError(f"Tippecanoe (dots) exited with code {ret}")

    # ------------------------------------------------------------------
    # 7. Tippecanoe — ratio polygons
    #    --simplification=10 / --simplify-only-low-zooms
    #      Reduces polygon vertex count at low zooms without affecting click accuracy
    # ------------------------------------------------------------------
    print("\n── 7. Tippecanoe — ratios layer...")
    ratios_dir = output_dataset_dir / "ratios"
    ratios_dir.mkdir(exist_ok=True)
    ratios_cmd = (
        f'tippecanoe -f -l ratio '
        f'--no-tile-compression '
        f'--simplification=10 '
        f'--simplify-only-low-zooms '
        f'--no-tile-size-limit '
        f'--force '
        f'--read-parallel '
        f'-Z8 -z14 -B13 '
        f'--output-to-directory="{ratios_dir}" '
        f'{ratio_file}'
    )
    print(f"   {ratios_cmd}")
    ret = os.system(ratios_cmd)
    if ret != 0:
        raise RuntimeError(f"Tippecanoe (ratios) exited with code {ret}")

    # ------------------------------------------------------------------
    # 8. Config snippet
    # ------------------------------------------------------------------
    print("\n── 8. Writing config.json...")
    totals = data.sum()
    normalized = (totals / totals.max() * 100).round(2)
    config_snippet = {
        "name": dataset.replace("_", " ").title(),
        "tileDir": dataset,
        "dotLayer": dataset,
        "ratioLayer": "ratio",
        "keys": list(categories),
        "ratios": list(normalized.values),
    }
    config_path = output_dataset_dir / "config.json"
    with open(config_path, "w") as f:
        json.dump(config_snippet, f, indent=2)
    print(f"   Saved: {config_path}")
    print(json.dumps(config_snippet, indent=2))

    # ------------------------------------------------------------------
    # 9. Cleanup temp files
    # ------------------------------------------------------------------
    print("\n── 9. Cleaning up temp files...")
    shutil.rmtree(temp_dir)
    print("   Done.")

    print(f"\n✓ Finished: {dataset}")
    print(f"  Tiles:  {output_dataset_dir}/")
    print(f"  Ratios: {ratios_dir}/")
    print(f"  Config: {config_path}")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate dot-density vector tiles from Census 2021 OA data."
    )
    parser.add_argument("--dataset",    required=True,
                        help="Dataset name, e.g. TS021_ethnic_group_tb_6a_2021")
    parser.add_argument("--data-dir",   default=DEFAULTS["data_dir"],
                        help=f"Census CSV directory (default: {DEFAULTS['data_dir']})")
    parser.add_argument("--shapefile",  default=DEFAULTS["shapefile"],
                        help=f"OA shapefile path (default: {DEFAULTS['shapefile']})")
    parser.add_argument("--output-dir", default=DEFAULTS["output_dir"],
                        help=f"Output root directory (default: {DEFAULTS['output_dir']})")
    parser.add_argument("--temp-dir",   default=DEFAULTS["temp_dir"],
                        help=f"Temp chunk directory (default: {DEFAULTS['temp_dir']})")
    parser.add_argument("--cores",      type=int, default=DEFAULTS["cores"],
                        help=f"Parallel CPU cores (default: {DEFAULTS['cores']})")
    parser.add_argument("--chunks",     type=int, default=DEFAULTS["chunks"],
                        help=f"OA chunk count (default: {DEFAULTS['chunks']})")
    main(parser.parse_args())
