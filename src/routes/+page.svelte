<script>
  import { onMount } from 'svelte';
  import MapComponent from './MapComponent.svelte';
  import Categories from './Categories.svelte';
  import AtomicLoader from '$lib/components/AtomicLoader.svelte';
  import { Dropdown, Search } from 'carbon-components-svelte';
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
  let dscale = 0.1;
  let isUpdating = false;

  // Panel visibility
  let showMenu = true;
  let showLegend = true;

  // Derived from config
  let datasets = [];

  // Initialize dataset
  function initDataset(tileId) {
    if (!config?.datasets?.[tileId]) return;
    const dataset = config.datasets[tileId];
    keys = [...dataset.keys];
    bcsum = [...dataset.ratios];
    csum = [...dataset.ratios];
    colour = colourbase.slice(0, keys.length);
  }

  // Change tile dataset
  async function changetile(tileId) {
    if (!map || isUpdating || !config || !tileId) return;
    
    const dotSource = map.getSource('dot-src');
    const ratioSource = map.getSource('ratio-src');
    if (!dotSource) return;
    
    const dataset = config.datasets[tileId];
    if (!dataset) return;

    isUpdating = true;
    
    try {
      const { tileHost } = config;
      
      dotSource.setTiles([`${tileHost}/${tileId}/{z}/{x}/{y}.pbf`]);
      ratioSource?.setTiles([`${tileHost}/${tileId}/ratios/{z}/{x}/{y}.pbf`]);

      map.removeLayer('dot-data');
      map.removeLayer('poly-layer');
      
      map.addLayer({
        id: 'dot-data',
        type: 'circle',
        source: 'dot-src',
        maxzoom: 22,
        minzoom: 4,
        'source-layer': dataset.dotLayer,
        paint: {
          'circle-radius': dscale * Math.floor(map.getZoom()) ** 0.7,
          'circle-color': 'white',
          'circle-opacity': 0.83
        },
        filter: ['==', '$type', 'Point']
      });

      map.addLayer({
        id: 'poly-layer',
        type: 'fill',
        source: 'ratio-src',
        'source-layer': dataset.ratioLayer,
        maxzoom: 22,
        minzoom: 0,
        paint: {
          'fill-color': 'rgba(0, 0, 0, 0)',
          'fill-outline-color': 'rgba(200, 200, 240, 0.1)'
        }
      });

      initDataset(tileId);
      keytitle = 'England + Wales';
      keycentre = false;

      setTimeout(() => {
        updatePaint();
        isUpdating = false;
      }, 50);
    } catch (err) {
      console.error('Error changing tile:', err);
      isUpdating = false;
    }
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
          zoom: 14
        });
      } else {
        alert('Postcode not found');
      }
    } catch {
      alert('Error searching postcode');
    }
  }

  // Handle point size change
  function handlePointSizeChange() {
    if (map?.getLayer('dot-data')) {
      map.setPaintProperty('dot-data', 'circle-radius', dscale * Math.floor(map.getZoom()) ** 0.7);
    }
  }

  // Handle legend title click
  function handleLegendClick() {
    if (keycentre) {
      map.flyTo({ center: keycentre, zoom: 14 });
    }
  }

  onMount(async () => {
    const res = await fetch('/config.json');
    config = await res.json();

    datasets = Object.entries(config.datasets).map(([id, data]) => ({
      id,
      text: data.name
    }));
    
    tile = Object.keys(config.datasets)[0];

    colour = [...colourbase];
    legend = document.querySelector('.legend');

    initDataset(tile);

    const checkMap = setInterval(() => {
      if (map?.loaded()) {
        clearInterval(checkMap);
        
        updatePaint();

        const peopleEl = document.getElementById('people');
        map.on('zoomend', () => {
          const z = Math.floor(map.getZoom());
          if (peopleEl) peopleEl.innerText = Math.ceil(2 ** (14 - z));
          if (map.getLayer('dot-data')) {
            map.setPaintProperty('dot-data', 'circle-radius', dscale * z ** 0.7);
          }
          if (usePageAverage) legend?.classList.add('loading');
        });

        map.on('moveend', () => {
          if (usePageAverage) legend?.classList.add('loading');
        });

        // Double-click to select output area
        map.on('dblclick', 'poly-layer', (e) => {
          console.log('Double-click detected!', e.features);
          if (!e.features?.length) {
            console.log('No features at click location');
            return;
          }
          
          const props = e.features[0].properties;
          console.log('Feature props:', props);
          keycentre = e.lngLat.toArray();
          
          if (map.getZoom() < 12) map.setZoom(12);

          try {
            const ratios = JSON.parse(props.ratios);
            const mx = Math.max(...ratios);
            csum = ratios.map((d) => (100 * d) / mx);
            const total = ratios.reduce((a, b) => a + b, 0);
            keytitle = `Output Area: ${props.OA21CD} (${total.toLocaleString()} people)`;

            map.setPaintProperty('poly-layer', 'fill-outline-color', [
              'match', ['get', 'OA21CD'],
              props.OA21CD, 'red',
              'rgba(200, 200, 240, 0.1)'
            ]);
          } catch (err) {
            console.error('Error parsing ratios:', err);
          }
        });

        // Also listen for general double-clicks to debug
        map.on('dblclick', (e) => {
          console.log('General dblclick at:', e.lngLat);
          const features = map.queryRenderedFeatures(e.point, { layers: ['poly-layer'] });
          console.log('Features at point:', features.length);
        });

        map.on('idle', calculateScreenRatios);
      }
    }, 100);

    return () => clearInterval(checkMap);
  });

  function handleTileChange(e) {
    const newTile = e.detail.selectedId;
    if (newTile && newTile !== tile) {
      tile = newTile;
      changetile(tile);
    }
  }

  $: if (map?.getLayer('dot-data') && colour) updatePaint();
  
  $: if (usePageAverage && legend) {
    legend.classList.add('loading');
    calculateScreenRatios();
  } else if (!usePageAverage && legend && config?.datasets?.[tile]) {
    const dataset = config.datasets[tile];
    csum = [...dataset.ratios];
    keytitle = 'England + Wales';
    legend.classList.remove('loading');
  }
