<script>
  import { onMount } from 'svelte';
  import MapComponent from './MapComponent.svelte';
  import Categories from './Categories.svelte';
  import AtomicLoader from '$lib/components/AtomicLoader.svelte';
  import { Search } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/g100.css';

  // Color palette
  const colourbase = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];
  
  // State
  let map;
  let config = null;
  let colour = [...colourbase];
  let csum = [100, 100, 100, 100, 100];
  let bcsum = [100, 100, 100, 100, 100];
  let keys = [];
  let legend;
  let debounce = new Date();
  let usePageAverage = false;
  let keytitle = 'England + Wales';
  let keycentre = false;
  let tile = '';
  let dscale = 0.16;
  let isUpdating = false;
  let selectedOA = null;
  let selectedTotal = null;

  // Freedraw state
  let isDrawing = false;
  let drawPoints = [];
  let selectedOAs = [];

  // Handle keyboard events
  function handleKeydown(e) {
    if (e.key === 'Enter' && isDrawing) {
      finishDrawing();
    } else if (e.key === 'Escape' && isDrawing) {
      cancelDrawing();
    }
  }

  // Panel visibility
  let showLegend = true;

  // Initialize dataset
  function initDataset(tileId) {
    if (!config?.datasets?.[tileId]) return;
    const dataset = config.datasets[tileId];
    keys = [...dataset.keys];
    bcsum = [...dataset.ratios];
    csum = [...dataset.ratios];
    colour = colourbase.slice(0, keys.length);
  }

  // Calculate on-screen ratios
  function calculateScreenRatios() {
    if (!usePageAverage || isUpdating || !map) return;
    
    const now = new Date();
    if (now - debounce < 2000) return;
    debounce = now;
    
    try {
      const c = new Array(keys.length).fill(0);
      const features = map.queryRenderedFeatures({ layers: ['dot-data'] });
      features.forEach((f) => {
        if (f.properties.cat !== undefined) {
          c[f.properties.cat] = (c[f.properties.cat] || 0) + 1;
        }
      });
      const mx = Math.max(...c);
      if (mx > 0) {
        csum = c.map((d) => (100 * d) / mx);
      }
      legend?.classList.remove('loading');
    } catch (err) {
      console.warn('Screen calculation error:', err);
    }
  }

  // Update dot colors
  function updatePaint() {
    if (!map?.getLayer('dot-data')) return;
    
    const matchExpr = ['match', ['get', 'cat']];
    for (let i = 0; i < keys.length; i++) {
      matchExpr.push(i);
      matchExpr.push(colour[i] || '#ccc');
    }
    matchExpr.push('#ccc');
    
    map.setPaintProperty('dot-data', 'circle-color', matchExpr);
  }

  // Handle postcode search
  async function handlePostcodeSearch(evt) {
    const postcode = evt.target.value.toUpperCase().trim();
    if (postcode.length < 5) return;
    
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
      const data = await res.json();
      
      if (data.result) {
        map.flyTo({
          center: [data.result.longitude, data.result.latitude],
          zoom: 13
        });
      } else {
        alert('Postcode not found');
      }
    } catch {
      alert('Error searching postcode');
    }
  }

  // Compute dot radius as a ratio of the canvas size.
  // dscale (slider) is treated as a percentage-like factor:
  // radius = dscale * min(canvas.width, canvas.height) / 200
  function computeDotRadius() {
    if (!map) return 0.5;
    const canvas = map.getCanvas();
    const baseDim = Math.min(canvas.clientWidth, canvas.clientHeight) || 1000;
    return (dscale * baseDim) / 200;
  }

  function applyDotSize() {
    if (map?.getLayer('dot-data')) {
      map.setPaintProperty('dot-data', 'circle-radius', computeDotRadius());
    }
  }

  function handlePointSizeChange() {
    applyDotSize();
  }

  // Clear area selection and reset to national average
  function clearSelection() {
    if (!config?.datasets?.[tile]) return;
    const dataset = config.datasets[tile];
    csum = [...dataset.ratios];
    keytitle = 'England + Wales';
    keycentre = false;
    selectedOA = null;
    selectedTotal = null;
    selectedOAs = [];
    
    // Reset polygon styling
    if (map?.getLayer('poly-layer')) {
      map.setPaintProperty('poly-layer', 'fill-outline-color', 'rgba(255, 255, 255, 0.08)');
      map.setPaintProperty('poly-layer', 'fill-color', 'rgba(0, 0, 0, 0)');
    }
    
    // Remove draw layer if exists
    if (map?.getSource('draw-polygon')) {
      if (map.getLayer('draw-polygon-fill')) map.removeLayer('draw-polygon-fill');
      if (map.getLayer('draw-polygon-line')) map.removeLayer('draw-polygon-line');
      map.removeSource('draw-polygon');
    }
  }

  // Handle legend title click - fly to selected area
  function handleLegendClick() {
    if (keycentre) {
      map.flyTo({ center: keycentre, zoom: 13 });
    }
  }

  // Select an output area and display its stats
  function selectArea(props, lngLat) {
    if (isDrawing) return; // Don't select while drawing

    keycentre = lngLat.toArray();
    selectedOA = props.OA21CD;
    selectedOAs = [props.OA21CD];

    try {
      // Parse ratios
      let ratios = props.ratios;
      if (typeof ratios === 'string') {
        ratios = JSON.parse(ratios);
      }
      
      if (!Array.isArray(ratios) || ratios.length === 0) {
        console.error('Invalid ratios:', props.ratios);
        return;
      }

      // Calculate totals and percentages
      const total = ratios.reduce((a, b) => a + b, 0);
      const mx = Math.max(...ratios);
      
      selectedTotal = total;
      csum = ratios.map((d) => (100 * d) / mx);
      keytitle = props.OA21CD;

      // Highlight selected area
      map.setPaintProperty('poly-layer', 'fill-outline-color', [
        'match', ['get', 'OA21CD'],
        props.OA21CD, '#ff6b6b',
        'rgba(255, 255, 255, 0.08)'
      ]);
      map.setPaintProperty('poly-layer', 'fill-color', [
        'match', ['get', 'OA21CD'],
        props.OA21CD, 'rgba(255, 107, 107, 0.2)',
        'rgba(0, 0, 0, 0)'
      ]);
    } catch (err) {
      console.error('Error parsing ratios:', err);
    }
  }

  // ==================== FREEDRAW FUNCTIONS ====================

  // Start drawing mode
  function startDrawing() {
    isDrawing = true;
    drawPoints = [];
    clearSelection();
    map.getCanvas().style.cursor = 'crosshair';
    
    // Disable map interactions
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
  }

  // Cancel drawing
  function cancelDrawing() {
    isDrawing = false;
    drawPoints = [];
    map.getCanvas().style.cursor = '';
    
    // Re-enable map interactions
    map.dragPan.enable();
    map.scrollZoom.enable();
    
    // Remove draw layer
    if (map.getSource('draw-polygon')) {
      if (map.getLayer('draw-polygon-fill')) map.removeLayer('draw-polygon-fill');
      if (map.getLayer('draw-polygon-line')) map.removeLayer('draw-polygon-line');
      map.removeSource('draw-polygon');
    }
  }

  // Finish drawing and select OAs
  function finishDrawing() {
    if (drawPoints.length < 3) {
      cancelDrawing();
      return;
    }
    
    isDrawing = false;
    map.getCanvas().style.cursor = '';
    
    // Re-enable map interactions
    map.dragPan.enable();
    map.scrollZoom.enable();
    
    // Create polygon from points
    const polygon = [...drawPoints, drawPoints[0]]; // Close the polygon
    
    // Find all OAs that intersect with the polygon
    selectOAsInPolygon(polygon);
  }

  // Check if point is inside polygon (ray casting)
  function pointInPolygon(point, polygon) {
    const x = point[0], y = point[1];
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  // Select all OAs within the drawn polygon
  function selectOAsInPolygon(polygon) {
    // Query all visible poly-layer features
    const features = map.queryRenderedFeatures({ layers: ['poly-layer'] });
    
    // Find unique OAs whose centroids are inside the polygon
    const oaSet = new Set();
    const oaRatios = {};
    
    features.forEach(f => {
      const oa = f.properties.OA21CD;
      if (oaSet.has(oa)) return;
      
      // Get centroid of the feature
      let centroid;
      if (f.geometry.type === 'Polygon') {
        // Approximate centroid from first ring
        const coords = f.geometry.coordinates[0];
        const sumX = coords.reduce((a, c) => a + c[0], 0);
        const sumY = coords.reduce((a, c) => a + c[1], 0);
        centroid = [sumX / coords.length, sumY / coords.length];
      } else if (f.geometry.type === 'MultiPolygon') {
        const coords = f.geometry.coordinates[0][0];
        const sumX = coords.reduce((a, c) => a + c[0], 0);
        const sumY = coords.reduce((a, c) => a + c[1], 0);
        centroid = [sumX / coords.length, sumY / coords.length];
      }
      
      if (centroid && pointInPolygon(centroid, polygon)) {
        oaSet.add(oa);
        try {
          let ratios = f.properties.ratios;
          if (typeof ratios === 'string') ratios = JSON.parse(ratios);
          if (Array.isArray(ratios)) {
            oaRatios[oa] = ratios;
          }
        } catch (e) {}
      }
    });
    
    selectedOAs = Array.from(oaSet);

    if (selectedOAs.length === 0) {
      cancelDrawing();
      return;
    }
    
    // Calculate average ratios
    const numCategories = keys.length;
    const sumRatios = new Array(numCategories).fill(0);
    let totalPeople = 0;
    
    Object.values(oaRatios).forEach(ratios => {
      ratios.forEach((v, i) => {
        if (i < numCategories) sumRatios[i] += v;
      });
      totalPeople += ratios.reduce((a, b) => a + b, 0);
    });
    
    // Normalize for display
    const mx = Math.max(...sumRatios);
    if (mx > 0) {
      csum = sumRatios.map(d => (100 * d) / mx);
    }
    
    selectedTotal = totalPeople;
    selectedOA = 'custom';
    keytitle = 'Custom Area';
    keycentre = polygon[0]; // Use first point as center
    
    // Remove draw polygon layer
    if (map.getSource('draw-polygon')) {
      if (map.getLayer('draw-polygon-fill')) map.removeLayer('draw-polygon-fill');
      if (map.getLayer('draw-polygon-line')) map.removeLayer('draw-polygon-line');
      map.removeSource('draw-polygon');
    }
    
    // Highlight selected OAs with orange style (matching draw polygon)
    if (selectedOAs.length > 0) {
      map.setPaintProperty('poly-layer', 'fill-outline-color', [
        'match', ['get', 'OA21CD'],
        ...selectedOAs.flatMap(oa => [oa, '#f97316']),
        'rgba(255, 255, 255, 0.08)'
      ]);
      map.setPaintProperty('poly-layer', 'fill-color', [
        'match', ['get', 'OA21CD'],
        ...selectedOAs.flatMap(oa => [oa, 'rgba(249, 115, 22, 0.2)']),
        'rgba(0, 0, 0, 0)'
      ]);
    }
  }

  // Update the draw polygon on the map
  function updateDrawPolygon() {
    if (drawPoints.length < 2) return;
    
    const coordinates = drawPoints.length >= 3 
      ? [[...drawPoints, drawPoints[0]]]
      : [drawPoints];
    
    const geojson = {
      type: 'Feature',
      geometry: {
        type: drawPoints.length >= 3 ? 'Polygon' : 'LineString',
        coordinates: drawPoints.length >= 3 ? coordinates : drawPoints
      }
    };
    
    if (map.getSource('draw-polygon')) {
      map.getSource('draw-polygon').setData(geojson);
    } else {
      map.addSource('draw-polygon', {
        type: 'geojson',
        data: geojson
      });
      
      map.addLayer({
        id: 'draw-polygon-fill',
        type: 'fill',
        source: 'draw-polygon',
        paint: {
          'fill-color': 'rgba(249, 115, 22, 0.2)',
          'fill-outline-color': '#f97316'
        }
      });
      
      map.addLayer({
        id: 'draw-polygon-line',
        type: 'line',
        source: 'draw-polygon',
        paint: {
          'line-color': '#f97316',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    }
  }

  // Handle mouse events for drawing
  function setupDrawHandlers() {
    map.on('mousedown', (e) => {
      if (!isDrawing) return;
      drawPoints.push([e.lngLat.lng, e.lngLat.lat]);
      updateDrawPolygon();
    });
    
    map.on('mousemove', (e) => {
      if (!isDrawing || drawPoints.length === 0) return;
      // Show preview line to cursor
      const previewPoints = [...drawPoints, [e.lngLat.lng, e.lngLat.lat]];
      
      const geojson = {
        type: 'Feature',
        geometry: {
          type: previewPoints.length >= 3 ? 'Polygon' : 'LineString',
          coordinates: previewPoints.length >= 3 
            ? [[...previewPoints, previewPoints[0]]]
            : previewPoints
        }
      };
      
      if (map.getSource('draw-polygon')) {
        map.getSource('draw-polygon').setData(geojson);
      }
    });
  }

  onMount(async () => {
    const res = await fetch('/config.json');
    config = await res.json();

    // Single dataset: ethnicity
    tile = 'TS021_ethnic_group_tb_6a_2021';

    colour = [...colourbase];
    legend = document.querySelector('.legend');

    initDataset(tile);

    // Re-apply dot size on window resize so it stays a ratio of screen
    const onResize = () => applyDotSize();
    window.addEventListener('resize', onResize);

    const checkMap = setInterval(() => {
      if (map?.loaded()) {
        clearInterval(checkMap);
        
        updatePaint();
        applyDotSize();
        setupDrawHandlers();

        const peopleEl = document.getElementById('people');
        map.on('zoomend', () => {
          const z = Math.floor(map.getZoom());
          if (peopleEl) peopleEl.innerText = Math.ceil(2 ** (14 - z));
          applyDotSize();
          if (usePageAverage) legend?.classList.add('loading');
        });

        map.on('moveend', () => {
          if (usePageAverage) legend?.classList.add('loading');
        });

        // Click handler - query features at click point
        map.on('click', (e) => {
          if (isDrawing) return;
          
          const features = map.queryRenderedFeatures(e.point, { layers: ['poly-layer'] });

          if (features.length > 0) {
            selectArea(features[0].properties, e.lngLat);
          }
        });

        // Hover effects
        map.on('mousemove', (e) => {
          if (isDrawing) return;
          const features = map.queryRenderedFeatures(e.point, { layers: ['poly-layer'] });
          map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
        });

        map.on('idle', calculateScreenRatios);
      }
    }, 100);

    return () => {
      clearInterval(checkMap);
      window.removeEventListener('resize', onResize);
    };
  });

  $: if (map?.getLayer('dot-data') && colour) updatePaint();
  
  $: if (usePageAverage && legend) {
    legend.classList.add('loading');
    calculateScreenRatios();
  } else if (!usePageAverage && legend && config?.datasets?.[tile] && !selectedOA) {
    const dataset = config.datasets[tile];
    csum = [...dataset.ratios];
    keytitle = 'England + Wales';
    legend.classList.remove('loading');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<AtomicLoader backgroundColor="#1a1a2e" />

<MapComponent bind:map {config} />

<!-- Top Left: Title with source -->
<div class="dataset-title">
  <h1 class="dataset-name">Ethnicity TS021 6a</h1>
  <a
    class="dataset-source"
    href="https://danellisresearch.github.io/TS021_ethnic_group_tb_6a_2021/"
    target="_blank"
    rel="noopener"
  >
    danellisresearch.github.io/TS021_ethnic_group_tb_6a_2021
  </a>
</div>

<!-- Top Right: Settings -->
<div class="settings">
  <div class="setting-row">
    <span class="setting-label">Point size</span>
    <input
      type="range"
      min="0.04"
      max="0.4"
      step="0.01"
      bind:value={dscale}
      on:input={handlePointSizeChange}
    />
  </div>
  <div class="setting-row">
    <span class="setting-label">Page average</span>
    <label class="toggle">
      <input type="checkbox" bind:checked={usePageAverage} />
      <span class="toggle-slider"></span>
    </label>
  </div>

  <div class="setting-block">
    <Search size="sm" on:change={handlePostcodeSearch} placeholder="Search postcode..." />
  </div>

  <p class="info-text">
    <strong>1 dot</strong> = <span id="people">16</span> people
  </p>

  <!-- Freedraw -->
  <p class="draw-hint">Click an area to see its stats, or use the button below to draw an area.</p>
  <div class="draw-buttons">
    {#if !isDrawing}
      <button class="draw-btn" on:click={startDrawing}>
        Custom Selection
      </button>
    {:else}
      <button class="draw-btn finish" on:click={finishDrawing}>
        Finish
      </button>
      <button class="draw-btn cancel" on:click={cancelDrawing}>
        Cancel
      </button>
    {/if}
  </div>
</div>

<!-- Bottom Right: Legend -->
<div class="legend" class:hidden={!showLegend}>
  <button class="close-btn" on:click={() => showLegend = false}>×</button>

  <div class="legend-header">
    <button
      type="button"
      class="legend-title-btn"
      on:click={handleLegendClick}
      title={keycentre ? 'Click to fly to this area' : ''}
    >
      {keytitle}
    </button>
    {#if selectedOA}
      <button class="clear-btn" on:click={clearSelection} title="Clear selection">×</button>
    {/if}
  </div>
  
  {#if selectedTotal}
    <p class="area-total">
      {selectedTotal.toLocaleString()} people
      {#if selectedOAs.length > 1}
        <span class="oa-count">({selectedOAs.length} areas)</span>
      {/if}
    </p>
  {/if}

  <Categories {keys} bind:colour {colourbase} {csum} {bcsum} />
  
  <p class="legend-hint">Click category to toggle</p>
</div>

<!-- Show buttons when panels are hidden -->
{#if !showLegend}
  <button class="show-btn bottom-right" on:click={() => showLegend = true}>◧</button>
{/if}

<!-- Bottom Left: info tooltip -->
<div class="info-tip" role="img" aria-label="Click an area to see its breakdown">
  <span class="info-icon">i</span>
  <span class="info-tooltip">Click an area to see its breakdown</span>
</div>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
</svelte:head>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'IBM Plex Sans', sans-serif;
    overflow: hidden;
  }

  :global(#map) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
  }

  .hidden {
    display: none !important;
  }

  .close-btn {
    position: absolute;
    top: 6px;
    right: 10px;
    background: none;
    border: none;
    color: #666;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-btn:hover {
    color: white;
  }

  .show-btn {
    position: absolute;
    z-index: 1000;
    background: rgba(30, 30, 30, 0.9);
    border: none;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
  }

  .show-btn:hover {
    background: rgba(50, 50, 50, 0.95);
  }

  .show-btn.bottom-right {
    bottom: 10px;
    right: 10px;
  }

  /* Top Left: floating dataset title panel */
  .dataset-title {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: rgba(30, 30, 30, 0.92);
    backdrop-filter: blur(10px);
    padding: 10px 14px;
    border-radius: 10px;
    color: white;
    max-width: 320px;
  }

  .dataset-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: white;
  }

  .dataset-source {
    display: block;
    margin-top: 3px;
    font-size: 0.65rem;
    color: #888;
    text-decoration: none;
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dataset-source:hover {
    color: #ccc;
    text-decoration: underline;
  }

  .info-text {
    font-size: 0.75rem;
    color: #aaa;
    margin: 0;
  }

  .setting-block {
    margin-top: 2px;
  }

  /* Top Right Settings */
  .settings {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(30, 30, 30, 0.92);
    backdrop-filter: blur(10px);
    padding: 10px 14px;
    border-radius: 10px;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 220px;
    box-sizing: border-box;
  }

  .setting-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: center;
    gap: 12px;
  }

  .setting-label {
    font-size: 0.75rem;
    color: #aaa;
  }

  .settings input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #444;
    border-radius: 2px;
    cursor: pointer;
  }

  .settings input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #f97316;
    border-radius: 50%;
    cursor: pointer;
  }

  /* Custom Toggle */
  .toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    justify-self: end;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #444;
    transition: 0.2s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }

  .toggle input:checked + .toggle-slider {
    background-color: #f97316;
  }

  .toggle input:checked + .toggle-slider:before {
    transform: translateX(16px);
  }

  /* Draw buttons */
  .draw-buttons {
    display: flex;
    gap: 6px;
  }

  .draw-btn {
    flex: 1;
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    font-size: 0.75rem;
    cursor: pointer;
    background: rgba(249, 115, 22, 0.2);
    color: #f97316;
    border: 1px solid rgba(249, 115, 22, 0.4);
    transition: all 0.2s;
  }

  .draw-btn:hover {
    background: rgba(249, 115, 22, 0.35);
  }

  .draw-btn.finish {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.4);
  }

  .draw-btn.finish:hover {
    background: rgba(34, 197, 94, 0.35);
  }

  .draw-btn.cancel {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.4);
  }

  .draw-btn.cancel:hover {
    background: rgba(239, 68, 68, 0.35);
  }

  /* Bottom Right Legend */
  .legend {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(30, 30, 30, 0.92);
    backdrop-filter: blur(10px);
    padding: 12px 14px;
    border-radius: 10px;
    color: white;
    min-width: 520px;
    max-width: 600px;
  }

  .legend-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 2px;
  }

  .legend-title-btn {
    flex: 1;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 600;
    background: none;
    border: none;
    color: white;
    padding: 0;
    cursor: pointer;
  }

  .legend-title-btn:hover {
    color: #f97316;
  }

  .area-total {
    font-size: 0.75rem;
    color: #aaa;
    margin: 0 0 8px 0;
  }

  .oa-count {
    color: #666;
  }

  .clear-btn {
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid rgba(255, 107, 107, 0.4);
    color: #ff6b6b;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    line-height: 1;
  }

  .clear-btn:hover {
    background: rgba(255, 107, 107, 0.35);
  }

  .legend-hint {
    font-size: 0.6rem;
    color: #555;
    text-align: center;
    margin: 10px 0 0 0;
  }

  :global(.legend.loading .bx--progress-bar__bar) {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Bottom Left: info circle tooltip */
  .info-tip {
    position: absolute;
    bottom: 14px;
    left: 14px;
    z-index: 1000;
  }

  .info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.92);
    color: #ccc;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: help;
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
    transition: color 0.15s, border-color 0.15s;
  }

  .info-tip:hover .info-icon {
    color: white;
    border-color: rgba(255, 255, 255, 0.4);
  }

  .info-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    background: rgba(30, 30, 30, 0.95);
    color: white;
    padding: 7px 11px;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .info-tip:hover .info-tooltip {
    opacity: 1;
  }

  /* Carbon overrides */
  :global(.settings .bx--search) {
    min-width: 0 !important;
    width: 100% !important;
  }

  :global(.settings .bx--search-input) {
    background: rgba(50, 50, 50, 0.8) !important;
    min-width: 0 !important;
    width: 100% !important;
  }

  .draw-hint {
    font-size: 0.7rem;
    color: #888;
    margin: 0;
    line-height: 1.4;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
