<script>
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { onMount, onDestroy } from 'svelte';

  export let map;
  export let config;

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

    map = window.map = new maplibregl.Map({
      container: 'map',
      zoom: 8.5,
      pitch: 5,
      center: [-0.1360581413730415, 51.514891380499904],
      style: '/style-dark.json',
      antialias: true,
      fadeDuration: 0
    });

    map.doubleClickZoom.disable();

    map.on('load', function () {
      if (!config) return;
      
      const { tileHost, ratioHost, datasets } = config;
      const defaultTile = Object.keys(datasets)[0];
      const dataset = datasets[defaultTile];

      // Ratio/polygon source - from ONS Visual
      map.addSource('ratio-src', {
        type: 'vector',
        maxzoom: 13,
        tiles: [`${ratioHost}/${defaultTile}/ratios/{z}/{x}/{y}.pbf?raw=true`]
      });

      // Polygon layer
      map.addLayer({
        id: 'poly-layer',
        type: 'fill',
        source: 'ratio-src',
        'source-layer': dataset.ratioLayer,
        maxzoom: 22,
        minzoom: 0,
        paint: {
          'fill-color': 'rgba(200, 100, 240, 0)',
          'fill-outline-color': 'rgba(200, 200, 240, 0.1)'
        }
      });

      // Dots source - from wolfiex
      map.addSource('dot-src', {
        type: 'vector',
        maxzoom: 14,
        minzoom: 6,
        tiles: [`${tileHost}/${defaultTile}/{z}/{x}/{y}.pbf?raw=true`]
      });

      // Dots layer
      map.addLayer({
        id: 'dot-data',
        type: 'circle',
        source: 'dot-src',
        maxzoom: 22,
        minzoom: 4,
        'source-layer': dataset.dotLayer,
        paint: {
          'circle-radius': 0.5,
          'circle-color': 'white',
          'circle-opacity': 0.83
        },
        filter: ['==', '$type', 'Point']
      });

      map.setZoom(10.3);
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
