<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { rings } from './circledata.js';

  let go = false;

  export let backgroundColor = '#202226';

  onMount(() => {
    setTimeout(() => {
      go = true;
    }, 2000);
  });
</script>

{#if !go}
  <div id="shell" out:fade={{ duration: 500 }} style:background-color={backgroundColor}>
    <div class="loader-content">
      <svg class="rings" width="280" height="280" viewBox="-184 -184 367 367">
        {#each Object.entries(rings) as [key, data], i}
          <circle
            id={key}
            cx="0"
            cy="0"
            r={data.r}
            stroke={data.colour}
            stroke-width={data.width}
            fill="none"
            stroke-dasharray={data.dasharray}
            opacity=".5"
            style="animation-duration: {20 + i * 10}s;"
          />
        {/each}
      </svg>

      <div class="logos">
        <img
          src="https://cdn.ons.gov.uk/assets/images/ons-logo/v2/ons-logo.svg"
          alt="Office for National Statistics"
          class="ons-logo"
        />
        <svg class="census-logo" viewBox="0 0 200 45" width="100" height="23">
          <text x="0" y="32" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="white">Census</text>
          <text x="115" y="32" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="300" fill="#27A0CC">2021</text>
        </svg>
      </div>
    </div>
  </div>
{/if}

<style>
  #shell {
    position: fixed;
    inset: 0;
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .rings {
    margin-bottom: 0;
  }

  circle:nth-child(even) {
    animation: spin-reverse 45s linear infinite;
  }

  circle:nth-child(odd) {
    animation: spin 65s linear infinite;
  }

  circle {
    will-change: transform;
    transform-origin: 0 0;
  }

  @keyframes spin {
    to { transform: rotate(1turn); }
  }

  @keyframes spin-reverse {
    to { transform: rotate(-1turn); }
  }

  .logos {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .ons-logo {
    width: 100px;
    height: auto;
    opacity: 0.85;
  }

  .census-logo {
    display: block;
    opacity: 0.85;
  }
</style>
