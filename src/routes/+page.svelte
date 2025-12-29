<script>
  import { onMount } from 'svelte';
  import MapComponent from './MapComponent.svelte';
  import Categories from './Categories.svelte';
  import AtomicLoader from '$lib/components/AtomicLoader.svelte';
  import { Dropdown, Search, Slider, Toggle } from 'carbon-components-svelte';
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
  let showInstruct = true;
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
      
      // Local tiles - no ?raw=true needed
      dotSource.setTiles([`${tileHost}/${tileId}/{z}/{x}/{y}.pbf`]);
      ratioSource?.setTiles([`${tileHost}/${tileId}/ratios/{z}/{x}/{y}.pbf`]);

      map.removeLayer('dot-data');
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

      map.removeLayer('poly-layer');
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

        map.on('dblclick', 'poly-layer', (e) => {
          if (!e.features?.length) return;
          const props = e.features[0].properties;
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
          } catch {}
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

<!-- Controls Panel -->
<div class="menu" class:hidden={!showMenu}>
  <button class="close-btn" on:click={() => showMenu = false}>×</button>
  <h1>Census Dot Density Map</h1>
  
  <div class="control-group">
    <span class="label-text">Select Table</span>
    <Dropdown items={datasets} selectedId={tile} on:select={handleTileChange} />
  </div>

  <div class="control-group">
    <span class="label-text">Find Postcode</span>
    <Search size="sm" on:change={handlePostcodeSearch} placeholder="e.g. SW1A 1AA" />
  </div>

  <p class="info-text">
    <strong>1 dot</strong> = <span id="people">16</span> people
  </p>

  <p class="hint-text">
    💡 Double-click an area to see its breakdown
  </p>
</div>

<!-- Instructions & Point Size -->
<div id="instruct" class:hidden={!showInstruct}>
  <button class="close-btn" on:click={() => showInstruct = false}>×</button>
  <a href="https://scribehow.com/shared/Prototype_Dot_Density_Map__yreqzD5ISB6EQr2IU9FWbg" target="_blank">
    📖 Usage Instructions
  </a>
  
  <div class="slider-group">
    <Slider
      labelText="Point Size"
      min={0.04}
      max={0.2}
      step={0.01}
      bind:value={dscale}
      on:change={handlePointSizeChange}
      hideTextInput
    />
  </div>
</div>

<!-- Legend -->
<div class="legend" class:hidden={!showLegend}>
  <button class="close-btn" on:click={() => showLegend = false}>×</button>
  <div class="legend-header">
    <Toggle
      size="sm"
      labelText="Use page average"
      bind:toggled={usePageAverage}
    />
  </div>

  <button
    type="button"
    class="legend-title-btn"
    on:click={handleLegendClick}
    title={keycentre ? 'Click to fly to this area' : ''}
  >
    {keytitle}
  </button>

  <Categories {keys} bind:colour {colourbase} {csum} {bcsum} />
  
  <p class="legend-hint">Click a category to hide/show it</p>
</div>

<!-- Show buttons when panels are hidden -->
{#if !showMenu}
  <button class="show-btn top-left" on:click={() => showMenu = true}>☰</button>
{/if}
{#if !showInstruct}
  <button class="show-btn bottom-left" on:click={() => showInstruct = true}>⚙</button>
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

  h1 {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0 0 0.75rem 0;
  }

  .hidden {
    display: none !important;
  }

  .close-btn {
    position: absolute;
    top: 4px;
    right: 8px;
    background: none;
    border: none;
    color: #888;
    font-size: 1.2rem;
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
    background: rgba(40, 40, 40, 0.95);
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
  }

  .show-btn:hover {
    background: rgba(60, 60, 60, 0.95);
  }

  .show-btn.top-left {
    top: 10px;
    left: 10px;
  }

  .show-btn.bottom-left {
    bottom: 10px;
    left: 10px;
  }

  .show-btn.bottom-right {
    bottom: 10px;
    right: 10px;
  }

  .menu {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: rgba(40, 40, 40, 0.95);
    backdrop-filter: blur(8px);
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    min-width: 220px;
  }

  .control-group {
    margin-bottom: 12px;
  }

  .label-text {
    display: block;
    font-size: 0.75rem;
    color: #aaa;
    margin-bottom: 4px;
  }

  .info-text {
    font-size: 0.85rem;
    margin: 8px 0 4px 0;
  }

  .hint-text {
    font-size: 0.7rem;
    color: #888;
    margin: 0;
  }

  #instruct {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1000;
    background: rgba(40, 40, 40, 0.95);
    backdrop-filter: blur(8px);
    padding: 10px 14px;
    border-radius: 8px;
    color: white;
    font-size: 0.85rem;
  }

  #instruct a {
    color: #7eb8ff;
    text-decoration: none;
  }

  #instruct a:hover {
    text-decoration: underline;
  }

  .slider-group {
    margin-top: 10px;
  }

  .legend {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(40, 40, 40, 0.95);
    backdrop-filter: blur(8px);
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    min-width: 280px;
  }

  .legend-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .legend-title-btn {
    display: block;
    width: 100%;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 500;
    background: none;
    border: none;
    color: white;
    padding: 4px 0;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .legend-title-btn:hover {
    color: #7eb8ff;
  }

  .legend-hint {
    font-size: 0.65rem;
    color: #666;
    text-align: center;
    margin: 8px 0 0 0;
  }

  :global(.legend.loading .bx--progress-bar__bar) {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
