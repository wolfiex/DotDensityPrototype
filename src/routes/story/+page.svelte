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
    },
  ];

  let activeStepId = steps[0].id;
  let scrollProgress = 0;
  let sectionRefs = [];

  $: activeIndex = steps.findIndex(s => s.id === activeStepId);

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
<div class="story-root" style="--accent:{accent}">

  <!-- ─── Fixed right: visual illustrations ─── -->
  <div class="visual-pane">
    {#each steps as step (step.id)}
      {#if step.id === activeStepId}
        <div class="visual-slot" in:fade={{ duration: 350 }} out:fade={{ duration: 200 }}>

          <!-- Chapter I: Census OA table -->
          {#if step.id === 'data'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="30" class="illus-title" text-anchor="middle">Output Area — TS021 6a Counts</text>
              <!-- header row -->
              <rect x="40" y="48" width="420" height="28" fill="rgba(39,160,204,0.15)" rx="3"/>
              {#each ['OA Code','Asian','Black','Mixed','White','Other'] as h, hi}
                <text x={hi === 0 ? 55 : 130 + hi * 62} y="67" class="th">{h}</text>
              {/each}
              <!-- data rows -->
              {#each [
                ['E00000001','14','6','4','312','3'],
                ['E00000002','8','42','7','189','5'],
                ['E00000003','221','18','12','64','9'],
                ['E00000004','3','2','1','408','2'],
                ['E00000005','74','61','22','198','11'],
              ] as row, ri}
                <rect x="40" y={80 + ri*34} width="420" height="28" fill={ri%2===0 ? 'rgba(255,255,255,0.03)' : 'transparent'} rx="2"/>
                {#each row as cell, ci}
                  <text x={ci === 0 ? 55 : 130 + ci * 62} y={98 + ri*34}
                    class={ci === 0 ? 'td-code' : 'td'}
                    fill={ci > 0 && parseInt(cell) > 100 ? '#27A0CC' : 'rgba(255,255,255,0.7)'}
                  >{cell}</text>
                {/each}
              {/each}
              <text x="250" y="300" class="illus-note" text-anchor="middle">188,000 Output Areas · five categories each</text>
            </svg>

          <!-- Chapter II: Tile pyramid -->
          {:else if step.id === 'tiles'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="28" class="illus-title" text-anchor="middle">Vector Tile Pyramid</text>
              <!-- zoom levels -->
              {#each [{z:8,cols:2,size:80,y:50},{z:10,cols:4,size:48,y:160},{z:12,cols:6,size:32,y:248}] as level}
                {#each Array(level.cols) as _,c}
                  {#each Array(Math.min(level.cols,3)) as _,r}
                    {@const tx = 250 - (level.cols/2)*level.size + c*level.size + level.size*0.05}
                    {@const ty = level.y + r*(level.size+2)}
                    <rect x={tx} y={ty} width={level.size*0.9} height={level.size*0.9}
                      fill="rgba(255,255,255,0.04)" stroke="rgba(39,160,204,0.35)" stroke-width="1" rx="2"/>
                    <!-- scatter dots inside tile -->
                    {#each [0,1,2,3,4,5] as d}
                      <circle
                        cx={tx + (level.size*0.1) + Math.abs(Math.sin(c*7+r*13+d*31)*0.8) * level.size * 0.75}
                        cy={ty + (level.size*0.1) + Math.abs(Math.sin(d*17+c*5+r*11)*0.9) * level.size * 0.75}
                        r={level.size/24}
                        fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][d % 5]}
                        opacity="0.8"
                      />
                    {/each}
                  {/each}
                {/each}
                <text x="32" y={level.y + level.size * 0.55} class="td-code">z={level.z}</text>
              {/each}
              <text x="250" y="316" class="illus-note" text-anchor="middle">dots layer + ratios layer · served as .pbf</text>
            </svg>

          <!-- Chapter III: Ratio bar chart -->
          {:else if step.id === 'ratios'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="28" class="illus-title" text-anchor="middle">National vs Local Ratios</text>
              <!-- legend -->
              <rect x="320" y="44" width="10" height="10" fill="#27A0CC" rx="2"/>
              <text x="336" y="53" class="illus-note" text-anchor="start">National</text>
              <rect x="395" y="44" width="10" height="10" fill="#f97316" rx="2"/>
              <text x="411" y="53" class="illus-note" text-anchor="start">Local OA</text>
              <!-- bars -->
              {#each [
                {cat:'White',  nat:100, loc:42,  col:'#8338ec'},
                {cat:'Asian',  nat:11,  loc:38,  col:'#ffbe0b'},
                {cat:'Black',  nat:5,   loc:8,   col:'#fb5607'},
                {cat:'Mixed',  nat:3,   loc:6,   col:'#ff006e'},
                {cat:'Other',  nat:3,   loc:4,   col:'#3a86ff'},
              ] as row, i}
                {@const barW = 240}
                {@const y = 72 + i * 50}
                <text x="48" y={y+14} class="td" text-anchor="end">{row.cat}</text>
                <!-- national bar -->
                <rect x="56" y={y} width={row.nat/100 * barW} height="10" fill="#27A0CC" rx="2" opacity="0.7"/>
                <!-- local bar -->
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
              <!-- viewport rect -->
              <rect x="60" y="50" width="380" height="220" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" rx="4"/>
              <!-- dimension arrows -->
              <line x1="60" y1="282" x2="440" y2="282" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="250" y="297" class="illus-note" text-anchor="middle">W = viewport width</text>
              <line x1="452" y1="50" x2="452" y2="270" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="478" y="168" class="illus-note" text-anchor="middle" transform="rotate(-90 478 168)">H = height</text>
              <!-- dot cluster with 3 size examples -->
              {#each [
                {label:'dscale 0.04',r:3,  cx:140, cy:160, col:'rgba(39,160,204,0.6)'},
                {label:'dscale 0.16',r:8,  cx:250, cy:160, col:'rgba(39,160,204,0.8)'},
                {label:'dscale 0.40',r:18, cx:360, cy:160, col:'rgba(39,160,204,1)'},
              ] as ex}
                <!-- dot scatter -->
                {#each [[-1.8,-1],[0.5,-1.5],[1.2,0.3],[-0.5,1.1],[0.9,1.4],[-1.5,0.6]] as [dx,dy]}
                  <circle cx={ex.cx + dx*ex.r*1.6} cy={ex.cy + dy*ex.r*1.2} r={ex.r} fill={ex.col}/>
                {/each}
                <text x={ex.cx} y={ex.cy + ex.r*2.2 + 14} class="illus-note" text-anchor="middle">{ex.label}</text>
              {/each}
              <text x="250" y="330" class="illus-note" text-anchor="middle">r = dscale × min(W, H) / 200</text>
            </svg>

          <!-- Chapter V: Interaction modes -->
          {:else if step.id === 'interactions'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="22" class="illus-title" text-anchor="middle">Three Interaction Modes</text>
              <!-- mode panels -->
              {#each [
                {label:'Click to Inspect', x:30,  accent:'#ff6b6b'},
                {label:'Freedraw',         x:180, accent:'#f97316'},
                {label:'Page Average',     x:330, accent:'#27A0CC'},
              ] as mode, mi}
                <rect x={mode.x} y="35" width="130" height="220" fill="rgba(255,255,255,0.03)" stroke={mode.accent} stroke-opacity="0.3" stroke-width="1" rx="4"/>
                <text x={mode.x + 65} y="56" class="mode-label" text-anchor="middle" fill={mode.accent}>{mode.label}</text>
                <!-- dots scattered inside -->
                {#each Array(18) as _, d}
                  {@const dx = (d % 5) * 22 + mode.x + 12}
                  {@const dy = Math.floor(d / 5) * 22 + 68}
                  <circle cx={dx} cy={dy} r="5"
                    fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][d % 5]}
                    opacity={mi === 0 && d === 8 ? 1 : mi === 0 ? 0.35 : 0.6}
                  />
                {/each}
                <!-- mode-specific overlay -->
                {#if mi === 0}
                  <!-- highlight box -->
                  <rect x={mode.x + 12 + (8 % 5)*22 - 8} y="60" width="22" height="22" fill="none" stroke="#ff6b6b" stroke-width="1.5" rx="2"/>
                {:else if mi === 1}
                  <!-- draw polygon -->
                  <polygon points="{mode.x+20},{90} {mode.x+110},{75} {mode.x+120},{160} {mode.x+40},{170}"
                    fill="rgba(249,115,22,0.12)" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,3"/>
                {:else}
                  <!-- viewport scan lines -->
                  {#each [0,1,2] as l}
                    <line x1={mode.x+8} y1={80+l*28} x2={mode.x+122} y2={80+l*28}
                      stroke="#27A0CC" stroke-width="0.8" stroke-opacity="0.35" stroke-dasharray="2,4"/>
                  {/each}
                {/if}
                <!-- legend bars at bottom of panel -->
                {#each [100, 40, 18, 8, 6] as pct, bi}
                  <rect x={mode.x+10} y={198 + bi*9} width={pct * 1.1} height="5"
                    fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][bi]} rx="1" opacity="0.75"/>
                {/each}
              {/each}
              <text x="250" y="278" class="illus-note" text-anchor="middle">legend updates in real time for all three modes</text>
            </svg>

          <!-- Chapter VI: Product scatter -->
          {:else if step.id === 'product'}
            <svg viewBox="0 0 500 340" class="illus" xmlns="http://www.w3.org/2000/svg">
              <text x="250" y="22" class="illus-title" text-anchor="middle">England + Wales — Ethnicity 2021</text>
              <!-- stylised dot density scatter -->
              {#each Array(600) as _, d}
                {@const seed1 = (d * 1973 + 17) % 997}
                {@const seed2 = (d * 1301 + 83) % 887}
                {@const cx = 50 + (seed1 / 997) * 400}
                {@const cy = 38 + (seed2 / 887) * 270}
                <!-- cluster dots near centre (London analogue) -->
                {@const distFromCentre = Math.sqrt((cx-250)**2 + (cy-173)**2)}
                {@const catProb = distFromCentre < 80 ? [0.28,0.18,0.09,0.35,0.10] : [0.09,0.05,0.03,0.80,0.03]}
                {@const rand = (seed1 * seed2) % 100 / 100}
                {@const cat = rand < catProb[0] ? 0 : rand < catProb[0]+catProb[1] ? 1 : rand < catProb[0]+catProb[1]+catProb[2] ? 2 : rand < catProb[0]+catProb[1]+catProb[2]+catProb[3] ? 3 : 4}
                <circle
                  cx={cx}
                  cy={cy}
                  r="1.8"
                  fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][cat]}
                  opacity={distFromCentre < 80 ? 0.85 : 0.45}
                />
              {/each}
              <!-- category legend -->
              {#each ['Asian','Black','Mixed','White','Other'] as cat, ci}
                <circle cx={75 + ci*80} cy="325" r="4" fill={['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff'][ci]}/>
                <text x={82 + ci*80} y="329" class="illus-note">{cat}</text>
              {/each}
            </svg>
          {/if}
        </div>
      {/if}
    {/each}
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
              <p class="rationale-text">{step.rationale}</p>
            </aside>
          {/if}
        </div>
      </div>
    </section>
  {/each}

  <!-- ─── Outro ─── -->
  <section class="outro">
    <div class="caption-col">
      <div class="caption-inner">
        <h2>See it live</h2>
        <p class="sub">The complete map — all 56 million people, all five categories.</p>
        <a href="/" class="cta">Explore the map →</a>
      </div>
    </div>
  </section>

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

  /* ── Fixed right visual pane (60%) ── */
  .visual-pane {
    position: fixed;
    top: 0; right: 0;
    width: 60%; height: 100vh;
    z-index: 1;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.15);
  }
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
  }
  .step.active { opacity: 1; }

  /* ── Caption column (left 40%) ── */
  .caption-col {
    width: 40%;
    padding: 3rem 2rem 3rem 3.5rem;
    position: relative;
    z-index: 10;
  }
  .caption-inner { max-width: 360px; }

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

  /* ── Outro ── */
  .outro {
    min-height: 60vh;
    display: flex;
    align-items: center;
    z-index: 2;
    position: relative;
  }
  .cta {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.6rem;
    background: var(--accent);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-radius: 6px;
    transition: opacity 0.2s, transform 0.2s;
  }
  .cta:hover { opacity: 0.85; transform: translateY(-1px); }

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
