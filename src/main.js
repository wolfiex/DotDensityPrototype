import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { generateDotDensityPoints } from './dotDensity.js';
import { setupControls } from './controls.js';
import { createLegend } from './legend.js';
import { samplePolygonData } from './sampleData.js';

// Configuration
const CONFIG = {
  initialDotsPerUnit: 10,
  initialDotSize: 3,
  initialOpacity: 0.7,
  categories: [
    { id: 'category_a', label: 'Category A', color: '#e41a1c' },
    { id: 'category_b', label: 'Category B', color: '#377eb8' },
    { id: 'category_c', label: 'Category C', color: '#4daf4a' }
  ]
};

// State management to prevent unnecessary re-renders
let isUpdating = false;
let pendingUpdate = null;

// Initialize map
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  center: [-98.5795, 39.8283], // Center of US
  zoom: 4,
  maxZoom: 18,
  minZoom: 2
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Wait for map to load before adding layers
map.on('load', () => {
  console.log('Map loaded successfully');
  
  // Add polygon source for reference boundaries
  map.addSource('polygons', {
    type: 'geojson',
    data: samplePolygonData
  });

  // Add polygon outline layer
  map.addLayer({
    id: 'polygon-outline',
    type: 'line',
    source: 'polygons',
    paint: {
      'line-color': '#333',
      'line-width': 1,
      'line-opacity': 0.5
    }
  });

  // Generate initial dot density points
  const dotPoints = generateDotDensityPoints(
    samplePolygonData,
    CONFIG.categories,
    CONFIG.initialDotsPerUnit
  );

  // Add dots source
  map.addSource('dots', {
    type: 'geojson',
    data: dotPoints
  });

  // Add a layer for each category to allow individual styling
  CONFIG.categories.forEach((category, index) => {
    map.addLayer({
      id: `dots-${category.id}`,
      type: 'circle',
      source: 'dots',
      filter: ['==', ['get', 'category'], category.id],
      paint: {
        'circle-radius': CONFIG.initialDotSize,
        'circle-color': category.color,
        'circle-opacity': CONFIG.initialOpacity,
        'circle-stroke-width': 0
      }
    });

    // Add hover popup
    map.on('mouseenter', `dots-${category.id}`, (e) => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `dots-${category.id}`, () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', `dots-${category.id}`, (e) => {
      const feature = e.features[0];
      const props = feature.properties;
      
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <strong>${category.label}</strong><br>
          Region: ${props.regionName || 'Unknown'}<br>
          Value: ${props.value || 'N/A'}
        `)
        .addTo(map);
    });
  });

  // Create legend
  createLegend(CONFIG.categories);

  // Setup controls with debounced updates
  setupControls({
    onDensityChange: (value) => {
      debouncedUpdate(() => {
        const newDots = generateDotDensityPoints(
          samplePolygonData,
          CONFIG.categories,
          value
        );
        updateDotsSource(newDots);
      });
    },
    onDotSizeChange: (value) => {
      CONFIG.categories.forEach(category => {
        if (map.getLayer(`dots-${category.id}`)) {
          map.setPaintProperty(`dots-${category.id}`, 'circle-radius', value);
        }
      });
    },
    onOpacityChange: (value) => {
      CONFIG.categories.forEach(category => {
        if (map.getLayer(`dots-${category.id}`)) {
          map.setPaintProperty(`dots-${category.id}`, 'circle-opacity', value);
        }
      });
    }
  });
});

// Debounced update function to prevent render loops
function debouncedUpdate(callback) {
  if (pendingUpdate) {
    clearTimeout(pendingUpdate);
  }
  
  pendingUpdate = setTimeout(() => {
    if (!isUpdating) {
      isUpdating = true;
      try {
        callback();
      } finally {
        isUpdating = false;
      }
    }
    pendingUpdate = null;
  }, 100);
}

// Safe source update function
function updateDotsSource(newData) {
  const source = map.getSource('dots');
  if (source && !isUpdating) {
    source.setData(newData);
  }
}

// Error handling
map.on('error', (e) => {
  console.error('Map error:', e.error);
});

// Prevent memory leaks on page unload
window.addEventListener('beforeunload', () => {
  map.remove();
});

export { map, CONFIG };
