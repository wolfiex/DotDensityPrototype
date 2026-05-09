<script>
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { onMount, onDestroy } from 'svelte';

  export let map;
  export let config;

  // Parse hash to get zoom/lat/lng
  function parseHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return null;
    const parts = hash.split('/');
    if (parts.length >= 3) {
      const zoom = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const lng = parseFloat(parts[2]);
      if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
        return { zoom, lat, lng };
      }
    }
    return null;
  }

  // Update hash from map state
  function updateHash() {
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom().toFixed(2);
    const lat = center.lat.toFixed(5);
    const lng = center.lng.toFixed(5);
    const newHash = `#${zoom}/${lat}/${lng}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  }

  onMount(() => {
    // WebGL2 support
    if (maplibregl.Map.prototype._setupPainter.toString().indexOf('webgl2') === -1) {
      const _setupPainter_old = maplibregl.Map.prototype._setupPainter;
      maplibregl.Map.prototype._setupPainter = function () {
        const getContext_old = this._canvas.getContext;
        this._canvas.getContext = function (name, attrib) {
          return (
            getContext_old.apply(this, ['webgl2', attrib]) ||
            getContext_old.apply(this, ['webgl', attrib]) ||
            getContext_old.apply(this, ['experimental-webgl', attrib])
          );
        };
        _setupPainter_old.apply(this);
        this._canvas.getContext = getContext_old;
      };
    }

    // Get initial position from hash or default to London
    const hashPos = parseHash();
    const initialZoom = hashPos?.zoom ?? 10.3;
    const initialCenter = hashPos ? [hashPos.lng, hashPos.lat] : [-0.1276, 51.5074];

    map = window.map = new maplibregl.Map({
      container: 'map',
      zoom: initialZoom,
      pitch: 5,
      center: initialCenter,
      style: '/style-dark.json',
      antialias: true,
      fadeDuration: 0,
      minZoom: 8.3,
      maxZoom: 13.9
    });

    // Update hash on map move
    map.on('moveend', updateHash);
    map.on('zoomend', updateHash);

    // Set initial hash if not present
    if (!window.location.hash) {
      updateHash();
    }

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', () => {
      const pos = parseHash();
      if (pos) {
        map.jumpTo({
          center: [pos.lng, pos.lat],
          zoom: pos.zoom
        });
      }
    });

    map.doubleClickZoom.disable();

    map.on('load', function () {
      if (!config) {
        console.error('Config not loaded!');
        return;
      }
      
      const datasets = config.datasets;
      const defaultTileId = Object.keys(datasets)[0];
      const dataset = datasets[defaultTileId];

      // Use tileDir from config, must include -main suffix
      const tileDir = dataset.tileDir;

      // Tiles are hosted on GitHub Pages
      const tileBase = `https://danellisresearch.github.io/${tileDir}`;
      const dotTileUrl = `${tileBase}/{z}/{x}/{y}.pbf`;
      const ratioTileUrl = `${tileBase}/ratios/{z}/{x}/{y}.pbf`;

      // Dots source - tiles exist from zoom 8-13
      map.addSource('dot-src', {
        type: 'vector',
        maxzoom: 13,
        minzoom: 8,
        tiles: [dotTileUrl]
      });

      // Ratio/polygon source - tiles exist from zoom 0-13
      map.addSource('ratio-src', {
        type: 'vector',
        maxzoom: 13,
        minzoom: 0,
        tiles: [ratioTileUrl]
      });

      // Dots layer
      map.addLayer({
        id: 'dot-data',
        type: 'circle',
        source: 'dot-src',
        maxzoom: 22,
        minzoom: 8,
        'source-layer': dataset.dotLayer,
        paint: {
          'circle-radius': 0.5,
          'circle-color': 'white',
          'circle-opacity': 0.83
        }
      });

      // Polygon layer for click interaction
      map.addLayer({
        id: 'poly-layer',
        type: 'fill',
        source: 'ratio-src',
        'source-layer': dataset.ratioLayer,
        maxzoom: 22,
        minzoom: 0,
        paint: {
          'fill-color': 'rgba(0, 0, 0, 0)',
          'fill-outline-color': 'rgba(255, 255, 255, 0.08)'
        }
      });
    });

    map.on('error', (e) => console.error('MapLibre error:', e.error));
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div id="map"></div>

<style>
  #map {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
  }
</style>
