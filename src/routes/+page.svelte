<script>
  import { onMount } from 'svelte';
  import MapComponent from './MapComponent.svelte';
  import Categories from './Categories.svelte';

  import('carbon-components-svelte/css/g100.css');
  import { Dropdown, Search, Slider } from 'carbon-components-svelte';

  let colourbase = ['ffbe0b', 'fb5607', 'ff006e', '8338ec', '3a86ff'].map(
    (d) => '#' + d
  );
  let map;
  let colour;
  let csum = [100, 100, 100, 100, 100, 100];
  let legend;
  let debounce = new Date();
  let update = false;
  let keytitle = 'England + Wales ';
  let keycentre = false;
  let type, keys, tile, bcsum;
  let dscale = 0.1;
  let isUpdating = false;
  let config = null;

  tile = 'TS021_ethnic_group_tb_6a_2021';
  colour = [...colourbase];

  const names = [
    { id: 'TS021_ethnic_group_tb_6a_2021', text: 'Ethnicity' },
    { id: 'TS045_number_of_cars_5a_2021', text: 'Number of Cars' },
    { id: 'TS002_legal_partnership_status_3a_2021', text: 'Legal Partnership' },
    { id: 'TS059_hours_per_week_worked_3a_2021', text: 'Work Hours Per Week' }
  ];

  async function changetile(type) {
    if (!map || isUpdating || !config) return 0;
    
    const source = map.getSource('dot-src');
    if (!source) return 0;
    
    isUpdating = true;
    
    try {
      console.log('changetile', type);

      const tileHost = config.tileHost;
      source.setTiles([`${tileHost}/${type}/{z}/{x}/{y}.pbf`]);
      
      const ratioSource = map.getSource('ratio-src');
      if (ratioSource) {
        ratioSource.setTiles([`${tileHost}/${type}/ratios/{z}/{x}/{y}.pbf`]);
      }

      switch (type) {
        case 'TS021_ethnic_group_tb_6a_2021':
          keys = [
            'Asian, Asian British or Asian Welsh',
            'Black, Black British, Black Welsh, Caribbean or African',
            'Mixed or Multiple ethnic groups',
            'White',
            'Other ethnic group'
          ];
          csum = [11.04, 4.797, 3.48, 100.0, 2.51];
          bcsum = [11.04, 4.797, 3.48, 100.0, 2.51];
          break;

        case 'TS045_number_of_cars_5a_2021':
          keys = [
            'No cars or vans in household',
            '1 car or van in household',
            '2 cars or vans in household',
            '3 or more cars or vans in household'
          ];
          csum = [55.7, 100.0, 63.9, 22.6];
          bcsum = [55.7, 100.0, 63.9, 22.6];
          break;

        case 'TS059_hours_per_week_worked_3a_2021':
          keys = [
            'Part-time: 30 hours or less worked',
            'Full-time: 31 or more hours worked'
          ];
          csum = [42.53, 100.0];
          bcsum = [42.53, 100.0];
          break;

        case 'TS005_passports_all_4a_2021':
          keys = ['UK passport', 'Non-UK passport', 'No passport held'];
          csum = [100.0, 12.73, 17.53];
          bcsum = [100.0, 12.73, 17.53];
          break;

        case 'TS002_legal_partnership_status_3a_2021':
          keys = [
            'Married or in a registered civil partnership',
            'Other marital or civil partnership status'
          ];
          csum = [81.2, 100.0];
          bcsum = [81.2, 100.0];
          break;

        default:
          keys = [
            'Asian, Asian British or Asian Welsh',
            'Black, Black British, Black Welsh, Caribbean or African',
            'Mixed or Multiple ethnic groups',
            'White',
            'Other ethnic group'
          ];
          csum = [11.04, 4.797, 3.48, 100.0, 2.51];
          bcsum = [11.04, 4.797, 3.48, 100.0, 2.51];
          break;
      }

      setTimeout(() => {
        newpaint(colour);
        isUpdating = false;
      }, 50);
    } catch (err) {
      console.error('Error changing tile:', err);
      isUpdating = false;
    }
  }

  function screen() {
    if (!update || isUpdating) return;
    
    const now = new Date();
    if (now - debounce < 2000) return;
    
    debounce = now;
    
    try {
      const c = new Array(keys?.length || 5).fill(0);
      const features = map.queryRenderedFeatures({ layers: ['dot-data'] });
      features.forEach((d) => {
        if (d.properties.cat !== undefined) {
          c[d.properties.cat] = (c[d.properties.cat] || 0) + 1;
        }
      });
      const mx = Math.max(...c);
      if (mx > 0) {
        csum = c.map((d) => (100 * d) / mx);
      }
      legend?.classList.remove('loading');
    } catch (err) {
      console.warn('Screen update error:', err);
    }
  }

  onMount(async () => {
    // Load config
    const res = await fetch('/config.json');
    config = await res.json();

    document.body.style.opacity = 1;

    colour = [...colourbase];
    legend = document.querySelector('.legend');

    const checkMap = setInterval(() => {
      if (map && map.loaded()) {
        clearInterval(checkMap);
        
        changetile(tile).then(() => newpaint());

        map.on('moveend', () => {
          if (update) legend?.classList.add('loading');
        });

        const people = document.getElementById('people');

        map.on('zoomend', () => {
          let z = Math.floor(map.getZoom());
          if (people) {
            people.innerText = Math.ceil(2 ** (14 - z));
          }

          if (map.getLayer('dot-data')) {
            map.setPaintProperty('dot-data', 'circle-radius', dscale * z ** 0.7);
          }

          if (update) legend?.classList.add('loading');
        });

        map.on('dblclick', 'poly-layer', function (e) {
          keycentre = e.lngLat.toArray();
          if (map.getZoom() < 12) map.setZoom(12);

          const props = e.features[0].properties;
          const c = JSON.parse(props.ratios);
          const mx = Math.max(...c);
          csum = c.map((d) => (100 * d) / mx);
          const npeople = c.reduce((a, b) => a + b, 0);
          keytitle = 'Output Area: ' + props.OA21CD + '  (' + npeople + ' people)';

          map.setPaintProperty('poly-layer', 'fill-outline-color', [
            'match',
            ['get', 'OA21CD'],
            props.OA21CD,
            'red',
            'rgba(200, 200, 240, 0.1)'
          ]);
        });

        document
          .getElementById('legendtitle')
          ?.addEventListener('click', () => map.flyTo({ center: keycentre, zoom: 14 }));

        map.on('idle', screen);
      }
    }, 100);

    return () => clearInterval(checkMap);
  });

  function newpaint() {
    if (!map || !map.getLayer('dot-data')) return;
    
    map.setPaintProperty('dot-data', 'circle-color', [
      'match',
      ['get', 'cat'],
      0,
      colour[0],
      1,
      colour[1],
      2,
      colour[2],
      3,
      colour[3],
      4,
      colour[4],
      '#ccc'
    ]);
  }

  $: if (map && map.loaded() && config) {
    changetile(tile);
  }

  $: try {
    if (map && map.getLayer('dot-data')) {
      newpaint(colour);
    }
  } catch (err) {}

  async function handlePostcodeSearch(evt) {
    const psc = await fetch(
      `https://api.postcodes.io/postcodes/${evt.target.value.toUpperCase()}`
    )
      .then((d) => d.json())
      .then((d) => d.result);

    if (!psc) {
      alert('Incorrect Postcode');
      return;
    }

    map.flyTo({
      center: [psc.longitude, psc.latitude],
      zoom: 14
    });
  }

  function handleSliderChange() {
    if (map && map.getLayer('dot-data')) {
      map.setPaintProperty(
        'dot-data',
        'circle-radius',
        dscale * Math.floor(map.getZoom()) ** 0.7
      );
    }
  }

  function handleLegendClick() {
    if (keycentre) {
      map.flyTo({ center: keycentre, zoom: 14 });
    }
  }