</script>

<AtomicLoader backgroundColor="#1a1a2e" />

<MapComponent bind:map {config} />

<!-- Top Left: Controls -->
<div class="menu" class:hidden={!showMenu}>
  <button class="close-btn" on:click={() => showMenu = false}>×</button>
  
  <a href="https://datalegrey.sa" target="_blank" class="logo-link">
    <svg class="logo" viewBox="0 0 100 100" width="32" height="32">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316" />
          <stop offset="100%" style="stop-color:#ea580c" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="12" fill="#0c0c0c"/>
      <text x="50" y="62" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="url(#logoGrad)" text-anchor="middle">D</text>
    </svg>
    <span>Census Dots</span>
  </a>
  
  <div class="control-group">
    <Dropdown items={datasets} selectedId={tile} on:select={handleTileChange} size="sm" />
  </div>

  <div class="control-group">
    <Search size="sm" on:change={handlePostcodeSearch} placeholder="Search postcode..." />
  </div>

  <p class="info-text">
    <strong>1 dot</strong> = <span id="people">16</span> people
  </p>

  <p class="hint-text">💡 Double-click an area to see its breakdown</p>
</div>

<!-- Top Right: Settings -->
<div class="settings">
  <div class="setting-row">
    <span class="setting-label">Point size</span>
    <input 
      type="range" 
      min="0.04" 
      max="0.2" 
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
</div>

<!-- Bottom Right: Legend -->
<div class="legend" class:hidden={!showLegend}>
  <button class="close-btn" on:click={() => showLegend = false}>×</button>

  <button
    type="button"
    class="legend-title-btn"
    on:click={handleLegendClick}
    title={keycentre ? 'Click to fly to this area' : ''}
  >
    {keytitle}
  </button>

  <Categories {keys} bind:colour {colourbase} {csum} {bcsum} />
  
  <p class="legend-hint">Click category to toggle</p>
</div>

<!-- Show buttons when panels are hidden -->
{#if !showMenu}
  <button class="show-btn top-left" on:click={() => showMenu = true}>☰</button>
{/if}
{#if !showLegend}
  <button class="show-btn bottom-right" on:click={() => showLegend = true}>◧</button>
{/if}

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

  .show-btn.top-left {
    top: 10px;
    left: 10px;
  }

  .show-btn.bottom-right {
    bottom: 10px;
    right: 10px;
  }

  /* Top Left Menu */
  .menu {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: rgba(30, 30, 30, 0.92);
    backdrop-filter: blur(10px);
    padding: 14px 16px;
    border-radius: 10px;
    color: white;
    min-width: 200px;
  }

  .logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: white;
    margin-bottom: 14px;
  }

  .logo-link:hover {
    opacity: 0.85;
  }

  .logo-link span {
    font-size: 1rem;
    font-weight: 500;
  }

  .logo {
    border-radius: 6px;
  }

  .control-group {
    margin-bottom: 10px;
  }

  .info-text {
    font-size: 0.8rem;
    color: #999;
    margin: 6px 0 0 0;
  }

  .hint-text {
    font-size: 0.7rem;
    color: #666;
    margin: 4px 0 0 0;
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
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .setting-label {
    font-size: 0.75rem;
    color: #aaa;
  }

  .settings input[type="range"] {
    width: 80px;
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
    min-width: 260px;
    max-width: 300px;
  }

  .legend-title-btn {
    display: block;
    width: 100%;
    text-align: left;
    font-size: 0.85rem;
    font-weight: 500;
    background: none;
    border: none;
    color: white;
    padding: 2px 0 8px 0;
    cursor: pointer;
  }

  .legend-title-btn:hover {
    color: #f97316;
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

  /* Carbon overrides */
  :global(.menu .bx--dropdown) {
    background: rgba(50, 50, 50, 0.8) !important;
  }

  :global(.menu .bx--search-input) {
    background: rgba(50, 50, 50, 0.8) !important;
  }
</style>
