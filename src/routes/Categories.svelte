<svelte:head>
  <link rel="stylesheet" href="/coloris.min.css" />
  <script src="/coloris.min.js"></script>
</svelte:head>

<script>
  import { ProgressBar } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  export let csum;
  export let bcsum;
  export let keys = [];
  export let colour;
  export let colourbase;

  onMount(() => {
    console.warn(colour, 'col');
    setTimeout(() => {
      bcupdate(colour);
    }, 1000);
  });

  async function bcupdate(colour) {
    if (colour) {
      colour.forEach((c, i) => {
        try {
          const catBar = document.querySelector(`#cat_${i} div.bx--progress-bar__bar`);
          if (catBar) catBar.style['background-color'] = c;

          const catBaseBar = document.querySelector(`#catbase_${i} div.bx--progress-bar__bar`);
          if (catBaseBar) catBaseBar.style['background-color'] = c;
        } catch (err) {
          // Ignore errors
        }
      });
    }
  }

  function update_colour(i) {
    if (colour[i] === 'transparent') {
      colour[i] = colourbase[i];
    } else {
      colour[i] = 'transparent';
    }
  }

  function reset_colour(i) {
    colour[i] = colourbase[i];
  }

  $: {
    keys.forEach((d, i) => {
      reset_colour(i);
    });
  }

  $: bcupdate(colour);
</script>

<main>
  <span class="calculating-text">::calculating::</span>

  {#each keys.map((d, i) => [i, d]) as [i, cat]}
    <button
      type="button"
      class="lk"
      on:click={() => update_colour(i)}
    >
      <ProgressBar value={1 + csum[i]} labelText={cat} id={'cat_' + i} helperText="" />
      <ProgressBar value={1 + bcsum[i]} id={'catbase_' + i} />
    </button>
  {/each}
</main>

<style>
  .calculating-text {
    opacity: 0;
    float: right;
  }

  :global(div[id^='cat_']) {
    height: 0.5em !important;
  }

  :global(div[id^='catbase_']) {
    height: 1px !important;
    top: -1.3em;
  }

  .lk {
    padding: 1px;
    padding-top: 2px;
    margin-top: 1px;
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  :global(.loading .bx--progress-bar__bar) {
    opacity: 0.8;
    animation: blinker 4s linear infinite;
  }

  :global(.loading span) {
    opacity: 1;
    color: rgb(255, 255, 255);
    font-size: medium;
    animation: blinker 4s linear infinite;
  }

  @keyframes blinker {
    50% {
      opacity: 0.4;
    }
  }
</style>