</script>

<MapComponent bind:map {config} />

<div class="menu">
  <h1>Census Dot Density Map</h1>
  <br />
  <span class="label-text">Select Table</span>
  <br />

  <Dropdown items={names} bind:selectedId={tile} />

  <br />
  <span class="label-text">Find Postcode</span>
  <br />
  <Search size="sm" on:change={handlePostcodeSearch} />

  <p class="info-text">
    1 dot = <span id="people"></span> people
  </p>
</div>

<div id="instruct">
  <a
    href="https://scribehow.com/shared/Prototype_Dot_Density_Map__yreqzD5ISB6EQr2IU9FWbg"
  >
    Usage Instructions.
  </a>
  <Slider
    ariaLabelInput="Point size slider"
    id="slider"
    labelText=""
    max={0.2}
    min={0.04}
    step={0.01}
    maxLabel="Point Size"
    minLabel=" "
    bind:value={dscale}
    on:change={handleSliderChange}
    hideTextInput
    light={false}
  />
</div>

<!-- LEGEND BARS -->
<div class="legend">
  <button
    type="button"
    id="legendtitle"
    class="legend-title-btn"
    on:click={handleLegendClick}
  >
    {!update ? keytitle : 'Page Average'}
  </button>
  <br /><br />
  <Categories {keys} bind:colour {colourbase} {csum} {bcsum} />
</div>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100&display=swap"
  rel="stylesheet"
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'IBM Plex Sans', sans-serif;
    overflow: hidden;
    opacity: 0;
    -moz-transition: opacity 3.5s;
    -webkit-transition: opacity 3.5s;
    -o-transition: opacity 3.5s;
    transition: opacity 3.5s;
  }

  .label-text {
    display: block;
    height: 0.35em;
    font-size: inherit;
  }

  .info-text {
    display: block;
    padding-top: 2px;
    padding-bottom: 1em;
    margin: 0;
  }

  h1 {
    font-size: large;
  }

  :global(#map) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
  }

  .legend {
    z-index: 99999999;
    position: absolute;
    display: block;
    backdrop-filter: blur(3px) saturate(0.1);
    padding: 5px;
    background-color: #444;
    opacity: 80%;
    border-radius: 3%;
    margin: auto;
    bottom: 4px;
    align-content: center;
    right: 4px;
  }

  #instruct {
    z-index: 99999999;
    position: absolute;
    display: block;
    font-size: 110%;
    backdrop-filter: blur(3px);
    border-radius: 3%;
    padding: 5px;
    bottom: 4px;
    align-content: center;
    left: 4px;
  }

  .menu {
    z-index: 99999999;
    position: absolute;
    display: block;
    backdrop-filter: blur(3px) saturate(0.1);
    padding: 5px;
    background-color: #444;
    opacity: 80%;
    border-radius: 3%;
    margin: auto;
    top: 4px;
    align-content: center;
    left: 4px;
  }

  .legend-title-btn {
    float: right;
    margin: auto;
    font-size: medium;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
  }

  .legend-title-btn:hover {
    color: dodgerblue;
  }
</style>
