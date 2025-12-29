#!/usr/bin/env python3
"""
Generate ratio tiles for the DotDensity map.
This script:
1. Downloads OA (Output Area) polygon geometries
2. Reads CSV data with category counts per OA
3. Joins them and creates GeoJSON with ratio data
4. Converts to vector tiles using tippecanoe

Requirements:
    pip install geopandas pandas requests
    brew install tippecanoe  (or apt-get install tippecanoe)

Usage:
    python generate_ratios.py TS021_ethnic_group_tb_6a_2021
"""

import os
import sys
import json
import pandas as pd
import geopandas as gpd
import requests
from pathlib import Path

# Configuration
PROCESSING_DIR = Path(__file__).parent
DATA_DIR = PROCESSING_DIR / "2021-oa-data"
GEOM_DIR = PROCESSING_DIR / "geometry"
OUTPUT_DIR = PROCESSING_DIR.parent / "static"

# ONS Geography Portal - OA boundaries
OA_GEOJSON_URL = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Output_Areas_2021_EW_BGC_V2/FeatureServer/0/query?where=1%3D1&outFields=OA21CD&returnGeometry=true&f=geojson"

def download_oa_geometry():
    """Download Output Area boundaries from ONS."""
    geom_file = GEOM_DIR / "oa_2021.geojson"
    
    if geom_file.exists():
        print(f"Using cached geometry: {geom_file}")
        return gpd.read_file(geom_file)
    
    print("Downloading OA geometry from ONS...")
    GEOM_DIR.mkdir(parents=True, exist_ok=True)
    
    # For large datasets, we need to paginate
    # ONS limits to 2000 features per request
    all_features = []
    offset = 0
    batch_size = 2000
    
    while True:
        url = f"{OA_GEOJSON_URL}&resultOffset={offset}&resultRecordCount={batch_size}"
        print(f"  Fetching records {offset} to {offset + batch_size}...")
        
        response = requests.get(url, timeout=120)
        data = response.json()
        
        features = data.get('features', [])
        if not features:
            break
            
        all_features.extend(features)
        offset += batch_size
        
        if len(features) < batch_size:
            break
    
    print(f"Downloaded {len(all_features)} OA polygons")
    
    # Save as GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }
    
    with open(geom_file, 'w') as f:
        json.dump(geojson, f)
    
    return gpd.read_file(geom_file)


def load_csv_data(dataset_name):
    """Load CSV data for a dataset."""
    csv_file = DATA_DIR / f"{dataset_name}.csv"
    
    if not csv_file.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_file}")
    
    print(f"Loading CSV: {csv_file}")
    df = pd.read_csv(csv_file)
    
    # Set index to OA code
    df = df.set_index('Geography code')
    
    # Find the data columns (between 'Classification' and 'Total')
    cols = list(df.columns)
    start = cols.index('Classification') + 1
    end = cols.index('Total')
    data_cols = cols[start:end]
    
    print(f"  Data columns: {data_cols}")
    
    return df[data_cols], data_cols


def create_ratio_geojson(gdf, df, data_cols, output_file):
    """Join geometry with data and create GeoJSON with ratios."""
    print("Joining geometry with data...")
    
    # Merge on OA code
    gdf = gdf.set_index('OA21CD')
    
    # Only keep OAs that exist in both
    common_oas = gdf.index.intersection(df.index)
    print(f"  Matched {len(common_oas)} OAs")
    
    gdf = gdf.loc[common_oas]
    df = df.loc[common_oas]
    
    # Add ratios as JSON string array
    def make_ratios(row):
        return json.dumps([int(row[col]) for col in data_cols])
    
    gdf = gdf.copy()
    gdf['ratios'] = df.apply(make_ratios, axis=1)
    gdf = gdf.reset_index()
    
    # Save as GeoJSON
    print(f"Saving GeoJSON: {output_file}")
    gdf.to_file(output_file, driver='GeoJSON')
    
    return gdf


def generate_vector_tiles(geojson_file, output_dir, layer_name='ratio'):
    """Generate vector tiles using tippecanoe."""
    print(f"Generating vector tiles in: {output_dir}")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Run tippecanoe
    cmd = f"""tippecanoe \
        -zg \
        --no-tile-compression \
        --simplification=10 \
        --simplify-only-low-zooms \
        --no-tile-size-limit \
        --force \
        --read-parallel \
        --output-to-directory="{output_dir}" \
        -l {layer_name} \
        "{geojson_file}"
    """
    
    print(f"Running: tippecanoe...")
    result = os.system(cmd)
    
    if result != 0:
        print("ERROR: tippecanoe failed. Make sure it's installed:")
        print("  macOS: brew install tippecanoe")
        print("  Ubuntu: apt-get install tippecanoe")
        return False
    
    print("Vector tiles generated successfully!")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_ratios.py <dataset_name>")
        print("Example: python generate_ratios.py TS021_ethnic_group_tb_6a_2021")
        print("\nAvailable datasets:")
        for f in DATA_DIR.glob("*.csv"):
            print(f"  {f.stem}")
        sys.exit(1)
    
    dataset_name = sys.argv[1]
    
    # 1. Download/load OA geometry
    gdf = download_oa_geometry()
    
    # 2. Load CSV data
    df, data_cols = load_csv_data(dataset_name)
    
    # 3. Create ratio GeoJSON
    geojson_file = PROCESSING_DIR / f"{dataset_name}_ratios.geojson"
    create_ratio_geojson(gdf, df, data_cols, geojson_file)
    
    # 4. Generate vector tiles
    tiles_dir = OUTPUT_DIR / dataset_name / "ratios"
    generate_vector_tiles(geojson_file, tiles_dir)
    
    print(f"\nDone! Tiles are in: {tiles_dir}")
    print(f"Don't forget to commit and push to GitHub Pages!")


if __name__ == '__main__':
    main()
