<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  const accent = '#27A0CC';

  const steps = [
    {
      id: 'data',
      eyebrow: 'Chapter I · Data',
      title: 'From Census to Counts',
      content: `The raw material is the 2021 Census, published by the Office for National Statistics. For the Ethnicity table (TS021 6a), counts are released at <em>Output Area</em> level — the finest census geography in England and Wales, typically 100–600 people. Each of England and Wales's 188,000 OAs carries a population count for five categories: Asian, Black, Mixed, White, and Other.`,
      rationale: `OA-level data gives maximum spatial resolution available from the census. Aggregating to LSOA or MSOA would conceal within-neighbourhood variation that dot density is specifically designed to reveal. The tradeoff is tile file size — the granularity is worth it.`,
    },
    {
      id: 'tiles',
      eyebrow: 'Chapter II · Tiles',
      title: 'Building the Vector Tile Pyramid',
      content: `OA boundaries are loaded from the ONS shapefile in British National Grid (EPSG:27700) and reprojected to WGS84 before geometry work — the coordinate system Tippecanoe expects. Points are rejection-sampled inside each OA polygon across 8 parallel cores (~23,000 OAs per chunk). Each point carries one property: <code>{"cat": 0–4}</code>.<br><br>Ratio polygons are written as <strong>GeoJSONSeq</strong> (<code>.ndjson</code>) — one feature per line, no wrapping FeatureCollection. Tippecanoe runs twice with <code>-Z8 -z14 -B13 --no-tile-compression --read-parallel</code>: once for the dots layer, once for the ratio polygons with <code>--simplification=10 --simplify-only-low-zooms</code>. Each dataset also emits a <code>config.json</code> with normalised category ratios.`,
      rationale: `GeoJSONSeq is streamable line-by-line — with --read-parallel this eliminates the memory spike from parsing a monolithic 200 MB FeatureCollection, and sidesteps the JSON truncation error seen with the standard GeoJSON driver on large ratio files. Explicit -z14 replaces -zg: -zg triggered a "two distinct locations" crash on dense urban tiles. -B13 pins the base zoom so all features are retained from z13 upward without dropping. Uncompressed tiles skip a decompression step in MapLibre's main thread; pre-computing dot positions removes the most expensive spatial sampling step from the browser entirely.`,
    },
    {
      id: 'ratios',
      eyebrow: 'Chapter III · Ratios',
      title: 'Normalised Relative Ratios',
      content: `Raw counts are converted to ratios anchored to the nationally largest group. White (81.7% nationally) is set to 100; all other groups scale proportionally — Asian ≈ 11, Black ≈ 5, Mixed ≈ 3, Other ≈ 3. These baselines live in <code>config.json</code> and drive the legend bars at load time.<br><br>When a user selects an OA, the OA's own ratio vector is pulled from the tile feature properties and normalised to its <em>local</em> maximum, enabling instant comparison against the national baseline.`,
      rationale: `Absolute counts would mislead: OA populations range from 100 to 600. Normalising to the local maximum preserves distributional shape while making large and small OAs equally legible. The national baseline gives users an anchor — a way to read "this area has three times the national share of a given group" at a glance.`,
    },
    {
      id: 'rendering',
      eyebrow: 'Chapter IV · Rendering',
      title: 'Screen-Relative Dot Size',
      content: `Each dot is a MapLibre GL <code>circle</code> layer. Rather than fixing the radius in absolute pixels — which collapses on Retina displays and overshoots on small viewports — the radius is computed as a fraction of the shorter viewport dimension:<br><br><code>radius = dscale × min(W, H) / 200</code><br><br>A slider controls <code>dscale</code> in the range 0.04–0.4. A <code>resize</code> listener recomputes on every window change, keeping dot density consistent across devices and orientations.`,
      rationale: `A dot density map reads differently at different scales. Decoupling radius from zoom and anchoring it to screen size means a user's chosen visual density persists through panning and zooming rather than being reset. The formula was tuned so the default (dscale = 0.16) produces just enough overlap to convey density without obscuring individual dots at zoom 10–12.`,
    },
    {
      id: 'interactions',
      eyebrow: 'Chapter V · Interaction',
      title: 'Three Ways to Explore',
      content: `Three distinct modes let users interrogate the data at different granularities.<br><br><strong>Click to inspect.</strong> Selecting any OA reads its ratio vector from the polygon tile feature properties, highlights the area in red, and updates the legend in place.<br><br><strong>Freedraw.</strong> Tracing a polygon on the map identifies all OAs whose centroids fall inside it via point-in-polygon ray-casting. Their ratios are summed and normalised to produce an aggregate profile of the drawn area.<br><br><strong>Page average.</strong> MapLibre's <code>queryRenderedFeatures</code> counts all visible dots by category integer in real time — reflecting the ethnic mix of whatever is currently on screen.`,
      rationale: `Single OA selection gives statistical precision. Freedraw lets users define meaningful custom geographies — a school catchment, a ward, a high street corridor — that rarely align with OA boundaries. Page average is the lowest-friction mode: no clicking required, just pan.`,
    },
    {
      id: 'product',
      eyebrow: 'Chapter VI · Product',
      title: 'England + Wales, 2021',
      content: `The finished map renders 56 million people across 188,000 output areas — one dot per 16 people at the default zoom. Five colours represent the five ethnicity categories. The national distribution is immediately legible at city scale: predominantly White across most of England and Wales, with Asian, Black, Mixed, and Other populations concentrated in London, Birmingham, Manchester, Bradford, and Leicester.<br><br>The legend updates live as the user clicks, draws, or pans. The data is fixed: a complete snapshot of England and Wales at census day, <strong>21 March 2021</strong>.`,
      rationale: `Dot density is the only technique that simultaneously shows <em>where</em> people live (spatial distribution) and <em>who</em> they are (category proportions) without the area-size bias of a choropleth. Every dot is a real person recorded by the census. The map makes visible patterns that aggregate statistics flatten.`,
      cta: { label: 'Explore the full map →', href: '/' },
    },
  ];

  let activeStepId = steps[0].id;
  let scrollProgress = 0;
  let sectionRefs = [];

  $: activeIndex = steps.findIndex(s => s.id === activeStepId);
  $: mapActive = activeStepId === 'product';

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.4) {
          activeStepId = e.target.dataset.stepId;
        }
      });
    }, { threshold: [0.4, 0.6], rootMargin: '-5% 0px -5% 0px' });

    sectionRefs.forEach(el => { if (el) observer.observe(el); });

    const onScroll = () => {
      const i = activeIndex >= 0 ? activeIndex : 0;
      const el = sectionRefs[i];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const raw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      scrollProgress = Math.max(0, Math.min(1, raw));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  });

  function scrollToStep(id) {
    const i = steps.findIndex(s => s.id === id);
    sectionRefs[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

<!-- ─── Root wrapper ─── -->
<div class="story-root" style="--accent:{accent}" class:wide-visual={activeStepId === 'data'}>

  <!-- ─── Fixed left: visual illustrations ─── -->
  <div class="visual-pane" class:map-active={mapActive}>

    <!-- Chapter I: London dot density image -->
    <div
      class="visual-slot map-slot"
      style="opacity:{activeStepId === 'data' ? 1 : 0}; pointer-events:{activeStepId === 'data' ? 'none' : 'none'};"
    >
      <img src="/londondot.png" alt="London dot density map" class="chapter-img" />
    </div>

    <!-- SVG illustrations (chapters II–V) -->
    {#each steps.filter(s => s.id !== 'data' && s.id !== 'product') as step (step.id)}
      {#if step.id === activeStepId}
        <div class="visual-slot" in:fade={{ duration: 350 }} out:fade={{ duration: 200 }}>

          <!-- Chapter II: Tile pyramid -->
          {#if step.id === 'tiles'}
            <svg viewBox="0 0 520 380" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="260" y="26" class="illus-title" text-anchor="middle">Vector Tile Pyramid</text>
              {#each [
                {z:8,  cols:2, size:88, y:44},
                {z:10, cols:4, size:52, y:168},
                {z:12, cols:7, size:34, y:268},
              ] as level}
                {#each Array(level.cols) as _,c}
                  {@const totalW = level.cols * level.size}
                  {@const tx = 260 - totalW/2 + c * level.size + 2}
                  {@const ty = level.y}
                  <rect x={tx} y={ty} width={level.size - 4} height={level.size - 4}
                    fill="rgba(255,255,255,0.04)" stroke="rgba(39,160,204,0.35)" stroke-width="1" rx="2"/>
                  {#each [0,1,2,3,4,5,6] as d}
                    <circle
                      cx={tx + 4 + Math.abs(Math.sin(c*7+d*31)*0.9) * (level.size-12)}
                      cy={ty + 4 + Math.abs(Math.sin(d*17+c*5)*0.9) * (level.size-12)}
                      r={Math.max(1.2, level.size/26)}
                      fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][d % 5]}
                      opacity="0.75"
                    />
                  {/each}
                {/each}
                <text x="18" y={level.y + level.size/2} class="td-code" dominant-baseline="middle">z={level.z}</text>
                <text x="502" y={level.y + level.size/2} class="illus-note" text-anchor="end" dominant-baseline="middle">{level.cols * level.cols} tiles</text>
              {/each}
              <text x="260" y="358" class="illus-note" text-anchor="middle">dots layer + ratios layer · served as .pbf · zoom 8–14</text>
            </svg>

          <!-- Chapter III: Ratio bar chart -->
          {:else if step.id === 'ratios'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="28" class="illus-title" text-anchor="middle">National vs Local Ratios</text>
              <rect x="320" y="44" width="10" height="10" fill="#27A0CC" rx="2"/>
              <text x="336" y="53" class="illus-note" text-anchor="start">National</text>
              <rect x="395" y="44" width="10" height="10" fill="#f97316" rx="2"/>
              <text x="411" y="53" class="illus-note" text-anchor="start">Local OA</text>
              {#each [
                {cat:'White',  nat:100, loc:42},
                {cat:'Asian',  nat:11,  loc:38},
                {cat:'Black',  nat:5,   loc:8},
                {cat:'Mixed',  nat:3,   loc:6},
                {cat:'Other',  nat:3,   loc:4},
              ] as row, i}
                {@const barW = 240}
                {@const y = 72 + i * 50}
                <text x="48" y={y+14} class="td" text-anchor="end">{row.cat}</text>
                <rect x="56" y={y} width={row.nat/100 * barW} height="10" fill="#27A0CC" rx="2" opacity="0.7"/>
                <rect x="56" y={y+14} width={row.loc/100 * barW} height="10" fill="#f97316" rx="2" opacity="0.7"/>
                <text x={56 + Math.max(row.nat, row.loc)/100 * barW + 6} y={y+10} class="illus-note">{row.nat}</text>
                <text x={56 + Math.max(row.nat, row.loc)/100 * barW + 6} y={y+24} class="illus-note">{row.loc}</text>
              {/each}
              <text x="250" y="320" class="illus-note" text-anchor="middle">scores anchored to national max (White = 100)</text>
            </svg>

          <!-- Chapter IV: Dot size -->
          {:else if step.id === 'rendering'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="28" class="illus-title" text-anchor="middle">Radius as Fraction of Viewport</text>
              <rect x="60" y="50" width="380" height="220" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" rx="4"/>
              <line x1="60" y1="282" x2="440" y2="282" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="250" y="297" class="illus-note" text-anchor="middle">W = viewport width</text>
              <line x1="452" y1="50" x2="452" y2="270" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="478" y="168" class="illus-note" text-anchor="middle" transform="rotate(-90 478 168)">H = height</text>
              {#each [
                {label:'dscale 0.04',r:3,  cx:140, cy:160, col:'rgba(39,160,204,0.6)'},
                {label:'dscale 0.16',r:8,  cx:250, cy:160, col:'rgba(39,160,204,0.8)'},
                {label:'dscale 0.40',r:18, cx:360, cy:160, col:'rgba(39,160,204,1)'},
              ] as ex}
                {#each [[-1.8,-1],[0.5,-1.5],[1.2,0.3],[-0.5,1.1],[0.9,1.4],[-1.5,0.6]] as [dx,dy]}
                  <circle cx={ex.cx + dx*ex.r*1.6} cy={ex.cy + dy*ex.r*1.2} r={ex.r} fill={ex.col}/>
                {/each}
                <text x={ex.cx} y={ex.cy + ex.r*2.2 + 14} class="illus-note" text-anchor="middle">{ex.label}</text>
              {/each}
              <text x="250" y="330" class="illus-note" text-anchor="middle">r = dscale × min(W, H) / 200</text>
            </svg>

          <!-- Chapter V: Interaction modes -->
          {:else if step.id === 'interactions'}
            <svg viewBox="0 0 500 400" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="24" class="illus-title" text-anchor="middle">Three Interaction Modes</text>
              {#each [
                {label:'Click to Inspect', x:18,  accent:'#ff6b6b'},
                {label:'Freedraw',         x:184, accent:'#f97316'},
                {label:'Page Average',     x:350, accent:'#27A0CC'},
              ] as mode, mi}
                <rect x={mode.x} y="36" width="132" height="290" fill="rgba(255,255,255,0.03)" stroke={mode.accent} stroke-opacity="0.3" stroke-width="1" rx="4"/>
                <text x={mode.x + 66} y="54" class="mode-label" text-anchor="middle" fill={mode.accent}>{mode.label}</text>
                {#each Array(18) as _, d}
                  {@const dx = (d % 4) * 26 + mode.x + 14}
                  {@const dy = Math.floor(d / 4) * 26 + 68}
                  <circle cx={dx} cy={dy} r="6"
                    fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][d % 5]}
                    opacity={mi === 0 && d === 6 ? 1 : mi === 0 ? 0.3 : 0.55}
                  />
                {/each}
                {#if mi === 0}
                  <rect x={mode.x+14+(6%4)*26-8} y="62" width="28" height="28" fill="none" stroke="#ff6b6b" stroke-width="1.5" rx="2"/>
                {:else if mi === 1}
                  <polygon points="{mode.x+18},{90} {mode.x+112},{78} {mode.x+118},{175} {mode.x+28},{182}"
                    fill="rgba(249,115,22,0.12)" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
                {:else}
                  {#each [0,1,2,3] as l}
                    <line x1={mode.x+8} y1={85+l*30} x2={mode.x+124} y2={85+l*30}
                      stroke="#27A0CC" stroke-width="0.8" stroke-opacity="0.3" stroke-dasharray="2,4"/>
                  {/each}
                {/if}
                {#each [100, 38, 16, 8, 5] as pct, bi}
                  <rect x={mode.x+10} y={225 + bi*11} width={pct * 1.0} height="6"
                    fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][bi]} rx="1" opacity="0.75"/>
                {/each}
              {/each}
              <text x="250" y="348" class="illus-note" text-anchor="middle">legend updates in real time for all three modes</text>
            </svg>
          {/if}

        </div>
      {/if}
    {/each}

    <!-- Chapter VI: iframe lives outside the transition system so pointer events are never blocked -->
    <div
      class="visual-slot map-slot"
      style="opacity:{mapActive ? 1 : 0}; pointer-events:{mapActive ? 'auto' : 'none'};"
    >
      <iframe
        src="/"
        title="Census Dot Density Map"
        class="map-embed"
      />
    </div>

  </div>

  <!-- ─── Hero ─── -->
  <header class="hero">
    <div class="caption-col">
      <div class="caption-inner">
        <a href="/" class="back">← Back to map</a>
        <p class="super">Census 2021 · TS021 · England + Wales</p>
        <h1>Building the<br><span style="font-weight:300">Dot Density Map</span></h1>
        <p class="sub">From raw census counts to interactive vector tiles. Six chapters on the decisions behind the data, the geometry, and the interface.</p>
        <div class="hint">Scroll to explore ↓</div>
      </div>
    </div>
  </header>

  <!-- ─── Scrolling steps ─── -->
  {#each steps as step, i (step.id)}
    <section
      class="step"
      class:active={step.id === activeStepId}
      data-step-id={step.id}
      bind:this={sectionRefs[i]}
    >
      <div class="caption-col">
        <div class="caption-inner">
          <span class="eyebrow">{step.eyebrow}</span>
          <h2>{step.title}</h2>
          <p>{@html step.content}</p>
          {#if step.rationale}
            <aside class="rationale">
              <span class="rationale-label">Rationale</span>
              <p class="rationale-text">{@html step.rationale}</p>
            </aside>
          {/if}
          {#if step.cta}
            <a href={step.cta.href} class="step-cta">{step.cta.label}</a>
          {/if}
        </div>
      </div>
    </section>
  {/each}

  <!-- ─── Nav dots ─── -->
  <nav class="nav-dots" aria-label="Chapter navigation">
    {#each steps as step}
      <button
        class:active={step.id === activeStepId}
        on:click={() => scrollToStep(step.id)}
        title={step.title}
        aria-label={step.title}
      >
        <span class="dot" />
        {#if step.id === activeStepId}
          <span class="dot-label">{step.title}</span>
        {/if}
      </button>
    {/each}
  </nav>

  <!-- ─── Progress bar ─── -->
  <div class="progress-track">
    <div
      class="progress-fill"
      style="height:{((Math.max(0, activeIndex) + scrollProgress) / steps.length) * 100}%"
    />
  </div>

</div>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Montserrat:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<style>
  /* ── Global reset for this route ── */
  :global(body) {
    margin: 0; padding: 0;
    background: #1a1a2e;
    color: rgba(255,255,255,0.82);
    font-family: 'Montserrat', 'Segoe UI', sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(a) { color: inherit; text-decoration: none; }
  :global(h1,h2,h3) { font-family: 'Montserrat', sans-serif; font-weight: 900; line-height: 1.1; }

  /* ── Root ── */
  .story-root { position: relative; }

  /* ── Fixed left visual pane — default 1/3 ── */
  .visual-pane {
    position: fixed;
    top: 0; left: 0;
    width: 50%; height: 100vh;
    z-index: 1;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.15);
    transition: width 0.6s ease;
  }
  /* Chapter I: 2/3 image */
  .wide-visual .visual-pane { width: 66.67%; }
  .visual-slot {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  /* ── SVG illustrations ── */
  .illus {
    width: 100%;
    max-width: 520px;
    height: auto;
    font-family: 'Montserrat', sans-serif;
    overflow: visible;
  }

  /* ── Live map iframe ── */
  .chapter-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .map-slot {
    transition: opacity 0.4s ease;
  }

  .map-embed {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    pointer-events: auto;
  }

  /* Enable interaction when iframe is showing */
  .visual-pane.map-active {
    pointer-events: auto;
  }
  :global(.illus-title) {
    font-size: 13px; font-weight: 700; fill: rgba(255,255,255,0.7); letter-spacing: 0.04em;
  }
  :global(.illus-note) {
    font-size: 9.5px; fill: rgba(255,255,255,0.38); letter-spacing: 0.03em;
  }
  :global(.th) {
    font-size: 9px; font-weight: 700; fill: rgba(39,160,204,0.9); text-transform: uppercase; letter-spacing: 0.1em;
  }
  :global(.td) {
    font-size: 10px; fill: rgba(255,255,255,0.6);
  }
  :global(.td-code) {
    font-size: 9.5px; fill: rgba(255,255,255,0.38); font-family: ui-monospace, 'SFMono-Regular', monospace;
  }
  :global(.mode-label) {
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  }

  /* ── Hero ── */
  .hero {
    min-height: 90vh;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;
    pointer-events: none;
  }

  /* ── Steps ── */
  .step {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;
    opacity: 0.22;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }
  .step.active { opacity: 1; }

  /* ── Caption column — default 2/3 text ── */
  .caption-col {
    width: 50%;
    margin-left: 50%;
    padding: 3rem 3.5rem 3rem 2.5rem;
    position: relative;
    z-index: 10;
    transition: width 0.6s ease, margin-left 0.6s ease;
    pointer-events: auto;
  }
  /* Chapter I: 1/3 text */
  .wide-visual .caption-col { width: 33.33%; margin-left: 66.67%; }
  .caption-inner { max-width: 560px; }
  .wide-visual .caption-inner { max-width: 280px; }

  /* ── Text styles ── */
  .back {
    display: block;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.28);
    margin-bottom: 2rem;
    transition: color 0.2s;
  }
  .back:hover { color: var(--accent); }

  .super {
    display: block;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.3);
    margin-bottom: 0.8rem;
    font-weight: 500;
  }
  h1 {
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 0 0 1rem;
    color: #fff;
  }
  .sub {
    font-size: 0.78rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.42);
    margin: 0 0 1.5rem;
  }
  .hint {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.2);
    margin-top: 1rem;
  }
  .eyebrow {
    display: block;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--accent);
    margin-bottom: 0.6rem;
    font-weight: 700;
  }
  h2 {
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0 0 0.85rem;
    color: #fff;
  }
  p {
    font-size: 0.8rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.6);
    margin: 0 0 1rem;
  }
  :global(p code) {
    font-family: ui-monospace, 'SFMono-Regular', monospace;
    font-size: 0.75em;
    color: var(--accent);
    background: rgba(39,160,204,0.1);
    padding: 0.1em 0.35em;
    border-radius: 3px;
  }

  /* ── Rationale aside ── */
  .rationale {
    margin-top: 1.2rem;
    border-left: 2px solid rgba(39,160,204,0.35);
    padding: 0.6rem 0 0.6rem 1rem;
  }
  .rationale-label {
    display: block;
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 0.4rem;
  }
  .rationale-text {
    font-size: 0.73rem;
    line-height: 1.7;
    color: rgba(255,255,255,0.4);
    margin: 0;
    font-family: 'Merriweather', Georgia, serif;
    font-weight: 300;
  }

  .step-cta {
    display: inline-block;
    margin-top: 1.4rem;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid rgba(39,160,204,0.35);
    padding-bottom: 2px;
    transition: border-color 0.2s, color 0.2s;
  }
  .step-cta:hover { border-color: var(--accent); }

  /* ── Nav dots ── */
  .nav-dots {
    position: fixed;
    right: 1.4rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    z-index: 200;
  }
  .nav-dots button {
    position: relative;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: block;
    transition: background 0.3s, transform 0.3s;
  }
  .nav-dots button:hover .dot,
  .nav-dots button.active .dot {
    background: var(--accent);
    transform: scale(1.5);
  }
  .dot-label {
    position: absolute;
    right: calc(100% + 0.7rem);
    white-space: nowrap;
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.5);
  }

  /* ── Progress bar ── */
  .progress-track {
    position: fixed;
    right: 0; top: 0; bottom: 0;
    width: 2px;
    background: rgba(255,255,255,0.05);
    z-index: 199;
  }
  .progress-fill {
    width: 100%;
    background: var(--accent);
    transition: height 0.15s ease-out;
  }

  /* ── Mobile ── */
  @media (max-width: 800px) {
    .visual-pane { display: none; }
    .caption-col { width: 100%; padding: 2rem 1.5rem; }
    .nav-dots { display: none; }
    .progress-track { display: none; }
  }
</style>
