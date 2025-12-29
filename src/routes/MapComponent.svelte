<script>
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { onMount, onDestroy } from 'svelte';

  export let map;
  export let config = null;

  let mapContainer;

  onMount(async () => {
    // Load config
    if (!config) {
      const res = await fetch('/config.json');
      config = await res.json();
    }

    // Include webgl2 in maplibregl
    if (
      maplibregl.Map.prototype._setupPainter.toString().indexOf('webgl2') == -1
    ) {
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

    map = window.map = new maplibregl.Map({
      container: 'map',
      zoom: 9.5,
      pitch: 5,
      center: [-0.1360581413730415, 51.514891380499904],
      style: '/style-dark.json',
      antialias: true,
      fadeDuration: 0
    });

    map.doubleClickZoom.disable();

    map.on('load', function () {
      const tileHost = config.tileHost;
      const defaultTile = config.defaultTile;

      console.log('Loading tiles from:', `${tileHost}/${defaultTile}/{z}/{x}/{y}.pbf`);
      console.log('Source layer:', config.sourceLayer);

      // Polygons source
      map.addSource('ratio-src', {
        type: 'vector',
        maxzoom: 13,
        tiles: [
          `${tileHost}/${defaultTile}/ratios/{z}/{x}/{y}.pbf`
        ]
      });

      // Polygon layer
      map.addLayer({
        id: 'poly-layer',
        type: 'fill',
        source: 'ratio-src',
        'source-layer': config.ratioSourceLayer,
        maxzoom: 22,
        minzoom: 0,
        paint: {
          'fill-color': 'rgba(200, 100, 240, 0)',
          'fill-outline-color': 'rgba(200, 200, 240, 0.1)'
        }
      });

      // Dots source
      map.addSource('dot-src', {
        type: 'vector',
        maxzoom: 14,
        minzoom: 6,
        tiles: [
          `${tileHost}/${defaultTile}/{z}/{x}/{y}.pbf`
        ]
      });

      // Dots layer - removed filter to debug
      map.addLayer({
        id: 'dot-data',
        type: 'circle',
        source: 'dot-src',
        maxzoom: 22,
        minzoom: 4,
        'source-layer': config.sourceLayer,
        paint: {
          'circle-radius': 2,
          'circle-color': 'red',
          'circle-opacity': 1
        }
      });

      map.setZoom(10.3);

      // Debug: Check what's in the tiles after they load
      map.on('sourcedata', (e) => {
        if (e.sourceId === 'dot-src' && e.isSourceLoaded) {
          console.log('Dot source loaded');
          
          // Try to get vector tile features
          const features = map.querySourceFeatures('dot-src', {
            sourceLayer: config.sourceLayer
          });
          console.log('Features with sourceLayer "' + config.sourceLayer + '":', features.length);
          
          if (features.length === 0) {
            // Try to find what layers exist
            console.log('Trying to find available source layers...');
            // Query rendered features to see what's there
            const rendered = map.queryRenderedFeatures();
            console.log('All rendered features:', rendered.length);
            rendered.slice(0, 5).forEach(f => {
              console.log('Feature source:', f.source, 'sourceLayer:', f.sourceLayer);
            });
          } else {
            console.log('Sample feature:', features[0]);
          }
        }
      });
    });

    map.on('error', (e) => {
      console.error('MapLibre error:', e.error);
    });
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div id="map" bind:this={mapContainer}></div>

<style>
  #map {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
  }
</style>
