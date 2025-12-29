<script>
  import { ProgressBar } from 'carbon-components-svelte';
  import { onMount, afterUpdate, tick } from 'svelte';

  export let csum = [];
  export let bcsum = [];
  export let keys = [];
  export let colour = [];
  export let colourbase = [];

  async function updateBarColors() {
    await tick();
    if (!colour || !colourbase || !keys.length) return;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        const bar = document.querySelector(`[id="cat-${i}"] .bx--progress-bar__bar`);
        const baseBar = document.querySelector(`[id="catbase-${i}"] .bx--progress-bar__bar`);
        const activeColor = colour[i] || colourbase[i];
        
        if (bar) {
          bar.style.backgroundColor = activeColor;
        }
        if (baseBar) {
          baseBar.style.backgroundColor = activeColor === 'transparent' ? 'transparent' : (colourbase[i] || activeColor);
        }
      } catch (e) {
        console.warn('Error updating bar color:', e);
      }
    }
  }

  onMount(() => {
    setTimeout(updateBarColors, 100);
  });

  afterUpdate(() => {
    updateBarColors();
  });

  function toggleCategory(index) {
    if (colour[index] === 'transparent') {
      colour[index] = colourbase[index];
    } else {
      colour[index] = 'transparent';
    }
    colour = [...colour];
    updateBarColors();
  }

  // Reactive updates
  $: if (csum) updateBarColors();
  $: if (colour) updateBarColors();
  $: if (keys) updateBarColors();
</script>

<div class="categories">
  {#each keys as category, i (i)}
    <button
      type="button"
      class="category-row"
      class:hidden={colour[i] === 'transparent'}
      on:click={() => toggleCategory(i)}
    >
      <span class="category-label">{category}</span>
      <div class="bars-container">
        <div class="main-bar">
          <ProgressBar
            value={csum[i] || 0}
            max={100}
            id="cat-{i}"
            hideLabel
          />
        </div>
        <div class="base-bar">
          <ProgressBar
            value={bcsum[i] || 0}
            max={100}
            id="catbase-{i}"
            hideLabel
          />
        </div>
      </div>
    </button>
  {/each}
</div>

<style>
  .categories {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .category-row {
    display: block;
    width: 100%;
    background: none;
    border: none;
    padding: 6px 4px;
    cursor: pointer;
    text-align: left;
    transition: opacity 0.2s;
    border-radius: 4px;
  }

  .category-row:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .category-row.hidden {
    opacity: 0.35;
  }

  .category-label {
    display: block;
    font-size: 0.72rem;
    color: #ccc;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .bars-container {
    position: relative;
    height: 12px;
  }

  .main-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
  }

  .base-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.4;
  }

  /* Override Carbon styles */
  :global(.categories .bx--progress-bar) {
    min-width: unset !important;
    height: 100% !important;
  }

  :global(.categories .bx--progress-bar__track) {
    height: 100% !important;
    background-color: rgba(255, 255, 255, 0.1) !important;
  }

  :global(.categories .bx--progress-bar__bar) {
    height: 100% !important;
    transition: width 0.3s ease, background-color 0.3s ease;
  }

  :global(.categories .bx--progress-bar__label),
  :global(.categories .bx--progress-bar__helper-text) {
    display: none !important;
  }

  /* Loading animation */
  :global(.loading .categories .bx--progress-bar__bar) {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
